<?php namespace App;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;
class likeview extends Model{
	protected $table = 'likes_view';
	
	public static function getlike($anno_id){
		$likes = DB::table('likes_view')->where('aid',$anno_id)->get();
		return $likes;
	}
}
?>