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

        $user = Session::get('user');

        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;
        $tags = Request::input('tags');
        $uri = Request::input('uri');

        $isImage = Request::input('type') == 'image';
        $image_src = Request::input('src');
        $type = Request::input('type');
        $quote = Request::input('quote');
        $text = Request::input('text');
        $ranges_start = '';
        $ranges_end = '';
        $ranges_startOffset = '';
        $ranges_endOffset = '';
        $x = 0;
        $y = 0;

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

        /* 新增標記 */
        $anno = Annotation::add([
            'creator_id' => $user->id,
            'text' => $text,
            'quote' => $quote,
            'uri' => $uri,
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
        return $anno;
    }

    public function update($id)
    {
        $user = Session::get('user');
        //權限
        $permissions = Request::input('permissions');
        //標籤
        $tags = Request::input('tags');
        //是否公開
        $is_public = count($permissions['read']) == 0;
        /* 編輯標記 */
        $result = Annotation::edit($user->id, $id, [
            'creator_id' => $user->id,
            'text' => Request::input('text'),
            'quote' => Request::input('quote'),
            'uri' => Request::input('uri'),
            'ranges_start' => Request::input('ranges')[0]['start'],
            'ranges_end' => Request::input('ranges')[0]['end'],
            'ranges_startOffset' => Request::input('ranges')[0]['startOffset'],
            'ranges_endOffset' => Request::input('ranges')[0]['endOffset'],
            'permissions' => Request::input('permission')[0]['read'],
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


    public function search()
    {
        // limit 沒設定的話目前預設暫定 999 個標記
        $limit = Request::input('limit') == '' ? 999 : intval(Request::input('limit')) == 0 ? 999 : intval(Request::input('limit'));
        // 搜尋的 uri （必要）
        $uri = Request::input('uri');
        // 搜尋的 user id
        $user_id = Request::input('user');
        // 搜尋的標記內容
        $searchText = Request::input('search');


        $annos = AnnotationView::search([
            'uri' => $uri,
            'creator_id' => $user_id,
            'quote' => $searchText,
            'text' => $searchText
        ], $limit, 0);

        $result = [
            'total' => count($annos),
            'rows' => $annos
        ];

        return $result;
    }

    public function like()
    {
        $user = Session::get('user');
        $aid =  Request::input('aid');
        $user_id = $user->id;
        $like = Request::input('like');
        $like = intval($like);

        if ($like > 1 | $like < -1)
            $like = 0;

        Like::setLike($user_id, $aid, $like);
        return self::get($aid);
    }

    public function check()
    {

        $user = Session::get('user');
        return [
            'user' => [
                'id' => $user->id,
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
