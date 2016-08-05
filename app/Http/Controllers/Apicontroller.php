<?php namespace App\Http\Controllers;

ini_set("display_errors", "On");

use App\AnnotationView;
use App\Annotation;
use App\Tag;
use App\TagUse;
use App\User;
use App\UrlInfo;
use App\BodyMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;


class Apicontroller extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function output(){
		$searchText = Input::get('text');
        $uri = Input::get('uri');
        $count = Input::get('count');
        $orderby =Input::get('orderby');
        $annos = AnnotationView::apisearch([
            'uri' => $uri,
            'text' => $searchText,

        ], $count,$orderby);
        return $annos;
	}
	 public function import()
    {
        $data = json_decode(Input::get('json'));
        $annos = Annotation::import($data);
        
        return $annos;
    }
    public function getanno($id)
    {

         $annos = AnnotationView::apisearch([
            'id' => $id,
        ], 1,'desc');
        return $annos;
    }
}
