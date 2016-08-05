<?php namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\Controller;
use App\collect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;
class collecteController extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		//
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		$anno_id =  Request::input('anno_id');
		$user = Session::get('user');
		$result = collect::add($anno_id,$user);
		if($result == true)
		return abort(204);
		else
		return abort(500);
	}
	public function check()
	{
		$anno_id =  Request::input('anno_id');
		$user = Session::get('user');
		$result = collect::getcollect($anno_id,$user);
		if($result != null)
		{
			return "true";
		}
		else
		{
			return "false";
		}
	}
	public function destroy()
	{
		$user = Auth::user('user');
        $anno_id = Request::input('anno_id');
        
	    collect::del($anno_id,$user);
	  	return $anno_id;
	 	
	}

}
