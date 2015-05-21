<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Session;

class User extends Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = ['name', 'email', 'lastlogin', 'facebook_id', 'facebook_token', 'auth_token', 'auth_expire'];


    public static function getByFacebook($fbid)
    {
        return self::where('facebook_id',$fbid)->first();
    }

    public static function get($uid)
    {
        return self::where('id', $uid)->first();
    }

    public static function addByFacebook($user, $token)
    {
        $_user = new self();
        $_user->facebook_id = $user->id;
        $_user->name = $user->name;
        $_user->email = $user->email;
        $_user->facebook_token = $token;
        $_user->save();

        return $_user;
    }

    private static function update_lastlogin($uid)
    {
        self::where('id', $uid)->update([
            'lastlogin' => 'CURRENT_TIMESTAMP',
        ]);
    }

    //----------------------------------------------------------

    public static function user()
    {
        return Session::get('user');
    }


    public static function check()
    {
        $_user = self::user();

        if($_user != null)
        {

            $expire = Session::get('expire');
            $curtime = time();

            if( $curtime - $expire > 5 * 60 * 60)
            {

                self::logout();
            }
            else
            {
                Session::put('expire', time());
                return true;
            }
        }

        return false;
    }


    public static function guest()
    {
        return !self::check();
    }

    public static function logout()
    {
        Session::flush();
    }

    public static function login($user, $token)
    {

        $_user = self::getByFacebook($user->id);

        if($_user == null)
            $_user = self::addByFacebook($user, $token);

        self::update_lastlogin($_user->id);

        Session::put('expire', time());
        Session::put('user', $_user);

        return $_user;
    }

}
