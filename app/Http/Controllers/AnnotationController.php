<?php namespace App\Http\Controllers;

use App\Annotation;
use App\AnnotationView;
use App\AuthTable;
use App\Http\Requests;
use App\Like;
use App\bodygroup;
use App\Tag;
use App\User;
use App\BodyMember;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use OAuth\Common\Exception\Exception;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;
use Illuminate\Support\Facades\Auth;

class AnnotationController extends Controller
{
    /**
     * Get Annotation JS version.
     *
     * @return Object Json format of api version
     */
    public function index()
    {
        return [
            "name" => "Annotator Store API",
            "version" => "2.0.0"
        ];
    }

    public function add(Request $request)
    {
        
        $text = Request::input('text');
        $quote = Request::input('quote');
        $uri = Request::input('uri');
        $domain = Request::input('domain');
        $isImage = Request::input('type') == 'image';
        $image_src = Request::input('src');
        $type = Request::input('type');
        $tags = Request::input('tags') ;

        $ranges_start = '';
        $ranges_end = '';
        $ranges_startOffset = '';
        $ranges_endOffset = '';

        if(isset(Request::input('ranges')[0]['start']))
            $ranges_start = Request::input('ranges')[0]['start'];
        if(isset(Request::input('ranges')[0]['end']))
            $ranges_end = Request::input('ranges')[0]['end'];
        if(isset(Request::input('ranges')[0]['startOffset']))
            $ranges_startOffset = Request::input('ranges')[0]['startOffset'];
        if(isset(Request::input('ranges')[0]['endOffset']))
            $ranges_endOffset = Request::input('ranges')[0]['endOffset'];

        $x = ($isImage && isset(Request::input('position')['x'])) ?  Request::input('position')['x'] : 0;
        $y = ($isImage && isset(Request::input('position')['y'])) ?  Request::input('position')['y'] : 0;
        $width = ($isImage && isset(Request::input('position')['width'])) ?  Request::input('position')['width'] : 0;
        $height = ($isImage && isset(Request::input('position')['height'])) ?  Request::input('position')['height'] : 0;
        $Xpath = Request::input('Xpath');
        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;

        $user = Session::get('user');
        $content_type= Request::getContentType();
        /* 新增標記 */
       
        $anno = Annotation::add([
            'creator_id' => $user->id,
            'text' => $text,
            'quote' => $quote,
            'uri' => $uri,
            'domain' => $domain,
            'ranges_start' =>  $ranges_start,
            'ranges_end' => $ranges_end,
            'type' => $isImage ? $type : 'text',
            'src' => $isImage ? $image_src : $uri,
            'position' => $isImage ? [
                'x' => $x,
                'y' => $y,
                'width'=>$width,
                'height'=>$height
            ] : null,
            'Xpath' => $Xpath, // image Xpath
            'ranges_startOffset' => $ranges_startOffset,
            'ranges_endOffset' => $ranges_endOffset,
            'is_public' => $is_public,
            'tags' => $tags
        ]);
         
        //回傳該標記
        return self::get($anno);

    }
    /*Update the annotator*/
    public function update($id)
    {

        //標籤
        $tags = Request::input('tags');
        $text = Request::input('text');
        $quote = Request::input('quote');
        $uri = Request::input('uri');
        $domain = Request::input('domain');
        $ranges_start = '';
        $ranges_end = '';
        $ranges_startOffset = '';
        $ranges_endOffset = '';
        $bid = Request::input('bid');
        if(isset(Request::input('ranges')[0]['start']))
            $ranges_start = Request::input('ranges')[0]['start'];
        if(isset(Request::input('ranges')[0]['end']))
            $ranges_end = Request::input('ranges')[0]['end'];
        if(isset(Request::input('ranges')[0]['startOffset']))
            $ranges_startOffset = Request::input('ranges')[0]['startOffset'];
        if(isset(Request::input('ranges')[0]['endOffset']))
            $ranges_endOffset = Request::input('ranges')[0]['endOffset'];

        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;

        $user = Session::get('user');
        /* 編輯標記 */
        $result = Annotation::edit($user->id, $id, [
            'creator_id' => $user->id,
            'text' => $text,
            'quote' => $quote,
            'domain' => $domain,
            'uri' => $uri,
            'ranges_start' => $ranges_start,
            'ranges_end' => $ranges_end,
            'ranges_startOffset' => $ranges_startOffset,
            'ranges_endOffset' => $ranges_endOffset,
            'is_public' => $is_public,
            'tags' => $tags,
            'bg_id' => $bid,
        ]);


        // 儲存失敗則回傳Http 500
        if (!$result)
            abort(500);

        //成功則返回該標記
        return self::get($id); // self is static, can't replace with this .

    }

