<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;
use App\BodyMember;
use App\Like;
use App\bodygroup;
use App\action;
use App\Target;
use App\collect;
/**
 * Class AnnotationView
 * @package App
 */

class AnnotationView extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'annotation';
   
    public static function search($conditions , $orderBy = 'created_time', $sort='desc')
    {
    
        $temp =[];
         if(isset($conditions['uri']) && $conditions['uri'] != '')
        {
             //$annos = $annos->where('anno_id', '0');
            $anno_ids = Target::getannobyuri($conditions['uri']);
            /*foreach ($anno_ids as $anno_id) {
             $annos = $annos->orWhere('anno_id',$anno_id);
             }*/
            $temp = $anno_ids;
        }
        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::search($conditions['text']);
            $anno_ids=[];
            foreach ($bg_ids as $bg_id) {
                array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
            } 
            $temp = array_intersect($temp, $anno_ids); 
        }        
   

        $annos = DB::table('annotation');
     
       
        /*新增用的搜尋  return新增的資料 */
        if(isset($conditions['id']) && $conditions['id'] != '')
        {
            $annos = $annos->where('anno_id', $conditions['id']);
            $annos = $annos->get();
            $annos = AnnotationView::annotation($annos);
                $ret =[];
                foreach($annos as $anno) {
                   $ret[] = self::format($anno);
                }
                return  $ret;
        }
        
        if(isset($conditions['public']) && $conditions['public'] != '')
        {
            $a = $conditions['public']['creator_id'];
            $annos = $annos->where(function($query) use ($a){
                $query->where('is_public',1)->orWhere('creator_id',$a);
            });
        }
        if(empty($temp) ==false)
            $annos = $annos->whereIn('anno_id',$temp)->orderBy('created_time',$sort)->get();
        else 
            return ;

        $annos = AnnotationView::annotation($annos);
        $ret =[];
        foreach($annos as $anno) {
           $ret[] = self::format($anno);
        }
        return  $ret;

    }
    public static function getall($conditions){
       
        $annos = DB::table('annotation');

        if( isset($conditions['domain']) && $conditions['domain'] != '')
            $annos = $annos->where('domain', $conditions['domain']);

        $bidbylike = Like::getlikebyuser($conditions['user']);
        $folusers = follow::getfid($conditions['user']);
        
        $annos =$annos->where('anno_id',0);
        //get by follow
        if(empty($folusers) != false){
            foreach ($folusers as $foluser) {
                $annos = $annos->orWhere('creator_id',$foluser->fid);
            }
        }
        //get by like  
        if (empty($bidbylike) != false){
            
            foreach ($bidbylike as $id) {
                 $annoidbybid[] =  bodygroup::getanno_id($id->bg_id)->anno_id;
            }
            foreach ($annoidbybid as $id) {
                $annos = $annos->orWhere('anno_id',$id);
            }
        }

        $temp = $annos->lists('anno_id');
        //return $temp;
        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {

             $bg_ids = BodyMember::backgettags($conditions['tag']);
     
             $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {
                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);

             }
            
            
            $temp = array_intersect($temp, $anno_ids);
      
        }  

        $result = DB::table('annotation');
        $result = $result->where('anno_id','0');
        foreach ($temp as $id) {
            
            $result = $result->orWhere('anno_id',$id);
        }
   
        $result = AnnotationView::annotation($result->get());
        //$annos = $annos->orderBy('created_time', 'desc')->get();
        //$result = AnnotationView::annotation($annos);
        $ret =[];
        foreach($result as $anno) {
           $ret[] = self::format($anno);
        }
        return  $ret;


    }
    public static function beckendbriefsearch($conditions,$limit, $offset, $orderBy = 'created_time', $sort='desc'){
        if(isset($conditions['search_all']) && $conditions['search_all'])
        {
            $result1 = Target::search_with_likes($conditions['search_all']); //return anno_id array
         
            $bg_ids = BodyMember::search_with_like($conditions['search_all']);
            $result2 = bodygroup::getannobyid($bg_ids);
            $array = array_merge($result1,$result2);

            $annos = DB::table('annotation')->whereIn('anno_id',$array);
        }
       if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
            $annos = $annos->where('creator_id', $conditions['creator_id']);
       if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);

            }  
        }
        $count = $annos->count();
        $result = $annos->skip($offset)->take($limit)->orderBy($orderBy,$sort)->get();
        $result = AnnotationView::annotation($result);
        $ret =[];
        foreach( $result as $anno) {
           $ret[] = self::format($anno);
        }
        return  ['annos' =>$ret, 'count' => $count];
    }
    
    public static function beckendbriefsearch_collect($conditions,$limit, $offset, $orderBy = 'created_time', $sort='desc'){
        if(isset($conditions['search_all']) && $conditions['search_all'])
        {
            $result1 = Target::search_with_likes($conditions['search_all']); //return anno_id array
         
            $bg_ids = BodyMember::search_with_like($conditions['search_all']);
            $result2 = bodygroup::getannobyid($bg_ids);
            $array = array_merge($result1,$result2);

            $annos = DB::table('annotation')->whereIn('anno_id',$array);
        }
       if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
        {
            $collect = collect::get($conditions['creator_id']);
            $annos = $annos->whereIn('anno_id',$collect);
        }
       if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);
            }  
        }
        $count = $annos->count();
        $result = $annos->skip($offset)->take($limit)->orderBy($orderBy,$sort)->get();
        $result = AnnotationView::annotation($result);
        $ret =[];
        foreach( $result as $anno) {
           $ret[] = self::format($anno);
        }
        return  ['annos' =>$ret, 'count' => $count];
    }
    public static function backendsearch($conditions , $limit, $offset, $orderBy = 'created_time', $sort='desc')
    {
        $annos = DB::table('annotation');
       

        if( isset($conditions['domain']) && $conditions['domain'] != '')
            $annos = $annos->where('domain', $conditions['domain']);
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
            $annos = $annos->where('creator_id', $conditions['creator_id']);
        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);
                //$temp = array_intersect($temp, $public);
            }  
        }

        $temp = $annos->lists('anno_id');
        if(isset($conditions['uri']) && $conditions['uri'] != '')
        {

             $anno_ids = Target::getannobyuri($conditions['uri']);
             $uri =[];
             foreach ($anno_ids as $anno_id) {
                array_push($uri, $anno_id);
             }
             $temp = array_intersect($temp, $uri);
        }
       

        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::backsearchtext($conditions['text']);
            $anno_ids = [];

             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
             }
            $temp = array_intersect($temp, $anno_ids);
        }        

        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {
             $bg_ids = BodyMember::backgettags($conditions['tag']);
             
             $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);

             }
            $temp = array_intersect($temp, $anno_ids);
        }  

        $result = DB::table('annotation');
        $result = $result->whereIn('anno_id',$temp);

        
        if($limit == -1)
            $result = $result->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();
        else
            $result = $result->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();
        
        if(isset($conditions['sort']) && $conditions['sort'] != '') 
            {$sort = $conditions['sort'];
                $result = AnnotationView::annotation($result,$sort);
        }
        else
        $result = AnnotationView::annotation($result);
    
        $ret =[];
        foreach($result as $anno) {
           $ret[] = self::format($anno);
        }
        return  ['annos' =>$ret, 'count' => count($temp)];

    }
    public static function backendsearch_collect($conditions , $limit, $offset, $orderBy = 'created_time', $sort='desc')
    {
        $annos = DB::table('annotation');
       

        if( isset($conditions['domain']) && $conditions['domain'] != '')
            $annos = $annos->where('domain', $conditions['domain']);
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
              $anno_id = collect::get($conditions['creator_id']);
        
            $annos = $annos->whereIn('anno_id',$anno_id);
        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);
                //$temp = array_intersect($temp, $public);
            }  
        }

        $temp = $annos->lists('anno_id');
        if(isset($conditions['uri']) && $conditions['uri'] != '')
        {

             $anno_ids = Target::getannobyuri($conditions['uri']);
             $uri =[];
             foreach ($anno_ids as $anno_id) {
                array_push($uri, $anno_id);
             }
             $temp = array_intersect($temp, $uri);
        }
       

        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::backsearchtext($conditions['text']);
            $anno_ids = [];

             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
             }
            $temp = array_intersect($temp, $anno_ids);
        }        

        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {
             $bg_ids = BodyMember::backgettags($conditions['tag']);
             
             $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);

             }
            $temp = array_intersect($temp, $anno_ids);
        }  

        $result = DB::table('annotation');
        $result = $result->whereIn('anno_id',$temp);

        
        if($limit == -1)
            $result = $result->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();
        else
            $result = $result->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();
        
        if(isset($conditions['sort']) && $conditions['sort'] != '') 
            {$sort = $conditions['sort'];
                $result = AnnotationView::annotation($result,$sort);
        }
        else
        $result = AnnotationView::annotation($result);
    
        $ret =[];
        foreach($result as $anno) {
           $ret[] = self::format($anno);
        }
        return  ['annos' =>$ret, 'count' => count($temp)];

    }
    public static function apisearch($conditions,$count,$orderBy)
    {
        $annos = DB::table('annotation');
       
 
        $temp = $annos->lists('anno_id');
          if( isset($conditions['id']) && $conditions['id'] != '')
            {
                $annos = $annos->where('anno_id', $conditions['id']);
                  $temp = array_intersect($temp, $annos->lists('anno_id'));
            }

        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $anno_ids = BodyMember::gettext($conditions['text']);
            $text = $annos->where('anno_id', '0');
            foreach ($anno_ids as $id) {
              $text = $annos->orWhere('anno_id',$id);
            }  
            $text = $text->lists('anno_id');
            $temp = array_intersect($temp, $text);
        }     

        $result = DB::table('annotation');
        $result = $result->where('anno_id','0');
        foreach ($temp as $id) {
            $result = $result->orWhere('anno_id',$id);
        }
        
        $result = $result->take($count)->orderBy('anno_id','desc')->get();

        $annos = AnnotationView::annotation($result);

        $ret =[];

        foreach ($annos as $anno) {
                $ret[] = self::oacformat($anno);
        }
        return $ret ;
    
    }
    private static function annotation($result, $bsort ="time",$priority = "false")
    {

        foreach ( $result as $anno ) {
 
           if($bsort =='likes')
              $otherbodys_id = bodygroup::getohtergroup($anno->anno_id,$priority);
           elseif($bsort =='time')
              $otherbodys_id = bodygroup::getohtergroupbytime($anno->anno_id,$priority);
           
           $others = [];
        
           if($otherbodys_id != null)
            {
                foreach ( $otherbodys_id as $id) {
                  
                   $others[] = BodyMember::getothers($id);
                }
            }

           $anno->otherbodys = $others ;
           $targets = Target::getTarget($anno->anno_id);
          
           $anno->id = $anno->anno_id;
           $anno->quote ="";
           $anno->ranges_start="";
           $anno->ranges_end="";
           $anno->ranges_startOffset="";
           $anno->ranges_endOffset="";
           $anno->prefix = '';
           $anno->suffix = '';
           $anno->x ="";
           $anno->y ="";
           $anno->width ="";
           $anno->height = "";
           $anno->Xpath = "";
           $anno->likes ="0";
           $anno->created_at =$anno->created_time;
           $anno->tags = array();
           //$anno->likes = Like::count($bgs_id->bg_id);
          
           /*foreach($bodys as $body)
            {
                $anno->bodytype = $body->type;
                $anno->purpose = $body->purpose;
                if($body->purpose == 'tagging')
                {
                    array_push($anno->tags,$body->text);
                }
                else if($body->purpose =='describing')
                {
                    $anno->text = $body->text;
                }
            }*/
            foreach ($targets as $target ) {
                $anno ->selector  = json_decode($target->selector);
                $anno ->src = $target->source;
                $selector = json_decode($target->selector);
                $anno->uri = $target->uri;
                if($target->type =='image')
                {
                    $anno->src = $target->source;
                    $img = explode(",", $selector->value);
                    $anno->x = $img [0];
                    $anno->y = $img [1];
                    $anno->width =$img [2];
                    $anno->height =$img [3];
                    $anno->type = $target->type;
                    $anno->Xpath = $selector->Xpath;
                }
                else if ($target->type =="text")
                {
                    $anno->src = $target->source;
                    $anno->quote = $selector[1]->exact;
                    $anno->prefix = $selector[1]->prefix;
                    $anno->suffix = $selector[1]->suffix;
                    $anno->type = $target->type;
                    $anno->ranges_start = $selector[0]->startSelector->value;
                    $anno->ranges_end =   $selector[0]->endSelector->value;
                    $anno->ranges_startOffset = $selector[0]->startSelector->refinedBy->start;
                    $anno->ranges_endOffset  = $selector[0]->endSelector->refinedBy->end;  
                } 
              
            }
        }
        return $result;
    }
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
            'domain' => $row->domain,
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
            'likes' => $row->likes == null ? 0 : $row->likes,
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

?>