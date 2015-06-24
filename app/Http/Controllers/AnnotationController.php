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

    /**
     * Get all annotaions of specific article.
     * @param none
     * @return Object json format of annotations data.
     */
    public function all()
    {
        /*$objs = Annotation::getAllAnnotations(User::user()->id, $uri);
        $annos = [];
        foreach( $objs as $obj )
        {
            $annos[] = [
                'id' => $obj->id,
                'text' => $obj->text,
                'quote' => $obj->text,
                'uri' => $obj->text,
                'ranges' => [
                    [
                        'start' => $obj->ranges_start,
                        'end' => $obj->ranges_end,
                        'startOffset' => $obj->ranges_startOffset,
                        'endOffset' => $obj->ranges_endOffset
                    ]
                ],
            ];
        }

        return $annos;*/
    }

    public static function add()
    {
        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;
        $tags = Request::input('tags');
        /* Create New Annotation */
        $new_anno = Annotation::add(User::user()->id, [
            'creator_id' => User::user()->id,
            'text' => Request::input('text'),
            'quote' => Request::input('quote'),
            'uri' => Request::input('uri'),
            'ranges_start' => Request::input('ranges')[0]['start'],
            'ranges_end' => Request::input('ranges')[0]['end'],
            'ranges_startOffset' => Request::input('ranges')[0]['startOffset'],
            'ranges_endOffset' => Request::input('ranges')[0]['endOffset'],
            'is_public' => $is_public,
            'tags' => $tags
        ]);


        if (is_object($new_anno)) {
            return $new_anno;
        } else {
            // return error meesage
            return $new_anno;
        }
    }

    public static function update($id)
    {
        $permissions = Request::input('permissions');
        $tags = Request::input('tags');

        $is_public = count($permissions['read']) == 0;
        /* Edit Annotation */
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

        if (!$result)
            abort(500);

        /* Process Tags and Relations */


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
        // Delete annotation
        Annotation::del(User::user()->id, $id);
        abort(204);
    }


    public static function search()
    {

        $limit = Request::input('limit') == '' ? 0 : Request::input('limit');
        $uri = Request::input('uri');
        $user_id = Request::input('user');
        $searchTag = Request::input('tag');
        $searchText = Request::input('search');

        $annos_result = [];


        if ($searchText == '') {
            if ($user_id == '')
                $annos = Annotation::getPublicByUri($uri, $limit);
            else
                $annos = Annotation::getByUserUri($user_id, $uri, $limit);

            if ($searchTag != '') {
                foreach ($annos as $key => $anno) {
                    $checkTag = false;
                    foreach ($anno['tags'] as $key => $tag) {
                        if (strtolower($tag) == strtolower($searchTag)) {
                            $checkTag = true;
                            break;
                        }
                    }
                    if ($checkTag) {
                        $annos_result[] = $anno;

                    }
                }
            } else {
                $annos_result = $annos;
            }

        } else {
            $annos_result = Annotation::search($uri, $searchText);
        }


        // Ser result
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
