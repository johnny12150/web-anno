<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class canvas extends Model{
	protected $table = 'canvas';
	public $timestamps = false;


	public static function add($url,$canvas,$height,$width)
	{
		if(self::where('img_src',$url)->count() == 0){   
			$new_canvas = new canvas();
			$new_canvas->img_src = $url;
			$new_canvas->canvas = $canvas;
			$new_canvas->width = $width;
			$new_canvas->height = $height;
			$new_canvas->save();
			return $new_canvas->id;
		}
		else
		{
			return DB::table('canvas')->where('img_src',$url)->pluck('id');
		}
	}
	public static function get_canvas_by_annolistid($id){
		return self::where('id',$id)->first();
	}
}
?>