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
        if(isset($conditions['id']) && $conditions['id'] != '')
        {
            $annos = $annos->where('anno_id', $conditions['id']);
        }
         $annos = $annos->get();
   
       
        foreach ($annos as $anno ) {
           $bodys = bodyview::getbody($anno->anno_id);
           $likes =likeview::getlike($anno->anno_id);
           $action = action::getaction($anno->anno_id);
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
           $anno->created_at ="2016-07-01 06:33:57";
            
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
            foreach ($action as $action ) {
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
       /* $query = DB::table('annotations_view');

        if( isset($conditions['id']) && $conditions['id'] != '')
            $query = $query->where('id', $conditions['id']);
        if( isset($conditions['uri']) && $conditions['uri'] != '')
            $query = $query->where('uri', $conditions['uri']);
        if( isset($conditions['domain']) && $conditions['domain'] != '')
            $query = $query->where('domain', $conditions['domain']);
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
            $query = $query->where('creator_id', $conditions['creator_id']);

        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                if( isset($conditions['public']['creator_id']) && $conditions['public']['creator_id'] !== '')
                {
                    $is_public = $conditions['public']['is_public'];
                    $creator_id = intval($conditions['public']['creator_id']);
                    if ( $creator_id == 0)
                        $query = $query->whereRaw('is_public = ?', [$is_public]);
                    else
                        $query = $query->whereRaw('is_public = ? or creator_id = ?', [$is_public, $creator_id]);
                } else {
                    $is_public = $conditions['public']['is_public'];
                    $query = $query->where('is_piblic', $is_public);
                }
            }
        }
        
        if( isset($conditions['text']) && $conditions['text'] != '')
        {
            $condata = explode(",", $conditions['text']);
            $count = count($condata);
            for($x = 0 ; $x < $count ; $x ++)
            {
                $query = $query->Where('text' , 'like' , '%'.$condata[$x]. '%') ;
                        
            }
        }

        if( isset($conditions['text']) && $conditions['text'] != '')
        {
            $condata = explode(",", $conditions['text']);
            $count = count($condata);
            for($x = 1 ; $x < $count ; $x ++)
            {
               $searchtag = $condata[$x-1];
               $query_fortag = DB::table('annotations_view')->where('tags' , 'like' , "$searchtag"); 
               $query = $query->union($query_fortag);
            }
        }
 
        if($limit == -1)
            $annos = $query->orderBy($orderBy, $sort)->get();
        else
            $annos = $query->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();

        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
        */

    }
    public static function sortByUserTop(Array $annos, $user_id)
    {
        $user_annos = [];
        $other_annos = [];
        foreach($annos as $key => $value) {
            if( intval($value['user']['id']) === intval($user_id))
                $user_annos []= $value;
            else
                $other_annos []= $value;
        }
        return array_merge($user_annos, $other_annos);
    }

    private static function getById($id)
    {
        $annotation = self::where('id', $id)->get();
        return $annotation != null ?self::format($annotation) : [];
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
            //'link' => $row->link,
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