    public function get($id)
    {
        // Find tags
        $anno = AnnotationView::search(array(
            'id' => $id
        ), 1, 0);

        return (isset($anno[0]) ? $anno[0] : []);
    }
    public function addbody()
    {
        $text = Request::input('text');
        $id = Request::input('id');
        $uri = Request::input('uri');
        $user_id = Session::get('user')->id;
        $tags = explode(" ",Request::input('tags'));
        $public = Request::input('public');
        if($public =='true') $public = 1;
        else $public = 0;
        $bg_id = bodygroup::add($id);
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'public' => $public,
            'purpose' => "tagging",
            'bg_id' => $bg_id,
            'type' =>'TextualBody'
        ]);
        }
        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'public' => $public,
            'purpose' => "describing",
            'bg_id' => $bg_id,
            'type' =>'TextualBody'
        ]);
        $annos = self::search();
        return [$annos,$bg_id];
    }
    public function deletebody($bg_id){
        bodygroup::deletebody($bg_id);
        
        $uri = Request::input('uri');

        return self::search();
    }
    public function updatebody(){

        $text = Request::input('text');
        $id = Request::input('id');
        $user_id = Session::get('user')->id;
        $tags = explode(" ",Request::input('tags'));
        $uri = Request::input('uri');
        Bodymember::deleteBody($id);
        $public = Request::input('public');
        if($public =='true') $public = 1;
        else $public = 0;
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'purpose' => "tagging",
             'public' => $public,
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);
        }
        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'purpose' => "describing",
            'public' => $public,
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);

        $annotations = AnnotationView::search([
            'uri' => $uri
        ]);
        $result = [
            'total' => count($annotations),
            'rows' => $annotations
        ];
        return $result;
    }
    public function delete($id)
    {
        $user = Session::get('user');
        if($user != null) {
            //Delete Annotation
            Annotation::del($user->id, $id);
            //return 204 code
            abort(204);
        } else {
            abort(401);
        }
    }
    public function tempdelete($id)
    {
        $user = Session::get('user');
        if($user != null) {
            //Delete Annotation
            Annotation::tempdelete($user->id, $id);
            //return 204 code
            abort(204);
        } else {
            abort(401);
        }
    }

    /**
     * @return array
     */
    public function search()
    {

        $domain = Request::input('domain');
        $token = Request::input('anno_token');
        $domain = urldecode($domain);

        // limit 沒設定的話目前預設暫定 999 個標記
        $limit = Request::input('limit') == '' ? -1 :
            intval(Request::input('limit')) == 0 ? -1 : intval(Request::input('limit'));
        // 搜尋的 uri （必要）
        $uri = Request::input('uri');
        // 搜尋的 user id
        $user_id = intval(Request::input('user'));
        // 搜尋的標記內容
        $searchText = Request::input('search');
        
        $offset = intval(Request::input('offset'));
        $annotations = AnnotationView::search([
            'uri' => $uri,
            'quote' => $searchText,
            'text' => $searchText,
            'public' => [
                'is_public' => true,
                'creator_id' => $user_id
            ]
        ], $limit, $offset);

      

        $result = [
            'total' => count($annotations),
            'rows' => $annotations
        ];

        return $result;
    }

    public function like($id)
    {
        $like = Request::input('like');
        $like = intval($like);  //將變數變為整數
        if ($like > 1 | $like < -1)
            $like = 0;

        $user = Session::get('user');
        $user_id = $user->id;
        Like::setLike($user_id, $id, $like);
        return like::count($id);  
    }

    public function check()
    {
        $user = Session::get('user');
      
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gravatar' => Gravatar::src($user->email),
                'like' =>  Like::getlikebyuser($user->id)
            ]
        ];
    }


    public function logout() {
        $domain = Request::input('domain');
        $token = Request::input('anno_token');
        Auth::logout();
        AuthTable::remove($domain, $token);
        return [
            'response' => true
        ];
    }

    public function gethint()
    {

      
        $name = Annotation::getName();
        /*deal with data example:<p>abcds</p>*/
        $namefix = str_replace(array('<p>','</p>'),"",$name);
        $q = $_REQUEST["q"];
        $hint = "";
        // lookup all hints from array if $q is different from "" 
        if ($q !== "") {
            $q = strtolower($q);
            $len=strlen($q);
            foreach($namefix as $name) {
                if (stristr($q, substr($name, 0, $len))) {
                    if ($hint === "") {
                        $hint = $name;
                    } else {
                        $hint .= ", $name";
                    }
                }
            }
        }
        // Output "no suggestion" if no hint was found or output correct values 
        echo $hint === "" ? "no suggestion" : $hint;
    }
}
