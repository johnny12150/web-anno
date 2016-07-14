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
			$headers = get_headers($new_target->source,1);
			$new_target->format = json_encode($headers);
       		$new_target->anno_id = $data['anno_id'];
			$new_target->selector = $data['json'];
			$new_target->type = $data['type'];
			
			
			$new_target->save();

	}
	public static function getTarget($anno_id)
	{
		 $targets = self::where('anno_id',$anno_id)->get();
		 return $targets;
	}
}
?>
