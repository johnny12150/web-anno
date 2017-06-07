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
use App\AuthTable;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Input;

class ManifestController extends Controller
{
    public function output_manifest($id){
		$result = manifest::get_manifest($id)['manifest'];
		$var = '@id';
		foreach ($result['sequences'][0]['canvases'] as $key => $canvas ){
            $img_url = $canvas['images'][0]['resource'][$var]; 

			if(target::checkimg($img_url)){
				$canvas_id = canvas::add($img_url,$canvas[$var],$canvas['height'],$canvas['width']);
				$temp = array(
					'@id'=> "http://".$_SERVER['HTTP_HOST']."/list/".$canvas_id,
					'@type' =>'sc:AnnotationList',
				);
				$result['sequences'][0]['canvases'][$key]['otherContent'] =[];
				array_push($result['sequences'][0]['canvases'][$key]['otherContent'],$temp);
			}
        }
		
		return $result;
	}
	    public function output_manifest_mirador($id){
		$result = manifest::get_manifest($id)['manifest'];
		$var = '@id';
		foreach ($result['sequences'][0]['canvases'] as $key => $canvas ){
            $img_url = $canvas['images'][0]['resource'][$var]; 

			if(target::checkimg($img_url)){
				$canvas_id = canvas::add($img_url,$canvas[$var],$canvas['height'],$canvas['width']);
				$temp = array(
					'@id'=> "http://".$_SERVER['HTTP_HOST']."/mirador/list/".$canvas_id,
					'@type' =>'sc:AnnotationList',
				);
				$result['sequences'][0]['canvases'][$key]['otherContent'] =[];
				array_push($result['sequences'][0]['canvases'][$key]['otherContent'],$temp);
			}
        }
		
		return $result;
	}
	/**
	*接收IIIF editor傳來的新增註記，，並將這批資料交給Manifest Model存入DB
	*@return String $res['id'] 該筆Manifest的ID
	*/
	public function save(){
		$id = Request::input('id','');
		$manifest = Request::input('manifest');
		$annotations_str = Request::input('annotation');
		$annotations = json_decode($annotations_str);
		$user = Request::input('user');
		$deletArray = json_decode(Request::input('deletArray'));
		$updateArray = json_decode(Request::input('updateArray'));
		$TextArray = json_decode(Request::input('getUpdateText'));
		
		if($updateArray != null)
			foreach($updateArray as $ele){
				 $selector_json = self::CreatSelectorArray($ele);
				 Annotation::updateSelector($ele->aid,$selector_json);
			}
		if($TextArray != null)
		foreach($TextArray as $ele){
			 Annotation::updateBody($ele,$user);
		}
		if($deletArray != null){
			foreach($deletArray as $ele){
				 Annotation::del($user,$ele);
			}
		
		}
		if($annotations_str != null)
		foreach($annotations as $annotation){
		
			
			$selector_json ='';
			$selector_json = self::CreatSelectorArray($annotation);
			$anno = Annotation::add([
				'creator_id' => $user,
				'text' => $annotation->text ? $annotation->text : '',
				'uri' => $annotation->canvas_id,
				'type' => 'image',
				'src' => $annotation->image ? $annotation->image : '',
				'selector' => $selector_json,
				'is_public' => '1',
				'tags' => '',
				'metas' => '' ,
			]);
		}
		if($id != ''){
			$res = manifest::update_manifest($id,$manifest);
			return $res['_id'];
		}
	}
	
	
	public function subsave(){
		$annotations_str = Request::input('annotation');
		$annotations = json_decode($annotations_str);
			$user = Request::input('user');
		if($annotations_str != null)
		foreach($annotations as $annotation){
			$selector_json ='';
			$selector_json = self::CreatSelectorArray($annotation);
			$anno = Annotation::add([
				'creator_id' => $user,
				'text' => $annotation->text ? $annotation->text : '',
				'uri' => $annotation->canvas_id,
				'type' => 'image',
				'src' => $annotation->image ? $annotation->image : '',
				'selector' => $selector_json,
				'is_public' => '1',
				'tags' => '',
				'metas' => '' ,
			]);
			return $anno;
		}
	}
	/**
    *主要負責處理四邊形，多邊形，圓形的SVG XML檔產生
	*@param Object $annotation 繪畫的形狀與點
    *@return String json_encode($tempArray) svg字串
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
        } else if( $annotation->shape == "polygon"){
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
		} else if($annotation->shape == "circle"){
			$position = json_decode($annotation->point);
			$cx = $position[0]->x;
			$cy = $position[0]->y;
			$r = $position[1];
			$svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><circle cx="'.$cx.'" cy="'.$cy.'" r="'.$r.'" /></svg>';
			$tempArray =[array(
                'type' => "SvgSelector",
                'value'=> $svg
            )];
		} else if($annotation->shape = "marker"){
			$position = json_decode($annotation->point);
			$x =  $position[0]->x;
			$y =  $position[0]->y;
			$w =   $position[0]->w;
			$h =   $position[0]->h;
			$tempArray =[array(
                'type' =>"FragmentSelector",
                'conformsTo' =>"http://www.w3.org/TR/media-frags/",
                'value'=>  $x.','.$y.','.$w.','.$h
            ),array(
                'type' =>"XPathSelector",
                'value' => ''
            )];
			
		}
        return json_encode($tempArray);
    }
	public function Manifest(){
        
		$user = Auth::user();
		$manifestId = Request::input('id');
		$result = manifest::get_manifest($manifestId)['manifest'];
		
		
		$new_url = 'http://edit.annotation.taieol.tw/#/myprocess?manifest='.$manifestId.'&uid='.$user->id ;
		return redirect($new_url);
    }
	/**
	*產生IIIF annotationList
	*@param string $id mongodb上 manifest的id
	*@return array annotation list的Array
	*/
    public function IIIFformat($id){
        $canvas = canvas::get_canvas_by_annolistid($id);
        $anno_ids = Target::get_by_src($canvas->img_src,$canvas->canvas);
        $resources =[];
        foreach ($anno_ids as $anno_id)
        {
            $resource = Annotation::annotation_IIIF($anno_id,$canvas);
            array_push($resources,$resource);
        }

        return [
            '@id' => "http://".$_SERVER['HTTP_HOST']."/list/".$id,
            'context' => "http://www.shared-canvas.org/ns/context.json",
            '@type' =>'AnnotationList',
            'resources' => $resources
        ];
    }
	
	
	
