<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class TagUse extends Model {

    protected $table = 'tags_use';
    protected $fillable = ['tag_id', 'annotation_id'];
    public $timestamps = false;
    /**
     * find tags id by annotation id
     * @param $id
     * @return array
     */
    public static function findTagIds($id)
    {
        $list = self::where('annotation_id', '=', $id)->lists('tag_id');
        return $list == null ? [] : $list;
    }

    public static function findAnnoIds($id)
    {
        $list = self::where('tag_id', '=', $id)->lists('annotation_id');
        return $list == null ? [] : $list;
    }

    /**
     * Add Tag relation
     * @param $tag_id tag id
     * @param $anno_id annotation id
     * @return TagUse Object of Tag relation
     */
    public static function add($tag_id, $anno_id)
    {
        $tag_use = new TagUse();
        $tag_use->tag_id = $tag_id;
        $tag_use->annotation_id = $anno_id;
        $tag_use->save();
        return $tag_use;
    }

    /**
     * Delete relation by tag_od and anno_id
     * @param $tag_id tage id
     * @param $anno_id annotation id
     * @return string
     */
    public static function del($tag_id, $anno_id)
    {
        return self::where('tag_id', '=', $tag_id)
                    .where('annotation_id', '=', $anno_id)->delete();
    }

    /**
     * @param $anno_id
     * @return mixed
     */
    public static function delByAnnoId($anno_id)
    {
        return self::where('annotation_id', '=', $anno_id)->delete();
    }

}