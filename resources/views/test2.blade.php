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
<body>
  <div class="wellcomePlayer" data-uri="http://wellcomelibrary.org/package/b1948799x" data-sequenceindex="0" data-assetindex="2" data-zoom="-1.4191,0.0171,3.3239,1.5002" data-rotation="0" data-config="/service/playerconfig" style="width:800px; height:600px; background-color: #000"></div>

</body>
<script type="text/javascript" id="embedWellcomePlayer" src="http://wellcomelibrary.org/spas/player/build/wellcomeplayer/js/embed.js"></script><script type="text/javascript">/* wordpress fix */</script>
<script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
<script src="{{ asset('js/annotation.full.js')}}"></script>
<script type="text/javascript">
	this.annotation_show = true ;
	var is_authed = false;
	this.uri = location.href.split('#')[0];
	this.domain = location.href.split('#')[0];
	this.server = 'dev.annotation.taieol.tw' ; 
	var showUI = true;
	this.callback_url = location.href.split('#')[0];
	this.loginUrl = 'http://' + this.server + '/auth/login?callback_url=' + encodeURIComponent(this.callback_url) + '&uri=' + this.uri + '&domain=' + this.domain;
	function panel_init() {
		/*Panel details Layer1*/
		var panel = $('<div class="navbar-default sidebar anno-panel" role="navigation"></div>');
			/*Layer2 tool container*/
		var toolbar = $('<div class ="selection"></div>');
				/*Layer3 tools*/
		var panel_anno = $('<i class="fa fa-comments panel-message" style="font-size: 1.5em" aria-hidden="true" title="註記資訊"></i>');
		var function_list = $('<i class="fa fa-search panel-main" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="搜尋條件"></i>');
		var panel_list = $('<i class="fa fa-list-alt panel-annolist" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="註記列表"></i>');
		var panel_count = $('<span class="label label-danger panel-annolist-count" style="top:0px;left:95px;position:absolute"></span>');
		var panel_show = $('<i class="fa fa fa-eye panel-anno-show" aria-hidden="true" style="padding-left:10px;font-size: 1.5em;color:brown;"title="show"></i>');
			
			
		var login  = $('<div class ="anno-login"><span></span></div>');
			/*Layer2 */
		var div = $('<div class="sidebar-nav navbar-collapse panel1" ></div>');
		var filter = $('<ul class="nav in side-menu" id = "panel_filter"></ul>');
				/*Layer3 */
		var search = $('<li class="anno-search" ><p><strong>增加搜尋條件</strong></p>'+
		'<input id="anno-search-input" type="text" />' +
		'<button id="anno-search-submit" type="submit"></button>'+
		'</li>');
		var search_list = $('<li class="anno-con">' +
						'<a><i class="fa fa-check-square" aria-hidden="true"></i>條件列表<span class="fa arrow"></span></a> ' +
						'<ul class="nav nav-second-level collapse"> ' +
							'<li><hr style="padding:0px;margin:0px;"></li> ' +
							'<li class="anno-conditions"></li> '  +
						'</ul> '  +
					'</li>');
		var keywords = $('<li class="anno-keywords";><a href="#"><i class="fa fa-bar-chart-o fa-fw"></i>匯入權威檔<span class="fa arrow"></span></a><ul class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;"></ul></li>');
		var users = $('<li class="anno-users";>'+
						'<a><i class="fa fa-child" aria-hidden="true"></i> 在此網頁標籤的人<span class="fa arrow"></span></a>'+
						'<ul class="nav nav-second-level collapse"> '+
							'<p align="right"><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p> '+
							'<li><hr style="padding:0px;margin:0px;"></li> '+
						'</ul>'+
					'</li> ');
		
		var anno_lists = $('<ul class="nav in side-menu" id ="anno-lists" ></ul>');
		var anno_bodys = $('<ul class="nav in side-menu" id ="anno-body"></ul>');
		
		/*Panel little infos Layer1*/
		var panel_less = $('<div class = "anno_panel_less"></div>');
			/*Layer 2*/
		var appear = $('<div class="btn-appear" ><i class="fa fa-chevron-right " aria-hidden="true"></i></div> ');
		var less_visible = $('<div class="btn-show" style="color:brown"><i class="fa fa-eye" aria-hidden="true"></i></div> ');
		var less_count = $('<div class="btn-appear-count"><p id="anno-numer">0</p></div>');
		
		$('body').append(panel,panel_less);
		$('.anno-panel').append(toolbar,login,div);
		$('.panel1').append(filter,anno_lists,anno_bodys);
		$('#panel_filter').append(search,search_list,users)
		$('.anno_panel_less').append(appear,less_visible,less_count);
		$('.selection').append(panel_anno,function_list,panel_list,panel_count,panel_show);
		
		this.ui = $('.anno-panel');
		$('.panel-main').click(function(e) {
			$(e.target).css({ 'color': "blue" })
            $('.panel-message').css({ 'color': 'black' });
            $('.panel-annolist').css({ 'color': 'black' });
			anno_lists.hide();
			anno_bodys.hide();
			filter.show();
		});
		$('.panel-message').click(function(e) {

			anno_lists.hide();
			anno_bodys.show();
			filter.hide();
			$(e.target).css({ 'color': "blue" });
            $('.panel-main').css({ 'color': 'black' });
            $('.panel-annolist').css({ 'color': 'black' });
		});
		$('.panel-annolist').click(function(e) {
			$(e.target).css({ 'color': "blue" });
            $('.panel-main').css({ 'color': 'black' });
            $('.panel-message').css({ 'color': 'black' });
			anno_lists.show();
			anno_bodys.hide();
			filter.hide();
		});
		$('.btn-appear').bind('click', function(e) {
            if (showUI) {
                ui.stop().animate({
                    'right': '-300px'
                }, 1000, 'linear');
                $(".btn-appear").stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
               $(".btn-show").show();
               $(".btn-appear-count").show();
               $(".btn-appear").html('<i class="fa fa-chevron-left " aria-hidden="true"></i>');
                showUI = false;
            } else {
                ui.stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
               $(".btn-show").hide();
               $(".btn-appear-count").hide();
               $(".btn-appear").stop().animate({
                    'right': '300px'
                }, 1000, 'linear');
                /* $(".btn-appear-count").stop().animate({
                    'right': '305px'
                }, 1000, 'linear');
                $(".btn-show").stop().animate({
                    'right': '305px'
                }, 1000, 'linear');*/
                $(".btn-appear").html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
                showUI = true;
            }
        });
	}
	function annoinfos(annotation) {

		$("#anno-lists").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
				'<p><b>註記建立者:' + annotation.user.name + '</b></p>');

		var tags = "";
		$('#anno-lists #anno-info-id' + annotation.id).data('annotation',annotation);
		if(annotation.otherbodys[0].text[0] =='') annotation.otherbodys[0].text[0] = 'No Comment';
		for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
			tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
		}
		var metas = "";
		for (var i = 0; i <= annotation.otherbodys[0].metas.length - 1; i++) {
			metas += '<br/><span class="anno-body-metas">'+  annotation.otherbodys[0].metas[i].purpose.split(':')[1] + ':' + annotation.otherbodys[0].metas[i].text + ' </span>';
		}
		$('#anno-lists #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item">' +
			'<a href=manage/profile/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>' +
			'<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>' +
			'<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>' +
			tags+metas);
		
		
	   
		$('#anno-lists #anno-info-id' + annotation.id).append('<div ><a style="text-align:right">readmore</a></div>');
		if(annotation.type == 'text')
			var scrollTop = $(annotation.highlights).offset().top;

		$('#anno-info-id' + annotation.id).click(function() {
			 $('html,body').animate({ scrollTop: scrollTop - 100 }, 800);
			  console.log('annoinfo');
			  showAnnoOnpanel(new Array(annotation)); 
		});
		console.log('finish');
	};
	function panel_login(showUI, async) {

		if (!is_authed) {

			$.ajax({
				crossDomain: true,
				async: async === true,
				dataType: 'json',
				url: 'http://dev.annotation.taieol.tw/api/check',
				data: {
					'anno_token': 'f897c6190f2939209b843907d6fd967232d4694a',
					'domain': 'dev.annotation.taieol.tw'
				},
				success: function(data) {
					//$(_this.element).data('annotator-user', data.user);
					//_this.user = data.user;


					$('.anno-login span').html(
						'<img class="gravatar" src="' + data.user.gravatar + '"/>' +
						'<div>' +
						'<span>' + data.user.email + '</span>' +
						'</div>' +
						'<div style="padding-left:20px";>' +
						'<span>' +
						'<a href="#" id="btn-anno-logout">登出</a>' +
						'</span>' +
						'<span>' +
						'<a target="_blank" href="http://' + server + '">管理標記</a>' +
						'</span>' +
						'</div>');
				},
				statusCode: {
					200: function() {
						_this.is_authed = true;
					},
					401: function() {
						$('.anno-login').html('<div><span><a href="' + loginUrl + '"><i class="fa fa-user" aria-hidden="true"></i> 登入</a></span></div>');
						if (showUI != false)
							$('#openAuthUI').addClass('show');
					}
				}
			});
		}
	}
	function addReference(annotation) {

        var user_id;
        var gravatar_url = '#';

        // get user id from annotation
        if (annotation.user != null)
            user_id = annotation.user.id;

        if (user_id == null)
            user_id = _this.user.id;

        // not authed
        if (annotation.id == 0 || annotation.id == null)
            annotation.user = _this.user;

        var user = annotation.user;

        if (user.gravatar == null)
            user = _this.user;

        // get user gravatar url
        gravatar_url = user.gravatar;

        if(annotation.id == undefined) annotation.id = '-1';

        // check user is added to userlist
        if (this.ui.find('#anno-user-' + user_id).length == 0 && annotation.id.toString().indexOf('keyword') == -1) {

            //add user list item and bind to user list
            $('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                    '<a><input type="checkbox" checked data-search="user-' + user_id + '" name = "c"/>' +
                    '<img class="gravatar" src="' + gravatar_url + '" alt=""/>' +
                    '<span>' + user.name + '</span></a>' +
                    '</li>');
            /*$('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(_this.refreshHighLights);*/
        }

    };
	function search_submit(){
		$('#anno-search-submit').click(function(e) {
            e.preventDefault(); //prevent from getting empty input 
            //從Store插件找到搜尋的網址
            var url_search = _this.annotator.plugins.Store.options.urls.search;
            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            var condition = _this.ui.find('#anno-search-input').val();

            if (condition != "") {
                _this.ui.find('.anno-conditions')
                    .append($('<div class="annotator-condition">').attr('id', condition)
                        .append($('<span>').text(condition + " "))
                        .append('<a><i class="fa fa-times delete-condition" aria-hidden="true"></i></a>'));
                _this.condition += condition + ",";
            }

            data.search = _this.condition;
            $.ajax({
                url: url_search,
                data: data,
                dataType: 'json',
                success: function(data) {
                    if (data.total == 0) {
                        alert("查詢不到相關結果,顯示全部註記");
                    }
                    $('.annotator-hl').unbind('click')
                    $('.anno-users ul li').remove();
                    //_this.conditionData = data.rows;
                    _this.showing = data.rows;
                    _this.show_annotations();
                }
            });
        });	
	}


	var data = {
		'limit' : 0 ,
		'uri' : 'http://dev.annotation.taieol.tw/testing',
		'domain' : 'dev.annotation.taieol.tw',
		'anno_token' : '8c5348205ac186d370692434ce25c570f018d608',
		'user' : 2 
	}
	$.ajax({
	  url: 'http://dev.annotation.taieol.tw/api/search/',
	  data: data,
	  success: function(data){
		  var annotations = data.rows;
		  panel_init();
		  panel_login();
		  search_submit();
		  $('.side-menu').metisMenu();
		  annotations.forEach(function(annotation, index, annotations) {
			 $('.panel-main').click();
			 annoinfos(annotation);
			 addReference(annotation);
		  });
	  }
	});
</script>
</html>
