<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;
use App\BodyMemeber;
use Illuminate\Support\Facades\DB;
class bodygroup extends Model{
	

	protected $table = 'body_group';
	public $timestamps = false;


	public static function add($anno_id)
	{
		$bgroup = new bodygroup();
		$bgroup ->anno_id = $anno_id;
		$bgroup ->save();
		return $bgroup->id;
	}
	public static function deletebody($bg_id)
	{
		return	self::where('bg_id',$bg_id)->delete();
	}
    public static function getanno_id($bg_id)
    {
    	return self::select('anno_id')->where('bg_id',$bg_id)->first();
    }
	public static function getbodygroup($anno_id)
	{
		return self::where('anno_id',$anno_id)->first();

	}
	public static function getohtergroup($anno_id)
	{
		$bodygroup =DB::table('body_group')->leftJoin('likes','body_group.bg_id','=','likes.bg_id')
		->selectRaw('count(likes.like) as likes,body_group.bg_id')->where('anno_id',$anno_id)
		->orderby('likes','desc')->groupby('body_group.bg_id')->get();

		 $ids = [];
		 foreach ($bodygroup as $id) {
		 	$ids[] = $id->bg_id;
		 }
		 return $ids;
	}
	public static function getannobyid($bg_ids){
		$array = DB::table('body_group')->whereIn('bg_id',$bg_ids)->lists('anno_id');
		if(empty($array)==true) $array =[];
		return$array;
	}
	public static function getohtergroupbytime($anno_id)
	{
		$bodygroup =DB::table('body_group')->leftJoin('body_member','body_group.bg_id','=','body_member.bg_id')
		->selectRaw('body_member.created_time,body_group.bg_id')->where('anno_id',$anno_id)
		->orderby('created_time','desc')->groupby('body_group.bg_id')->get();

		 $ids = [];
		 foreach ($bodygroup as $id) {
		 	$ids[] = $id->bg_id;
		 }
		 return $ids;
	}

}