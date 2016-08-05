<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class follow extends Model {

	protected $table = 'follow';
	public $timestamps = false;
	public static function add($uid,$fid)
	{
		$follow = self::get($uid,$fid);
		if($follow == null){
		$newfollow = new follow();
		$newfollow->uid = $uid;
		$newfollow->fid = $fid;
		$newfollow->save();
		return true;
		}
	}
	public static function get($uid,$fid)
	{
		return self::where('uid',$uid)->where('fid',$fid)->first();
	}
	public static function del($uid,$fid){
		self::where('uid',$uid)->where('fid',$fid)->delete();
	}
	public static function check($uid,$fid)
	{
		$follow = self::get($uid,$fid);
		if($follow != null){
			return 'true';
		}
	}
	public static function getfid($uid)
	{
		return self::where('uid',$uid)->get();
	}
}
