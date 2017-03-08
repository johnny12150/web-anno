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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class ManifestController extends Controller
{
    public function output_manifest($id){
		$result = manifest::get_manifest($id)['manifest'];
		
		return  $result;
		
	}
	public function save(){
		$id = Request::input('id');
		$manifest = Request::input('manifest');
		$annotations_str = Request::input('annotation');
		$annotations = json_decode($annotations_str);
		$user = Request::input('user');
		foreach($annotations as $annotation){
		
			
			$selector_json ='';
			$selector_json = self::CreatSelectorArray($annotation);
			$anno = Annotation::add([
				'creator_id' => $user,
				'text' => $annotation->text ? $annotation->text : '',
				'uri' => 'http://edit.annotation.taieol.tw',
				'type' => 'image',
				'src' => $annotation->image ? $annotation->image : '',
				'selector' => $selector_json,
				'is_public' => '1',
				'tags' => '',
				'metas' => '' ,
			]);
		}
		$res = manifest::update_manifest($id,$manifest);
		return $res['_id'];
		/*$arr= [];
		foreach($data as $key =>$value){
			array_push($arr,$key);
			array_push($arr,$value);
		}
		return $arr;*/
	}
	/*把selector儲存成json  並回傳該 json
    *@param $data
    *return json_encode($tempArray)
    *
    */
    public static function CreatSelectorArray($annotation)
    {
		$position = json_decode($annotation->point);
        if ($annotation->shape == "rectangle")
        {
            $x = sprintf("%f",$position[1]->x);
            $y = sprintf("%f",$position[1]->y);
            $w = sprintf("%f",$position[3]->x - $position[1]->x);
            $h = sprintf("%f", $position[3]->y - $position[1]->y);
            $tempArray =[array(
                'type' =>"FragmentSelector",
                'conformsTo' =>"http://www.w3.org/TR/media-frags/",
                'value'=>  $x.','.$y.','.$w.','.$h
            ),array(
                'type' =>"XPathSelector",
                'value' => ''
            )];
        }
		else if( $annotation->shape == "polygon"){
			$tempArray =[];
			$points = 'points="'; 
			$position = json_decode($annotation->point);
			foreach($position as $point){
				$points = $points.$point->x.','.$point->y.',';
			}
			$points = $points.'"/>';
			$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><polygon '.$points.'</svg>';
			$tempArray =[array(
                'type' => "SvgSelector",
                'value'=> $svg
            )];
		}
        return json_encode($tempArray);
    }
	public function Manifest(){
        $Manifest = Request::input('json');
        $handle = fopen($Manifest,"rb");
		$user = Auth::user();
		print($user);
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
		$new_url = 'http://edit.annotation.taieol.tw/#/myprocess?manifest='.$new_id.'&uid='.$user->id ;
		
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
