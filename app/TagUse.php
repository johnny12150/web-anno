<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use DB;
class TagUse extends Model {

    protected $table = 'tags_use';
    protected $fillable = ['tag_id', 'annotation_id'];
    public $timestamps = false;

    /**
     * find tags id by annotation id
     * @param $id
     * @return array
     */
    public static function findTagIds($annoId)
    {
        $list = self::where('annotation_id', '=', $annoId)->lists('tag_id');
        return $list == null ? [] : $list;
    }

    public static function findAnnoIds($tagId)
    {
        $list = self::where('tag_id', '=', $tagId)->lists('annotation_id');
        return $list == null ? [] : $list;
    }

    /**
     * Add Tag relation
     * @param $tag_id tag id
     * @param $anno_id annotation id
     * @return TagUse Object of Tag relation
     */
    public static function add($tagId, $annoId)
    {
        $tag_use = new TagUse();
        $tag_use->tag_id = $tagId;
        $tag_use->annotation_id = $annoId;
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
        return self::where('tag_id',$tag_id)->where('annotation_id', $anno_id)->delete();
    }

    /**
     * Delete Tag link by Annotation id
     * @param $anno_id
     * @return bool
     */
    public static function delByAnnoId($anno_id)
    {
        return self::where('annotation_id', $anno_id)->delete();
    }

	public static function fidTagNameforuser($user_id)
	{
		$tags_objs=DB::select('select name from tags where tags.id in (select tags_use.tag_id from annotations,tags_use where annotations.id=tags_use.annotation_id and annotations.creator_id = ?)',[$user_id]);
		$tags=[];
		foreach ($tags_objs as $tags_obj) {
			 $tags[]=$tags_obj->name;
		}
		return $tags;
	}

}