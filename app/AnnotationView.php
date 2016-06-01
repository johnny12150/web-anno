<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

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
    protected $table = 'annotations_view';

   
    public static function search($conditions , $limit, $offset, $orderBy = 'likes', $sort='desc')
    {

       
        $query = DB::table('annotations_view');

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

       /*if( isset($conditions['tag']) && $conditions['tag'] != '')
            $query = $query->whereRaw('tags = "'.$conditions['tag'].'" OR tags LIKE "% ,'.$conditions['tag'].'%"'.' OR tags LIKE "%'.$conditions['tag'].' ,%"');
    
       */
           
        $query1 =$query;
        if( isset($conditions['text']) && $conditions['text'] != '')
        {
         
            $condata = explode(",", $conditions['text']);
            $count = count($condata);
            for($x = 0 ; $x < $count ; $x ++)
            {
                $query = $query->where('text' , 'like' , '%'.$condata[$x]. '%') ;

            } 
          /*    for($x = 0 ; $x < $count ; $x ++)
            {
                if($x == 0 )
                $query2 = $query1->where('tags' , 'like' , '%'.$condata[$x]. '%') ;
                else

            } */
        }
        
        
        $query = $query1 ;

        if($limit == -1)
            $annos = $query->orderBy($orderBy, $sort)->get();
        else
            $annos = $query->skip($offset)->take($limit)->orderBy($orderBy, $sort)->get();

        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
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
            'link' => $row->link,
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