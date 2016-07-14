<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Like extends Model {

    protected $table = 'likes';
    public $timestamps = false;

    public static function getLike($uid, $aid)
    {
        return self::where('uid', $uid)->where('aid', $aid)->first();
    }

    public static function setLike($uid, $aid, $value)
    {
        $like = self::getLike($uid, $aid);
        if( $like == null ) {
            $like = new self();
            $like->like = $value;
            $like->uid = $uid;
            $like->aid = $aid;
            $like->save();
        } else {
            $res =  self::where('uid', $uid)->where('aid', $aid)->update(array(
                'like' => $value ));
            return $res;
        }
    }
 
}
