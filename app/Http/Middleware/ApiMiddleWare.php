<?php namespace App\Http\Middleware;

use App\AuthTable;
use App\User;
use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;

class ApiMiddleWare {

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
        $uri = Request::input('uri');
        $token = Request::input('anno_token');

        if(AuthTable::check($uri, $token)) {
            $user = User::get(AuthTable::getByUriToken($uri, $token)->uid);
            User::storeUserToSession($user);
		    return $next($request);
        }
        App::abort(401, 'Not authenticated');
	}

}
