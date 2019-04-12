var login ={name:'null',id : -1 };

var manifest = function(manifestUrl,element){
	var manifest = {};	
	manifest.element = element; //作用在哪個div
	manifest.json_object ; //manifest object
	manifest.canvasArray = []; //canvas array
	manifest.index = 1; //目前在哪個canvas的index
	manifest.currenCanvas ; //目前的canvas canvasArray[index] 
	manifest.leaflet; // leaflet 物件	
	manifest.id = manifestUrl;
	manifest.init = function(){
		appendLoginPanel();
		confirmBox();
		$.getJSON(manifest.id, function(data) {
			manifest.json_object = data;
			manifest.canvasArray = data.sequences[0].canvases;
			//leaflet要用div 這邊新增一個
			var div = $('<div id ="mapid"></div>');
			$(element).append(div);
			manifest.currenCanvas = manifest.canvasArray[0];
			manifest.checkOtherContent(manifest.currenCanvas);
			//manifest.add_chose_button();			
		});
	}
	
	manifest.checkOtherContent = function(canvas){
		if( typeof canvas['otherContent'] !== 'undefined'){			
			afterCheckOtherContent(canvas['otherContent'][0]['@id']);
		}else{			
			$.post( "http://dev.annotation.taieol.tw/manifest/searchAnnoByCanvas", { canvas: canvas })
			.done(function( data ) {				
				afterCheckOtherContent(data);
			});
		}		
	}
	
	function afterCheckOtherContent(data){
		var object = {
			'@id' : data,
			'@type' :"sc:AnnotationList"
		}
		console.log(data);
		manifest.currenCanvas['otherContent'] =[];
		manifest.currenCanvas['otherContent'].push(object);
		
	
		manifest.leaflet = leafletMap(manifest.currenCanvas);
		manifest.add_chose_button();
	}
	
	manifest.change = function(){
			manifest.leaflet.remove();
		    manifest.currenCanvas = manifest.canvasArray[manifest.index-1];
			manifest.checkOtherContent(manifest.currenCanvas);	
	}
	
	manifest.add_chose_button = function(){
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
			}else{alert('Out of Range');}
		});
		left.click(function(){
			if(manifest.index-1 >= 1){
				manifest.index = manifest.index-1; 
				manifest.change();
			}else{alert('Out of Range');}
		});
	};
	
	manifest.changeManifest = function($manifestID){
		manifest.id = $manifestID;	
		manifest.leaflet.remove();
		$.getJSON(manifest.id, function(data) {
			manifest.json_object = data;
			manifest.canvasArray = data.sequences[0].canvases;
			manifest.currenCanvas = manifest.canvasArray[0];
			manifest.checkOtherContent(manifest.currenCanvas);
			manifest.add_chose_button();
			
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


function leafletManifestList(){  
	if(login.id !== -1){
		var controlbar = $('<div  id ="mycontrol" class="leaflet-control-layers leaflet-control" style="padding-top: 5px;"></div>');
		$($('.leaflet-top.leaflet-right')[0]).append(controlbar);
		controlbar = $('#mycontrol');
		var login_div = $('<div id ="leaflet_Manifest" class="leaflet-control-layers-base canvasBtn"><a href="#" title="列表"><span class="fa fa-list-alt fa-2x"></span></a></div>');//點下去前
		var login_col = $('<div id ="leaflet_Manifest_col" class="leaflet-control-layers-base canvasBtn"><a href="#" title="列表"><span class="fa fa-list-alt fa-2x"></span></a></div>');//點下去後
		controlbar.append(login_div,login_col ); 
		login_col.hide();
		$('#leaflet_Manifest').click(function(){//manifest list 出現之前，可點DIV讓它出現
			LeafletListPanel();
			//manifest.changeManifest('https://data.ucd.ie/api/img/manifests/ucdlib:30708#');
			$('#manifestList').css('display','block');
			login_col.show();
			login_div.hide();
		});
		$('#leaflet_Manifest_col').click(function(){//manifest list 出現之後，可點COL讓它消失
			$('#manifestList').css('display','none');
			login_col.hide();
			login_div.show();
		});
	} 
	
}

function ExportCurrentManifest(){  
	if(login.id !== -1){
		var controlbar = $('<div  id ="mycontrol1" class="leaflet-control-layers leaflet-control" style="padding-top: 5px;"></div>');
		$($('.leaflet-top.leaflet-right')[0]).append(controlbar); 
		controlbar = $('#mycontrol1');
		var exportManifest = $('<div id ="exportManifest" class="leaflet-control-layers-base canvasBtn"><a href="#" title="匯出"><span class="fa fa-floppy-o fa-2x"></span></a></div>');
		controlbar.append(exportManifest); 
		exportManifest.click(function(e){
			$.post("http://dev.annotation.taieol.tw/manifest/getid",{json :manifest.json_object['@id'] })
			.done(function(data){
					url = "http://dev.annotation.taieol.tw/manifest/" + data + '.json';
					alert(url);
			});
		});
	
	}
}

var times = -1;
function LeafletListPanel(){
	/*LoginPanel*/
	times = times +1 ;
	if(times === 0){
		
		list = $('<div id ="manifestList" class= "login-page"></div>');	
		list.css('display','none');
		importBox = $('<input type="text" id="mytext">');
		importConfirm = $('<button>submit</button>');
		$('body').append(list);
		list.append(importBox);
		list.append(importConfirm);
		
		importConfirm.click(function(e){
			
			var json = document.getElementById("mytext").value; 
			$.post("http://dev.annotation.taieol.tw/manage/manifest/import",{ id : json, uid : login.id})
			.done(function(datas){
				var url = "http://dev.annotation.taieol.tw/manifest/" +datas + ".json"; 
 				$('#leaflet_Manifest_col').click(); 
				$.post("http://dev.annotation.taieol.tw/manifest/getList", { uid: login.id })
				.done(function( datas ) {
					if(datas != null){
						 $('.manifestListItem.form').html('');

						 datas.forEach(function(data, index, datas){ 
								var link = data.manifest['@id'];
								var text = data.manifest.sequences[0].canvases[0].images[0].resource['@id'];
						     	text = text.replace('full/0',',250/0'); 
								var image = $('<img ></img>');  
								image.attr('src',text);
								image.attr('height','150px');
								image.data('Manifestdata',link);  
								var div = $('<div class ="manifestListItem"></div>');  
								div.append(image);
								$('.manifestListItem.form').append(div); 
						 })
						$('.manifestListItem').click(function(e){ 
							$('#leaflet_Manifest_col').click(); 
							manifest.changeManifest($(e.target).data('Manifestdata')); 
							
						});  
					}else{
						alert('NO datas'); 
					} 
				})
				manifest.changeManifest(url); 
				
			}); 
			 
			 
		});
		
		$.post("http://dev.annotation.taieol.tw/manifest/getList", { uid: login.id })
		.done(function( datas ) {
			if(datas != null){
				 var div = $('<div class ="manifestListItem form"></div>'); 
				 $('#manifestList').append(div);
				 datas.forEach(function(data, index, datas){ 
						var link = data.manifest['@id'];
						var text = data.manifest.sequences[0].canvases[0].images[0].resource['@id'];
						text = text.replace('full/0',',250/0'); 
						var image = $('<img ></img>'); 
						image.attr('src',text);
						image.attr('height','150px');
						image.data('Manifestdata',link);   
						var div = $('<div class ="manifestListItem"></div>'); 
						div.append(image);
						$('.manifestListItem.form').append(div); 
				 })  
				$('.manifestListItem').click(function(e){
					$('#leaflet_Manifest_col').click(); 
					manifest.changeManifest($(e.target).data('Manifestdata')); 
					
				});  
			}else{
				alert('NO datas');
			}
		}); 
	}
	
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
	//繪圖完後出現的框框啦
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
	for(var zoomtemp = 0 ;zoomtemp<18; zoomtemp++){
		if( Math.max(canvas.width,canvas.height) < 256*Math.pow(2,zoomtemp) ){break;}
	}
	var mymap = L.map('mapid',{ zoom : 13 ,  crs : L.CRS.Simple , center : [0,0] });	
	var iiif_layer = L.tileLayer.iiif(canvas.images[0].resource.service['@id'] + '/info.json').addTo(mymap);
	var drawnItems = L.featureGroup().addTo(mymap);
	var mapAidToLid =[];
	var editStatus = false;
	/*用於編輯文字的update，產生一個浮動的button，等到mousemove 到layer上，且編輯狀態為true，則會顯示*/
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
	var creators=[];
	var maps={};
	var str=",";
	if(canvas.otherContent !== undefined){
		$.getJSON(canvas.otherContent[0]['@id'], function(annoData) {
			$.each(annoData.resources, function(i, value) {
				if(typeof value.creator !== 'undefined'){
					user=value.creator.replace("http://dev.annotation.taieol.tw/user/","").split('/');
				}
				else{
					console.log('error:value.creator is undefined');
					var user=['0','none'];
				}
				
				if (!str.includes(","+user[1]+","))
				{
					str+=user[1]+",";
					var anno_layer=L.featureGroup();
					creators.push({id:user[0],user:user[1],anno_layer:anno_layer})
				}
			});
			var haslogin=false;//annotation creator login or not
			for(var i=0;i<creators.length;i++){
				if (login['id']==creators[i].id){
					maps[creators[i].user]=drawnItems
					haslogin=true;
				}else{
					maps[creators[i].user]=creators[i].anno_layer.addTo(mymap);
				}
			}
			if (!haslogin && login['id'] !== -1 ){
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
			leafletManifestList();
			ExportCurrentManifest();
			$.each(annoData.resources, function(i, value) {
				if(typeof value.creator !== 'undefined'){
					var user=value.creator.replace("http://dev.annotation.taieol.tw/user/","").split('/'); 
				}else{
					console.log('error:value.creator is undefined');
					var user=['0','none'];
				}
				
				var layer;
				var shape;
				if (typeof value.on === 'object') {
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
								var unprojectObject =   mymap.unproject(new Array(tempx,tempy), zoomtemp);
								array.push(unprojectObject);
							}
						});
						layer = L.polygon(array);
					}else if(result.documentElement.getElementsByTagName('circle')[0] !== undefined){
						shape = 'circle';
						var cx = result.documentElement.getElementsByTagName('circle')[0].attributes[0].nodeValue;
						var cy = result.documentElement.getElementsByTagName('circle')[0].attributes[1].nodeValue; 
						var r = result.documentElement.getElementsByTagName('circle')[0].attributes[2].nodeValue;					 
						var latlng = mymap.unproject(new Array(cx,cy),zoomtemp);
						var center = new Array(latlng.lat,latlng.lng);
						layer = L.circle(center, r);
					}else{
						return;
					}
					maps[user[1]].addLayer(layer);
					layer.bindLabel(value.resource.chars).addTo(mymap);
				}else{
					shape = 'rectangle';
					var b = /xywh=(.*)/.exec(value.on)[1].split(',');
					var minPoint = L.point(b[0], b[1]);
					var maxPoint = L.point(parseInt(b[0]) + parseInt(b[2]), parseInt(b[1]) + parseInt(b[3]));

					var min = mymap.unproject(minPoint, zoomtemp);
					var max = mymap.unproject(maxPoint, zoomtemp);
					if(parseInt(b[2]) <= 1){
						layer =  L.marker(min);
					}else{
						layer = L.rectangle(L.latLngBounds(min, max));
					}
					maps[user[1]].addLayer(layer);
					layer.bindLabel(value.resource.chars).addTo(mymap);
				}
			  
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
	}else{
		console.log('canvas.otherContent is undefined');
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
			
				var point = mymap.project(layer._latlng,zoomtemp);
				point.x = point.x * 100 / canvas.width;
				point.y = point.y * 100 / canvas.height;
				points_array = [];
				points_array.push(point);
				points_array.push(layer._mRadius);
		}else if (event.layerType ==='marker')
		{
				
				var point = mymap.project(layer._latlng,zoomtemp);
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


	function saveChangeText(){
		var TextArray = [];
		mapAidToLid.forEach(function(element, index, array) {
			if( element.text === undefined ){
				console.log('element.text is undefined!');
			}else{
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
					console.log('layer._latlngs is undefined');
					var point = mymap.project(layer._latlng,zoomtemp);
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
			var temp = mymap.project(value,zoomtemp);
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
				console.log('layer._path!=undefined');
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
