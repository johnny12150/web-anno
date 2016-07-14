<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;
use App\Annotation;
use App\Body;
use Illuminate\Support\Facades\DB;
class BodyMember extends Model{

	protected $table = 'body_member';
	public $timestamps = false;

	public static function add($data){
		
		$new_body = new BodyMember();
		$new_body->type ="textualBody";
		$new_body->text = $data['text'];
		$new_body->role = $data['role'];
		$new_body->creator = $data['creator_id'];
		$new_body->save();
		$body = Body::add($data['anno_id'],$new_body->id);
	}
	
	public static function getupdate($data){
		$body_member_id = Body::get_body_id($data['anno_id']);
		foreach ($body_member_id as $id) {
			DB::table('body_member')
				->where('body_member_id',$id)
				->where('role','tagging')
				->update(array('text' => $data['tags'] ));

			DB::table('body_member')
				->where('body_member_id',$id)
				->where('role','describing')
				->update(array('text' => $data['text'] ));
			
		}
	}
	public static function deleteBody($id)
	{
		$body_member_id =Body::get_body_id($id);
		foreach ($body_member_id as $bodyid) {
			DB::table('body_member')->where('body_member_id',$bodyid)->delete();
		}
		Body::deleteAnno($id);
	}

}
?>
