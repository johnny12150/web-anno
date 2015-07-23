<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Tag extends Model {

    protected $table = 'tags';
    protected $fillable = ['name'];
    public $timestamps = false;

    /**
     * Check Tag id exists
     * @param int $id
     * @return bool
     */
    public static function checkExists($id) {
        return self::where('id', '=', $id)->count() > 0;
    }

    /**
     * Get Tag name by id
     * @param $id
     * @return string|false
     */
    public static function getNameById($id)
    {
        if(self::checkExists($id))
            return self::select('name')->where('id', $id)->first()['name'];
        return null;
    }

    /**
     * Get Tag by Name
     * @param $name
     * @return Tag|null
     */
    public static function getByName($name)
    {
        return self::where('name', $name)->first();
    }

    public static function getAllTags()
    {
        return self::all()->lists('name');
    }


    /**
     * Add Tag
     * @param $name
     * @return Tag
     */
    public static function add($name)
    {
        if( $name != '') {
            return self::create([
                'name' => $name
            ]);
        }
        return false;
    }
}
