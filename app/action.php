<?php namespace App;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;
class action extends Model{
	protected $table = 'action';
	
	public static function getaction($anno_id){
		$action = DB::table('action')->where('anno_id',$anno_id)->where('state',"1")->get();
		return $action;
	}
}
?>