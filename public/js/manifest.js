var login ={name:'null',id : -1 };
var manifest = function(manifestUrl,element){
	var manifest  = {
	};
	manifest.element = element; //作用在哪個div
	manifest.json_object ; //manifest object
	manifest.canvasArray = []; //canvas array
	manifest.index = 1; //目前在哪個canvas的index
	manifest.currenCanvas ; //目前的canvas
	manifest.leaflet; // leaflet 物件	

	manifest.init = function(){
		appendLoginPanel();
		confirmBox();
		$.getJSON(manifestUrl, function(data) {
			manifest.json_object = data;
			manifest.canvasArray = data.sequences[0].canvases;

			var div = $('<div id ="mapid"></div>');
			$(element).append(div);

			manifest.currenCanvas = manifest.canvasArray[0];
			manifest.checkOtherContent(manifest.currenCanvas);
			manifest.add_chose_button();
			
		});
	};
	/*查詢是否有先前的註記*/
	manifest.checkOtherContent = function(canvas){
		/*���� �Ȯɼg�� POST�� Manifest Controller   Method:get AnnoList(*/
		$.post( "http://dev.annotation.taieol.tw/manifest/searchAnnoByCanvas", { canvas: canvas })
		.done(function( data ) {
			var object = {
				'@id' : data,
				'@type' :"sc:AnnotationList"
			}
			manifest.currenCanvas['otherContent'] =[];
			manifest.currenCanvas['otherContent'].push(object);
			manifest.leaflet = leafletMap(manifest.currenCanvas);
			console.log('leaflet_map');
			manifest.add_chose_button();
			console.log('切換canvas');
		});

	};
	/*Change Canvas時要執行的動作*/
	manifest.change = function(){
			manifest.leaflet.remove();
		    manifest.currenCanvas = manifest.canvasArray[manifest.index-1];
			console.log(manifest.currenCanvas);
			manifest.checkOtherContent(manifest.currenCanvas);	
	}

	/*選擇要第幾個canvas*/
	manifest.add_chose_button = function(){
		//add css class and separator div and class
		var div = $('<div class= "leaflet-control-layers leaflet-control" style="padding-top: 5px;"></div>');
		var left = $('<div class="leaflet-control-layers-base canvasBtn" ><span class="fa fa-chevron-left fa-2x" aria-hidden="true"> </span></div>');
		var input =  $('<div class="leaflet-control-layers-base canvasPage"><span></span></div>');
		var right = $('<div class="leaflet-control-layers-base canvasBtn" ><span class="fa fa-chevron-right fa-2x" aria-hidden="true"> </span></div>');
		var separatorL = $('<div class="vertical_separator" ></div>');
		var separatorR = $('<div class="vertical_separator"></div>');
		div.append(left,separatorL,input,separatorR,right);
		$($('.leaflet-bottom.leaflet-right')[0]).prepend(div);
		$($(input)[0]).html(manifest.index + '/'+ manifest.canvasArray.length );
		right.click(function(){
			if( manifest.index +1 <= manifest.canvasArray.length){
				manifest.index = manifest.index+1 ;
				manifest.change();
			}else{
				alert('Out of Range');
			}

		});
		left.click(function(){
			if(manifest.index-1 >= 1){
				manifest.index = manifest.index-1;
				manifest.change();
			}else{
				alert('Out of Range');
			}
		});
	};
	return manifest;
}

