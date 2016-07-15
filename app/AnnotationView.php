<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;
use App\bodyview;
use App\likeview;
use App\action;
use App\Target;
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
   
    public static function search($conditions , $limit, $offset, $orderBy = 'likes', $sort='desc')
    {
        $annos = DB::table('annotation');
        /**/
        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $anno_ids = bodyview::search($conditions['text']);
             $annos = $annos->where('anno_id', '0');
            foreach ($anno_ids as $id) {
             $annos = $annos->orWhere('anno_id',$id);
        
            }  
        }
        /*新增用的搜尋  return新增的資料 */
        if(isset($conditions['id']) && $conditions['id'] != '')
        {
            $annos = $annos->where('anno_id', $conditions['id']);
        }

        
        $annos = $annos->get();
   
       
        foreach ($annos as $anno ) {
           $bodys = bodyview::getbody($anno->anno_id);
           $likes =likeview::getlike($anno->anno_id);
           $actions = action::getaction($anno->anno_id);
           $targets = Target::getTarget($anno->anno_id);

           $anno->id = $anno->anno_id;
           $anno->quote ="";
           $anno->ranges_start="";
           $anno->ranges_end="";
           $anno->ranges_startOffset="";
           $anno->ranges_endOffset="";
           $anno->x ="";
           $anno->y ="";
           $anno->width ="";
           $anno->height = "";
           $anno->likes ="0";
    
           foreach($bodys as $body)
            {
                if($body->role == 'tagging')
                {
                    $anno->tags = $body->text;
                }
                else if($body->role =='describing')
                {
                    $anno->text = $body->text;
                }
            }
            foreach ($likes as $like) {
                $anno->likes = $like->likes ;
            }
            foreach ($actions as $action ) {
                $anno->created_at = $action->created_at;
            }
            foreach ($targets as $target ) {
                $selector = json_decode($target->selector);
               
                if($target->type =='image')
                {
                    $anno->src = $target->source;
                    $img = explode(",", $selector->value);
                    $anno->x = $img [0];
                    $anno->y = $img [1];
                    $anno->width =$img [2];
                    $anno->height =$img [3];
                    $anno->type = $target->type;
                }
                else if ($target->type =="text")
                {
                    $anno->src = $target->source;
                    $anno->quote = $selector->quote;
                    $anno->type = $target->type;
                    $anno->ranges_start = $selector->startSelector->value;
                    $anno->ranges_end =   $selector->endSelector->value;
                    $anno->ranges_startOffset = $selector->startSelector->refinedBy->start;
                    $anno->ranges_endOffset  = $selector->endSelector->refinedBy->end;  
                } 
              
            }
        }
        $ret =[];
        foreach($annos as $anno) {
           $ret[] = self::format($anno);
        }
        return  $ret;

    }
    public static function backendsearch($conditions , $limit, $offset, $orderBy = 'likes', $sort='desc')
    {
        $annos = DB::table('annotation');
       
        if( isset($conditions['uri']) && $conditions['uri'] != '')
            $annos = $annos->where('uri', $conditions['uri']);
        if( isset($conditions['domain']) && $conditions['domain'] != '')
            $annos = $annos->where('domain', $conditions['domain']);
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
            $annos = $annos->where('creator_id', $conditions['creator_id']);
        $temp = $annos->lists('anno_id');
       
        
        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $public = $annos->where('is_public',$conditions['public']['is_public'])->lists('anno_id');
                $temp = array_intersect($temp, $public);
            }  
         
        }
        

        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $anno_ids = bodyview::gettext($conditions['text']);
            $text = $annos->where('anno_id', '0');
            foreach ($anno_ids as $id) {
              $text = $annos->orWhere('anno_id',$id);
            }  
            $text = $text->lists('anno_id');
            $temp = array_intersect($temp, $text);
        }        

        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {
             $anno_ids = bodyview::gettags($conditions['tag']);
             $tags = $annos->where('anno_id', '0');
             foreach ($anno_ids as $id) {
             $tags = $annos->orWhere('anno_id',$id);
            }  
            $tags = $annos ->lists('anno_id');
            $temp = array_intersect($temp, $tags);
        }  

        $result = DB::table('annotation');
        $result = $result->where('anno_id','0');
        foreach ($temp as $id) {
            
            $result = $result->orWhere('anno_id',$id);
        }

       
        if($limit == -1)
            $result = $result->orderBy($orderBy, $sort)->get();
        else
            $result = $result->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();
       
        foreach ( $result as $anno ) {
           $bodys = bodyview::getbody($anno->anno_id);
           $likes =likeview::getlike($anno->anno_id);
           $actions = action::getaction($anno->anno_id);
           $targets = Target::getTarget($anno->anno_id);

           $anno->id = $anno->anno_id;
           $anno->quote ="";
           $anno->ranges_start="";
           $anno->ranges_end="";
           $anno->ranges_startOffset="";
           $anno->ranges_endOffset="";
           $anno->x ="";
           $anno->y ="";
           $anno->width ="";
           $anno->height = "";
           $anno->likes ="0";
    
           foreach($bodys as $body)
            {
                if($body->role == 'tagging')
                {
                    $anno->tags = $body->text;
                }
                else if($body->role =='describing')
                {
                    $anno->text = $body->text;
                }
            }
            foreach ($likes as $like) {
                $anno->likes = $like->likes ;
            }
            foreach ($actions as $action ) {
                $anno->created_at = $action->created_at;
            }
            foreach ($targets as $target ) {
                $selector = json_decode($target->selector);
               
                if($target->type =='image')
                {
                    $anno->src = $target->source;
                    $img = explode(",", $selector->value);
                    $anno->x = $img [0];
                    $anno->y = $img [1];
                    $anno->width =$img [2];
                    $anno->height =$img [3];
                    $anno->type = $target->type;
                }
                else if ($target->type =="text")
                {
                    $anno->src = $target->source;
                    $anno->quote = $selector->quote;
                    $anno->type = $target->type;
                    $anno->ranges_start = $selector->startSelector->value;
                    $anno->ranges_end =   $selector->endSelector->value;
                    $anno->ranges_startOffset = $selector->startSelector->refinedBy->start;
                    $anno->ranges_endOffset  = $selector->endSelector->refinedBy->end;  
                } 
              
            }
        }

  
        $ret =[];
        foreach($result as $anno) {
           $ret[] = self::format($anno);
        }
        return  $ret;

    }
    private static function format($row)
    {
        $creator = User::get($row->creator_id);
        // Refact object
        return [
            'id' => $row->id,
            'text' => $row->text,
            'quote' => $row->quote,
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
            'tags' => explode(',',$row->tags),
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
            ]
        ];
    }
}

?>