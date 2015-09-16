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
     * @param $data the data that will be verified
     * @return bool result of validation
     */


    public static function search($conditions , $limit, $offset)
    {
        $query = DB::table('annotations_view');

        if( isset($conditions['id']) && $conditions['id'] != '')
            $query = $query->where('id', $conditions['id']);
        if( isset($conditions['uri']) && $conditions['uri'] != '')
            $query = $query->where('uri', $conditions['uri']);
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
            $query = $query->where('creator_id', $conditions['creator_id']);
        if( isset($conditions['text']) && $conditions['text'] != '')
            $query = $query->where('text', 'like', '%'.$conditions['text'].'%');
        if( isset($conditions['quote']) && $conditions['quote'] != '')
            $query = $query->where('quote', 'like', '%'.$conditions['quote'].'%');
        if( isset($conditions['tag']) && $conditions['tag'] != '')
            $query = $query->whereRaw('tags = "'.$conditions['tag'].'" OR tags LIKE "% ,'.$conditions['tag'].'%"'.' OR tags LIKE "%'.$conditions['tag'].' ,%"');

        $annos = $query->skip($offset)->take($limit)->orderBy('likes', 'desc')->get();

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
            'ranges' => [
                [
                    'start' => $row->ranges_start,
                    'end' => $row->ranges_end,
                    'startOffset' => $row->ranges_startOffset,
                    'endOffset' => $row->ranges_endOffset
                ]
            ],
            'tags' => explode(' ,',$row->tags),
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
                'gravatar' => Gravatar::src($creator->email)
            ]
        ];
    }
}

?>