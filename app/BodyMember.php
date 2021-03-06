<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;
use App\Annotation;
//use App\Body;
use App\User;
use Illuminate\Support\Facades\DB;
class BodyMember extends Model{

	protected $table = 'body_member';
	public $timestamps = false;

	public static function add($data){
		
		$new_body = new BodyMember();
		$new_body->type = $data['type'];
		$new_body->text = $data['text'];
		$new_body->purpose = $data['purpose'];
		$new_body->creator = $data['creator_id'];
		$new_body->bg_id = $data['bg_id'];
		$new_body->is_public = $data['public'];
		$new_body->save();
	}
	public static function getbody($bg_id){
		$body = DB::table('body_member')->where('bg_id',$bg_id)->get();
		return $body;
	}

	public static function getothers($bg_id){
		
		$tags = DB::table('body_member')->select('text')->where('purpose','tagging')->where('bg_id',$bg_id)->get();
		$texts = DB::table('body_member')->where('purpose','describing')->where('bg_id',$bg_id)->get();
		$metas = DB::table('body_member')->where('purpose','like','meta:%')->where('bg_id',$bg_id)->get();
		$tagarray = [];
		$textarray =[];
		$text ;
		$creator ;
		$created_time;
		$is_public;
		$like = Like::count($bg_id);
		foreach ($tags as $tag ) {
			array_push($tagarray, $tag->text);
		}
		foreach ($texts as $text ) {
			
			array_push($textarray, $text->text);
			$creator = $text->creator;
			$created_time = $text->created_time;
			$is_public = $text->is_public;
		}
		$user = User::get($creator);
		$body = ['bid'=> isset($bg_id) ? $bg_id : "",
					   'text' => isset($textarray) ? $textarray :"",
					   'tags' => isset($tagarray) ? $tagarray :"",
					   'metas' => isset($metas) ? $metas:"",
					   'creator' => isset($user->name) ? $user->name: "",
   					   'creator_id' =>isset($creator) ? $creator:"",
					   'created_time' => isset($created_time) ?$created_time : "",
					   'is_public' =>  isset($is_public) ? $is_public : "",
					   'like' => isset($like) ? $like : '0'
			];
		return $body;
	}

	public static function deleteBody($id)
	{
		DB::table('body_member')->where('bg_id',$id)->delete();
	}
	//user for manageController get api
	public static function getTags($user_id)
	{
		
		$tags = DB::table('body_member')->where('purpose','tagging')->where('creator',$user_id)->lists('text');
		return array_unique($tags);
	}
	//user for manageController get api
	public static function getTexts($user_id)
	{
		
		$texts = DB::table('body_member')->where('purpose','describing')->where('creator',$user_id)->lists('text');
		return array_unique($texts);
	}
	//use for manageController  backend search
	public static function backgettags($tags){

		$body = DB::table('body_member')->where('text','0');
		if( isset($tags) && $tags != '')
        {
            $condata = explode(",", $tags);
            $count = count($condata);
         
            for($x = 0 ; $x < $count -1 ; $x ++)
            {
                $body = $body->orWhere('text', 'like' , '%'.$condata[$x]. '%')->where('purpose','tagging');                   	          
            }
            return $body->get();
        }
		
	}
	public static function backsearchtext($texts){
		$texts = DB::table('body_member')->where('purpose','describing')->where('text', 'like' , '%'.$texts. '%')->get();
		return $texts;
	}
	public static function get_bg_id_from_userid($uid){
		return self::where('creator',$uid)->lists('bg_id')->all();
	}
	public static function search_with_like($data){
		$body = DB::table('body_member')->select('bg_id');

        if( isset($data) && $data != '')
        {
            $condata = explode(" ", $data);
            $count = count($condata);
            for($x = 0 ; $x < $count ; $x ++)
            {
            	if($x == 0)
                $body = $body->Where('text', 'like' , '%'.$condata[$x]. '%');	
                else
                $body = $body->orWhere('text', 'like' , '%'.$condata[$x]. '%');							         
            }
        }
        return $body->lists('bg_id');
	}
	public static function search($data){
        
        $body = DB::table('body_member');
      
        if( isset($data) && $data != '')
        {
            $condata = explode(",", $data);
            $count = count($condata);
            for($x = 0 ; $x < $count ; $x ++)
            {
                $body = $body->select('bg_id')->Where('text', 'like' , '%'.$condata[$x]. '%')
                								->Where('purpose','describing');             
            }
       		  
       
        }
       
        if( isset($data) && $data != '')
        {
            $condata = explode(",", $data);
            $count = count($condata);
            for($x = 1 ; $x < $count ; $x ++)
            {
               $searchtag = $condata[$x-1];
               $query_fortag = DB::table('body_member')->select('bg_id')->where('text' , 'like' , '%'.$searchtag.'%')
               										  ->where('purpose','tagging'); 
               $body = $body->union($query_fortag);
            }
        }
  	
          $body = $body->distinct()->get();
       	  return $body;
	}
 
}
?>
