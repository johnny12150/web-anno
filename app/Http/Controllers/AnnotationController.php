<?php namespace App\Http\Controllers;

use App\Annotation;
use App\AnnotationView;
use App\AuthTable;
use App\Http\Requests;
use App\Like;
use App\TagUse;
use App\Tag;

use App\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use OAuth\Common\Exception\Exception;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;


class AnnotationController extends Controller
{


    function __construct()
    {

    }
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

    public function add()
    {


        $text = Request::input('text');
        $quote = Request::input('quote');
        $uri = Request::input('uri');
        $domain = Request::input('domain');
        $link = Request::input('link');
        $isImage = Request::input('type') == 'image';
        $image_src = Request::input('src');
        $type = Request::input('type');
        $tags = Request::input('tags');

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

        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;

        $user = Session::get('user');

        /* 新增標記 */
        $anno = Annotation::add([
            'creator_id' => $user->id,
            'text' => $text,
            'quote' => $quote,
            'uri' => $uri,
            'domain' => $domain,
            'link' => $link,
            'ranges_start' =>  $ranges_start,
            'ranges_end' => $ranges_end,
            'type' => $isImage ? $type : 'text',
            'src' => $isImage ? $image_src : null,
            'position' => $isImage ? [
                'x' => $x,
                'y' => $y
            ] : null,
            'ranges_startOffset' => $ranges_startOffset,
            'ranges_endOffset' => $ranges_endOffset,
            'is_public' => $is_public,
            'tags' => $tags
        ]);

        //回傳該標記
        return self::get($anno['id']);
    }

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
            'tags' => $tags
        ]);


        // 儲存失敗則回傳Http 500
        if (!$result)
            abort(500);

        //成功則返回該標記
        return self::get($id);

    }

    public function get($id)
    {
        // Find tags
        $anno = AnnotationView::search(array(
            'id' => $id
        ), 1, 0);

        return (isset($anno[0]) ? $anno[0] : []);
    }

    public function delete($id)
    {
        $user = Session::get('user');
        //Delete Annotation
        Annotation::del($user->id, $id);
        //return 204 code
        abort(204);
    }


    /**
     * @return array
     */
    public function search()
    {

        $domain = Request::input('domain');
        $token = Request::input('anno_token');
        $domain = urldecode($domain);
        if(AuthTable::check($domain, $token))
        {
            $user = User::get(AuthTable::getByDomainToken($domain, $token)->uid);
            Session::flash('user', $user);
        }


        // limit 沒設定的話目前預設暫定 999 個標記
        $limit = Request::input('limit') == '' ? -1 :
            intval(Request::input('limit')) == 0 ? -1 : intval(Request::input('limit'));
        // 搜尋的 uri （必要）
        $uri = Request::input('uri');
        // 搜尋的 user id
        $user_id = intval(Request::input('user'));

        if( $user_id == 0 && isset($user))
        {
            $user_id = $user->id;
        }
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

        $annotations = AnnotationView::sortByUserTop($annotations, $user_id);

        $result = [
            'total' => count($annotations),
            'rows' => $annotations
        ];

        return $result;
    }

    public function like($id)
    {
        $like = Request::input('like');

        $like = intval($like);
        if ($like > 1 | $like < -1)
            $like = 0;

        $user = Session::get('user');
        $user_id = $user->id;
        Like::setLike($user_id, $id, $like);
        return self::get($id);
    }

    public function check()
    {

        $user = Session::get('user');
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gravatar' => Gravatar::src($user->email)
            ]
        ];
    }


    public function logout() {
        $domain = Request::input('domain');
        $token = Request::input('anno_token');
        AuthTable::remove($domain, $token);
        return [
            'response' => true
        ];
    }

}
