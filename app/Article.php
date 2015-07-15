<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Article extends Model {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'articles';
    protected $fillable = ['title', 'content'];

    /**
     * @param $data the data that will be verified
     * @return bool result of validation
     */
    public static function validator($data) {
        $validator_return = Validator::make(
            $data,
            [
                'title' => ['required', 'max:255'],
                'content' => ['required']
            ]);
        if($validator_return->fails()) {
            return $validator_return->messages();
        } else {
            return true;
        }
    }


    public static function get($aid){
        if(self::checkExist($aid)) {
            return self::whereRaw('id = ?',array($aid))->first();
        } else {
            return false;
        }
    }


    public static function getAll($page, $limit)
    {
        return self::skip($limit*($page-1))->take($limit)->get();
    }

    public static function checkExist($aid)
    {
        $count = self::whereRaw('id = ?',array($aid))->count();
        if($count == 0) {
            return False;
        } else {
            return True;
        }
    }


    public static function add($uid, $article)
    {
        $check = self::validator($article);
        if($check) {

            $new_article = new Article();
            $new_article->author_id = $uid;
            $new_article->title = $article['title'];
            $new_article->content = $article['content'];

            $new_article->save();
            return $new_article;
        } else {
            return $check;
        }
    }


    public static function del($uid, $aid)
    {
        if(self::checkExist($uid, $aid)) {
            return self::whereRaw('id = ? and author_id = ?',array($aid, $uid))->delete();
        } else {
            return 'Article does not exist.';
        }
    }

}
