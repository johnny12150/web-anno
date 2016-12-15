<?php namespace App;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;

class Manifest extends Eloquent {
	protected  $connection = 'mongodb';
	protected  $collection = 'manifest';
	
	public static function add($manifest){
		
		$count = DB::connection('mongodb')->collection('manifest')->where('manifest',$manifest)->count();

		if($count === 1){
			$manifest = DB::connection('mongodb')->collection('manifest')->where('manifest',$manifest)->first();
			return $manifest['_id'];
		}
		else{
			$Manifest = new Manifest();
			$Manifest->manifest = $manifest;
			$Manifest->save();
			return $Manifest->id;
		}

	}
	public static function get_manifest($id){
		
		return  DB::connection('mongodb')->collection('manifest')->where('_id',$id)->first();
	}
}

?>