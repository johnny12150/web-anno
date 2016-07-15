<?php namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
class bodyview extends Model{
	protected $table = 'body_view';
	
	public static function getbody($anno_id){
		$body = DB::table('body_view')->where('anno_id',$anno_id)->get();
		return $body;
	}

 	/**
     * @param $data the data that from search condition 
     * @return $anno->id
     */
	public static function search($data){
        
        $body = DB::table('body_view');
      
        if( isset($data) && $data != '')
        {
            $condata = explode(",", $data);
            $count = count($condata);
            for($x = 0 ; $x < $count ; $x ++)
            {
                $body = $body->select('anno_id')->Where('text', 'like' , '%'.$condata[$x]. '%')
                								->Where('role','describing');             
            }
       		  
       
        }
       
        if( isset($data) && $data != '')
        {
            $condata = explode(",", $data);
            $count = count($condata);
            for($x = 1 ; $x < $count ; $x ++)
            {
               $searchtag = $condata[$x-1];
               $query_fortag = DB::table('body_view')->select('anno_id')->where('text' , 'like' , '%'.$searchtag.'%')
               										  ->where('role','tagging'); 
               $body = $body->union($query_fortag);
            }
        }
  	
          $body = $body->lists('anno_id');
       	  return $body;
	}
    public static function gettext($text)
        {
            $body_view =DB::table('body_view');
            $body_view = $body_view->where('role','describing')
                                   ->where('text' , 'like' , '%'.$text.'%')->lists('anno_id');
 
            return $body_view;
        }
    public static function gettags($text)
        {
            $body_view =DB::table('body_view');
            $body_view = $body_view->where('role','tagging')
                                   ->where('text' , 'like' , '%'.$text.'%')->lists('anno_id');
 
            return $body_view;
        }
}

?>