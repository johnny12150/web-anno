<!DOCTYPE html>
<html lang="en-us">
<head>
  <meta charset="utf-8">
  <title>Lightbox Example</title>
  <link rel="stylesheet" href="./lightbox2-master/dist/css/lightbox.min.css">
    <link rel="stylesheet" href="{{ asset('css/annotator.min.css') }}"/>
    <link rel="stylesheet" href="{{ asset('css/richText-annotator.min.css')}}">
    <link rel="stylesheet" href="{{ asset('css/annotation.css') }}"/>
    <link rel="gettext" type="application/x-po" href="{{ asset('locale/annotator.po') }}">
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
  
 
</head>
<body 
  <div class ="test">
    <section>
      <h3>Two Individual Images</h3>
      <div>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-1.jpg" data-lightbox="example-1"><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-1.jpg" alt="image-1" /></a>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-2.jpg" data-lightbox="example-2" data-title="Optional caption."><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-2.jpg" alt="image-1"/></a>
      </div>

      <hr />

      <h3>A Four Image Set</h3>
      <div>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-3.jpg" data-lightbox="example-set" data-title="Click the right half of the image to move forward."><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-3.jpg" alt=""/></a>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-4.jpg" data-lightbox="example-set" data-title="Or press the right arrow on your keyboard."><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-4.jpg" alt="" /></a>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-5.jpg" data-lightbox="example-set" data-title="The next image in the set is preloaded as you're viewing."><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-5.jpg" alt="" /></a>
        <a class="example-image-link" href="http://lokeshdhakar.com/projects/lightbox2/images/image-6.jpg" data-lightbox="example-set" data-title="Click anywhere outside the image or the X to the right to close."><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/images/thumb-6.jpg" alt="" /></a>
      </div>
    </section>

    <section>
      <p>
        For more information, visit <a href="http://lokeshdhakar.com/projects/lightbox2/">http://lokeshdhakar.com/projects/lightbox2/</a>
      </p>
    </section>
    <div><p>fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff</p></div>
    <div><p>fffffffffffffffffffffff3333ffffffffffffffffffffffffffffffffffffffffffffffffff</p></div>
  </div>

  <script src="./lightbox2-master/dist/js/lightbox-plus-jquery.min.js"></script>

</body>
<script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
<script src="{{ asset('js/annotation.full.js')}}"></script>
<script type="text/javascript">

    var uri = 'http://testing';

    var anno = annotation('.test');
    anno.init({
        uri : uri,
        imageAnnotation : false,

    });


</script>
</html>
