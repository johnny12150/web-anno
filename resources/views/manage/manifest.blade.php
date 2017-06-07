@extends('app')
@section('custom_css')

<link rel="stylesheet" href="/css/jquery.tokenize.css"></script>
<link rel="stylesheet" href="/css/easy-autocomplete.css"></script>
<style type="text/css"> 
.manifestImg { 

cursor: pointer; 

} 
</style> 
@endsection
@section('content')

<div class="container">
    <div class ="row">
		
		<button id='cManifest' class='btn btn-default'>Create New Manifest</button>
		<button id='iManifest' class='btn btn-default'>Import Current Manifest</button>
		<form action="myprocess" method="post" id='form1'style='display:none' >
			  Import The manifest By URL: <input id ='manifestInput' type="test" name="id">
            　<input type="submit" value="Import"> 
		</form>
	<hr>

	@foreach($manifestData as $manifest)
		<div class='col-lg-3'>
			<?php 
				$src=$manifest['manifest']['sequences'][0]['canvases'][0]['images'][0]['resource']['@id'];
				if (strpos($src,'full/full/0/default.jpg')==false)
					$src.='/full/full/0/default.jpg'; 
				$src=str_replace('full/0',',250/0',$src);
			?>
			<img class ='manifestImg'  height='250px' src= '{{$src}}'
			data-id = {{$manifest['_id']}} alt= {{ $manifest['manifest']['label'] }}>
			<p>{{ substr($manifest['manifest']['label'],0,30)}}...<i class="fa fa-trash fa-1x trash" aria-hidden="true" data ={{$manifest['_id']}}></i></p>
			
		</div>
	 @endforeach
	</div>
</div>
@endsection
@section('custom_script')
<script>

	$(document).on('click','.manifestImg',function(e){
		var manifest_id  = $(e.target).attr('data-id')
		$('#manifestInput').val(manifest_id);
		var from1 = document.getElementById("form1");
        from1.submit();
	});
	$(document).on('mouseover','.manifestImg',function(e){
		$(e.target.parentElement).find('.trash').show()
	});
	$(document).on('mouseleave','.manifestImg',function(e){
		//$(e.target.parentElement).find('.trash').hide()
	});
	$(document).on('click','.trash',function(e){
		var id = $(e.target).attr('data');
		$.ajax({
			xhrFields: {
				withCredentials: true
			},
			url: '/manage/manifest/delete',
			method: "POST",
			data: {id: id},
			success: function (data, textStatus) {
				if (data.result) {
					location.reload();
				} else {
					location.reload();
				}
			},
			error: function(data) {
				//location.reload();
			},
			dataType: 'json'
		});
		
	});
	$(document).on('click','#cManifest',function(e){
		location.href = 'http://edit.annotation.taieol.tw/#/new';
	});
	$(document).on('click','#iManifest',function(e){
		location.href = 'http://edit.annotation.taieol.tw/#/open';
	});
</script>
@endsection