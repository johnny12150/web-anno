<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

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


    public static function checkExist($uid, $id)
    {
        $count = self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->count();
        if($count == 0)
            return False;
        else
            return True;
    }

    public static function get($id)
    {
        return self::where('id', '=', $id)->first();
    }


    public static function getByUri($uid, $uri, $limit = 1, $offset = 1) {
        return self::whereRaw('uri = ? AND ( creator_id= ? OR is_public = 1 )',array($uri, $uid))->take($limit)->get();
    }


    public static function getById($id) {
        return self::where('id', '=', $id)->first();
    }


    public static function getAllUriArray($uid) {
        return self::select(`uri`)->where('id', '=', $uid)->groupBy('uri')->lists('uri');
    }


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
            return $new_anno;
        }
        else
        {
            return $check;
        }
    }


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


    public static function edit($uid, $id, $data)
    {
        if(self::checkExist($uid, $id))
        {
            $check = self::validator($data);
            if( $check == true )
            {
                return self::whereRaw('id = ? and creator_id = ?',array($id, $uid))->update(array(
                    'text' => $data['text'],
                    'quote' => $data['quote'],
                    'uri' => $data['uri'],
                    'ranges_start' => $data['ranges_start'],
                    'ranges_end' => $data['ranges_end'],
                    'ranges_startOffset' => $data['ranges_startOffset'],
                    'ranges_endOffset' => $data['ranges_endOffset'],
                ));
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

    public static function format($anno, $tags)
    {
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
                'id' => $anno->creator_id
            ]
        ];
    }



}
