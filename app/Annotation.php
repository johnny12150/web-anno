<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use App\BodyMember;
use App\Target;
use App\bodygroup;
use App\follow;
use Carbon\Carbon;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

/**
 * Class Annotation
 * @package App
 */
class object{

};
class Annotation extends Model {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'annotation';
    public $timestamps = false;
    /** 驗證要求儲存的資料是否符合
     * @param $data the data that will be verified
     * @return 如果驗證success 回傳true ;如果驗證fail return false
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
     * 檢查該註記 是否屬於該使用者
     * @param $uid User ID
     * @param $id  Annotation ID
     * @return 如果是 回傳true
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
     * Add Annotation to DB
     * @param $data  from AnnotationController.php 76
     * @return 新增成功 回傳annotation's id ;新增失敗 回傳false 
     */
 
    public static function add($data)
    {

        $check = self::validator($data);
        if($check == true)
        {
            //1.annotation
            $new_anno = new Annotation();
            $new_anno->creator_id = $data['creator_id'];
            $new_anno->is_public  = $data['is_public'];
            $new_anno->state = "exist"; //未來可能用於軟刪除  目前還沒用到
            $new_anno->edited_time = Carbon::now();
            $new_anno->save();

            //2.target
            $json = self::CreatSelectorArray($data);//WA selector
            Target::add([
                'source' => $data['src'],
                'type' => $data['type'],
                'anno_id' => $new_anno->id,
                'uri' => $data['uri'],
                'json' => $json,
                'creator' => $data['creator_id']
            ]);


            //3.body_group
            $bg_id = bodygroup::add($new_anno->id);
        
            $tags = $data['tags']; //$data['tags'] = array
             if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                //$data['tags']= $tagName;
                $Bodymember = Bodymember::add([
                    'creator_id' => $data['creator_id'],
                    //'text' => $data['tags'],
                    'text' => $tagName,
                    'purpose' => "tagging",
                    'bg_id' => $bg_id,
                    'public' => $data['is_public'],
                    'type' =>'TextualBody'
                ]);
                //$new_anno->tags = $data['tags'];
            }
            Bodymember::add([
                'creator_id' => $data['creator_id'],
                'text' => $data['text'],
                'purpose' => "describing",
                'bg_id' => $bg_id,
                'public' => $data['is_public'],
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
    /*取得註記
    *@param uid  user's id
    *@param $front 分辨前後台
    *return 用於前台 可取得當前使用者的註記與公開的註記
    *        用於後台 可取得當前使用者的註記
    */
    public static function getAnnos($uid,$front = 'front',$super ='false'){
        if($super =='true')  return self::lists('anno_id')->all();
        if($front == 'front')
        return self::where('creator_id',$uid)->orWhere('is_public',1)->lists('anno_id')->all();
        else
        return self::where('creator_id',$uid)->lists('anno_id')->all();

    }
    public static function anno_id_get_from_reply($uid){
        $anno_id = bodygroup::get_annoid_from_bgid($uid);
        return $anno_id;
    }
    public static function anno_id_get_from_like($uid){
        $anno_id = bodygroup::get_annoid_from_like($uid);
        return $anno_id;
    }
    public static  function anno_id_get_from_follow_user($uid){
        $users = follow::getfid($uid);
        return self::whereIn('creator_id',$users)->lists('anno_id')->all();
    }
    /*把selector儲存成json  並回傳該 json
    *@param $data
    *return json_encode($tempArray)
    *
    */
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
                'type' =>'TextQuoteSelector',
                'prefix' => $data['prefix'],
                'exact' => $data['quote'],
                'suffix' => $data['suffix']
            )];
        }
        else if ($data['type']=="image")
        {
            $x = sprintf("%f",$data['position']['x']);
            $y = sprintf("%f",$data['position']['y']);
            $w = sprintf("%f",$data['position']['width']);
            $h = sprintf("%f",$data['position']['height']);
            $tempArray =[array(
                'type' =>"FragmentSelector",
                'conformsTo' =>"http://www.w3.org/TR/media-frags/",
                'value'=>  $x.','.$y.','.$w.','.$h
            ),array(
                'type' =>"XPathSelector",
                'value' => $data['Xpath']
            )];
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
    public static function get_anno_by_id($anno_id){
        return self::where('anno_id',$anno_id)->get();
    } 
    /*取得annotation's id 後 從body與target資料表 找出屬於他的資訊
    *$result  annotations set 
    *return   annotations set (include body and taget)
    */
    public static function annotation($result, $bsort ="time",$priority = "false")
    {
        $front_array=[];
        foreach ( $result as $anno_id ) {
           $annotation = self::get_anno_by_id($anno_id)[0];
           if($bsort =='likes')
              $otherbodys_id = bodygroup::getohtergroup($anno_id,$priority);
           elseif($bsort =='time')
              $otherbodys_id = bodygroup::getohtergroupbytime($anno_id,$priority);
           
           $others = [];
        
           if($otherbodys_id != null)
            {
                foreach ( $otherbodys_id as $id) {
                  
                   $others[] = BodyMember::getothers($id);
                }
            }
           $front_anno_object = new object();
           $front_anno_object->otherbodys = $others ;
           $targets = Target::getTarget($anno_id);
           $front_anno_object->creator_id = $annotation->creator_id;
           $front_anno_object->is_public = $annotation->is_public;
           $front_anno_object->created_at =$annotation->created_time;
           $front_anno_object->id = $anno_id;
           $front_anno_object->quote ="";
           $front_anno_object->ranges_start="";
           $front_anno_object->ranges_end="";
           $front_anno_object->ranges_startOffset="";
           $front_anno_object->ranges_endOffset="";
           $front_anno_object->prefix = '';
           $front_anno_object->suffix = '';
           $front_anno_object->x ="";
           $front_anno_object->y ="";
           $front_anno_object->width ="";
           $front_anno_object->height = "";
           $front_anno_object->Xpath = "";
          
           $front_anno_object->tags = array();

            foreach ($targets as $target ) {
                $front_anno_object ->selector  = json_decode($target->selector);
                $front_anno_object ->src = $target->source;
                $selector = json_decode($target->selector);
                $front_anno_object->uri = $target->uri;
                if($target->type =='image')
                {
                    $front_anno_object->src = $target->source;
                    $img = explode(",", $selector[0]->value);
                    $front_anno_object->x = $img [0];
                    $front_anno_object->y = $img [1];
                    $front_anno_object->width =$img [2];
                    $front_anno_object->height =$img [3];
                    $front_anno_object->type = $target->type;
                    $front_anno_object->Xpath = $selector[1]->value;
                    $front_anno_object->selector =  $selector[0]->value;
                }
                else if ($target->type =="text")
                {
                    $front_anno_object->src = $target->source;
                    $front_anno_object->quote = $selector[1]->exact;
                    $front_anno_object->prefix = $selector[1]->prefix;
                    $front_anno_object->suffix = $selector[1]->suffix;
                    $front_anno_object->type = $target->type;
                    $front_anno_object->ranges_start = $selector[0]->startSelector->value;
                    $front_anno_object->ranges_end =   $selector[0]->endSelector->value;
                    $front_anno_object->ranges_startOffset = $selector[0]->startSelector->refinedBy->start;
                    $front_anno_object->ranges_endOffset  = $selector[0]->endSelector->refinedBy->end;  
                } 
              
            }

            $ret = self::format($front_anno_object);
            array_push($front_array,$ret);
        }
        return $front_array;
    }
    public static function annotation_IIIF($anno_id,$canvas)
    {
        $otherbodys_id = bodygroup::getohtergroup($anno_id, "false");
        //print(count($otherbodys_id) === 0 );
		if(count($otherbodys_id) === 0 )  return 'null';
		$others = BodyMember::getothers($otherbodys_id[0]);
        $targets = Target::getTarget($anno_id);


 
        $selector = json_decode($targets[0]->selector);
        $img = explode(",", $selector[0]->value);
        $x = $img[0]*$canvas->width/100;
        $y = $img[1]*$canvas->height/100;
        $width = $img[2]*$canvas->width/100;
        $height = $img[3]*$canvas->height/100;
         return ([
            '@id' => $anno_id,
            '@type' => "oa:Annotation",
            'motivation' => "sc:painting",
            'resource'=>[
                 'type' => 'cnt:ContentAsText',
                 'format'=>'text/plan',
                 'chars' =>  $others['text'][0]
                ],
            'on' => $canvas->canvas."#xywh=".$x.",".$y.",".$width.",".$height
        ]);
    }

    /*將後台資訊轉為前端所要求的格式
    *@param $row annotation object
    *return annotation object
    **/

    private static function format($row)
    {
        $creator = User::get($row->creator_id);
        // Refact object
	
        return [
            'id' => $row->id,
            'text' => '不使用',
            'prefix' => $row->prefix,
            'quote' => $row->quote,
            'suffix' => $row->suffix,
            'uri' => $row->uri,
            'domain' => explode('/',$row->uri)[2],
            'ranges' => [
                [
                    'start' => $row->ranges_start,
                    'end' => $row->ranges_end,
                    'startOffset' => $row->ranges_startOffset,
                    'endOffset' => $row->ranges_endOffset
                ]
            ],
            'tags' => '不使用',
            'permissions' => [
                "read" => $row->is_public ? [] :[(int)$row->creator_id],
                "admin" => [(int)$row->creator_id],
                "update" => [(int)$row->creator_id],
                "delete" => [(int)$row->creator_id]
            ],
            'type' => $row->type,
            'position' => [
                'x' => $row->x,
                'y' => $row->y,
                'width' => $row->width,
                'height' => $row->height
            ],
            'src' => $row->src,
            'created_at' => $row->created_at,
            'user' => [
                'id' => $creator->id ,
                'name' => $creator->name,
                'gravatar' => Gravatar::src($creator->email)
            ],
            'otherbodys' => $row->otherbodys,
            'Xpath' => $row->Xpath

        ];
    }

      


    /*尚未完整的程式 將DB資訊匯出Web Annotation Data Model所規範的格式
    *$param $rows annotation object
    *return temarray array
    */
    private static function oacformat($row)
    {   
        $creator = User::get($row->creator_id);
        $temparray = array(
            '@context' => 'http://www.w3.org/ns/anno.jsonld',
             'id' => $row->uri.'/anno'.$row->id,
             'type' => "annotation",
             'created_at' => $row->created_at,
             'creator' => array(
                'id' => $row->uri.$creator->id,
                'name'=> $creator->name,
                ),
             'body' => [array(
                    'type' => $row->bodytype,
                    'value'=> $row->text,
                    'format'=> "text/html",
                    'purpose' => $row->purpose,
                ),
                 array(
                    'type' => $row->bodytype,
                    'value'=> $row->tags,
                    'format'=> "text/html",
                    'purpose' => 'tagging',
                )],
             'target'=> array(
                'type'=>'SpecificResource',
                'source' => $row->src,
                'selector'=> $row->selector,
                )
            );
        return ($temparray);
    }
   
}
