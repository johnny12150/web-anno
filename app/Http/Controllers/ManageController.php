<?php namespace App\Http\Controllers;

use App\Annotation;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\User;
use Illuminate\Http\Request;
use App\UrlInfo;

class ManageController extends Controller {

	public function index($page = 1)
    {
        $user = User::user();

        $annos = Annotation::getByUser($user->id, 10, ($page-1)*10);
        $count = Annotation::getCountByUser($user->id);
        $pagesCount = $count / 10 + 1;
        $titles = [];

        foreach($annos as $anno)
        {
            $title = UrlInfo::getTitle($anno['uri']);
            if( $title == null )
            {
                $title = UrlInfo::getTitleFromInternet($anno['uri']);
                UrlInfo::updateTitle($anno['uri'], $title);
            }
            $titles[$anno['uri']] = ( $title != false ? $title['title']  : '無標題');
        }

        return view('manage.index', [
            'annos' => $annos,
            'titles' => $titles,
            'page' => $page,
            'pagesCount' => $pagesCount
        ]);
    }

}
