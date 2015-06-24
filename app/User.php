<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Session;

/**
 * Class User
 * @package App
 */
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


    protected $hidden = ['facebook_token', 'lastlogin'];

    /**
     * Get user by facebook id
     *
     * @param $fbid - facebook id
     * @return User|null
     */
    public static function getByFacebook($fbid)
    {
        return self::where('facebook_id',$fbid)->first();
    }

    /**
     * Get user by id
     *
     * @param $uid - User id
     * @return User|null
     */
    public static function get($uid)
    {
        return self::where('id', $uid)->first();
    }

    /**
     * Add user by facebook user obj
     *
     * @param $fbuser
     * @param $token
     * @return User
     */
    public static function addByFacebook($fbuser, $token)
    {
        $user = new self();
        $user->facebook_id = $fbuser->id;
        $user->name = $fbuser->name;
        $user->email = $fbuser->email;
        $user->facebook_token = $token;
        $user->save();

        return $user;
    }

    /**
     * update lastlogin timestamp of user
     *
     * @param $uid - user id
     */
    private static function update_lastlogin($uid)
    {
        self::where('id', $uid)->update([
            'lastlogin' => 'CURRENT_TIMESTAMP',
        ]);
    }

    //----------------------------------------------------------

    /**
     * Get user from seesion
     *
     * @return mixed
     */
    public static function user()
    {
        return Session::get('user');
    }


    /**
     * Check logined or not
     *
     * @return bool
     */
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


    /**
     *
     *
     * @return bool
     */
    public static function guest()
    {
        return !self::check();
    }

    /**
     * Logout from system
     */
    public static function logout()
    {
        Session::flush();
    }

    /**
     * Login to system
     *
     * @param $fbuser - Facebook user obj
     * @param $token - Facebook token
     * @return User|mixed
     */
    public static function login($fbuser, $token)
    {

        $user = self::getByFacebook($fbuser->id);

        if($user == null)
            $user = self::addByFacebook($fbuser, $token);

        self::update_lastlogin($user->id);

        self::storeToSession($user);

        return $user;
    }


    public static function storeToSession($user, $isflash = false)
    {
        if(!$isflash) {
            Session::put('expire', time());
            Session::put('user', $user);
        } else {
            Session::flash('user', $user);
        }
    }
}
