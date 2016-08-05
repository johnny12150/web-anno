<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\follow;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller {

	public function follow()
	{

		$fid = Request::input('fid');
		$uid = Auth::user('user')->id;
		$res = follow::add($uid,$fid);
		return "sccuess";
	}
	public function delfollow()
	{
		
		$fid = Request::input('fid');
		$uid = Auth::user('user')->id;
		$res = follow::del($uid,$fid);
		return "sccuess";
	}

}
