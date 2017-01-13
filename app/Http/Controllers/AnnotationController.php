<?php namespace App\Http\Controllers;

use App\Annotation;
use App\AuthTable;
use App\Http\Requests;
use App\Like;
use App\bodygroup;
use App\Tag;
use App\User;
use App\BodyMember;
use App\Target;
use App\manifest;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use OAuth\Common\Exception\Exception;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;
use Illuminate\Support\Facades\Auth;

class AnnotationController extends Controller
{
    /**
     * Get Annotation JS version.
     *
     * @return Object Json format of api version
     */
    public function index()
    {
        return [
            "name" => "Annotator Store API",
            "version" => "2.0.0"
        ];
    }
    /*將前端新增的註記資訊存入DB，成功後便回傳該筆註記
    *@pararm $request 前端產生的註記資訊
    *return annotation object
    */
    public function add(Request $request)
    {
        
        $text = Request::input('text');
        $quote = Request::input('quote');
        $uri = Request::input('uri');
        $isImage = Request::input('type') == 'image';
        $image_src = Request::input('src');
        $type = Request::input('type');
        $tags = Request::input('tags') ;

        $ranges_start = '';
        $ranges_end = '';
        $ranges_startOffset = '';
        $ranges_endOffset = '';

        if(isset(Request::input('ranges')[0]['start']))
            $ranges_start = Request::input('ranges')[0]['start'];
        if(isset(Request::input('ranges')[0]['end']))
            $ranges_end = Request::input('ranges')[0]['end'];
        if(isset(Request::input('ranges')[0]['startOffset']))
            $ranges_startOffset = Request::input('ranges')[0]['startOffset'];
        if(isset(Request::input('ranges')[0]['endOffset']))
            $ranges_endOffset = Request::input('ranges')[0]['endOffset'];
        
        $prefix = Request::input('prefix','');        
        $suffix = Request::input('suffix','');
        $x = ($isImage && isset(Request::input('position')['x'])) ?  Request::input('position')['x'] : 0;
        $y = ($isImage && isset(Request::input('position')['y'])) ?  Request::input('position')['y'] : 0;
        $width = ($isImage && isset(Request::input('position')['width'])) ?  Request::input('position')['width'] : 0;
        $height = ($isImage && isset(Request::input('position')['height'])) ?  Request::input('position')['height'] : 0;
        $Xpath = Request::input('Xpath');
        $permissions = Request::input('permissions');
        $is_public = count($permissions['read']) == 0;
        $user = Session::get('user');
        /* 新增標記 */
        $anno = Annotation::add([
            'creator_id' => $user->id,
            'text' => $text,
            'quote' => $quote,
            'uri' => $uri,
            'ranges_start' =>  $ranges_start,
            'ranges_end' => $ranges_end,
            'type' => $isImage ? $type : 'text',
            'src' => $isImage ? $image_src : $uri,
            'position' => $isImage ? [
                'x' => $x,
                'y' => $y,
                'width'=>$width,
                'height'=>$height
            ] : null,
            'Xpath' => $Xpath, // image Xpath
            'ranges_startOffset' => $ranges_startOffset,
            'ranges_endOffset' => $ranges_endOffset,
            'prefix' => $prefix,
            'suffix' => $suffix,
            'is_public' => $is_public,
            'tags' => $tags
        ]);
         
        //回傳該標記
        if($anno != false)
            return self::get($anno);
        else
            abort(303);

    }
    /*Update the annotator*/
   
