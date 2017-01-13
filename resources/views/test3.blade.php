<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>數位島嶼編輯介面</title>

    <!-- Bootstrap Core CSS -->
    <link href="./bt1/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="./bt1/css/modern-business.css" rel="stylesheet">

    <!-- Custom Fonts -->
    <link href="./bt1/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <link rel="stylesheet" href="{{ asset('css/annotator.min.css') }}"/>
    <link rel="stylesheet" href="{{ asset('css/richText-annotator.min.css')}}">
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
	
		<img src ='{{ $url }}'>
	
</body>
<script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
<script src="{{ asset('js/annotation.full.js')}}"></script>

<script type="text/javascript">

     $(window).load(function(){
        
		var img = "<?php echo $url  ?>";
        var anno = annotation('body');
        anno.init({
			specific_url : img ,
            uri :  location.href.split('#')[0],
            imageAnnotation : true,
			
        });
    });



</script>
</html>
