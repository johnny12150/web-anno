$(window).load(function(){
	var anno = annotation('body');
	anno.init({

		uri :  location.href.split('#')[0],
		imageAnnotation : true,
		
	});
});
