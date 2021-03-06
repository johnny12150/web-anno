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
			
			
            Target::add([
                'source' => $data['src'],
                'type' => $data['type'],
                'anno_id' => $new_anno->id,
                'uri' => $data['uri'],
                'json' => $data['selector'],
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
			$metas=json_decode($data['metas']);
			if (gettype($metas) == 'string')
				$metas=json_decode($metas);
			foreach((array)$metas as $key=>$value) {
				if ($value != ""){
					$Bodymember = Bodymember::add([
						'creator_id' => $data['creator_id'],
						'text' => $value,
						'purpose' => 'meta:'.$key,
						'bg_id' => $bg_id,
						'public' => $data['is_public'],
						'type' =>'TextualBody'
					]);
				}
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
     * @param $id  Annotation id 
     * @param $selector selector' json type
     * @return bool  
     */
	public static function updateSelector($id,$selector){
		$result = Target::updateSelector($id,$selector);
		return $result;
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
	public static function updateBody($TextArray,$user){
		$bg_id  = bodygroup::getbodygroup($TextArray->aid);
		Bodymember::deleteBody($bg_id->bg_id);
		Bodymember::add([
			'creator_id' => $user,
			'text' => $TextArray->text,
			'purpose' => "describing",
			 'public' => '1',
			'bg_id' => $bg_id->bg_id,
			'type' =>'TextualBody'
		]);
		
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
	/*
    public static function annotation_IIIF_mirador($anno_id,$canvas)
    {
        $otherbodys_id = bodygroup::getohtergroup($anno_id, "false");
        //print(count($otherbodys_id) === 0 );
		if(count($otherbodys_id) === 0 )  return 'null';
		$others = BodyMember::getothers($otherbodys_id[0]);
        $targets = Target::getTarget($anno_id);


		$on_string = '';
        $selector = json_decode($targets[0]->selector);
        /**將DB四邊形形狀的格式會出成IIIF的格式
		*//*
        if($selector[0]->type == 'FragmentSelector'){
			$img = explode(",", $selector[0]->value);
			$x = $img[0]*$canvas->width/100;
			$y = $img[1]*$canvas->height/100;
			$width = $img[2]*$canvas->width/100;
			$height = $img[3]*$canvas->height/100;
			if($width == 0 && $height ==0){
				$svg = '<svg xmlns="http://www.w3.org/2000/svg"><path xmlns="http://www.w3.org/2000/svg" d="M'.$x.','.$y.'c0,-10.22864 5.11432,-20.45728 15.34296,-30.68592c0,-8.47368 -6.86928,-15.34296 -15.34296,-15.34296c-8.47368,0 -15.34296,6.86928 -15.34296,15.34296c10.22864,10.22864 15.34296,20.45728 15.34296,30.68592z" data-paper-data="{&quot;strokeWidth&quot;:1,&quot;fixedSize&quot;:true,&quot;editable&quot;:true,&quot;deleteIcon&quot;:null,&quot;annotation&quot;:null}" id="pin_0ca06f7a-bbf1-4f5d-9f33-9423a90e79d4" fill-opacity="0" fill="#00bfff" fill-rule="nonzero" stroke="#00bfff" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"/></svg>';			
				$on_object =  array(
						'@type' => "oa:SpecificResource",
						'full'=> $canvas->canvas,
						'selector' => array(
								'@type' => 'oa:Choice',
								'default' => array(
									'@type' => 'oa:FragmentSelector',
									"value" => "xywh=".$x.",".$y.",".$width.",".$height
								),
								'item' => array(
									'@type' => 'oa:SvgSelector',
									'value' => $svg,
								),
							),
					);
				$on_string = array($on_object);
			
			}else{
				$on_string = $canvas->canvas."xywh=".$x.",".$y.",".$width.",".$height;
			}
			
		}
		else if($selector[0]->type == 'SvgSelector') {
			/**非四邊形就用SvgSelector，目前有兩種形狀circle,polygon
			*//*
			$string = $selector[0]->value;
			$xywh = 'xywh=1119.9999984,3223.999977,1328.0000024,791.9999934';
			$xml = simplexml_load_string($string);
			$xml->registerXPathNamespace('svg', 'http://www.w3.org/2000/svg');
			$svg = '';
			/*將DB polygon形狀的格式會出成IIIF的格式 IIIF on的部份*//*
			if($xml->xpath('/svg:svg/svg:polygon') !== []){
				$value = $xml->xpath('/svg:svg/svg:polygon')[0]->attributes();
				$points = (string)$value->points[0];
				$explode_points = explode(',',$points);
				$origin_points = '';
				
				foreach($explode_points as $count => $point){
					if($count % 2 == 1){
					   $point = $point * $canvas->height/100;
					   
					}else{
					   $point = $point * $canvas->width/100;
					}
					if($point == 0 ) break;
					
					if($count == 0)
						$origin_points = 'M';
					if ($count % 2 == 1)
							$origin_points = $origin_points.$point.'L';
						else if ($count % 2 == 0)
							$origin_points = $origin_points.$point.',';
					
				}
				$origin_points =  substr($origin_points,0,-1);
				$origin_points = $origin_points.'z';
				$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="'.$origin_points.'" data-paper-data="{&quot;strokeWidth&quot;:1,&quot;editable&quot;:true,&quot;deleteIcon&quot;:null,&quot;annotation&quot;:null}" id="rough_path_57a9539e-b429-4e76-9f30-4175813e2db8" fill-opacity="0.00001" fill="#00bfff" fill-rule="nonzero" stroke="#00bfff" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"/></svg>' ;
				
		    } else if($xml->xpath('/svg:svg/svg:circle') !== []){
				$value = $xml->xpath('/svg:svg/svg:circle')[0]->attributes();
				$cx = (string)$value->cx[0] * $canvas->width/100;
				$cy = (string)$value->cy[0] * $canvas->height/100;
				$r = (string)$value->r[0];
				$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><circle cx="'.$cx.'" cy="'.$cy.'" r="'.$r.'" /></svg>' ;
				$xywh = 'xywh='.($cx-100).','.($cy-100).',200,200';			
			} else {
				$svg =  $string;
				
				
				
			}
				$on_object =  array(
					'@type' => "oa:SpecificResource",
					'full'=> $canvas->canvas,
					'selector' => array(
							'@type' => 'oa:Choice',
							'default' => array(
								'@type' => 'oa:FragmentSelector',
								"value" => $xywh,
							),
							'item' => array(
								'@type' => 'oa:SvgSelector',
								'value' => $svg,
							),
						),
				);
				$on_string = array($on_object);
			
		}
        return ([
            '@id' => $anno_id,
            '@type' => "oa:Annotation",
            'motivation' => "sc:painting",
			'creator'=> 'http://dev.annotation.taieol.tw/user/'.$others['creator_id'].'/'.$others['creator'],
            'resource'=>[
                 'type' => 'cnt:ContentAsText',
                 'format'=>'text/plan',
                 'chars' =>  $others['text'][0]
                ],
            'on' => $on_string
        ]);
    }
	*/
	 public static function annotation_IIIF($anno_id,$canvas)
    {
        $otherbodys_id = bodygroup::getohtergroup($anno_id, "false");
        if(count($otherbodys_id) === 0 )  return 'null';
		$others = BodyMember::getothers($otherbodys_id[0]);
        $targets = Target::getTarget($anno_id);
		$on_string = '';
        $selector = json_decode($targets[0]->selector);
        /**將DB四邊形形狀的格式會出成IIIF的格式
		*/
        if($selector[0]->type == 'FragmentSelector'){
			$img = explode(",", $selector[0]->value);
			$x = $img[0]*$canvas->width/100;
			$y = $img[1]*$canvas->height/100;
			$width = $img[2]*$canvas->width/100;
			$height = $img[3]*$canvas->height/100;
			$on_string = $canvas->canvas."#xywh=".$x.",".$y.",".$width.",".$height;
		}
		else if($selector[0]->type == 'SvgSelector') {
			/**非四邊形就用SvgSelector，目前有兩種形狀circle,polygon
			*/
			$string = $selector[0]->value;
			$xywh = 'xywh=1119.9999984,3223.999977,1328.0000024,791.9999934';
			$xml = simplexml_load_string($string);
			$xml->registerXPathNamespace('svg', 'http://www.w3.org/2000/svg');
			$svg = '';
			/*將DB polygon形狀的格式會出成IIIF的格式 IIIF on的部份*/
			if($xml->xpath('/svg:svg/svg:polygon') !== []){
				$value = $xml->xpath('/svg:svg/svg:polygon')[0]->attributes();
				$points = (string)$value->points[0];
				$explode_points = explode(',',$points);
				$origin_points = '';
				
				foreach($explode_points as $count => $point){
					if($count % 2 == 1){
					   $point = $point * $canvas->height/100;
					   
					}else{
					   $point = $point * $canvas->width/100;
					}
					if($point == 0 ) break;
					
					if($count == 0)
						$origin_points = $point;
					else
						$origin_points = $origin_points.','.$point;
				}
				$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><polygon points="'.$origin_points.'" /></svg>' ;
				
		    } else if($xml->xpath('/svg:svg/svg:circle') !== []){
				$value = $xml->xpath('/svg:svg/svg:circle')[0]->attributes();
				$cx = (string)$value->cx[0] * $canvas->width/100;
				$cy = (string)$value->cy[0] * $canvas->height/100;
				$r = (string)$value->r[0];
				$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><circle cx="'.$cx.'" cy="'.$cy.'" r="'.$r.'" /></svg>' ;
				$xywh = 'xywh='.($cx-100).','.($cy-100).',200,200';			
			} else {
				$svg =  $string;
			}
				$on_object =  array(
					'@type' => "oa:SpecificResource",
					'full'=> $canvas->canvas,
					'selector' => array(
							'@type' => 'oa:Choice',
							'default' => array(
								'@type' => 'oa:FragmentSelector',
								"value" => $xywh,
							),
							'item' => array(
								'@type' => 'oa:SvgSelector',
								'value' => $svg,
							),
						),
				);
				$on_string = array($on_object);
		}
        return ([
            '@id' => $anno_id,
            '@type' => "oa:Annotation",
            'motivation' => "sc:painting",
			'creator'=> 'http://dev.annotation.taieol.tw/user/'.$others['creator_id'].'/'.$others['creator'],
            'resource'=>[
                 'type' => 'cnt:ContentAsText',
                 'format'=>'text/plan',
                 'chars' =>  $others['text'][0]
                ],
            'on' => $on_string
        ]);
    }
    /*將後台資訊轉為前端所要求的格式
    *@param $row annotation object
    *return annotation object
    **/

    private static function format($row)
    {
        $creator = User::get($row->creator_id);
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
                "update" => $row->is_public ? [] :[(int)$row->creator_id],
                "delete" => $row->is_public ? [] :[(int)$row->creator_id]
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
				'level' => $creator->level,
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
