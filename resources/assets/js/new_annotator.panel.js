/**
 * 顯示Annotation的插件
 */
Annotator.Plugin.ViewPanel = function(element, settings) {
	
	
	var _this = this;
    this.settings = settings;
    this.annotator = $(element).annotator().data('annotator');
    this.element = element;
    this.uri = settings.uri;
    this.keywords = settings.keywords;
    this.hide_keywords = "";
    this.anno_token = settings.anno_token;
    this.target_anno = settings.target_anno; //當後台蒐尋特定anno的id
    this.server = settings.server;
    this.condition = ""; //過濾條件
    this.domain = settings.domain;
    this.callback_url = location.href.split('#')[0];
    this.allTags = [];
    this.data = [];// Storing entire data;
    this.showing = []; // Storing data that only showed;`
    this.autocompleteData = [];
    this.is_authed = false;
    this.conditionData = [];
    // Panel Object
    var ui = null;
    // API URLS
    this.postlikeUrl = settings.urls.postlikeUrl ;
    this.authCheckurl = settings.urls.authCheckurl;
    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url=' + encodeURIComponent(this.callback_url) + '&uri=' + this.uri + '&domain=' + this.domain;
    this.logoutUrl =  settings.urls.logoutUrl;
    this.postreplyurl =  settings.urls.postreplyurl;
    this.postdeleteurl =  settings.urls.postdeleteurl;
    this.postupdateurl =  settings.urls.postupdateurl;
    this.collecturl =  settings.urls.collecturl;
    this.delete_anno_url = settings.urls.delete_anno_url;
    this.edit_target_url = settings.urls.edit_target_url;
    var showUI = true;
    this.annotation_show = true;
    this.user = null;
    this.maptoid = {};
	
	var ViewPanel;
	/*繪畫底層的panel*/
	function panel_Init() {
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
		var search = $('<li class="anno-search" ><p><strong>增加搜尋條件</strong></p></li>');
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
		
		
		ui = panel;
		/*產生panel HTML*/
		$('body').append(panel,panel_less);
		$('.anno-panel').append(toolbar,login,div);
		$('.panel1').append(filter,anno_lists,anno_bodys);
		$('#panel_filter').append(search,search_list,keywords,users)
		$('.anno_panel_less').append(appear,less_visible,less_count);
		$('.selection').append(panel_anno,function_list,panel_list,panel_count,panel_show);
		
		/*Panel的event's binding*/
		function_list.click(function(e) {
			$(e.target).css({ 'color': "blue" })
            panel_anno.css({ 'color': 'black' });
            panel_list.css({ 'color': 'black' });
			anno_lists.hide();
			anno_bodys.hide();
			filter.show();
		});
		panel_anno.click(function(e) {

			anno_lists.hide();
			anno_bodys.show();
			filter.hide();
			$(e.target).css({ 'color': "blue" });
            function_list.css({ 'color': 'black' });
            panel_list.css({ 'color': 'black' });
		});
		panel_list.click(function(e) {
			$(e.target).css({ 'color': "blue" });
            function_list.css({ 'color': 'black' });
            panel_anno.css({ 'color': 'black' });
			anno_lists.show();
			anno_bodys.hide();
			filter.hide();
		});
		appear.bind('click', function(e) {
            if (showUI) {
                ui.stop().animate({
                    'right': '-300px'
                }, 1000, 'linear');
                appear.stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
               $(".btn-show").show();
               $(".btn-appear-count").show();
               appear.html('<i class="fa fa-chevron-left " aria-hidden="true"></i>');
                showUI = false;
            } else {
                ui.stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
               $(".btn-show").hide();
               $(".btn-appear-count").hide();
               appear.stop().animate({
                    'right': '300px'
                }, 1000, 'linear');
                /* $(".btn-appear-count").stop().animate({
                    'right': '305px'
                }, 1000, 'linear');
                $(".btn-show").stop().animate({
                    'right': '305px'
                }, 1000, 'linear');*/
                appear.html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
                showUI = true;
            }
        });
	}
	
	/*Find text highlight by click info 的動畫事件 binding*/
	function find_highlight(annotation){
		var scrollTop = $(annotation.highlights).offset().top;

		$('#anno-info-id' + annotation.id).click(function() {
			 $('html,body').animate({ scrollTop: scrollTop - 100 }, 800); 
		});
	}
	
	/*將註記資訊 顯示在panel list上的function*/
	function annoinfos(annotation) {
		var anno_lists = $("#anno-lists");
		var anno_list_recored = $('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">');
		var user = $('<p><b>註記建立者:' + annotation.user.name + '</b></p>');
		
		anno_list_recored.data('annotation',annotation);
		
		if(annotation.otherbodys[0].text[0] =='') annotation.otherbodys[0].text[0] = 'No Comment';
		
		var tags = '';
		
		for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
			tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
		}
		var metas = "";
		
		for (var i = 0; i <= annotation.otherbodys[0].metas.length - 1; i++) {
			metas += '<br/><span class="anno-body-metas">'+  annotation.otherbodys[0].metas[i].purpose.split(':')[1] + ':' + annotation.otherbodys[0].metas[i].text + ' </span>';
		}
		
		var body = $('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item"></div>');
		var creator = $('<a href=manage/profile/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>');
		var time = $('<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>');
		var content = $('<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>');
		
		body = body.append(creator,time,content,$(tags),$(metas));
		anno_lists.append(anno_list_recored);
		anno_list_recored.append(user,body);
		anno_list_recored.append('<div ><a style="text-align:right">readmore</a></div>');
		
		anno_list_recored.click(function() {
			showAnnoOnpanel(new Array(annotation)); 
		});

	};
	
	/*檢查登入狀態*/
	function checkLoginState(showUI, async) {

		if (!_this.is_authed) {

			$.ajax({
				crossDomain: true,
				async: async === true,
				dataType: 'json',
				url: _this.authCheckurl,
				data: {
					'anno_token': _this.anno_token,
					'domain': _this.domain
				},
				success: function(data) {
					$(_this.element).data('annotator-user', data.user);
					_this.user = data.user;


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
						'<a target="_blank" href="http://' + _this.server + '">管理標記</a>' +
						'</span>' +
						'</div>');
				},
				statusCode: {
					200: function() {
						_this.is_authed = true;
					},
					401: function() {
						$('.anno-login').html('<div><span><a href="' + _this.loginUrl + '"><i class="fa fa-user" aria-hidden="true"></i> 登入</a></span></div>');
						if (showUI != false)
							$('#openAuthUI').addClass('show');
					}
				}
			});
		}
	}
	
	/*Filter過濾功能之一，對使用者過濾*/
	function addReference (annotation) {

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
        if ($('#anno-user-' + user_id).length == 0 && annotation.id.toString().indexOf('keyword') == -1) {

            //add user list item and bind to user list
          $('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                    '<a><input type="checkbox" checked data-search="user-' + user_id + '" name = "c"/>' +
                    '<img class="gravatar" src="' + gravatar_url + '" alt=""/>' +
                    '<span>' + user.name + '</span></a>' +
                    '</li>');
            $('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(refreshHighLights());
        }

    };
	
	/*show annotations的body在Panel上*/
	ViewPanel.showAnnoOnpanel = function(annotations) {
        var id = [];
        var collect_text = "收藏";
        $('.anno-body').html('');

        if (annotations != null)
            $('.panel-message').click();
        else
            $('.panel-annolist').click();
        for (var i in annotations) {
            var annotation = annotations[i];

		
            
            
            $('.anno-body').append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
                '<p><b>註記建立者:' + annotation.user.name + '</b></p>');
            $('.anno-body #anno-info-id' + annotation.id).data('annotation',annotation);
			
            for (var j = 0; j < annotation.otherbodys.length; j++) {

                var tags = "";

                for (var i = 0; i <= annotation.otherbodys[j].tags.length - 1; i++) {
                    tags += '<span class="anno-body-tag">' + annotation.otherbodys[j].tags[i] + ' </span>';
                }
				var metas = "";
				/*for (var i = 0; i <= annotation.otherbodys[j].metas.length - 1; i++) {
                    metas += '<br/><span class="anno-body-meta">' + annotation.otherbodys[j].metas[i].purpose.split(':')[1] + ':' + annotation.otherbodys[j].metas[i].text + ' </span>';
                }*/
               
                id.push(annotation.otherbodys[j].bid);
                $('.anno-body #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[j].bid + '" class = "anno-body-item">' +
                    '<a href=manage/profile/' + annotation.otherbodys[j].creator + ' class="anno-user-name">' + annotation.otherbodys[j].creator + '</a>' +
                    '<span class="anno-body-time">' + annotation.otherbodys[j].created_time + '</span>' +
                    '<div class="anno-body-text">' + annotation.otherbodys[j].text[0] + '</div>' +
                    tags +
					metas +
					'<p><b><strong>評分:</strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.otherbodys[j].like + '</span>' +
                    '<a href="#" id="anno-like-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '" data-id="' + annotation.id + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" id="anno-dislike-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '"data-id="' + annotation.id + '" class="anno-dislike fa fa-thumbs-down" ></a>' +
                    '</span></b></p>'
                );
                if ($(_this.element).data('annotator-user') != undefined)
                    if ($(_this.element).data('annotator-user').name == annotation.otherbodys[j].creator) {
						var edit = $('<a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;"data-id=' + annotation.otherbodys[j].bid + '></a>').data('annobody_data',annotation.otherbodys[j]).data('anno_id',annotation.id);
                        var del = $('<a class="anno-body-delete fa fa-times" style="background-position: 0 -75px;" data-id=' + annotation.otherbodys[j].bid + '></a>');
						var span = $('<span class="annotator-controls">').append(edit,del);
						$('.anno-body  #anno-body' + annotation.otherbodys[j].bid).append(span);
                    }
            }
            

            if ($(_this.element).data('annotator-user') != undefined) {
                var likes = $(_this.element).data('annotator-user').like
                for (var i in likes) {
                    if (id.indexOf(likes[i].bg_id) != -1) {
                        if (likes[i].like == "-1") {
                            $("#anno-dislike-" + likes[i].bg_id).css({ 'color': "red" });
                            $("#anno-dislike-" + likes[i].bg_id).addClass('click');
                        } else if (likes[i].like == "1") {
                            $("#anno-like-" + likes[i].bg_id).css({ 'color': "blue" });
                            $("#anno-like-" + likes[i].bg_id).addClass('click');
                        }
                    }
                }
                $.post(_this.checkcollect_url,{anno_id : annotation.id, anno_token :settings.anno_token ,domain: settings.domain })
                .success(function(data){
                    if(data == "true"){
                       $('#anno-collect-'+ annotation.id).addClass('collecting');
                       $('#anno-collect-'+ annotation.id).html('取消收藏');
                    }
                    else  {
                        $('#anno-collect-'+ annotation.id).html('收藏');
                        $('#anno-collect-'+ annotation.id).removeClass('collecting');
                     }
                }); 
            }
            $('.anno-body #anno-info-id' + annotation.id).append(
                '<a class="anno-collect fa fa-diamond" id ="anno-collect-'+annotation.id + '" data-id="' + annotation.id + '" style="padding-left:5px;">收藏</a>' +
                '<a class="anno-reply fa fa-comment" data-id="' + annotation.id + '" style="padding-left:5px;">增加本文</a>'
            );
            if($(_this.element).data('annotator-user') != undefined)
                if ($(_this.element).data('annotator-user').id == annotation.user.id)
                    $('.anno-body #anno-info-id' + annotation.id).append(
                       '<a class="anno-delete fa fa-trash-o" data-id="' + annotation.id + '" style="padding-left:5px;">刪除</a>');
        }

        /*詢問使用者改善註記的部份*/
        if(annotation.fix != undefined && annotation.user.id == getCookie('user_id')){
            var a = confirm('是否要保存該註記');
            if(a ==true){
                edit_target(annotation);
            }else{
                $('.anno-delete').click();
            }
        }
    }
	
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
	
	function handler(event) {
        var annotations = event.data.annotations;
        $('.annotator-hl-focus').removeClass('annotator-hl-focus');
		showAnnoOnpanel(annotations);
        for (var i in annotations) $(annotations[i].highlights).addClass('annotator-hl-focus');
        ui.stop().animate({
            'right': '0px'
        }, 1000, 'linear');
        $(".btn-appear").stop().animate({
            'right': '300px'
        }, 1000, 'linear');
        $(".btn-appear").html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
        showUI = true;
    }
	

	/*return {
        pluginInit: function() {
			panel_Init();
			checkLoginState(false);
			search_submit();
			$('#panel_filter').metisMenu(); 
			$('.panel-annolist').click(); 
			this.annotator.
				subscribe("annotationsLoaded", function(annotations) {
					 annotations.forEach(function(annotation, index, annotations) {
						 checkLoginState();
						 if(annotation.type == 'text'){
							annoinfos(annotation);
							find_highlight(annotation);
							addReference(annotation);
						 }
					  });
					  
				}).
				subscribe('annotationViewerShown', function(viewer, annotations) {
                $('.annotator-hl').unbind('click');
                /*我們隱藏viewer 用panel秀出多筆annotaiton
                $('.annotator-hl').bind('click',{annotations:annotations},handler);
				});
		}
	}*/
	return ViewPanel;
};
