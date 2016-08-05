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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;

class ManageController extends Controller {
    //for easy autocomplete
    public function getall()
    {
        $user = Auth::user();
        $annos = AnnotationView::backendsearch(['creator_id' => $user->id],-1,0);
        $array = [];
        foreach($annos as $anno) {
          array_push($array, strip_tags($anno['text']));
        }
        return $array;
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
        $collects = collect::get($user->id);
        $annos = [];
        foreach ($collects as $collect ) {
            array_push($annos, self::get($collect->anno_id));
        }
    
        return view('manage.collect',[
            'annos' => $annos,
            'user'=>$user
            ]);
    }

    //my profile
    public function manage($page = 1)
    {
        
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $searchPublic = Input::get('search_public');
        $searchsort = input::get('search_sort');
        $user = Auth::user();
        

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

        if( empty($searchText) && empty($searchTag) )
            $count = Annotation::count();
        else 
        $count = count($annos);

        $pagesCount = intval($count / 10 + 1);
        $tags =  BodyMember::getTags($user->id);
        $urilist =[];


        $annoData = [];

        foreach($annos as $anno) {

            $annoData[$anno['uri']] []= $anno;
            array_push($urilist,$anno['uri']);
        }

        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'urilists' => array_unique($urilist),
            'count' => $count,
            'tags' => $tags ,
            'user' => $user,
            'following' => '',
            'old' => [
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_public' => $searchPublic
            ]
        ]);
    }
    //other's profile
	public function index($name,$page = 1)
    {
        $buser = User::getbyname($name);
        
        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $user = Auth::user();
        if($buser == null)
        $buser = $user;
        $following = follow::check($user->id,$buser->id);

        $annos = AnnotationView::backendsearch([
            'uri' => $uri,
            'creator_id' => isset($buser->id) ? $buser->id :'',
            'text' => $searchText,
            'tag' => $searchTag,
            'public' => [
                'is_public' => '1',
                'creator_id' =>  isset($buser->id) ? $buser->id :'',
            ],
        ], 10, ($page-1)*10, 'created_at');
        
        if( empty($searchText) && empty($searchTag) )
            $count = Annotation::count();
        else 
        $count = count($annos);
       
        
        $pagesCount = intval($count / 10 + 1);
        $tags =  BodyMember::getTags($buser->id);
        

        $urilist =[];


        $annoData = [];

        foreach($annos as $anno) {
            $annoData[$anno['uri']] []= $anno;
            array_push($urilist,$anno['uri']);
        }
        return view('manage.index', [
            'annoData' => $annoData,
            'page' => $page,
            'pagesCount' => $pagesCount,
            'count' => $count,
            'tags' => $tags ,
            'user' => $buser,
            'urilists' => array_unique($urilist),
            'old' => [
                'search_text' => Input::get('search_text'),
                'search_tag' => Input::get('search_tag'),
                'search_uri' => Input::get('search_uri'),
                'search_public' => []
            ],
            'following' => $following
        ]);
    }
    
    public function all(){
        
        $user = Auth::user();
        
        $tags =  BodyMember::getTags( $user->id);

        $searchText = Input::get('search_text');
        $searchTag = Input::get('search_tag');
        $uri = Input::get('search_uri');
        $annos = AnnotationView::getall(['user' => $user->id,
            'uri' => $uri,
            'text' => $searchText,
            'tag' => $searchTag
            ]);

        if( empty($searchText) && empty($searchTag) )
        $count = Annotation::count();
        else 
        $count = count($annos);
       
        
        $pagesCount = intval($count / 10 + 1);
         

        return view('manage.all', [
                'annos' =>$annos,
                'page' => 1,
                'pagesCount' => $pagesCount,
                'count' => $count,
                'tags' => $tags ,
                'user' => $user,
                'old' => [
                    'search_text' => Input::get('search_text'),
                    'search_tag' => Input::get('search_tag'),
                    'search_public' => []
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


}
