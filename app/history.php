<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class history extends Model{
	protected $table = 'history';
	public $timestamps = false;


	public static function add($data)
	{
		$new_history = new history();
		$new_history->member_id = $data['member_id'];
		$new_history->text = $data['text'];
		$new_history->role = $data['role'];
		$new_history->type = $data['type'];
		$new_history->save() ;
	}
}
?>