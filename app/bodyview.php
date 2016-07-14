<?php namespace App;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;
class bodyview extends Model{
	protected $table = 'body_view';
	
	public static function getbody($anno_id){
		$body = DB::table('body_view')->where('anno_id',$anno_id)->get();
		return $body;
	}
}
?>