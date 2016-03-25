<?php namespace App\Http\Controllers;


use App\AnnotationView;
use App\Annotation;
use App\Tag;
use App\TagUse;
use App\User;
use App\UrlInfo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;

class ManageController extends Controller {


	public function index($page = 1)
    {

        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = Input::get('search_public');
        $user = Auth::user();


        $annos = AnnotationView::search([
            'uri' => $uri,
            'creator_id' => $user->id,
            'text' => $searchText,
            'quote' => $searchText,
            'tag' => $searchTag,
            'public' => $searchPublic == '' ? [] :[
                'is_public' => $searchPublic == '1',
                'creator_id' => $user->id,
            ],
        ], 10, ($page-1)*10, 'uri');

        $count = count($annos);
        $pagesCount = $count / 10 + 1;
        $titles = [];
        //$tags = Tag::getAllTags();
		$tags = TagUse::fidTagNameforuser($user->id);
        $annoData = [];

        foreach($annos as $anno) {
            $annoData[$anno['uri']] []= $anno;
        }

        $tags = array_unique($tags);


        return view('manage.index', [
            'annoData' => $annoData,
            'titles' => $titles,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'tags' => $tags,
            'old' => [
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_public' => $searchPublic
            ]
        ]);
    }


    public function delete()
    {
        $id = Input::get('id');
        $user_id = Auth::user()->id;
        $result = Annotation::del($user_id, $id);
        return [
            'result' => $result > 0
        ];
    }

    public function edit()
    {
        $text = Input::get('text');
        $id = Input::get('id');
        $user_id = Auth::user()->id;
        $result = Annotation::editText($user_id, $id, $text);

        return [
            'result' => $result != false ,
        ];
    }


}
