<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Tag extends Model {

    protected $table = 'tags';
    protected $fillable = ['name'];

    public static function find($name)
    {
        return self::where('name', '=', $name)->get();
    }

    public static function add($name)
    {
        return self::create([
           'name' => $name
        ]);
    }
}
