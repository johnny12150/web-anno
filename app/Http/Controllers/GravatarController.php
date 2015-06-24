<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;


class GravatarController extends  Controller {

    public static function get($email)
    {
        $url = Gravatar::src($email);
        return redirect($url);
    }
}