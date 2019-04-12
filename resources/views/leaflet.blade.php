<!doctype html>
<html>
<head>
	<!--external plugim-->
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.5/leaflet.css" />
	<script src="http://cdn.leafletjs.com/leaflet-0.7.5/leaflet.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="https://cdn.rawgit.com/mejackreed/Leaflet-IIIF/master/leaflet-iiif.js"></script>
	<script src="https://leaflet.github.io/Leaflet.draw/src/Leaflet.draw.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/Leaflet.Draw.Event.js"></script>
    <link rel="stylesheet" href="https://leaflet.github.io/Leaflet.draw/src/leaflet.draw.css"/>
	<link rel="stylesheet" href="http://dev.annotation.taieol.tw/css/leaflet.label.css"/>
    <script src="https://leaflet.github.io/Leaflet.draw/src/Toolbar.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/Tooltip.js"></script>

    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/GeometryUtil.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/LatLngUtil.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/LineUtil.Intersect.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/Polygon.Intersect.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/Polyline.Intersect.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/ext/TouchEvents.js"></script>

    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/DrawToolbar.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Feature.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.SimpleShape.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Polyline.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Circle.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Marker.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Polygon.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/draw/handler/Draw.Rectangle.js"></script>


    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/EditToolbar.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/EditToolbar.Edit.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/EditToolbar.Delete.js"></script>

    <script src="https://leaflet.github.io/Leaflet.draw/src/Control.Draw.js"></script>

    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/Edit.Poly.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/Edit.SimpleShape.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/Edit.Circle.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/Edit.Rectangle.js"></script>
    <script src="https://leaflet.github.io/Leaflet.draw/src/edit/handler/Edit.Marker.js"></script>
	<script src="http://dev.annotation.taieol.tw/js/leaflet.label.js"></script> <!---->
	<script src="https://use.fontawesome.com/7ff432e6bc.js"></script>
	<script src="//cdn.tinymce.com/4/tinymce.min.js"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.4.2/leaflet.draw.css"/>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.4.2/leaflet.draw.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<!--關聯到的--> 
	<script src="http://dev.annotation.taieol.tw/js/manifest.js"></script>
	<link rel="stylesheet" href="http://dev.annotation.taieol.tw/css/leaflet.login.css"/>
	
	 
 
	<script>tinymce.init({ selector:'textarea'  ,
                toolbar_items_size: 'small',
				menubar: false,
                toolbar: [
					'undo redo | styleselect | bold italic | link image |alignleft aligncenter alignright'
				]
    });</script>
   <style>
	#mapid { height: 500px; width : 800px ;}
	#confirmOverlay{
		width:100%;
		height:100%;
		position:fixed;
		top:0;
		left:0;
		background:url('ie.png');
		background: -moz-linear-gradient(rgba(11,11,11,0.1), rgba(11,11,11,0.6)) repeat-x rgba(11,11,11,0.2);
		background:-webkit-gradient(linear, 0% 0%, 0% 100%, from(rgba(11,11,11,0.1)), to(rgba(11,11,11,0.6))) repeat-x rgba(11,11,11,0.2);
		z-index:100000;
	}

	#confirmBox{
		background-color: #f0f0f0;
		width:300px;
		position:fixed;


		border: 1px solid rgba(33, 33, 33, 0.6);

		-moz-box-shadow: 0 0 2px rgba(255, 255, 255, 0.6) inset;
		-webkit-box-shadow: 0 0 2px rgba(255, 255, 255, 0.6) inset;
		box-shadow: 0 0 2px rgba(255, 255, 255, 0.6) inset;
	}

	#confirmBox h1,
	#confirmBox p{
		font:26px/1 'Cuprum','Lucida Sans Unicode', 'Lucida Grande', sans-serif;
		background:url('header_bg.jpg') repeat-x left bottom #f5f5f5;
		padding: 18px 25px;
		text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
		color:#666;
	}

	#confirmBox h1{
		letter-spacing:0.3px;
		color:#888;
	}

	#confirmBox p{
		background:none;
		font-size:16px;
		line-height:1.4;
		padding-top: 35px;
	}

	#confirmButtons{
		padding:5px;
		text-align:center;
	}

	#confirmBox .button{
		display:inline-block;
		background:url('buttons.png') no-repeat;
		color:white;
		position:relative;
		height: 33px;

		font:17px/33px 'Cuprum','Lucida Sans Unicode', 'Lucida Grande', sans-serif;

		margin-right: 15px;
		padding: 0 35px 0 40px;
		text-decoration:none;
		border:none;
	}

	#confirmBox .button:last-child{	margin-right:0;}

	#confirmBox .button span{
		position:absolute;
		top:0;
		right:-5px;
		background:url('buttons.png') no-repeat;
		width:5px;
		height:33px
	}

	#confirmBox .blue{				background-position:left top;text-shadow:1px 1px 0 #5889a2;}
	#confirmBox .blue span{			background-position:-195px 0;}
	#confirmBox .blue:hover{		background-position:left bottom;}
	#confirmBox .blue:hover span{	background-position:-195px bottom;}

	#confirmBox .gray{				background-position:-200px top;text-shadow:1px 1px 0 #707070;}
	#confirmBox .gray span{			background-position:-395px 0;}
	#confirmBox .gray:hover{		background-position:-200px bottom;}
	#confirmBox .gray:hover span{	background-position:-395px bottom;}
	
	/** next previous button css  **/
	.canvasBtn { float:left;width:26px;height:26px;text-align: center;cursor: pointer; }
	.canvasPage {float:left;text-align: center;min-width:26px;font-size: 16px; }
	.vertical_separator{float:left;border-left: 1px solid #ddd;height: 31px;width: 1px;margin-top: -5px;}
	
	
	button, .button {
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 0;
    border-style: solid;
    border-width: 0;
    cursor: pointer;
    font-family: "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
    font-weight: normal;
    line-height: normal;
    margin: 0 0 1.25rem;
    position: relative;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    padding: 1rem 2rem 1.0625rem 2rem;
    font-size: 1rem;
    background-color: #008CBA;
    border-color: #007095;
    color: #FFFFFF;
    transition: background-color 300ms ease-out;
	}
	
	input:not([type]), input[type="text"], input[type="password"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="time"], input[type="url"], input[type="color"], textarea {
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 0;
    background-color: #FFFFFF;
    border-style: solid;
    border-width: 1px;
    border-color: #cccccc;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.75);
    display: block;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.3125rem;
    margin: 0 0 1rem 0;
    padding: 0.5rem;
    width: 100%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition: border-color 0.15s linear, background 0.15s linear;
    -moz-transition: border-color 0.15s linear, background 0.15s linear;
    -ms-transition: border-color 0.15s linear, background 0.15s linear;
    -o-transition: border-color 0.15s linear, background 0.15s linear;
    transition: border-color 0.15s linear, background 0.15s linear;
	}
   </style>
</head>
<body>
	<div id="main"></div>
	
</body>
<script>

	
	//(function ($) {
	//  $.UrlParam = function (name) {
	    //宣告正規表達式
	//    console.log(name);
	//    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	//	console.log(reg);
	    /*
	     * window.location.search 獲取URL ?之後的參數(包含問號)
	     * substr(1) 獲取第一個字以後的字串(就是去除掉?號)
	     * match(reg) 用正規表達式檢查是否符合要查詢的參數
	    */
	//    var r = window.location.search.substr(1).match(reg);
	//	console.log(r);
	    //如果取出的參數存在則取出參數的值否則回穿null
	//    if (r != null) return unescape(r[2]); return null;
	//  }
	//})(jQuery);ObjectId("59a673d628fd3c0f5935203e")
	/**
			Mirador example
			https://iiif.lib.harvard.edu/manifests/drs:48309543
			http://iiif.harvardartmuseums.org/manifests/object/299843
			https://purl.stanford.edu/qm670kv1873/iiif/manifest
			http://manifests.ydc2.yale.edu/manifest/Admont23
			http://gallica.bnf.fr/iiif/ark:/12148/btv1b84539771/manifest.json
			https://data.ucd.ie/api/img/manifests/ucdlib:30708

			Universal Viewer example
			https://wellcomelibrary.org/iiif/b18031511-0/manifest


			diva.js example
			https://ddmal.github.io/diva.js/try/iiif-highlight-pages/stgallen_390_annotated.json

			leaflet IIIF example
			http://iiif.bodleian.ox.ac.uk/iiif/manifest/9fb27615-ede3-4fa0-89e4-f0785acbba06.json
			
			我們所匯出的IIIF Manifest
			http://dev.annotation.taieol.tw/manifest/59b89ee628fd3c75c363d19c.json


	*/
	
	
	
	
</script>
<br><br><br>
<form>
<input id = 'manifest' type = 'text' >
<a id="setManifestBtn" class="button">Set</a>
<form>
<script>
//debugger;
var strUrl = location.search;
var getPara, ParaVal;
var aryPara = [];
if (strUrl.indexOf("?") != -1) {
	var getSearch = strUrl.split("?");
	getPara = getSearch[1].split("&");
	for (i = 0; i < getPara.length; i++) {
		ParaVal = getPara[i].split("=");
		aryPara.push(ParaVal[0]);
		aryPara[ParaVal[0]] = ParaVal[1];
	}
}
if(typeof aryPara.manifest!=='undefined'){
	//console.log(aryPara.manifest);
	var manifest =  manifest(aryPara.manifest,'#main');
	manifest.init();
}else{
	var manifest =  manifest('http://dev.annotation.taieol.tw/manifest/59b89ee628fd3c75c363d19c.json','#main');
	console.log('aryPara.manifest is null');
	manifest.init();
}


$('#setManifestBtn').on('click', function(e){
	var manifest = $('#manifest').val();
	if(manifest!==''){
		console.log('setManifestBtn click');
		e.preventDefault();            
		reload(manifest);
	}else{
		
		console.log('manifest is null');
	}
	
});

function reload(qs) {       
	
	                                                                                                                                      
	var orgUrl=window.location.pathname+'?';
	var newUrl=orgUrl+'manifest='+qs;
	if(qs!==aryPara.manifest){
		window.location=newUrl;
	}else{
		alert('you are in the same page!');
	}
	
	
	
	
	
}
	
  
</script>

<h1>Mirador example</h1>
https://iiif.lib.harvard.edu/manifests/drs:48309543<br>
http://iiif.harvardartmuseums.org/manifests/object/299843<br>
https://purl.stanford.edu/qm670kv1873/iiif/manifest<br>
http://manifests.ydc2.yale.edu/manifest/Admont23<br>
http://gallica.bnf.fr/iiif/ark:/12148/btv1b84539771/manifest.json<br>
https://data.ucd.ie/api/img/manifests/ucdlib:30708<br>

<h1>Universal Viewer example</h1>
https://wellcomelibrary.org/iiif/b18031511-0/manifest


<h1>diva.js example</h1>
https://ddmal.github.io/diva.js/try/iiif-highlight-pages/stgallen_390_annotated.json

<h1>leaflet IIIF example</h1>
http://iiif.bodleian.ox.ac.uk/iiif/manifest/9fb27615-ede3-4fa0-89e4-f0785acbba06.json

<h1>我們所匯出的IIIF Manifest</h1>
http://dev.annotation.taieol.tw/manifest/59b89ee628fd3c75c363d19c.json
	
</html>