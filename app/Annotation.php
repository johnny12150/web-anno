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
    public static function checkOwner($uid, $id)
    {
        $count = self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->count();
        if($count == 0)
            return False;
        else
            return True;
    }


    /**
     * Get Annotations by Uri
     * @param string $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUri($uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {

        $annos = self::where('uri', $uri)->take($limit)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();

        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }

        return $ret;
    }

    /**
     * Get Annotations by user_id and uri
     * @param int $uid
     * @param int $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUserUri($uid, $uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {

        $annos = self::where('creator_id', $uid)->where('uri', $uri)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get Public Annotations by uri
     * @param $uri
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getPublicByUri($uri, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {
        $annos = self::where('uri', $uri)->where('is_public', true)->skip($offset)->take($limit)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }

    /**
     * Get Annotations by user_id
     * @param $uid
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function getByUser($uid, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc') {
        $annos = self::where('creator_id', $uid)->take($limit)->skip($offset)->orderBy($orderBy, $order)->get();
        $ret = [];
        foreach($annos as $anno) {
            $ret[] = self::format($anno);
        }
        return $ret;
    }


    /**
     * Get Annotation by id
     * @param int $id
     * @return array Formatted Annotaton
     */
    public static function getById($id) {
        $anno = self::where('id', '=', $id)->first();
        return self::format($anno);
    }

    /**
     * Search Annotation by condition( uri , creator_id , text , quote )
     * @param Array $cond
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array Array of formatted Annotations
     */
    public static function search($cond, $limit = 1, $offset = 0, $orderBy = 'id', $order = 'asc')
    {
        $query = null;

        if(isset($cond['uri'])) {
            $query = self::where('uri', $cond['uri']);
        }

        if(isset($cond['creator_id'])) {
            if($query == null)
                $query = self::where('creator_id', $cond['creator_id']);
            else
                $query->where('creator_id', $cond['creator_id']);
        }

        if(!isset($cond['text']))
            $cond['text'] = '';
        if(!isset($cond['quote']))
            $cond['quote'] = '';

        if( $query != null )
        {
            $query->whereRaw(' ( text LIKE ? OR quote LIKE ? ) ', array('%'.$cond['text'].'%','%'.$cond['quote'].'%'));
            $query->orderBy($orderBy, $order);

            $annos = $query->skip($offset)->take($limit)->get();
            $ret = [];
            foreach($annos as $anno) {
                $ret[] = self::format($anno);
            }
            return $ret;
        } else return [];
    }

    public static function getCountByUser($uid)
    {
        return self::where('creator_id', $uid)->count();
    }

    /**
     * Add Annotation
     *
     * @param $data
     * @return array|bool
     */
    public static function add($data)
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
            $new_anno->type = $data['type'];
            if($data['type'] == 'image') {
                $new_anno->x = $data['position']['x'];
                $new_anno->y = $data['position']['y'];
                $new_anno->src = $data['src'];
            }
            $new_anno->save();

            $tags = $data['tags'];

            if(!$tags)
                $tags = [];
            $tags = array_unique($tags);

            foreach( $tags as $tagName) {
                $tagName = str_replace(',','',$tagName);
                $tag = Tag::getByName($tagName);
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
        if(self::checkOwner($uid, $id) )
        {
            return self::where('id', $id)->where('creator_id', $uid)->delete();
        }
        else
        {
            return false;
        }
    }
    public static function editText($uid, $id, $text)
    {
        if(self::checkOwner($uid, $id))
        {

            $res =  self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->update(array(
                'text' => $text ));

            return $res;
        } else {
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
        if(self::checkOwner($uid, $id)) {
            $check = self::validator($data);
            if( $check == true ) {
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
                    $tagName = str_replace(',','',$tagName);
                    $tag = Tag::getByName($tagName);

                    if ($tag == null)
                        $tag = Tag::add($tagName);
                    TagUse::add($tag->id,$id);
                }

                return $data;

            }
            else {
                return $check;
            }
        } else {
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
            'type' => $anno->type,
            'position' => [
                'x' => $anno->x,
                'y' => $anno->y
            ],
            'src' => $anno->src,
            'user' => [
                'id' => $creator->id ,
                'gravatar' => Gravatar::src($creator->email)
            ]
        ];
    }

}
