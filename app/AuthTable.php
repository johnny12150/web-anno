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
    protected $fillable = ['uid', 'domain', 'auth_token', 'auth_expire'];

    public $timestamps = false;


    public static function getByDomainUser($domain, $uid)
    {
        return self::where('uid', $uid)->where('domain', $domain)->first();
    }

    public static function getByDomainToken($domain, $token)
    {
        return self::where('domain', $domain)->where('auth_token', $token)->first();
    }

    public static function check($domain, $token)
    {
        return self::where('domain', $domain)->where('auth_token', $token)->first() != null;
    }

    public static function add($domain, $uid)
    {
        $auth = self::getByDomainUser($uid, $domain);

        if($auth != null) {
            $auth = self::updateExpire($auth);
        } else {
            $auth = new self();
            $auth->uid = $uid;
            $auth->domain = $domain;
            $auth->auth_token = self::generateToken($uid, $domain);
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

    private static function generateToken($domain, $uid)
    {
        $token = sha1($uid.$domain.time());
        while(self::check($domain, $token))
            $token = sha1($uid.$domain.time());
        return $token;
    }

}