var login_page = $('<div class ="login-page"></div>');
function appendLoginPanel(){
	/*LoginPanel*/
    login_page = $('<div class ="login-page"></div>');
	var _form = $('<div class="form" ></div>');
	var _loginForm = $('<form class="login-form" ></form>');
	var inputText1 = $('<input type="text" placeholder="username"/>');
	var inputText2 = $('<input type="password" placeholder="password"/>');
	var loginButton =  $('<button>login</button>');
	$('body').append(login_page);
	login_page.append(_form);
	_form.append(_loginForm);
	_loginForm.append(inputText1,inputText2,loginButton);
	login_page.css('display','none');
	
	$(".login-form").unbind('submit');
	$(".login-form").submit(function(e){ 
		e.preventDefault();
		console.log($(":text").val());
		loginfun();
	 });

}
function leafletLogin(){
	var controlbar = $('<div class="leaflet-control-layers leaflet-control" style="padding-top: 5px;"></div>');
	$($('.leaflet-top.leaflet-right')[0]).append(controlbar);
	
	var login_div = $('<div id ="leaflet_Login" class="leaflet-control-layers-base canvasBtn"><a href="#" title="登入"><span class="fa fa-sign-in fa-2x"></span></a></div>');
	var logout_div = $('<div id="leaflet_Logout_div"><span id="login_user"></span><div id ="leaflet_Logout" class="leaflet-control-layers-base canvasBtn"><a href="#" title="登出"><span class="fa fa-sign-out fa-2x"></span></a></div></div>');
	controlbar.append(login_div,logout_div);
	if(login.id == -1){
		$('.leaflet-draw-section').css('display','none');
		$('#leaflet_Login').show();
		$('#leaflet_Logout_div').hide();
	} else{
		$('.leaflet-draw-section').css('display','block');
		$('#leaflet_Login').hide();
		$('#leaflet_Logout_div').show();
		$('#login_user').html(login.name);
	}
	$('#leaflet_Login').click(function(){
		login_page.css('display','block');
	});
	$('#leaflet_Logout').click(function(){
		logoutfun();
	});
	
}
function confirmBox(){
	/*confirmBox*/
	var confirmOverlay = $('<div id="confirmOverlay" style="display: none;"></div>');
	var confirmBox = $('<div id="confirmBox">');
	var textArea = $('<textarea name="editor" id="editor" cols="30" rows="10"></textarea>');
	var confirmButtons = $('<div id="confirmButtons"></div>');
	var save = $('<a id="annotation_save" class="button blue" >save<span></span></a>');
	var cancel = $('<a id="annotation_cancel" class="button gray" >cancel<span></span></a>');
	$('body').append(confirmOverlay);
	confirmOverlay.append(confirmBox);
	confirmBox.append(textArea,confirmButtons);
	confirmButtons.append(save,cancel);
	
}
function loginfun(){
	$.post("http://dev.annotation.taieol.tw/login", { 
		email: $(":text").val(),
		password :$(":password").val(),
	})
	.done(function(data){
		login = data;
		manifest.change();
		login_page.css('display','none');
	});
}

function logoutfun(){
	$.post("http://dev.annotation.taieol.tw/logout", { 
		token: login.token,
	})
	.done(function(data){
		login = {name:'null',id : -1 };
		manifest.change();
	});
}

