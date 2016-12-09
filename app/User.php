<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Session;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;

use Illuminate\Foundation\Auth\Access\Authorizable;

use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
/**
 * Class User
 * @package App
 */
class User extends Model implements AuthenticatableContract, CanResetPasswordContract, AuthorizableContract {
    use Authenticatable, CanResetPassword, Authorizable;
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
   
    public static function get($uid)
    {
        return self::where('id', $uid)->first();
    }
    public static function getbyname($name)
    {
        return self::where('name',$name)->first();
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
