<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Like extends Model {

    protected $table = 'likes';
    public $timestamps = false;

    public static function getLike($uid, $bg_id)
    {
        return self::where('uid', $uid)->where('bg_id', $bg_id)->first();
    }
    public static function count($bg_id)
    {
        return self::where('bg_id',$bg_id)->sum('like');
    } 
    public static function getlikebyuser($uid){
        return self::where('uid', $uid)->get();
    }
    public static function setLike($uid, $bg_id, $value)
    {
        $like = self::getLike($uid, $bg_id);
        if( $like == null ) {
            $like = new self();
            $like->like = $value;
            $like->uid = $uid;
            $like->bg_id = $bg_id;
            $like->save();
        } else {
            $res =  self::where('uid', $uid)->where('bg_id', $bg_id)->update(array(
                'like' => $value ));
            return $res;
        }
    }
    
}
