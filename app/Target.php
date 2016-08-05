<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
class Target extends Model{

	protected $table = 'target';
	public $timestamps = false;

	public static function add($data){
			
			$new_target = new Target();


			$new_target->source  = $data['source'];
			$headers = get_headers($new_target->source,1)['Content-Type'];
			$new_target->format = $headers;
       		$new_target->anno_id = $data['anno_id'];
			$new_target->selector = $data['json'];
			$new_target->type = $data['type'];
			$new_target->uri = $data['uri'];
			
			$new_target->save();

	}
	public static function getTarget($anno_id)
	{
		 $targets = self::where('anno_id',$anno_id)->get();
		 return $targets;
	}
	public static function deleteTarget($anno_id)
	{
		DB::table('target')->where('anno_id',$anno_id)->delete();
	}
	public static function getannobyuri($uri)
	{
			$target = self::where('uri',$uri)->lists('anno_id');
			$ids =[];
			foreach ($target as $id ) {
				array_push($ids,$id);
			}
			return $ids;
	}
}
?>
