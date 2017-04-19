<?php namespace App;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;

class Manifest extends Eloquent {
	protected  $connection = 'mongodb';
	protected  $collection = 'manifest';
	
	public static function add($manifest,$url){
		
		$count = DB::connection('mongodb')->collection('manifest')->where('manifest',$manifest)->count();

		if($count === 1){
			$manifest = DB::connection('mongodb')->collection('manifest')->where('url',$url)->first();
			return $manifest['_id'];
		}
		else{
			$Manifest = new Manifest();
			$Manifest->url = $url;
			$Manifest->manifest = $manifest;
			$Manifest->save();
			return $Manifest->id;
		}

	}
	public static function get_manifest( $id = NULL ){
		if( $id != NULL)
			return  DB::connection('mongodb')->collection('manifest')->where('_id',$id)->first();
		else 
			return  DB::connection('mongodb')->collection('manifest')->get();
	}
	public static function update_manifest($id,$manifest){
		$new_manifest = self::where('_id',$id)->first();

	    $new_manifest['manifest'] = json_decode($manifest);
		$result = $new_manifest->save();
		return $new_manifest;
		
	}
	public static function deleteManifest($id){
		return DB::connection('mongodb')->collection('manifest')->where('_id',$id)->delete();
	}
	
}

?>