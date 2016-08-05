<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use App\BodyMember;
use App\Target;
use App\bodygroup;
//use App\action;
//use App\history;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

/**
 * Class Annotation
 * @package App
 */
class Annotation extends Model {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'annotation';
    public $timestamps = false;
    /**
     * @param $data the data that will be verified
     * @return bool result of validation
     */
    public static function validator($data)
    {
        $validator_return = Validator::make(
            $data,
            [
                'creator_id' => ['required', 'numeric'],
                'text' => ['required'],
                'quote' => ['required'],
                'uri' => ['required'],
                'domain' => ['required'],
                'ranges_start' => ['required'],
                'ranges_end' => ['required'],
                'ranges_startOffset' => ['required', 'numeric'],
                'ranges_endOffset' => ['required', 'numeric']
            ]);
        if($validator_return->fails())
        {
            return $validator_return->messages();
        }
        else
        {
            return true;
        }
    }
      
    /**
     * Check Annotation exists
     * @param $uid User ID
     * @param $id  Annotation ID
     * @return bool
     */
    public static function checkOwner($uid, $id)
    {
        $count = self::whereRaw('anno_id = ? and creator_id = ?',array($id, $uid))->count();
        if($count == 0)
            return False;
        else
            return True;
    }

    /**
     * Add Annotation
     *
     * @param $data
     * @return array|bool
     */
    public static function add($data)
    {

        $check = self::validator($data);
        if($check == true)
        {
            //1.annotation
            $new_anno = new Annotation();
            $new_anno->creator_id = $data['creator_id'];
            //$new_anno->uri = $data['uri'];
            $new_anno->domain = $data['domain'];
            $new_anno->is_public  = $data['is_public'];
            $new_anno->state = "exist";
            $new_anno->save();

            //2.target
            $json = self::CreatSelectorArray($data);
            Target::add([
                'source' => $data['src'],
                'type' => $data['type'],
                'anno_id' => $new_anno->id,
                'uri' => $data['uri'],
                'json' => $json
            ]);


            //3.body_group
            $bg_id = bodygroup::add($new_anno->id);
        
            $tags = $data['tags'];
            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                $data['tags']= $tagName;
                $Bodymember = Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['tags'],
                'purpose' => "tagging",
                'bg_id' => $bg_id,
                'type' =>'TextualBody'
            ]);
            $new_anno->tags = $data['tags'];
            }
            Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['text'],
                'purpose' => "describing",
                'bg_id' => $bg_id,
                'type' =>'TextualBody'
            ]);

          return $new_anno->id;

        }
        else
        {
            return $check;
        }
       
    }

    /**
     * @param $uid
     * @param $id
     * @return bool
     */
    public static function del($uid, $id)
    {
        if(self::checkOwner($uid, $id) )
        {
            Target::deleteTarget($id);
            bodygroup::deleteBody($id);
            return self::where('anno_id', $id)->where('creator_id', $uid)->delete();
        }
        else
        {
            return false;
        }
    }
    public static function editText($uid, $id, $text,$tags)
    {
        if(self::checkOwner($uid, $id))
        {
           Annotation::updateaction($id,$uid,$text,$tags);
                
           $res = Bodymember::getupdate([
                'creator_id' => $uid,
                'purpose' => "tagging",
                'anno_id' => $id,
                'text' => $text,
                'tags' => $tags
                ]); 
        
            return $res;
        } else {
            return false;
        }
    }

    /**
     * @param $uid
     * @param $id
     * @param $data
     * @return bool|string
     */
    public static function edit($uid, $id, $data)
    {
        if(self::checkOwner($uid, $id)) {
            $check = self::validator($data);
            if( $check == true ) {
                $anno = self::whereRaw('anno_id = ? and creator_id = ?',array($id, $uid))->update(array(
                    'is_public' => $data['is_public']
                ));
            $tags = $data['tags'];

            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);
            
            Bodymember::deleteBody($data['bg_id']);

            foreach( $tags as $tagName) {
                $data['tags']= $tagName;
                $Bodymember = Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['tags'],
                'purpose' => "tagging",
                'bg_id' => $data['bg_id'],
                'type' =>'TextualBody'
            ]);
            }
            Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['text'],
                'purpose' => "describing",
                'bg_id' => $data['bg_id'],
                'type' =>'TextualBody'
            ]);
                return $data;

            }
            else {
                return $check;
            }
        } 
        else {
            return 'anootation does not exist';
        }
    }

    /**
     * @param $anno
     * @return array
     */

    public static function format($anno)
    {
     
        $creator = User::get($anno->creator_id);
        // Refact object
        return [
            'id' => $anno->id,
            'text' => $anno->text,
            'quote' => $anno->quote,
            'uri' => $anno->uri,
            'ranges' => [
                [
                    'start' => $anno->ranges_start,
                    'end' => $anno->ranges_end,
                    'startOffset' => $anno->ranges_startOffset,
                    'endOffset' => $anno->ranges_endOffset
                ]
            ],
            'tags' => $anno->tags,
            'permissions' => [
                "read" => $anno->is_public ? [] :[(int)$anno->creator_id],
                "admin" => [(int)$anno->creator_id],
                "update" => [(int)$anno->creator_id],
                "delete" => [(int)$anno->creator_id]
            ],
            'type' => $anno->type,
            'position' => [
                'x' => $anno->x,
                'y' => $anno->y,
                'width' => $anno->w,
                'height' => $anno->h
            ],
            'src' => $anno->src,
            'user' => [
                'id' => $creator->id ,
                'gravatar' => Gravatar::src($creator->email)
            ]
        ];
    }
  
    public static function CreatSelectorArray($data)
    {
        if($data['type']== "text"){
            $tempArray = [array(
                'type' =>"RangeSelector",
                'startSelector' =>array(
                    'type' => "XPathSelector",
                    'value'=> $data['ranges_start'],
                    'refinedBy' => array(
                        'type' =>"TextPositionSelector",
                        'start'=> $data['ranges_startOffset'],
                        'end' => 'null'
                    )
                ),
                'endSelector' =>array(
                    'type' => "XPathSelector",
                    'value'=> $data['ranges_end'],
                    'refinedBy' => array(
                        'type' =>"TextPositionSelector",
                        'start' =>'null',
                        'end'=> $data['ranges_endOffset']
                    )
                ),
              
            ),array(
            'type' =>'TextQuotePosition',
            'exact' => $data['quote']
            )];
        }
        else if ($data['type']=="image")
        {
            $x = sprintf("%d",$data['position']['x']);
            $y = sprintf("%d",$data['position']['y']);
            $w = sprintf("%d",$data['position']['width']);
            $h = sprintf("%d",$data['position']['height']);
            $tempArray = array(
                'type' =>"FragmentSelector",
                'conformsTo' =>"http://www.w3.org/TR/media-frags/",
                'value'=>  $x.','.$y.','.$w.','.$h
            
            );
        }
        return json_encode($tempArray);
    }
    public static function updateaction($id,$uid,$text,$tags)
    {
            $bodys = BodyMember::getbody($id);
            foreach ($bodys as $body) {
                if($body->purpose =='tagging')
                {
                    if($body->text != $tags )
                    {
                         Action::add([
                            'anno_id' =>  $id,
                            'user_id' =>  $uid,
                            'body_id' =>  $body->member_id,
                            'state' => 'update'
                        ]);
                         history::add([
                            'member_id' =>$body->member_id,
                            'text' => $body->text,
                            'purpose' => $body->purpose,
                            'type' => 'TextualBody'
                            ]);
                    }
                } 
                else if ($body->purpose =='describing')
                {
                    if($body->text != $text )
                    {
                         Action::add([
                            'anno_id' =>  $id,
                            'user_id' =>  $uid,
                            'body_id' =>  $body->member_id,
                            'state' => 'update'
                        ]);
                        history::add([
                            'member_id' =>$body->member_id,
                            'text' => $body->text,
                            'purpose' => $body->purpose,
                            'type' => 'TextualBody'
                        ]);
                    }
                }
            }

    }
    public static function tempdelete($uid,$id)
    {
        if(self::checkOwner($uid, $id) )
        {
            return self::where('anno_id', $id)->where('creator_id', $uid)->update(['state'=>'delete']);
        }
        else
        {
            return false;
        }
    }
    public static function import($data)
    {
        $domain =  explode("/",$data->id);
        $uri = preg_replace('|[0-9]+|', '', $data->id);
        $new_anno = new Annotation();
        $new_anno->creator_id = '0';
        $new_anno->uri = $uri;
        $new_anno->domain = $domain [2];
        $new_anno->is_public  = '1';
        $new_anno->state = "exist";
        if(array_key_exists("creator", get_object_vars($data)))
        $new_anno->import= $data->creator;
        $new_anno->save();

        if(gettype($data->body)== 'string')
        {
            $new_anno->body = $data->body;
            $new_anno->purpose = 'null';
            $new_anno->type = 'null';
        }
        else
        {
            $array = get_object_vars($data->body);
            if(array_key_exists("puropose", $array))
            {
                $new_anno->purpose = $data->body->purpose;
            }
            else {
                $new_anno->purpose = 'null';
            }
            if(array_key_exists("value", $array))
            {
                $new_anno->body = $data->body->value;
            }
            else{
                 $new_anno->body = $data->body->id;
            }
            if (array_key_exists("type", $array)) {
                $new_anno->type = $data->body->type;
            }
            else
            {
                $new_anno->type = 'null';
            }
        }


        if(gettype($data->target)== 'string')
        {
            $new_anno->ttype = 'null';
            $new_anno->tselector = 'null';
           $new_anno->tsource =  $data->target;
        }
        else
        {
            $array = get_object_vars($data->target);
            if(array_key_exists("type", $array))
            {
                $new_anno->ttype = $data->target->type;
            }
            else {
                $new_anno->ttype = 'null';
            }
            if(array_key_exists("source", $array))
            {
                $new_anno->tsource = $data->target->source;
            }
            else if(array_key_exists("id", $array))  {
                $new_anno->tsource = $data->target->id;
            }
            if(array_key_exists("selector", $array))
            {
                $new_anno->tselector = json_encode($data->target->selector);
            }
            else {
               $new_anno->tselector = 'null';
            }
       
       
        }
        Bodymember::add([
                'creator_id' => '0',
                'text' => $new_anno->body,
                'purpose' => $new_anno->purpose,
                'anno_id' => $new_anno->id,
                'type' => $new_anno->type 
            ]);
        Target::add([
                'source' => $new_anno->tsource,
                'type' => $new_anno->ttype,
                'anno_id' => $new_anno->id,
                'json' => $new_anno->tselector
            ]);

        return $new_anno->id;
    }
}
