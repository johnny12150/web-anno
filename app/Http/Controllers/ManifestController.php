<?php

namespace App\Http\Controllers;


use Illuminate\Support\Facades\Request;

use Illuminate\Support\Facades\Redirect;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\manifest;
use App\canvas;
use	App\Target;
use App\Annotation;
class ManifestController extends Controller
{
    public function output_manifest($id){
		$result = manifest::get_manifest($id)['manifest'];
		
		return  $result;
		
	}
	public function save(){
		$id = Request::input('id');
		$manifest = Request::input('manifest');
		
		$res = manifest::update_manifest($id,$manifest);
		return $res['_id'];
		/*$arr= [];
		foreach($data as $key =>$value){
			array_push($arr,$key);
			array_push($arr,$value);
		}
		return $arr;*/
	}
	public function Manifest(){
        $Manifest = Request::input('json');
        $handle = fopen($Manifest,"rb");
        $content = "";
        while (!feof($handle)) {
                $content .= fread($handle, 10000);
        }
        fclose($handle);
        $content = json_decode($content);
        $var = '@id';
        foreach ($content->sequences[0]->canvases as $canvas ){
            $img_url = $canvas->images[0]->resource->$var; 
			if(target::checkimg($img_url)){
				$canvas_id = canvas::add($img_url,$canvas->$var,$canvas->height,$canvas->width);
				$temp = array(
					'@id'=> "http://".$_SERVER['HTTP_HOST']."/list/".$canvas_id,
					'@type' =>'sc:AnnotationList',
				);
				$canvas->otherContent[0] = $temp;
			}
           
        }
		$new_id = manifest::add($content);
		$new_url = 'http://edit.annotation.taieol.tw/#/myprocess?manifest='.$new_id ;
		
		//return 'http://edit.annotation.taieol.tw/#/myprocess?manifest='.$new_id;
		//return json_encode($content);
		return redirect($new_url);
      
    }
    public function IIIFformat($id){
        $canvas = canvas::get_canvas_by_annolistid($id);

        $anno_ids = Target::get_by_src($canvas->img_src);
        $resources =[];
        foreach ($anno_ids as $anno_id)
        {
            $resource = Annotation::annotation_IIIF($anno_id,$canvas);
            array_push($resources,$resource);
        }

        return [
            '@id' => "http://".$_SERVER['HTTP_HOST']."list/".$id,
            'context' => "http://www.shared-canvas.org/ns/context.json",
            '@type' =>'AnnotationList',
            'resources' => $resources
            ];
    }
   
}
