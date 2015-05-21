<?php namespace App\Http\Middleware;

use App\AuthTable;
use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;

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

        if(AuthTable::check($uri, $token))
		    return $next($request);
        App::abort(401, 'Not authenticated');
	}

}
