<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
class Body extends Model{

	protected $table = 'body';
	public $timestamps = false;

	public static function add($anno_id,$member_id){
		$new_body = new Body();
		$new_body->anno_id = $anno_id;
		$new_body->member_id = $member_id;
		$new_body->save();
	}
	public static function get_body_id($anno_id)
	{
		$id = DB::table('body')->where('anno_id',$anno_id)->lists('member_id');
		return $id;
	}
	public static function deleteAnno($anno_id)
	{
		DB::table('body')->where('anno_id',$anno_id)->delete();
	}
}
?>
