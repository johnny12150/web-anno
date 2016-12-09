<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class collect extends Model{
	protected $table = 'collect';
	public $timestamps = false;

	public static function add($anno_id,$user)
	{
		$collect = self::getcollect($anno_id,$user);
		if($collect == null){
		$newcollcet = new collect();
		$newcollcet->id = $user->id;
		$newcollcet->anno_id = $anno_id;
		$newcollcet->save() ;
		return true;
		}
		else{
			self::del($anno_id,$user);
			return true;
		}
	
	}
	public static function getcollect($anno_id,$user)
	{
		$collect = self::where('anno_id',$anno_id)->where('id',$user->id)->first();
		return $collect;
	}
	public static function get($user)
	{
		return self::where('id',$user)->lists('anno_id')->all();
	}
	public static function del($anno_id,$user)
	{
		return self::where('anno_id',$anno_id)->where('id',$user->id)->delete();
	}

}
?>