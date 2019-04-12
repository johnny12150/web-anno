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
	
		//$uid = Request::input('uid');
        $token = Request::input('anno_token');
        $domain = Request::input('domain');
		
        $domain = urldecode($domain);
		
		
        if(AuthTable::check($domain, $token)) {
            $user = User::get(AuthTable::getByDomainToken($domain, $token)->uid);
            $request->session()->flash('user', $user);
		    return $next($request);
        }
        return response()->view('errors.api.401', [], 401);
	}

}
