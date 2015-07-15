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
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['uid', 'uri', 'auth_token', 'auth_expire'];

    public $timestamps = false;


    public static function getByUriUser($uri, $uid)
    {
        return self::where('uid', $uid)->where('uri', $uri)->first();
    }

    public static function getByUriToken($uri, $token)
    {
        return self::where('uri', $uri)->where('auth_token', $token)->first();
    }

    public static function check($uri, $token)
    {
        return self::where('uri', $uri)->where('auth_token', $token)->first() != null;
    }

    public static function add($uri, $uid)
    {
        $auth = self::getByUriUser($uid, $uri);

        if($auth != null) {
            $auth = self::updateExpire($auth);
        } else {
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

    private static function generateToken($uri, $uid)
    {
        $token = sha1($uid.$uri.time());
        while(self::check($uri, $token))
            $token = sha1($uid.$uri.time());
        return $token;
    }

}