	public function IIIFformat_mirador($id){
        $canvas = canvas::get_canvas_by_annolistid($id);
        $anno_ids = Target::get_by_src($canvas->img_src,$canvas->canvas);
        $resources =[];
        foreach ($anno_ids as $anno_id)
        {
            $resource = Annotation::annotation_IIIF_mirador($anno_id,$canvas);
            array_push($resources,$resource);
        }

        return [
            '@id' => "http://".$_SERVER['HTTP_HOST']."/mirador/list/".$id,
            'context' => "http://www.shared-canvas.org/ns/context.json",
            '@type' =>'AnnotationList',
            'resources' => $resources
        ];
    }
	
	
	public function getAnnoList(){
		$canvas = Request::input('canvas');
		$img_url = $canvas['images'][0]['resource']['@id'];
		$canvas_id = canvas::add($img_url,$canvas['@id'],$canvas['height'],$canvas['width']);
		return "http://dev.annotation.taieol.tw/list/".$canvas_id;
	}
	public function import(){
		$Manifest = Request::input('id');
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
		$new_id = manifest::add($content,$Manifest);
		return $new_id;
	}
	public function index(){
		$user = Auth::user();
		$manifestData = manifest::get_manifest();

		return view('manage.manifest',[
			'manifestData' => $manifestData
		]);
	}
   public function delete(){
	   $id = Request::input('id');
	   return manifest::deleteManifest($id);
   }
   
   public function leaflet_Login(){
	
	 if (Auth::attempt(['email' => Input::get('email'), 'password' => Input::get('password')])) {
			$domain = 'leaflet';
			$user = Auth::user();
			// generate a auth token for this external site
			$auth = AuthTable::add($domain, $user->id);
			return  array(
				'id' => $user->id,
                'name'     => $user->name,
                'token'  => $auth->auth_token
            );
	 }
   }
   
   public function leaflet_logout() {
        $domain = 'leaflet';
        $token = Input::get('token');
		$state = 'failed';
        if (AuthTable::check($domain,$token)){
			$state = AuthTable::remove($domain, $token);
        }
		return [
            'response' => $state
        ];
		
    }
}
