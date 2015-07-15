<?php namespace App\Http\Controllers;

use App\Annotation;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\User;
use Illuminate\Http\Request;
use App\UrlInfo;
use Illuminate\Support\Facades\Input;

class ManageController extends Controller {


	public function index($page = 1)
    {

        $keyword = Input::get('keyword');
        $tag = Input::get('tag');
        $uri = Input::get('uri');

        $user = User::user();
        $annos = Annotation::getByUser($user->id, 10, ($page-1)*10, 'uri');

        $count = Annotation::getCountByUser($user->id);
        $pagesCount = $count / 10 + 1;
        $titles = [];

        foreach($annos as $anno) {
            $urlinfo = UrlInfo::getByUrl($anno['uri']);
            $title = null;
            if( $urlinfo == null ) {
                $title = UrlInfo::getTitleFromInternet($anno['uri']);
                $urlinfo = UrlInfo::updateTitle($anno['uri'], $title);
            }
            $titles[$anno['uri']] = ( $urlinfo != null ? $urlinfo['title']  : '無標題');
        }

        return view('manage.index', [
            'annos' => $annos,
            'titles' => $titles,
            'page' => $page,
            'pagesCount' => $pagesCount
        ]);
    }


    public function delete()
    {
        $id = Input::get('id');
        $user_id = User::user()->id;
        $result = Annotation::del($user_id, $id);
        return [
            'result' => $result > 0
        ];
    }

    public function edit()
    {
        $text = Input::get('text');
        $id = Input::get('id');
        $user_id = User::user()->id;
        $result = Annotation::editText($user_id, $id, $text);

        return [
            'result' => $result != false ,
        ];
    }


}
