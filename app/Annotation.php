<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use App\Tag;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

/**
 * Class Annotation
 * @package App
 */
class Annotation extends Model {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'annotations';

    /**
     * @param $data the data that will be verified
     * @return bool result of validation
     */
    public static function validator($data)
    {
        $validator_return = Validator::make(
            $data,
            [
                'creator_id' => ['required', 'numeric'],
                'text' => ['required'],
                'quote' => ['required'],
                'uri' => ['required'],
                'ranges_start' => ['required'],
                'ranges_end' => ['required'],
                'ranges_startOffset' => ['required', 'numeric'],
                'ranges_endOffset' => ['required', 'numeric']
            ]);
        if($validator_return->fails())
        {
            return $validator_return->messages();
        }
        else
        {
            return true;
        }
    }


    /**
     * Check Annotation exists
     * @param $uid User ID
     * @param $id  Annotation ID
     * @return bool
     */
    public static function checkExist($uid, $id)
    {
        $count = self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->count();
        if($count == 0)
            return False;
        else
            return True;
    }


    /**
     * Get anntations by Uri
     * @param $uri - Uri of annotations
     * @param int $limit - Limit of result
     * @param int $offset - Skip records
     * @return array - Array of annotation
     */
    public static function getByUri($uri, $limit = -1, $offset = 0) {

        if($limit == -1)
            $annos = self::where('uri', $uri)->take($limit)->skip(0)->get();
        else
            $annos = self::where('uri', $uri)->take($limit)->skip(0)->take($limit)->get();

        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get Anntations by user id and uri
     * @param $uid - User ID
     * @param $uri - Uri of annotation
     * @param int $limit - Limit of results
     * @param int $offset - Skip records
     * @return array - Array of annotation
     */
    public static function getByUserUri($uid, $uri, $limit = 1, $offset = 1) {

        $annos = self::where('creator_id', $uid)->where('uri', $uri)->take($limit)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get only public Anntations by uri
     *
     * @param $uid - User ID
     * @param $uri - Uri of annotation
     * @param int $limit - Limit of result
     * @param int $offset - Skip raws
     * @return array - Array of annotation
     */
    public static function getPublicByUri($uri, $limit = 1, $offset = 1) {
        $annos = self::whereRaw('uri = ? AND is_public = 1',array($uri))->take($limit)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get annotations by user id
     *
     * @param $uid - User ID
     * @param int - $limit Limit of result
     * @param int $offset - Skip of raws
     * @return array - Array of annotation
     */
    public static function getByUser($uid, $limit = 1, $offset = 0) {
        $annos = self::where('creator_id', $uid)->take($limit)->skip($offset)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * @param int $uid - User ID
     * @return int - amount of annotations belongs to that user
     */
    public static function getCountByUser($uid)
    {
        return self::where('creator_id', $uid)->count();
    }


    /**
     * Get annotation by ID
     * @param int $id
     * @return Annotation
     */
    public static function getById($id) {
        $anno = self::where('id', '=', $id)->first();
        return self::format($anno);
    }


    /**
     * Get all uri of annotations
     * @param $uid - User ID
     * @return array - Array of Uris
     */
    public static function getAllUriArray($uid) {
        $annos =  self::select(`uri`)->where('id', '=', $uid)->groupBy('uri')->lists('uri');
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Search annotations by uri or keyword
     *
     * @param $uri - Uri of searching
     * @param $text - Keyword of searching
     * @return array - Array of annotations
     */
    public static function search($uri, $text) {

        $annos = self::getByUri($uri, 999);
        $new_res = [];

        foreach($annos as $anno) {

            $check = false;

            if( strpos($anno['text'], $text) !== false ) {
                $new_res[] = $anno;
                continue;
            }
            if( strpos($anno['quote'], $text) !== false ) {
                $new_res[] = $anno;
                continue;
            }

            $check = false;
            foreach($anno['tags'] as $key => $tag )
            {
                if( strpos(strtolower($tag) , strtolower($text)) !== false )
                {
                    $check = true;
                    break;
                }
            }

            if( $check ) {
                $new_res[] = $anno;
                continue;
            }
        }


        return $new_res;

    }


    /**
     * Add Annotation
     *
     * @param $uid
     * @param $data
     * @return array|bool
     */
    public static function add($uid, $data)
    {
        $check = self::validator($data);
        if($check == true)
        {
            $new_anno = new Annotation();
            $new_anno->creator_id = $data['creator_id'];
            $new_anno->text = $data['text'];
            $new_anno->quote = $data['quote'];
            $new_anno->uri = $data['uri'];
            $new_anno->is_public  = $data['is_public'];
            $new_anno->ranges_start = $data['ranges_start'];
            $new_anno->ranges_end = $data['ranges_end'];
            $new_anno->ranges_startOffset = $data['ranges_startOffset'];
            $new_anno->ranges_endOffset = $data['ranges_endOffset'];
            $new_anno->save();

            $tags = $data['tags'];

            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                $tag = Tag::findByName($tagName);
                if ($tag == null)
                    $tag = Tag::add($tagName);
                TagUse::add($tag->id, $new_anno->id);
            }

            return self::format($new_anno);
        }
        else
        {
            return $check;
        }
    }


    /**
     * @param $uid
     * @param $id
     * @return bool
     */
    public static function del($uid, $id)
    {
        if(self::checkExist($uid, $id) )
        {
            return self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->delete();
        }
        else
        {
            return false;
        }
    }


    /**
     * @param $uid
     * @param $id
     * @param $data
     * @return bool|string
     */
    public static function edit($uid, $id, $data)
    {
        if(self::checkExist($uid, $id))
        {
            $check = self::validator($data);
            if( $check == true )
            {
                $anno =  self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->update(array(
                    'text' => $data['text'],
                    'quote' => $data['quote'],
                    'uri' => $data['uri'],
                    'ranges_start' => $data['ranges_start'],
                    'ranges_end' => $data['ranges_end'],
                    'ranges_startOffset' => $data['ranges_startOffset'],
                    'ranges_endOffset' => $data['ranges_endOffset'],
                ));

                $tags = $data['tags'];

                if(!$tags)
                    $tags = [];
                $tags = array_unique($tags);

                //clear origin relation and readd relation
                TagUse::delByAnnoId($id);

                foreach( $tags as $tagName) {
                    //find this tag
                    $tag = Tag::findByName($tagName);

                    if ($tag == null)
                        $tag = Tag::add($tagName);
                    TagUse::add($tag->id,$id);
                }

                return $data;

            }
            else
            {
                return $check;
            }
        }
        else
        {
            return 'anootation does not exist';
        }
    }

    /**
     * @param $anno
     * @return array
     */
    public static function format($anno)
    {
        //Link tags
        $tag_list = TagUse::findTagIds($anno->id);
        $tags = [];
        foreach($tag_list as $tag_id) {
            $tagName = Tag::getNameById($tag_id);
            if($tagName != null) {
                $tags[] = $tagName;
            }
        }

        $creator = User::get($anno->creator_id);
        // Refact object
        return [
            'id' => $anno->id,
            'text' => $anno->text,
            'quote' => $anno->quote,
            'uri' => $anno->uri,
            'ranges' => [
                [
                    'start' => $anno->ranges_start,
                    'end' => $anno->ranges_end,
                    'startOffset' => $anno->ranges_startOffset,
                    'endOffset' => $anno->ranges_endOffset
                ]
            ],
            'tags' => $tags,
            'permissions' => [
                "read" => $anno->is_public ? [] :[(int)$anno->creator_id],
                "admin" => [(int)$anno->creator_id],
                "update" => [(int)$anno->creator_id],
                "delete" => [(int)$anno->creator_id]
            ],
            'user' => [
                'id' => $creator->id ,
                'gravatar' => Gravatar::src($creator->email)
            ]
        ];
    }



}
