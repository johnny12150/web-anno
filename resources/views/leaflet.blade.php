<!doctype html>
<html>
<head>

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
	<script src="http://dev.annotation.taieol.tw/js/leaflet.label.js"></script>
	<script src="http://dev.annotation.taieol.tw/js/manifest.js"></script>
	<link rel="stylesheet" href="http://dev.annotation.taieol.tw/css/leaflet.login.css"/>
	<script src="https://use.fontawesome.com/7ff432e6bc.js"></script>
	<script src="//cdn.tinymce.com/4/tinymce.min.js"></script>
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
   </style>
</head>
<body>
	<div id="main"></div>
	
</body>
<script>
	var manifest =  manifest('http://dev.annotation.taieol.tw/manifest.json','#main');
	manifest.init();

	
	
</script>


	
</html>