<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
class Body extends Model{

	protected $table = 'body';
	public $timestamps = false;

	public static function add($anno_id,$member_id){
		$new_body = new Body();
		$new_body->anno_id = $anno_id;
		$new_body->member_id = $member_id;
		$new_body->save();
	}
}
?>
