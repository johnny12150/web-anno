<!DOCTYPE html>
<!-- saved from url=(0037)http://data.asdc.tw/lod/Person/PR0001 -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><link type="text/css" rel="stylesheet" href="./LTA_Annotation_DEMO_files/css"><style type="text/css">.gm-style .gm-style-cc span,.gm-style .gm-style-cc a,.gm-style .gm-style-mtc div{font-size:10px}</style><style type="text/css">@media print {  .gm-style .gmnoprint, .gmnoprint {    display:none  }}@media screen {  .gm-style .gmnoscreen, .gmnoscreen {    display:none  }}</style><style type="text/css">.gm-style{font-family:Roboto,Arial,sans-serif;font-size:11px;font-weight:400;text-decoration:none}.gm-style img{max-width:none}</style>
    <title>Link Taiwan Artists</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="{{ asset('css/annotation.css') }}"/>
    <link rel="gettext" type="application/x-po" href="{{ asset('locale/annotator.po') }}">
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

    <body >
	<img src ='image/demo.jpg' style='width:70%'></img>
  </body>

<script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
<script src="{{ asset('js/annotation.full.js')}}"></script>
<script type="text/javascript">
    window.onload =function(){
      var uri = 'http://testing';

      var anno = annotation('body');
      anno.init({
          uri : uri,
          imageAnnotation : true,
  		keywords:[{
  				host: 'http://140.109.18.158/api/annotation.jsp',
  				data:{tagType:'00ff00'},
  				name: '本草綱目',
  				color: 'lime'},
  				{
  				host: 'http://140.109.18.158/api/annotation.jsp',
  				data:{tagType:'00ff00'},
  				name: '資源網',
  				color: 'red'},
  				{
  				host: 'http://140.109.18.158/api/annotation.jsp',
  				name: '資源網test',
  				color: 'blue'}]
      });

    }
</script>
</html>
