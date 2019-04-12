<?php namespace App;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;

class Manifest extends Eloquent {
	protected  $connection = 'mongodb'; 
	protected  $collection = 'manifest';
	
	public static function add($manifest,$url,$creator){
		
		$count = DB::connection('mongodb')->collection('manifest')->where('manifest',$manifest)->count();
		
		if($count === 1){
			$manifest = DB::connection('mongodb')->collection('manifest')->first();
			return $manifest['_id'];
		}
		else{
			$Manifest = new Manifest();
			$Manifest->url = $url;
			$Manifest->creator = $creator; 
			$Manifest->manifest = $manifest;
			//print_r(gettype($manifest->sequences[0]['canvases'][0]['images'][0]['resource']['height']));
		
			$Manifest->save();
			return $Manifest->id;
		}

	}
	public static function get_manifest( $id = NULL ){
		if( $id != NULL)
			return  DB::connection('mongodb')->collection('manifest')->where('_id',$id)->first();
		else  //manifestController@index
			return  DB::connection('mongodb')->collection('manifest')->get();
	}
	public static function get_manifestByuser( $uid ){
			return  DB::connection('mongodb')->collection('manifest')->where('creator',$uid)->get();

	}
	public static function update_manifest($id,$url){
		$new_manifest = self::where('_id',$id)->first();
		
		if($new_manifest['url']!=$url||$new_manifest['manifest']['@id'] != $url){
			$new_manifest['url'] = $url;
			$a=$new_manifest['manifest'];
			$a['@id'] = $url;
			$new_manifest['manifest']=$a;
			$result = $new_manifest->save();
			return $new_manifest;
		}else{
			//return '000';
			return ;
		}
			
	    
		 
	}
	public static function getManifestID($ManifestUrl){

		$manifest = DB::connection('mongodb')->collection('manifest')->where('url',$ManifestUrl)->first(); 
		return $manifest['_id'];
	}
	public static function deleteManifest($id){
		return DB::connection('mongodb')->collection('manifest')->where('_id',$id)->delete();
	}
	
}

?>