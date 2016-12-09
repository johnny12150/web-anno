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
   
    /*用於後台蒐尋時，auto complete的資訊
    *return tags ,text ,uri recommedation
    *return user's tags and text
    */
    public function gettags()
    {
        $user = Auth::user();
        if($user->authorization == 0){
            
        }else{
            
            $tags =  BodyMember::getTags($user->id);
            $texts =  BodyMember::getTexts($user->id);
            $uri_array =[];
            $anno_ids = Annotation::getAnnos($user->id,'backend');
            foreach ($anno_ids as $anno_id) {
                 array_push($uri_array, Target::geturi($anno_id));
            }
            $uri  = array_values(array_unique($uri_array)); 

            $array_text = [];
            foreach ($texts as $text ) {
               array_push($array_text, strip_tags($text));
            }
            return ['tags' => $tags , 'text'=>  $array_text,'uri' => $uri];
       
        }
    }
    /*collect頁面管理自己所收藏的註記
    *
    *
    */
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

                $annos = self::beckendbriefsearch_collect([
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

                $annos = self::beckendbriefsearch_collect([
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
                $annos = self::backendsearch_collect([
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
                $annos = self::backendsearch_collect([
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

    /*manage頁面管理自己的註記
    */
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

                $annos = self::beckendbriefsearch([
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

                $annos = self::beckendbriefsearch([
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
                $annos = self::backendsearch([
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
                $annos = self::backendsearch([
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
    /*首頁，查看自己所收藏與所追蹤的使用者的註記
    */
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
          

            $annos = self::beckendbriefsearch_follow([
                'search_all' => $search_all,
                'sort' => $searchsort,
                'creator_id' => $user->id,
                'user_first' => $search_user_first,
                'public' => $searchPublic == '' ? [] :[
                    'is_public' => $searchPublic == '1',
                    'creator_id' => $user->id,
                ],
            ], 10, ($page-1)*10, 'created_time');

   
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
    public function beckendbriefsearch_follow($conditions,$limit, $offset, $orderBy = 'created_time', $sort='desc'){
        $anno_id_get_from_reply =  Annotation::anno_id_get_from_reply($conditions['creator_id']);
        $anno_id_get_from_like = Annotation::anno_id_get_from_like($conditions['creator_id']);
        $anno_id_get_from_follow_user = Annotation::anno_id_get_from_follow_user($conditions['creator_id']);
        $temp = array_merge($anno_id_get_from_reply,$anno_id_get_from_like,$anno_id_get_from_follow_user);
        $annos = Annotation::annotation($temp);

        return  ['annos' =>$annos, 'count' => count($temp)];

    }
    /*後台管理頁面，刪除評論
    */
    public function delete()
    {

        $id = Input::get('id');
        $user_id = Auth::user()->id;
        $result = bodygroup::deletebody($id);;
        return [
            'result' => $result > 0
        ];
    }
    /*後台管理頁面，編集自己的評論
    *刪除舊的評論，從新創建取代之
    *return true  編集成公
    */
    public function edit()
    {
        
        $text = Input::get('text');
        $id = Input::get('id');
        $user_id = Auth::user()->id;
        $tags = explode(" ",Input::get('tags'));

        BodyMember::deleteBody($id);
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'purpose' => "tagging",
            'public' => '1',
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);
        }

        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'purpose' => "describing",
            'bg_id' => $id,
            'public' => '1',
            'type' =>'TextualBody'
        ]);

        return [
            'result' => "true" != false ,
        ];
    }
    /*瀏覽他人頁面,並回傳他的註記
    *@param $name 
    *@param $page 
    *return object 被瀏覽者的註記
    *others user profile*/
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

                $annos = self::beckendbriefsearch([
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

                $annos = self::beckendbriefsearch([
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
                $annos = self::backendsearch([
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
                $annos = self::backendsearch([
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
       /*後台manage頁面搜尋
       *將使用者輸入的條件，對target與body進行搜尋、搜尋結果用joint起來
       *@param $conditions    過律條件 uri 使用者ID 公開與否  標籤 文字等 
       *@param limit 一頁呈現比數
       *@param offset 從第幾筆開始
       **/
    public static function beckendbriefsearch($conditions,$limit, $offset, $orderBy = 'created_time', $sort='desc'){
        
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != ''){
            $anno_ids = Annotation::getAnnos($conditions['creator_id'],'backend');
            $temp = $anno_ids;    
            echo 'normal user';
         }
         else{
            $anno_ids = Annotation::getAnnos('0','backend','true');
            $temp = $anno_ids;
         } 

        if(isset($conditions['search_all']) && $conditions['search_all'])
        {
            $result1 = Target::search_with_likes($conditions['search_all']); //return anno_id array
            $bg_ids = BodyMember::search_with_like($conditions['search_all']);
            $result2 = bodygroup::getannobyid($bg_ids);
            $array = array_merge($result1,$result2);
        }
        $temp = array_intersect($temp, $array);
        $temp = array_unique($temp);

       /*if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);

            }  
        }*/
        //$count = $annos->count();
        //$result = $annos->skip($offset)->take($limit)->orderBy($orderBy,$sort)->get();
        $annos = Annotation::annotation($temp);
        $output = array_splice($annos,$offset,$limit);
        return  ['annos' =>$output, 'count' => count($temp)];
    }
    /*第一次進後台與進皆搜尋走的程式
    *過濾URI或TAGS或公開與否給使用者
    *@param $conditions    過律條件 uri 使用者ID 公開與否  標籤 文字等 
    *@param limit 一頁呈現比數
    *@param offset 從第幾筆開始
    **/
    public static function backendsearch($conditions , $limit, $offset, $orderBy = 'created_time', $sort='desc')
    {
        
       

        $temp = [];
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != ''){   
            $anno_ids = Annotation::getAnnos($conditions['creator_id'],'backend');
            $temp = $anno_ids;    
        }
        else{
            $anno_ids = Annotation::getAnnos('0','backend','true');
            $temp = $anno_ids;
         } 
        /*這裡還沒改*/
        if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
               
                //$temp = array_intersect($temp, $public);
            }  
        }

      
        if(isset($conditions['uri']) && $conditions['uri'] != '')
        {

             $anno_ids = Target::getannobyuri($conditions['uri']);
             $uri =[];
             foreach ($anno_ids as $anno_id) {
                array_push($uri, $anno_id);
             }
             $temp = array_intersect($temp, $uri);
        }
       
        /*對標記內容的篩選*/
        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::backsearchtext($conditions['text']);
            $anno_ids = [];

             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
             }

            $temp = array_intersect($temp, $anno_ids);
        }        

        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {

             $bg_ids = BodyMember::backgettags($conditions['tag']);
             
             $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);

             }

            $temp = array_intersect($temp, $anno_ids);
        }  
        $annos = Annotation::annotation($temp);
        $output = array_splice($annos,$offset,$limit);
        return  ['annos' =>$output, 'count' => count($temp)];

    }
    /*收藏頁面使用,統一搜尋
    *過濾URI或TAGS或公開與否給使用者
    *@param $conditions    過律條件 uri 使用者ID 公開與否  標籤 文字等 
    *@param limit 一頁呈現比數
    *@param offset 從第幾筆開始
    **/
    public static function beckendbriefsearch_collect($conditions,$limit, $offset, $orderBy = 'created_time', $sort='desc'){
        
        if(isset($conditions['search_all']) && $conditions['search_all'])
        {
            $result1 = Target::search_with_likes($conditions['search_all']); //return anno_id array
            $bg_ids = BodyMember::search_with_like($conditions['search_all']);
            $result2 = bodygroup::getannobyid($bg_ids);
            $array = array_merge($result1,$result2);
        }
       if( isset($conditions['creator_id']) && $conditions['creator_id'] != '')
        {
            $collect = collect::get($conditions['creator_id']);
            $result = array_intersect($array, $collect);
        }
       /*if( isset($conditions['public']) && is_array($conditions['public']))
        {
            if( isset($conditions['public']['is_public']) && $conditions['public']['is_public'] !== '')
            {
                $annos = $annos->where('is_public',$conditions['public']['is_public']);
            }  
        }*/
        $annos = Annotation::annotation($result);
        $output = array_splice($annos,$offset,$limit);
        return  ['annos' =>$output, 'count' => count($temp)];
    }
     /*收藏頁面使用,各別搜尋
    *過濾URI或TAGS或公開與否給使用者
    *@param $conditions    過律條件 uri 使用者ID 公開與否  標籤 文字等 
    *@param limit 一頁呈現比數
    *@param offset 從第幾筆開始
    **/
    public static function backendsearch_collect($conditions , $limit, $offset, $orderBy = 'created_time', $sort='desc')
    {
        $temp ;
        if( isset($conditions['creator_id']) && $conditions['creator_id'] != ''){
              $anno_id = collect::get($conditions['creator_id']);
              $temp = $anno_id;
        }    

        if(isset($conditions['uri']) && $conditions['uri'] != '')
        {

             $anno_ids = Target::getannobyuri($conditions['uri']);
             $uri =[];
             foreach ($anno_ids as $anno_id) {
                array_push($uri, $anno_id);
             }
             $temp = array_intersect($temp, $uri);
        }
       

        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::backsearchtext($conditions['text']);
            $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
             }
            $temp = array_intersect($temp, $anno_ids);
        }        

        if(isset($conditions['tag']) && $conditions['tag'] != '')
        {
             $bg_ids = BodyMember::backgettags($conditions['tag']);
             
             $anno_ids = [];
             foreach ($bg_ids as $bg_id ) {                 
                 array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);

             }
            $temp = array_intersect($temp, $anno_ids);
        }  
        $annos = Annotation::annotation($temp);
        $output = array_splice($annos,$offset,$limit);
        return  ['annos' =>$output, 'count' => count($temp)];

    }

   
  

}
