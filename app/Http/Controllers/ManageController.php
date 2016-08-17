<?php namespace App\Http\Controllers;
ini_set("display_errors", "On");

use App\AnnotationView;
use App\Annotation;
use App\Tag;
use App\TagUse;
use App\User;
use App\UrlInfo;
use App\collect;
use App\BodyMember;
use App\follow;
use App\bodygroup;
use App\Target;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;

class ManageController extends Controller {
    /*
    return user's tags and text
    */
    //for easy autocomplete
    public function gettags()
    {
        $user = Auth::user();
        if($user->authorization == 0){
            
        }else{
            
            $tags =  BodyMember::getTags($user->id);
            $texts =  BodyMember::getTexts($user->id);
            $uri_array =[];
            $anno_ids = Annotation::getAnnos($user->id);
            foreach ($anno_ids as $anno_id) {
                 array_push($uri_array, Target::geturi($anno_id));
            }
           

            $array_text = [];
            foreach ($texts as $text ) {
               array_push($array_text, strip_tags($text));
            }
            return ['tags' => $tags , 'text'=>  $array_text,'uri' => $uri_array];
       
        }
    }
    public function get($id)
    {
        // Find tags
        $anno = AnnotationView::search(array(
            'id' => $id
        ), 1, 0);

        return (isset($anno[0]) ? $anno[0] : []);
    } 
    public function collect(){
        $user = Auth::user();
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = Input::get('search_public');
        $searchsort = input::get('search_sort');
        $search_user_first = Input::get('search_user_first');
        $page = Input::get('search_page');
        if($page == '') $page =1;
        $search_all = Input::get('search_all');
        if($search_all != '')
        {   if($user->authorization == 0){

                $annos = AnnotationView::beckendbriefsearch_collect([
                    'search_all' => $search_all,
                    'sort' => $searchsort,
                    'creator_id' => $user->id,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
             
            }
            else
            {

                $annos = AnnotationView::beckendbriefsearch_collect([
                    'search_all' => $search_all,
                    'creator_id' => $user->id,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
            }
        }
        else{
            if($user->authorization == 0)
            {
                $annos = AnnotationView::backendsearch_collect([
                'uri' => $uri,
                'text' => $searchText,
                'creator_id' => $user->id,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'user_first' => $search_user_first,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');

            }else
            {
                $annos = AnnotationView::backendsearch_collect([
                'uri' => $uri,
                'creator_id' => $user->id,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');
            }
        }
        
        $pagesCount = intval($annos['count'] / 10 + 1);
        $urilist =[];


        $annoData = [];

        foreach($annos['annos'] as $anno) {

            $annoData[$anno['uri']] [] = $anno;
            array_push($urilist,$anno['uri']);
        }

        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'urilists' => array_unique($urilist),
            'user' => $user,
            'following' => '',
            'old' => [
                'search_all' => Input::get('search_all'),
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_page'=> $page,
                'search_sort' =>input::get('search_sort'),
                'search_public' => $searchPublic
            ]
        ]);

      
    }

    //my profile
    public function manage()
    {
        
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = Input::get('search_public');
        $searchsort = input::get('search_sort');
        $search_user_first = Input::get('search_user_first');
        $page = Input::get('search_page');
        if($page == '') $page =1;
        $user = Auth::user();
        $search_all = Input::get('search_all');
        if($search_all != '')
        {   if($user->authorization == 0){

                $annos = AnnotationView::beckendbriefsearch([
                    'search_all' => $search_all,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        //'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
             
            }
            else
            {

                $annos = AnnotationView::beckendbriefsearch([
                    'search_all' => $search_all,
                    'creator_id' => $user->id,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
            }
        }
        else{
            if($user->authorization == 0)
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'user_first' => $search_user_first,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    //'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');

            }else
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                'creator_id' => $user->id,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');
            }
        }
        $pagesCount = intval($annos['count'] / 10 + 1);
        $urilist =[];


        $annoData = [];

        foreach($annos['annos'] as $anno) {

            $annoData[$anno['uri']] [] = $anno;
            array_push($urilist,$anno['uri']);
        }

        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'urilists' => array_unique($urilist),
            'user' => $user,
            'following' => '',
            'old' => [
                'search_all' => Input::get('search_all'),
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_page'=> $page,
                'search_sort' =>input::get('search_sort'),
                'search_public' => $searchPublic
            ]
        ]);
    }
   
    public function all(){
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = Input::get('search_public');
        $searchsort = input::get('search_sort');
        $search_user_first = Input::get('search_user_first');
        $page = Input::get('search_page');
        if($page == '') $page =1;
        
        $user = Auth::user();
        $search_all = Input::get('search_all');
        
        if($search_all != '')
        {   if($user->authorization == 0){

                $annos = AnnotationView::beckendbriefsearch_follow([
                    'search_all' => $search_all,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
             
            }
            else
            {

                $annos = AnnotationView::beckendbriefsearch([
                    'search_all' => $search_all,
                    'creator_id' => $user->id,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $user->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
            }
        }
        else{
            if($user->authorization == 0)
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'user_first' => $search_user_first,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');

            }else
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                //'creator_id' => $user->id,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');
            }
        }
        $pagesCount = intval($annos['count'] / 10 + 1);
        $urilist =[];


        $annoData = [];

        foreach($annos['annos'] as $anno) {

            $annoData[$anno['uri']] [] = $anno;
            array_push($urilist,$anno['uri']);
        }

        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'urilists' => array_unique($urilist),
            'user' => $user,
            'following' => '',
            'old' => [
                'search_all' => Input::get('search_all'),
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_page'=> $page,
                'search_sort' =>input::get('search_sort'),
                'search_public' => $searchPublic
            ]
        ]); 
 
    }
    public function delete()
    {

        $id = Input::get('id');
        $user_id = Auth::user()->id;
        //$result = Annotation::del($user_id, $id);
        $result = bodygroup::deletebody($id);;
        return [
            'result' => $result > 0
        ];
    }

    public function edit()
    {
        
        $text = Input::get('text');
        $id = Input::get('id');
        $user_id = Auth::user()->id;
        $tags = explode(" ",Input::get('tags'));
        //$result = Annotation::editText($user_id, $id, $text,$tags);
        
        BodyMember::deleteBody($id);
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'purpose' => "tagging",
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);
        }

        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'purpose' => "describing",
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);

        return [
            'result' => "true" != false ,
        ];
    }
    /*others user profile*/
    public function index($name,$page = 1)
    {
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = '1';
        $searchsort = input::get('search_sort');
        $search_user_first = Input::get('search_user_first');
        $page = Input::get('search_page');
        if($page == '') $page =1;
        $user = Auth::user();
        $buser = User::getbyname($name);
        $search_all = Input::get('search_all');
        if($search_all != '')
        {   if($user->authorization == 0){

                $annos = AnnotationView::beckendbriefsearch([
                    'search_all' => $search_all,
                    'sort' => $searchsort,
                    'creator_id' => $buser->id,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $buser->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
             
            }
            else
            {

                $annos = AnnotationView::beckendbriefsearch([
                    'search_all' => $search_all,
                    'creator_id' => $buser->id,
                    'sort' => $searchsort,
                    'user_first' => $search_user_first,
                    'public' => $searchPublic == '' ? [] :[
                        'is_public' => $searchPublic == '1',
                        'creator_id' => $buser->id,
                    ],
                ], 10, ($page-1)*10, 'created_time');
            }
        }
        else{
            if($user->authorization == 0)
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                'text' => $searchText,
                'creator_id' => $buser->id,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'user_first' => $search_user_first,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $buser->id,
                ],
            ], 10, ($page-1)*10, 'created_time');

            }else
            {
                $annos = AnnotationView::backendsearch([
                'uri' => $uri,
                'creator_id' => $buser->id,
                'text' => $searchText,
                'tag' => $searchTag,
                'sort' => $searchsort,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $buser->id,
                ],
            ], 10, ($page-1)*10, 'created_time');
            }
        }
   
        $pagesCount = intval($annos['count'] / 10 + 1);
        $urilist =[];


        $annoData = [];

        foreach($annos['annos'] as $anno) {

            $annoData[$anno['uri']] [] = $anno;
            array_push($urilist,$anno['uri']);
        }

        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'urilists' => array_unique($urilist),
            'user' => $user,
            'following' => '',
            'old' => [
                'search_all' => Input::get('search_all'),
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_page'=> $page,
                'search_sort' =>input::get('search_sort'),
                'search_public' => $searchPublic
            ]
        ]);
    }
}
