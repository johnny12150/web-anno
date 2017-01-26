<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class CrossDomainMiddleWare {

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: X-CSRF-TOKEN,  Content-Type,  Origin');
        return $next($request);

	}

}
