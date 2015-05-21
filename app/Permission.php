<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model {

    protected $table = 'permission';
    protected $fillable = ['uri', ''];
    public $timestamps = false;

    public static function checkExists($uri) {
        return self::where('uri', '=', $uri)->count() > 0;
    }

    public static function get($uri) {
        if( self::checkExists($uri) )
            return self::where('uri', '=', $uri)->first()->is_public;
        else
            return null;
    }

    public static function setPublic($uri, $permission)
    {
        if( self::checkExists($uri) )
        {
            $ret = self::where('uri', '=', $uri)->first();
            $ret->is_public = $permission;
            $ret->save();
        }
        else
            return self::add($uri, $permission);
    }

    public static function add($uri, $permission = false)
    {
        return self::create([
            'uri' => $uri,
            'is_public' => $$permission
        ]);
    }
}
