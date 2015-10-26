<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;


class GravatarController extends  Controller {

    public static function get($email)
    {
        //用email取得圖像的網址
        $url = Gravatar::src($email);
        //轉址過去
        return redirect($url);
    }
}