<?php namespace App\Http\Controllers;

use App\Annotation;
use App\Http\Requests;
use App\TagUse;
use App\Tag;

use App\User;
use Illuminate\Support\Facades\Request;
use OAuth\Common\Exception\Exception;


class AnnotationController extends Controller
{


    function __construct()
    {
        //設定cross domain 的header
        header('Access-Control-Allow-Origin', '*');
        header('Allow', 'GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        header('Access-Control-Allow-Credentials', 'true');
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

    public static function add()
    {
        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;
        $tags = Request::input('tags');

        $isImage = Request::input('type') == 'image';
        $image_src = Request::input('src');
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
        $src = ($isImage && Request::input('src') != '') ? Request::input('src') : '';
        /* 新增標記 */
        $anno = Annotation::add([
            'creator_id' => User::user()->id,
            'text' => Request::input('text'),
            'quote' => Request::input('quote'),
            'uri' => Request::input('uri'),
            'ranges_start' =>  $ranges_start,
            'ranges_end' => $ranges_end,
            'type' => $isImage ? Request::input('type') : 'text',
            'src' => $isImage ? Request::input('src') : null,
            'position' => $isImage ? [
                'x' => $x,
                'y' => $y
            ] : null,
            'src' => $isImage ? $src : null,
            'ranges_startOffset' => $ranges_startOffset,
            'ranges_endOffset' => $ranges_endOffset,
            'is_public' => $is_public,
            'tags' => $tags
        ]);

        //回傳該標記
        return $anno;
    }

    public static function update($id)
    {
        //權限
        $permissions = Request::input('permissions');
        //標籤
        $tags = Request::input('tags');
        //是否公開
        $is_public = count($permissions['read']) == 0;
        /* 編輯標記 */
        $result = Annotation::edit(User::user()->id, $id, [
            'creator_id' => User::user()->id,
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

    public static function get($id)
    {
        // Find tags
        $anno = Annotation::getById($id);

        return $anno;
    }

    public static function delete($id)
    {
        //Delete Annotation
        Annotation::del(User::user()->id, $id);
        //return 204 code
        abort(204);
    }


    public static function search()
    {
        // limit 沒設定的話目前預設暫定 999 個標記
        $limit = Request::input('limit') == '' ? 999 : intval(Request::input('limit')) == 0 ? 999 : intval(Request::input('limit'));
        // 搜尋的 uri （必要）
        $uri = Request::input('uri');
        // 搜尋的 user id
        $user_id = Request::input('user');
        // 搜尋的標記內容
        $searchText = Request::input('search');

        $annos_result = [];

        if ($searchText == '') {
            // 如果沒有特定使用者，就直接抓公開的標記，反之，只抓特定使用者的標記
            if ($user_id == '')
                $annos_result = Annotation::getPublicByUri($uri, $limit);
            else
                $annos_result = Annotation::getByUserUri($user_id, $uri, $limit);
        } else {
            //用標記內容、網址搜尋
            $annos_result = Annotation::search([
                'uri' => $uri,
                'creator_id' => $user_id,
                'text' => $searchText,
                'quote' => $searchText
            ], 999);
        }

        $result = [
            'total' => count($annos_result),
            'rows' => $annos_result
        ];

        return $result;
    }

    public static function check()
    {
        return '';
    }

}
