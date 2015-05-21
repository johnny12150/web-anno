<?php namespace App\Http\Controllers;

use App\Annotation;
use App\Http\Requests;
use App\TagUse;
use App\Tag;

use App\User;
use Illuminate\Support\Facades\Request;


class AnnotationController extends Controller {

    function __construct() {
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
            "name"=> "Annotator Store API",
            "version"=> "2.0.0"
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
        ]);


        // Find tags
        $anno_id = $new_anno->id;
        $tags = Request::input('tags');
        if( $tags == null )
            $tags = [];
        $tags = array_unique($tags);

        foreach( $tags as $tagName) {
            $tag = Tag::findByName($tagName);
            if ($tag == null)
                $tag = Tag::add($tagName);
            TagUse::add($tag->id, $anno_id);
        }

        if(is_object($new_anno))
        {
            // Refact object
            return Annotation::format($new_anno, $tags);
        }
        else
        {
            // return error meesage
            return $new_anno;
        }
    }

    public static function update($id)
    {
        $permissions = Request::input('permissions');
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
        ]);

        if(!$result)
            abort(500);

        /* Process Tags and Relations */

        $tags = Request::input('tags');
        if( $tags == null)
            $tags = [];
        $tags = array_unique($tags);

        //clear origin relation and readd relation
        $result = TagUse::delByAnnoId($id);

        if(!$result)
            abort(500);

        foreach( $tags as $tagName) {
            //find this tag
            $tag = Tag::findByName($tagName);

            if ($tag == null)
                $tag = Tag::add($tagName);
            TagUse::add($tag->id,$id);
        }

        return self::get($id);

    }

    public static function get($id)
    {
        // Find tags
        $anno = Annotation::getById($id);
        $tag_list = TagUse::findTagIds($anno->id);
        $tags = [];
        foreach($tag_list as $tag_id) {
            $tagName = Tag::getNameById($tag_id);
            if($tagName != null)
                $tags[] = $tagName;
        }

        // Refact result object
        return Annotation::format($anno, $tags);
    }

    public static function delete($id)
    {
        // Delete annotation
        Annotation::del(User::user()->id, $id);
        abort(204);
    }


    public static function search() {

        $limit = Request::input('limit') != '' ? Request::input('limit') : 0;
        $uri = Request::input('uri');

        $objs = Annotation::getByUri(User::user()->id, $uri, $limit);
        $annos = [];

        foreach( $objs as $obj )
        {
            // Find tags
            $tag_list = TagUse::findTagIds($obj->id);
            $tags = [];
            foreach($tag_list as $tag_id) {
                $tagName = Tag::getNameById($tag_id);
                if($tagName!=null)
                    $tags[] = $tagName;
            }

            // Refact object
            $annos[] = Annotation::format($obj, $tags);
        }

        // Ser result
        $result = [
            'total' => count($annos),
            'rows' => $annos
        ];

        return $result;
    }

    public static function check() {
        return '';
    }


}
