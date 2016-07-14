<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;
use App\Annotation;
use App\Body;
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
}
?>
