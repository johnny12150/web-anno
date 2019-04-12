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
<script>

</script>
	@foreach($manifestData as $manifest)
		<div class='col-lg-3'>
			<?php 
				
				/*print_r($manifest['manifest']['sequences'][0]['canvases'][0]['images'][0]['resource']['@id']);
				die();*/
				$src=$manifest['manifest']['sequences'][0]['canvases'][0]['images'][0]['resource']['@id'];
				$src=str_replace('250/0',',250/0',$src);
				
				if(isset($manifest['manifest']['label'])==null)
				{
					$label='the manifest do not have label';
				}
				else
				{
					$label=$manifest['manifest']['label'];
				}
				
			?>
			<img class ='manifestImg' style="border:2px green dashed;" height='250px' width='200px' src= '{{$src}}'
			data-id = {{$manifest['_id']}} alt= {{ $label }} >
			<p>{{ substr($label,0,30)}}...<i class="fa fa-trash fa-1x trash" aria-hidden="true" data ={{$manifest['_id']}}></i></p>
			<!--編輯註記按鈕 -->
			<p><a href=" {{ 'http://dev.annotation.taieol.tw/leaflet?manifest=' . $manifest['manifest']['@id'] }} ">編輯註記</a></p>
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
	var user = "<?php echo $user['id']  ?>";

	$(document).on('click','#cManifest',function(e){
		location.href = 'http://edit.annotation.taieol.tw/#/new';
	});
	$(document).on('click','#iManifest',function(e){
		location.href = 'http://edit.annotation.taieol.tw/#/open?uid=' + user ;
	});
</script>
@endsection