    public function edit_target(){
        $start = Request::input('start');
        $end = Request::input('end');
        $anno_id = Request::input('id');
        $a = Target::edit([
            'start' => $start,
            'end' => $end,
            'startOffset'=> Request::input('startOffset'),
            'endOffset' => Request::input('endOffset'),
            'anno_id' => $anno_id
        ]);
        return $a;
    }
    /*
    *透過annotation的id 取得該註記
    *@param $id annotation's id
    *return $anno[0]  該id的註記
    */
    public function get($id)
    {
        // Find tags
        $array=[];
        array_push($array,$id);
        $anno = Annotation::annotation($array);

        return (isset($anno[0]) ? $anno[0] : []);
    }
    public function addbody()
    {
        $text = Request::input('text');
        $id = Request::input('id');
        $uri = Request::input('uri');
        $user_id = Session::get('user')->id;
        $tags = explode(" ",Request::input('tags'));
        $public = Request::input('public');
        if($public =='true') $public = 1;
        else $public = 0;
        $bg_id = bodygroup::add($id);
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'public' => $public,
            'purpose' => "tagging",
            'bg_id' => $bg_id,
            'type' =>'TextualBody'
        ]);
        }
        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'public' => $public,
            'purpose' => "describing",
            'bg_id' => $bg_id,
            'type' =>'TextualBody'
        ]);
        $annos = self::search();
        return [$annos,$bg_id];
    }
    public function deletebody($bg_id){
        bodygroup::deletebody($bg_id);
        return self::search();
    }


    public function updatebody(){

        $text = Request::input('text');
        $id = Request::input('id');
        $user_id = Session::get('user')->id;
        $tags = explode(" ",Request::input('tags'));
        $uri = Request::input('uri');
        Bodymember::deleteBody($id);
        $public = Request::input('public');
        if($public =='true') $public = 1;
        else $public = 0;
        foreach ($tags as $tag) {
            Bodymember::add([
            'creator_id' => $user_id,
            'text' => $tag,
            'purpose' => "tagging",
             'public' => $public,
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);
        }
        Bodymember::add([
            'creator_id' => $user_id,
            'text' => $text,
            'purpose' => "describing",
            'public' => $public,
            'bg_id' => $id,
            'type' =>'TextualBody'
        ]);

        $annotations = self::search_front([
            'uri' => $uri
        ]);
        $result = [
            'total' => count($annotations),
            'rows' => $annotations
        ];
        return $result;
    }
    public function delete($id)
    {
        $uri= Request::input('uri');
        $user = Session::get('user');
        if($user != null) {
            //Delete Annotation
            Annotation::del($user->id,$id);
            abort(204);
        } else {
            abort(401);
        }
     
    }
    public function tempdelete($id)
    {
        $user = Session::get('user');
        if($user != null) {
            //Delete Annotation
            Annotation::tempdelete($user->id, $id);
            //return 204 code
            abort(204);
        } else {
            abort(401);
        }
    }

    /**
     * @return array
     */
    public function search()
    {

        $domain = Request::input('domain');
        $token = Request::input('anno_token');
        $domain = urldecode($domain);
		$specific_url = Request::input('specific_url');

        // limit 沒設定的話目前預設暫定 999 個標記
        $limit = Request::input('limit') == '' ? -1 :
            intval(Request::input('limit')) == 0 ? -1 : intval(Request::input('limit'));
        // 搜尋的 uri （必要）
        $uri = Request::input('uri');
        // 搜尋的 user id
        $user_id = intval(Request::input('user'));
        // 搜尋的標記內容
        $searchText = Request::input('search');
        
        $offset = intval(Request::input('offset'));
        $annotations = self::search_front([
            'uri' => $uri,
            'quote' => $searchText,
            'text' => $searchText,
			'specific_url' => $specific_url,
            'public' => [
                'is_public' => true,
                'creator_id' => $user_id
            ]
        ], $limit, $offset);

      

        $result = [
            'total' => count($annotations),
            'rows' => $annotations
        ];

        return $result;
    }
    
    public function like($id)
    {
        $like = Request::input('like');
        $like = intval($like);  //將變數變為整數
        if ($like > 1 | $like < -1)
            $like = 0;

        $user = Session::get('user');
        $user_id = $user->id;
        Like::setLike($user_id, $id, $like);
        return like::count($id);  
    }

    public function check()
    {
        $user = Session::get('user');
      
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gravatar' => Gravatar::src($user->email),
                'like' =>  Like::getlikebyuser($user->id)
            ]
        ];
    }


    public function logout() {
        $domain = Request::input('domain');
        $token = Request::input('anno_token');

        Auth::logout();
        $state = AuthTable::remove($domain, $token);
        return [
            'response' => $state
        ];
    }

    public function gethint()
    {

      
        $name = Annotation::getName();
        /*deal with data example:<p>abcds</p>*/
        $namefix = str_replace(array('<p>','</p>'),"",$name);
        $q = $_REQUEST["q"];
        $hint = "";
        // lookup all hints from array if $q is different from "" 
        if ($q !== "") {
            $q = strtolower($q);
            $len=strlen($q);
            foreach($namefix as $name) {
                if (stristr($q, substr($name, 0, $len))) {
                    if ($hint === "") {
                        $hint = $name;
                    } else {
                        $hint .= ", $name";
                    }
                }
            }
        }
        // Output "no suggestion" if no hint was found or output correct values 
        echo $hint === "" ? "no suggestion" : $hint;
    }
    /*前端取得註記用
   *@$conditions  tag,uri,id,public
   *@$ret  annotations set
   */
    public static function search_front($conditions , $orderBy = 'created_time', $sort='desc')
    {
        
        $temp =[];
         if(isset($conditions['uri']) && $conditions['uri'] != '')
        {
            $anno_ids = Target::getannobyuri($conditions['uri']);
            $temp = $anno_ids;
			
        }
		/*if has specific_img's url then it will work*/
		if(isset($conditions['specific_url']) && $conditions['specific_url'] != '')
        {
            $anno_ids = Target::getspecific_img($conditions['specific_url']);
			$temp = array_intersect($temp, $anno_ids); 
        }
        if(isset($conditions['text']) && $conditions['text'] != '')
        {
            $bg_ids = BodyMember::search($conditions['text']);
            $anno_ids=[];
            foreach ($bg_ids as $bg_id) {
                array_push($anno_ids, bodygroup::getanno_id($bg_id->bg_id)->anno_id);
            } 
            $temp = array_intersect($temp, $anno_ids); 
        }        
        if(isset($conditions['public']) && $conditions['public'] != '')
        {
            $anno_ids = Annotation::getAnnos($conditions['public']['creator_id']);
            $temp = array_intersect($temp, $anno_ids);
        }
        $annos = Annotation::annotation($temp);

        return  $annos;

    }
	public static function modified_for_sophy(Request $request){
		echo $_SERVER['QUERY_STRING'] ; 
		$url = Request::input('json');
		if($url != '')  Session::put('img_url',$url);
		else  $url = Session::get('img_url');
		return view('test3',['url' => $url]);

	}
	public static function digital_island_old(){
		$url = 'http://dev.annotation.taieol.tw/cyber.json';
		/*$handle = fopen($url,"rb");
		$content = "";
        while (!feof($handle)) {
			     
                $content .= fread($handle, 10000);
			
        }
        fclose($handle);*/
		$content=file_get_contents($url);
		$content = iconv("big5","UTF-8",$content);

		$json = json_decode($content, true );
		foreach($json['records'] as $key => $img){
		    //$img_url = $img['url'];
			//$img_count = Target::count_annotation($img_url);
			$img['p_title'] = str_replace('"', '', $img['p_title']);
			$img['p_title'] = str_replace("'", '',$img['p_title']);
			$img['a_title'] = str_replace('"', '', $img['a_title']);
			$img['a_title'] = str_replace("'", '',$img['a_title']);
			$string =  'INSERT INTO digital(d_index, p_id, p_title, a_title, uname, url) VALUES (null,"'.$img['p_id'].'","'.$img['p_title'].'","'.$img['a_title'].'","'.$img['uname'].'","'.$img['url'].'");';
			
			echo $string ;
			echo '<br>';
			//$json['records'][$key]['count'] =  (string)$img_count;
		}
	
		//return $json['records'];

		
	}
	public static function digital_island(){
		$search_value = Request::input('search')['value'];
		$start =Request::input('start');
		$length = Request::input('length');
		$order_col = Request::input('order')[0]['column'];
		$order_dir  = Request::input('order')[0]['dir'];
		$draw = Request::input('draw');
		$result = Target::digital_island($search_value,$order_col,$order_dir,$start,$length);
		$arr =  [];
		foreach($result['result'] as $data){
			$img_source = "<img src=". $data->url ." class ='annotation_img' height =200px />";
			$record = array($data->p_title,$data->a_title,$data->uname,$img_source,$data->count);
			array_push($arr,$record);
		}
		return [
		  "draw" => $draw,
		  "recordsTotal"=> $result['count'],
		  "data"=> $arr,
		  "recordsFiltered"=> $result['count'],

		];
	}
}
