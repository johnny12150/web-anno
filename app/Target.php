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
			$new_target->format = json_encode($headers);
       		$new_target->anno_id = $data['anno_id'];
			$new_target->selector = $data['json'];
			$new_target->type = $data['type'];
			$new_target->uri = $data['uri'];
			$new_target->creator = $data['creator'];
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
	public static function search_with_likes($uri){
		$query = DB::table('target');
		
		if( isset($uri) && $uri != '')
	        {
	            $condata = explode(" ", $uri);
	            $count = count($condata);
	            for($x = 0 ; $x < $count ; $x ++)
	            {

	               $searchuri = $condata[$x];
	               if($x==0)
	               	$query = $query->where('uri','like' , '%'.$searchuri.'%');
	               	else	  
	               	$query = $query->orWhere('uri','like' , '%'.$searchuri.'%');           
	            }
	        }
	    $array = $query->lists('anno_id');
	    if(empty($array)==true) $array = [];
	    return $array;
	}

	public static function geturi($anno_id)
	{
		$uri = self::where('anno_id',$anno_id)->pluck('uri');
		return $uri;
	}
}
?>
