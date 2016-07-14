<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use App\Tag;
use App\BodyMember;
use App\Body;
use App\Target;
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
     * Get Annotations by Uri
     * @param string $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUri($uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {

        $annos = self::where('uri', $uri)->take($limit)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();

        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }

        return $ret;
    }

    /**
     * Get Annotations by user_id and uri
     * @param int $uid
     * @param int $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUserUri($uid, $uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {

        $annos = self::where('creator_id', $uid)->where('uri', $uri)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get Public Annotations by uri
     * @param $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getPublicByUri($uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {
        $annos = self::where('uri', $uri)->where('is_public', true)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get Annotations by user_id
     * @param $uid
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUser($uid, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {
        $annos = self::where('creator_id', $uid)->take($limit)->skip($offset)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }


    /**
     * Get Annotation by id
     * @param int $id
     * @return array Formatted Annotaton
     */
    public static function getById($id) {
        $anno = self::where('id', '=', $id)->first();
        return self::format($anno);
    }

    public static function getCountByUser($uid)
    {
        return self::where('creator_id', $uid)->count();
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
            $new_anno = new Annotation();
            $new_anno->creator_id = $data['creator_id'];
            $new_anno->uri = $data['uri'];
            $new_anno->domain = $data['domain'];
            $new_anno->is_public  = $data['is_public'];
            $new_anno->save();

          

            $tags = $data['tags'];
            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                $data['tags']= $tagName;
                $Bodymember = Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['tags'],
                'role' => "tagging",
                'anno_id' => $new_anno->id
            ]);
            $new_anno->tags = $data['tags'];
            }
            Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['text'],
                'role' => "describing",
                'anno_id' => $new_anno->id
            ]);
            $json = self::CreatSelectorArray($data);
            Target::add([
                'source' => $data['src'],
                'type' => $data['type'],
                'anno_id' => $new_anno->id,
                'json' => $json
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
            Bodymember::deleteBody($id);
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
           $res = Bodymember::getupdate([
                'creator_id' => $uid,
                'role' => "tagging",
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

                    'domain' => $data['domain'],
                    'is_public' => $data['is_public']

                ));
            $tags = $data['tags'];

            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                $data['tags']= $tagName;
                $Bodymember = Bodymember::getupdate([
                'creator_id' => $data['creator_id'],
                'tags' => $data['tags'],
                'anno_id' => $id,
                'text' => $data['text']
                ]);
            }

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
        //Link tags
        /*$tag_list = TagUse::findTagIds($anno->id);
        $tags = [];
        foreach($tag_list as $tag_id) {
            $tagName = Tag::getNameById($tag_id);
            if($tagName != null) {
                $tags[] = $tagName;
            }
        }
        */
        $creator = User::get($anno->creator_id);
        // Refact object
        return [
            'id' => $anno->id,
            'text' => $anno->text,
            'quote' => $anno->quote,
            'uri' => $anno->uri,
            //'link' => $anno->link,
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
    public static function count()
    {
        return self::all()->count();
    }
    public static function getName()
    {
        return self::all()->lists('text');
    }
    public static function CreatSelectorArray($data)
    {
        if($data['type']== "text"){
            $tempArray = array(
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
                'quote' => $data['quote']
            );
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
}
