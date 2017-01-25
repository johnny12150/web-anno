<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class digital extends Model {

	protected $table = 'digital';
	public $timestamps = false;

	public static function get($id)
	{
		return self::where('d_index',$id)->first();
	}
}
