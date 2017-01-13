
<html>
    <head>
        <head>

		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="">
		<meta name="author" content="">
        <title>digital_island Manage Page</title>
		<style>
			tr:hover td {
				cursor : pointer;
				background-color: #d5f5d5;
			}
		</style>
		<script
		  src="https://code.jquery.com/jquery-3.1.1.js"
		  integrity="sha256-16cdPddA6VdVInumRGo6IbivbERE8p7CQR3HzTBuELA="
		  crossorigin="anonymous"></script>
		<script src="//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js"></script>
		<script src="https://cdn.datatables.net/1.10.13/js/dataTables.bootstrap.min.js"></script>

		<link rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/dataTables.bootstrap.min.css">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

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
		<div style='padding:20px'>
			<form id ='target' action="modified_annotation" method="post">
			   <input id='input1' type="test" name="json" hidden='true'>
			</form>
			<table id="example" class="table table-striped table-bordered" cellspacing="0" width="100%">
				<thead>
					<tr>
						<th>作品名稱</th>
						<th>相簿名稱</th>
						<th>作者</th>
						<th>圖片位置</th>
						<th>註記數量</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th>作品名稱</th>
						<th>相簿名稱</th>
						<th>作者</th>
						<th>圖片位置</th>
						<th>註記數量</th>
					</tr>
				</tfoot>
			</table>
		</div>
    </body>
	<script>
		
        var dataSet;
		/*$(document).ready(function() {
		
			$.ajax({
			  type: "POST",
			  url: 'digital_island_api',
			  success: function(data){
				 dataSet = data;

					$('#example').DataTable( {
					data: dataSet,
					deferRender: true
					columns: [
						
						{ data: 'url' , title : 'IMG' ,
						  "render": function(data, type, row) {
							 return '<img class ="annotation_img"src="'+data+'" width="250px" height="200px"/>';
						 }
						},
						{ data: 'p_title',title : '相片名稱' },
						{ data: 'a_title',title : '相簿名稱' },
						{ data: 'uname',title : '作者' },

					],
					
				});
				$( ".annotation_img" ).click(function(e) {
					 console.log(e.target.src);
					 var src = (e.target.src);
					 $('#input1').val(src);
					 $('#target').submit();
				});
			  },
			  error :function(data){
				console.log(data);
			  }
			});
		});*/
		$(document).ready(function() {
			$('#example').DataTable( {

				"processing": true,
				"serverSide": true,
				"ajax": "http://dev.annotation.taieol.tw/digital/digital_island_api",
				"rowCallback": function( row, data ) {
					$(row).data('data',data);
				}
				
			});
			$('#example tbody').on('click','tr',function(e) {
				var src="";
				if($(e.target).attr('src') == null )
					src = $($(e.target.parentElement).data('data')[3]).attr('src');
				 else
					src = $(e.target).attr('src');
				 $('#input1').val(src);
				 $('#target').submit();
			});
		} );
	

	</script>
</html>