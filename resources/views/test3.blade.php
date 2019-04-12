<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">

    <meta name="description" content="">    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="">

    <title>數位島嶼編輯介面</title>



    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <link rel="stylesheet" href="{{ asset('css/annotation.css') }}"/>
    <link rel="gettext" type="application/x-po" href="{{ asset('locale/annotator.po') }}">
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
</head>

<body>
	<nav class="navbar navbar-default navbar-custom">
		<div class="container-fluid">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
					<span class="sr-only">Toggle Navigation</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="{{ url('/manage') }}">數位人文工具</a>
			</div>

			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				<ul class="nav navbar-nav">
					<li id="digital"><a href="{{ url('/digital/digital_island') }}">數位島嶼管理介面</a></li>
				</ul>
			</div>
		</div>
	</nav>
	<div style="float:left;max-width:70%;margin:0 10px">
		<img src ='{{ $url }}' style='width:100%'>
	</div>
	<div style="display: inline;width:100px;font-size:20px">
		<div style="margin:10px"><b>相片名稱</b><br/>{{$p_title}}</div>
		<div style="margin:10px"><b>相簿名稱</b><br/>{{$a_title}}</div>
		<div style="margin:10px"><b>作者</b><br/>{{$uname}}</div>
	</div>
	
</body>
<script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
<script src="{{ asset('js/annotation.full.js')}}"></script>
<script src="{{ asset('js/annotation-init.js')}}"></script>
</html>
