<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Session;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
/**
 * Class User
 * @package App
 */
class User extends Model implements AuthenticatableContract, CanResetPasswordContract {
    use Authenticatable, CanResetPassword;
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
	protected $fillable = ['name', 'password', 'email', 'lastlogin', 'facebook_id', 'facebook_token', 'auth_token', 'auth_expire'];


    protected $hidden = ['password', 'remember_token', 'facebook_token', 'lastlogin'];
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
    private static function updateLastlogin($uid)
    {
        self::where('id', $uid)->update([
            'lastlogin' => 'CURRENT_TIMESTAMP',
        ]);
    }


}
