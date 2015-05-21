<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Tag extends Model {

    protected $table = 'tags';
    protected $fillable = ['name'];
    public $timestamps = false;

    public static function checkExists($id) {
        return self::where('id', '=', $id)->count() > 0;
    }

    public static function getNameById($id)
    {
        if(self::checkExists($id))
            return self::select('name')->where('id', '=', $id)->first()['name'];
        return false;
    }

    public static function findByName($name)
    {
        return self::where('name', '=', $name)->first();
    }


    public static function add($name)
    {
        return self::create([
           'name' => $name
        ]);
    }
}
