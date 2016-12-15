<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
class Target extends Model{

	protected $table = 'target';
	public $timestamps = false;
	/*DB儲存New target資訊
	 * @param $data['source']    img src 
     * @param $data['anno_id']   annotation's id
     * @param $data['selector']  Web annotation Data Model selector json
     * @param $data['uri']       web resource's uri 
     * @param $data['creator']   target's creator id
     * @return null
	*/
	public static function add($data){
			
			$new_target = new Target();
			$new_target->source  = $data['source'];
			$headers = get_headers($new_target->source,1)['Content-Type']; 
			$new_target->format = json_encode($headers); // get reosurce Content-Type
       		$new_target->anno_id = $data['anno_id'];
			$new_target->selector = $data['json'];
			$new_target->type = $data['type'];
			$new_target->uri = $data['uri'];
			$new_target->creator = $data['creator'];
			$new_target->save();

	}
	/*取得annotation's target
	 * @param $anno_id    annotation's id 
     * @return target
	*/
	public static function get_by_src($src){
		return self::where('source',$src)->lists('anno_id')->all();
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
	/*後台蒐尋介面使用 // 以URI當條件
	 *@param $uri resource's uri
	 *@return $ids  $annotations ids(array)
 	*/
	public static function getannobyuri($uri)
	{
			$target = self::where('uri',$uri)->lists('anno_id')->all();
			$ids =[];
			foreach ($target as $id ) {
				array_push($ids,$id);
			}
			return $ids;
	}
	/*後台全文檢索使用 // 以URI當條件
	 *@param $uri resource's uri
	 *@return $ids  $annotations ids(array)
 	*/
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
	    foreach ($array as $key ) {
	    	echo $key.',';
	    }
	    if(empty($array) === true) 
	    	$array = [];

	    return $array;
	}

	public static function geturi($anno_id)
	{
		$uri = self::where('anno_id',$anno_id)->pluck('uri');
		return $uri;
	}
	public static function edit($data){
		$origin_target = DB::table('target')->where('anno_id',$data['anno_id'])->pluck('selector');
		$origin_selector =  json_decode($origin_target);
        $origin_selector[0]->startSelector->value =  $data['start'];
		$origin_selector[0]->endSelector->value = $data['end'];
		$origin_selector[0]->startSelector->refinedBy->start = $data['startOffset'];
		$origin_selector[0]->endSelector->refinedBy->end = $data['endOffset'];  
		$new_selector = json_encode($origin_selector);
		DB::table('target')->where('anno_id',$data['anno_id'])->update(array('selector' =>$new_selector));
	}
	
	public static function checkimg($img_url)
	{
		$number = self::where('source',$img_url)->count();
		if($number > 0)
			return true;
		else 
			return false;
	}
}
?>
