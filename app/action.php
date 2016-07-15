<?php namespace App;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;
class action extends Model{
	protected $table = 'action';
	public $timestamps = false;
	public static function getaction($anno_id){
		$action = DB::table('action')->where('anno_id',$anno_id)->where('state',"create")->get();
		return $action;
	}
	public static function add($data)
	{
		$action = new action();
		$action->anno_id = $data['anno_id'];
		$action->user_id = $data['user_id'];
		if(isset($data['body_id']) && $data['body_id'] != '')
		{
			$action->body_id = $data['body_id'];
		}
		$action->state = $data['state'];
		$action->save();
	}
}
?>