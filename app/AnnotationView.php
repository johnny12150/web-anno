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
    protected $table = 'annotation_view';

    /**
     * @param $conditions
     * @param $limit
     * @param $offset
     * @param string $orderBy
     * @param string $sort
     * @return bool result of validation
     */

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
        if( isset($conditions['text']) && $conditions['text'] != '')
            $query = $query->where('text', 'like', '%'.$conditions['text'].'%');
        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && is_bool($conditions['public']['is_public']))
            {
                if( isset($conditions['public']['creator_id']) && $conditions['public']['creator_id'] !== '')
                {
                    $is_public = $conditions['public']['is_public'];
                    $creator_id = intval($conditions['public']['creator_id']);
                    $query = $query->whereRaw('is_public = ? or creator_id = ?', [ $is_public, $creator_id]);
                }
            }
        }
        //if( isset($conditions['quote']) && $conditions['quote'] != '')
        //    $query = $query->where('quote', 'like', '%'.$conditions['quote'].'%');
        if( isset($conditions['tag']) && $conditions['tag'] != '')
            $query = $query->whereRaw('tags = "'.$conditions['tag'].'" OR tags LIKE "% ,'.$conditions['tag'].'%"'.' OR tags LIKE "%'.$conditions['tag'].' ,%"');

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
                'y' => $row->y
            ],
            'likes' => $row->likes == null ? 0 : $row->likes,
            'src' => $row->src,
            'user' => [
                'id' => $creator->id ,
                'name' => $creator->name,
                'gravatar' => Gravatar::src($creator->email)
            ]
        ];
    }
}

?>