var leafletMap = function(canvas){

	var leafletMap = {};
	var mymap = L.map('mapid',{ zoom: 13 ,  crs: L.CRS.Simple , center: [0,0] }).setView([51.505, -0.09], 13);
	var iiif_layer = L.tileLayer.iiif(canvas.images[0].resource.service['@id'] + '/info.json').addTo(mymap);
	var drawnItems = L.featureGroup().addTo(mymap);
	var mapAidToLid =[];
	var editStatus = false;
	/**
	*用於編輯文字的update
	*產生一個浮動的button，等到mouse move 到layer上，且編輯狀態為true，則會顯示
	*/
	var button_edit = $('<div class ="leaflet-button-pane" style="z-Index:6;left: 0;top: 0;position: relative;"></div>');
	var leaflet_objects = $('.leaflet-objects-pane');
	if(leaflet_objects.find('.leaflet-button-pane').length === 0){
		leaflet_objects.append(button_edit);
		
		var editDiv = $('<div class= "leaflet-control-layers leaflet-control edit_button_group" style="padding-top: 5px;"></div>');
		var editTextButton = $('<div id="textButtonEdit" class="leaflet-control-layers-base canvasBtn" ><a href="#" title="編輯文字"><span class="fa fa-pencil-square-o fa-2x" aria-hidden="true"></span></a></div>');
		var editShapeButton =  $('<div id="shapeButtonEdit" class="leaflet-control-layers-base canvasBtn"><a href="#" title="編輯圖形"><span class="fa fa-arrows fa-2x" aria-hidden="true"></span></a></div>');
		var deleteShapediv = $('<div id="deleteButtonEdit" class="leaflet-control-layers-base canvasBtn" ><a href="#" title="刪除"><span class="fa fa-trash-o fa-2x" aria-hidden="true"> </span></a></div>');
		
		var separatorL = $('<div class="vertical_separator" ></div>');
		var separatorR = $('<div class="vertical_separator"></div>');
		editDiv.append(editTextButton,separatorL,editShapeButton,separatorR,deleteShapediv);
	
		var savediv = $('<div class= "leaflet-control-layers leaflet-control check_button_group" style="padding-top: 5px;"></div>');
		var saveButton = $('<div id="saveButton" class="leaflet-control-layers-base canvasBtn" ><a href="#" title="存檔"><span class="fa fa-floppy-o fa-2x" aria-hidden="true"> </span></a></div>');
		var cancelButton = $('<div id="cancelButton" class="leaflet-control-layers-base canvasBtn" ><a href="#" title="取消"><span class="fa fa-ban fa-2x" aria-hidden="true"> </span></a></div>');
		var separator = $('<div class="vertical_separator" ></div>');
		savediv.append(saveButton,separator,cancelButton);
		
		$('.leaflet-button-pane').append(editDiv,savediv);
		$('.leaflet-button-pane').css('display','none');
		$('.check_button_group').css('display','none');
	}

	leafletMap.edit_status = false;


	leafletMap.chageEditStatus = function(bool){
		leafletMap.edit_status = bool
	}


	
	var creators=[];
	var maps={};
	var str=",";
	if(canvas.otherContent !== undefined){
		$.getJSON(canvas.otherContent[0]['@id'], function(annoData) {
			$.each(annoData.resources, function(i, value) {
				user=value.creator.replace("http://dev.annotation.taieol.tw/user/","").split('/');
				if (!str.includes(","+user[1]+","))
				{
					str+=user[1]+",";
					var anno_layer=L.featureGroup();
					creators.push({id:user[0],user:user[1],anno_layer:anno_layer})
				}
			});
			var haslogin=false;
			for(var i=0;i<creators.length;i++)
			{
					if (login['id']==creators[i].id)
					{
						maps[creators[i].user]=drawnItems
						haslogin=true;
					}else{
						maps[creators[i].user]=creators[i].anno_layer.addTo(mymap);
					}
			}
			if (!haslogin && login['id'] !== -1 )
			{
				maps[login['name']]=drawnItems; 
			}
			L.control.layers({
				"iiif":iiif_layer
			}, maps, { position: 'topleft', collapsed: false }).addTo(mymap); 

			mymap.addControl(new L.Control.Draw({
				edit: {
					featureGroup: drawnItems,
					poly: {
						allowIntersection: false
					},
					remove: false,
					edit: false
				},
				draw: {
					polygon: {
						allowIntersection: false,
						showArea: true
					},
					 marker: true,
					 polygon: true,
					 rectangle : true,
					 polyline: false,
					 circle: false
				}
			}));
			
			leafletLogin();
			$.each(annoData.resources, function(i, value) {
			  var user=value.creator.replace("http://dev.annotation.taieol.tw/user/","").split('/'); 
			  var layer;
			  var shape;
			  if (typeof value.on === 'object') {
				  //�h����
				 var svg = value.on[0].selector.item.value;
				 var result = xmlStringToXmlObject(svg);
				 shape = 'polygon';
				 if( result.documentElement.getElementsByTagName('polygon')[0] !== undefined ){
					 var pointString = result.documentElement.getElementsByTagName('polygon')[0].attributes[0].nodeValue; 
					 var array_point = pointString.split(',');
					 var tempx = '';
					 var tempy = '';
					 var array = [];

					 array_point.forEach(function(point, index, array_point){
						 if (index % 2 === 0) {
							 tempx = point;
						 } else if (index % 2 ===1 ) {
							 tempy = point
							 var unprojectObject =   mymap.unproject(new Array(tempx,tempy), 3);
							 array.push(unprojectObject);
						 }

					 });
					layer = L.polygon(array);

				 }else if(result.documentElement.getElementsByTagName('circle')[0] !== undefined){
					 //����
					  shape = 'circle';
					 var cx = result.documentElement.getElementsByTagName('circle')[0].attributes[0].nodeValue;
					 var cy = result.documentElement.getElementsByTagName('circle')[0].attributes[1].nodeValue; 
					 var r = result.documentElement.getElementsByTagName('circle')[0].attributes[2].nodeValue;
					 var latlng = mymap.unproject(new Array(cx,cy),3);
					 var center = new Array(latlng.lat,latlng.lng);
					 layer = L.circle(center, r);

				 }else{
						return;
				 }
				 maps[user[1]].addLayer(layer);
				 layer.bindLabel(value.resource.chars).addTo(mymap);
				

			  }else{
				  //�x��
				  shape = 'rectangle';
				  var b = /xywh=(.*)/.exec(value.on)[1].split(',');
				  var minPoint = L.point(b[0], b[1]);
				  var maxPoint = L.point(parseInt(b[0]) + parseInt(b[2]), parseInt(b[1]) + parseInt(b[3]));
				  var min = mymap.unproject(minPoint, 3);
				  var max = mymap.unproject(maxPoint, 3);
				  if(parseInt(b[2]) <= 1){
					layer =  L.marker(min);
					console.log(b[2]);
			      }else{
					layer = L.rectangle(L.latLngBounds(min, max));
			      }
				  maps[user[1]].addLayer(layer);
				  layer.bindLabel(value.resource.chars).addTo(mymap);
			  }
			  /**/
			  var mapObject = {
				'aid': value['@id'],
				'lid': layer._leaflet_id,
				'layer' : layer._map._layers,
				'shape' : shape
			   };
			  mapAidToLid.push(mapObject);
			  if(login['id']==user[0])
				binding_modified_event(layer);
			});
		});
	}

		
	 mymap.on(L.Draw.Event.CREATED, function (event) {
        var layer = event.layer;

        maps[login['name']].addLayer(layer);
    });

	mymap.on(L.Draw.Event.DRAWSTART, function (event) {
		$(document).mousemove(function(event){
			x = event.pageX ;
			y = event.pageY ;
		});
		$( "#annotation_cancel").unbind( "click" );
		$( "#annotation_save").unbind( "click" );
	});
	mymap.on(L.Draw.Event.CREATED, function (event) {
		var layer = event.layer;
		 maps[login['name']].addLayer(layer);


		$('#confirmOverlay').show();
		$('#confirmBox')
			.css('left', x)
			.css('top', y);
		var points_array ;
		if( event.layerType ==='circle'){
				var point = mymap.project(layer._latlng,3)
				point.x = point.x * 100 / canvas.width;
				point.y = point.y * 100 / canvas.height;
				points_array = [];
				points_array.push(point);
				points_array.push(layer._mRadius);
		}else if (event.layerType ==='marker')
		{
				var point = mymap.project(layer._latlng,3)
				point.x = point.x * 100 / canvas.width;
				point.y = point.y * 100 / canvas.height;
				point.w = 0;
				point.h = 0;
				points_array = [];
				points_array.push(point);
		}
		else{
			points_array = convert_latlng_SVG(canvas,layer._latlngs);
		}
		$('#annotation_save').click(function(e){
			var annotationObject = {
				'canvas_id' : canvas["@id"],
				'image' : canvas.images[0].resource["@id"],
				'point' :  JSON.stringify(points_array) ,
				'shape' :  event.layerType,
				'lid' : layer._leaflet_id,
				'text' :  tinyMCE.activeEditor.getContent()
			};
			layer.bindLabel(annotationObject.text).addTo(mymap);
			save_anno(annotationObject,'save');
			$('#confirmOverlay').hide();
			tinyMCE.activeEditor.setContent('');
			binding_modified_event(layer);

		});
		$('#annotation_cancel').click(function(e){
			 maps[login['name']].removeLayer(layer);
			tinyMCE.activeEditor.setContent('');
			$('#confirmOverlay').hide();
		});
	});

	mymap.on(L.Draw.Event.DELETED, function (e) {
	   var layer = e.layers._layers

	   var layer_keys = Object.keys(layer);
	   var deletArray = [];
	   mapAidToLid.forEach(function(element, index, array) {
	    if( layer_keys.indexOf(String(element.lid)) !== -1 )
			deletArray.push(element.aid);
		});
	   save_anno(deletArray,'delete');
	});

/*
	mymap.on('draw:edited', function (e) {
		var layers = e.layers;
		var layer_keys = Object.keys(layers._layers);
		var udateArray = [];
		var TextArray = [];
		mapAidToLid.forEach(function(element, index, array) {
			if(layer_keys.indexOf(String(element.lid)) !== -1){
				var points_array = convert_latlng_SVG(canvas,layers._layers[layer_keys]._latlngs);
				element.point = JSON.stringify(points_array);
			}
		});
		mapAidToLid.forEach(function(element, index, array) {
			if( element.point !== undefined ){
				var object = {
					'aid' : element.aid,
					'point' : element.point,
					'shape' : element.shape
				};
				udateArray.push(object);
			}

		});
		mapAidToLid.forEach(function(element, index, array) {
			if( element.text !== undefined ){
				var object = {
					'aid' : element.aid,
					'text' : element.text,
				};
				TextArray.push(object);
			}
		});
		save_anno(TextArray, 'editText');
		save_anno(udateArray,'edit');
     });
	*/
	function saveChangeText(){
		var TextArray = [];
		mapAidToLid.forEach(function(element, index, array) {
			if( element.text !== undefined ){
				var object = {
					'aid' : element.aid,
					'text' : element.text,
				};
				TextArray.push(object);
			}
		});
		save_anno(TextArray, 'editText');
	}
	function saveChangeShape(layer){
		var udateArray = [];
		mapAidToLid.forEach(function(element, index, array) {
			if(String(layer._leaflet_id).indexOf(String(element.lid)) !== -1){
				var tmp  = layer._latlngs;
				var points_array
				if(layer._latlngs === undefined){
					var point = mymap.project(layer._latlng,3)
					var tmp =[];
					point.x = point.x * 100 / canvas.width;
					point.y = point.y * 100 / canvas.height;
					point.w = 0;
					point.h = 0;
					tmp.push(point);
					element.shape = 'marker';
					points_array  = tmp;
				} else {
					points_array = convert_latlng_SVG(canvas,tmp);
				}
				element.point = JSON.stringify(points_array);
				var object = {
					'aid' : element.aid,
					'point' : element.point,
					'shape' : element.shape
				};
				udateArray.push(object);
			}
		});
		save_anno(udateArray,'edit');
	}
	mymap.on('draw:editstart', function(e){
		editStatus = true ;
	});

	mymap.on('draw:editstop', function(e){
		editStatus = false;
		$('.leaflet-button-pane').css('display','none');
	});


	if(canvas.otherContent !== undefined){
		$.getJSON(canvas.otherContent[0]['@id'], function(annoData) {


		});
	}
	function save_anno(data,purpose,layer) {
		var array = [];
		var empty = [];
		if(purpose === 'save'){
			array.push(data);
			$.post( "http://dev.annotation.taieol.tw/manifest/subsave", { annotation: JSON.stringify(array),
				user : login['id'],
				getUpdateText : empty,
				updateArray :empty,
				deletArray :empty
			})
			.done(function(Rdata) {
				var mapObject = {
				'aid': Rdata,
				'lid': data.lid,
				'layer' : data.layer,
				'shape' : data.shape
			    };
			    mapAidToLid.push(mapObject);
				console.log(Rdata);
			});
		} else if( purpose == 'delete'){

			$.post( "http://dev.annotation.taieol.tw/manifest/save", { annotation: empty,
				user : login['id'],
				getUpdateText : empty,
				updateArray :empty,
				deletArray :JSON.stringify(data)
			})
			.done(function( data ) {
				layer._map.removeLayer(layer);
				$('.leaflet-button-pane').css('display','none');
			});
		} else if(purpose === 'edit'){
			$.post( "http://dev.annotation.taieol.tw/manifest/save", { annotation: empty,
				user : login['id'],
				getUpdateText : empty,
				updateArray :JSON.stringify(data),
				deletArray :empty
			}).done(function(data){
				$('.leaflet-button-pane').css('display','none');
			});

		} else if(purpose ==='editText'){
			$.post( "http://dev.annotation.taieol.tw/manifest/save", { annotation: empty,
				user : login['id'],
				getUpdateText : JSON.stringify(data),
				updateArray :empty,
				deletArray :empty
			})
			.done(function(data){
				$('.leaflet-button-pane').css('display','none');
			});

		}
	}
	function convert_latlng_SVG (canvas,points){
		var array = [];
		$.each(points, function(i, value) {
			var temp = mymap.project(value,3);

			temp.x = temp.x * 100 / canvas.width;
			temp.y = temp.y * 100 / canvas.height;
			array.push(temp);
		});
		return array ;
	}
	function xmlStringToXmlObject(xmlString) {
		var parseXml;
		if (window.DOMParser) {
			parseXml = function(xmlStr) {
				return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
			};
		} else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
			parseXml = function(xmlStr) {
				var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			};
		} else {
			parseXml = function() { return null; }
		}

		var xmlDoc = parseXml(xmlString);
		if (xmlDoc) {
			return xmlDoc;
		}
	} 
	var editing = false;
	var btn_leave=true;
	var layer_leave=true;
	$('.edit_button_group').mouseleave(function(event){
		btn_leave=true;
		if (!editing)
			setTimeout(function(){if( editing === false && btn_leave && btn_leave){$('.edit_button_group').css('display','none');}},200); 
	});
	$('.edit_button_group').mouseover(function(event){
		btn_leave=false;
	});
	function binding_modified_event(layer){
		var element = layer._path!=undefined?$(layer._path):$(layer._icon);
		element.mouseleave(function(event){
			layer_leave=true;
			if (!editing)
				setTimeout(function(){if( editing === false && btn_leave && btn_leave){$('.edit_button_group').css('display','none');}},200); 
		});
		element.mouseover(function( event ) {
			var centerlatlng;
			layer_leave=false;
			if (layer._path!=undefined) {
				 var latlngs=layer.getLatLngs();
				 var lat=0,lng=0;
				 
				 for(var i=0;i<latlngs.length;i++){
					 lat+=latlngs[i].lat;
					 lng+=latlngs[i].lng;
				 }
				 lat=lat/latlngs.length;
				 lng=lng/latlngs.length;
				 centerlatlng={ 'lat':lat, 'lng': lng }; 
			}else{
					centerlatlng=layer.getLatLng();
			}

			$('.leaflet-button-pane').css('transform',L.DomUtil.getTranslateString(layer._map.latLngToLayerPoint(centerlatlng).round()));
			$('.leaflet-button-pane').css('display','block');
			$('.edit_button_group').unbind('click');
			$('#annotation_save').unbind('click');
			$('#shapeButtonEdit').unbind('click');
			$('#deleteButtonEdit').unbind('click');
			$('#textButtonEdit').unbind('click');
			$('#annotation_cancel').unbind('click');
			if( editing === false)
				$('.edit_button_group').css('display','block');
		
			$('#textButtonEdit').click(function(event){
				console.log(layer);
				tinyMCE.activeEditor.setContent(layer.label._content);
				$('#confirmOverlay').show();
				$('#confirmBox')
						.css('left', event.pageY)
						.css('top',  event.pageY);
				$('#annotation_save').click(function(e){
					layer.label.setContent(tinyMCE.activeEditor.getContent());
					$('#confirmOverlay').hide();
					mapAidToLid.forEach(function(element, index, array) {
					if(element.lid === layer._leaflet_id){
							element.text = tinyMCE.activeEditor.getContent();
							tinyMCE.activeEditor.setContent('');
						}
					});
					saveChangeText();
					
				});
				$('#annotation_cancel').click(function(e){
					tinyMCE.activeEditor.setContent('');
					$('#confirmOverlay').hide();
				});
			});
			$('#shapeButtonEdit').click(function(event){
				  var old;
				  if (layer._path!=undefined){
					  old=layer.getLatLngs();
				  }else{
					  old=layer.getLatLng();
				  }
				  editing = true;
				  $('.edit_button_group').css('display','none');
				  layer.editing.enable();
				  $('.check_button_group').css('display','block');
				  
				//變動sytle
				if(layer._icon === undefined)
					layer.setStyle({ dashArray: '10 , 10',color:'#777'});
				$('#saveButton').click(function(event){
					saveChangeShape(layer);
					editing =false;
					layer.editing.disable();
					$('.check_button_group').css('display','none');
					$('.edit_button_group').css('display','block');
					if(layer._icon === undefined)
						layer.setStyle({ color: "#0033ff",
						dashArray : null
						}); 
				});
				$('#cancelButton').click(function(event){
					if (layer._path!=undefined){
						layer.setLatLngs(old);
					}else{
						layer.setLatLng(old);
					}
					editing =false;
					layer.editing.disable();
					$('.check_button_group').css('display','none');
					$('.edit_button_group').css('display','block');
					if(layer._icon === undefined)
						layer.setStyle({ color: "#0033ff",
						dashArray : null
						}); 
				});
			});  
			$('#deleteButtonEdit').click(function(e){
				var deletArray = []
				mapAidToLid.forEach(function(element, index, array) {
				if(String(layer._leaflet_id).indexOf(String(element.lid)) !== -1 )
					deletArray.push(element.aid);
				});
				save_anno(deletArray,'delete',layer);
			});

		});
		
	}

	return mymap;
}
