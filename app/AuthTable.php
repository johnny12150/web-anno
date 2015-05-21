<?php
/**
 * Created by PhpStorm.
 * User: flyx
 * Date: 4/16/15
 * Time: 7:58 AM
 */

namespace App;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class AuthTable extends Model{

    protected $table = 'auth_table';

    protected $fillable = ['id', 'uri', 'auth_token', 'auth_expire'];

    public $timestamps = false;


    public static function get($uid, $uri)
    {
        return self::where('uid', $uid)->where('uri', $uri)->first();
    }

    public static function exists($uid, $uri)
    {
        return self::get($uid, $uri) != null;
    }

    public static function check($uri, $token)
    {
        return self::where('uri', $uri)->where('auth_token', $token)->first() != null;
    }

    public static function add($uid, $uri)
    {
        $auth = self::get($uid, $uri);

        if($auth != null)
        {
            $auth = self::updateExpire($auth);
        }
        else
        {
            $auth = new self();
            $auth->uid = $uid;
            $auth->uri = $uri;
            $auth->auth_token = self::generateToken($uid, $uri);
            $auth->auth_expire = Carbon::now()->addMonths(1);
            $auth->save();
        }

        return $auth;
    }

    public static function updateExpire($auth)
    {

        $auth->auth_expire = Carbon::now()->addMonths(1);
        $auth->save();
        return $auth;
    }

    private static function generateToken($uid, $uri)
    {
        return sha1($uid.$uri.time());
    }

}