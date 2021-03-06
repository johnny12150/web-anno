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
    this.data = []; // Storing entire data;
    this.showing = []; // Storing data that only showed;`
    this.autocompleteData = [];
    this.is_authed = false;
    this.conditionData = [];
    // Panel Object
    this.ui = null;
    // API URLS


    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url=' + encodeURIComponent(this.callback_url) + '&uri=' + this.uri + '&domain=' + this.domain;

    showUI = true;
    this.annotation_show = true;
    this.user = null;
    this.maptoid = {};

    var ViewPanel = {};
    this.loadAnnotations = function(data) {
        $('#anno-lists').empty();
        _this.annotator.loadAnnotations(data);
    }

    this.initkeyword = function() {
        _this.show_annotations();
    }

    $(window).resize(function(e) {
        $('.annotator-hl').unbind('click');
        $('.annotator-hl').removeClass('annotator-hl');
        _this.loadAnnotations(_this.data);
    })

    this.show_annotations = function() {
        $('.annotator-hl').unbind('click');
        $('.annotator-hl').removeClass('annotator-hl');
        $('.annotator-hl-focus').removeClass('annotator-hl-focus');

        /*for (x in _this.keywords) {
            $('.keyword-hl-' + _this.keywords[x].color).not('.anno-keywords ul li span.keyword-hl-' + _this.keywords[x].color).removeClass('keyword-hl-' + _this.keywords[x].color);
            if (_this.hide_keywords.indexOf(',' + x + ',') == -1) {
                var tmp = JSON.parse(JSON.stringify(_this.keywords[x].anno));
                _this.loadAnnotations(tmp);
                $('.annotator-hl').not('[class*=keyword-hl]').addClass('keyword-hl-' + _this.keywords[x].color);
            }
        }*/
        /*if (_this.showing.length == 0) {
            _this.showing = _this.data;
        }*/
        //var tmp = JSON.parse(JSON.stringify(_this.showing));
        //console.log(tmp);
        _this.loadAnnotations(_this.showing);

    }

    this.clickkeyword = function() {
        var checkboxs = $('.anno-keywords ul li input[type=checkbox]');

        _this.hide_keywords = ",";
        for (i = 0; i < checkboxs.length; i++) {
            //id
            var val = $(checkboxs[i]).attr('data-search').split('-')[1];
            if (!checkboxs[i].checked) {
                _this.hide_keywords += i + ",";
            }
        }
        _this.show_annotations();
    }

    /*登入Anntation的 Modal UI*/
    this.insertAuthUI = function() {
        $('body').append('<div id="openAuthUI" class="authDialog">' + '     <div>' + '         <h2>本網站使用了標記的服務</h2>' + '         <span><a id="anno-btn-login" class="btn anno-btn-login">永久儲存標記</a></span>' + '         <span><a href="#" id="anno-btn-close" class="btn anno-btn-close">關閉視窗</a></span>' + '     </div>' + '</div>');

        $(document)
            .on('click', '#anno-btn-login', function(e) {
                location.href = _this.loginUrl;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
                return false;
            })
            .on('click', '.annotator-adder', function(e) {
                if (!_this.is_authed) {
                    $('#openAuthUI').addClass('show');
                    $('.annotator-cancel').click();
                }
            });
    };

    /*keyword UI*/
    this.insertKeywordUI = function() {
        for (x in _this.keywords) {
            _this.ui.find('.anno-keywords ul')
                .append('<li id="anno-keyword-' + _this.keywords[x].id + '">' +
                    '<a><input type="checkbox" checked data-search="keyword-' + _this.keywords[x].id + '"/>' +
                    '<span class="keyword-hl-' + _this.keywords[x].color + '">' + _this.keywords[x].name + '</span></a>' +
                    '</li>');
            $('#anno-keyword-' + _this.keywords[x].id)
                .find('input[type=checkbox]')
                .click(_this.clickkeyword);
        }
        _this.initkeyword();
    };


    /*增加panel以及動化程式
     */
    function panel_Init() {
        /*宣告component*/
        var panel = $('<div class="navbar-default sidebar anno-panel" role="navigation"></div>');
        /*Layer2 tool container*/
        var toolbar = $('<div class ="selection"></div>');
        /*Layer3 tools*/
        var panel_anno = $('<i class="fa fa-comments panel-message" style="font-size: 1.5em" aria-hidden="true" title="註記資訊"></i>');
        var function_list = $('<i class="fa fa-search panel-main" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="搜尋條件"></i>');
        var panel_list = $('<i class="fa fa-list-alt panel-annolist" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="註記列表"></i>');
        var panel_count = $('<span class="label label-danger panel-annolist-count" style="top:0px;left:95px;position:absolute"></span>');
        var panel_show = $('<i class="fa fa fa-eye panel-anno-show" aria-hidden="true" style="padding-left:10px;font-size: 1.5em;color:brown;"title="show"></i>');
		var list_transform = $('<i class="fa fa-file-text-o list_transform" aria-hidden="true" style="padding-left:10px;font-size: 1.5em;color:brown;" title="匯出成JSON"></i>');
		

        var login = $('<div class ="anno-login"><span></span></div>');
        /*Layer2 */
        var div = $('<div class="sidebar-nav navbar-collapse panel1" ></div>');
        var filter = $('<ul class="nav in side-menu" id = "panel_filter"></ul>');
        /*Layer3 */
        var search = $('<li class="anno-search">' +
            '<p><strong>增加搜尋條件</strong></p>' +
            '<form action="#" id="form-search">' +
            '<input id="anno-search-input" type="text"/>' +
            '<button id="anno-search-submit" type="submit"></button>' +
            '</form>' +
            '</li>');
        var search_list = $('<li class="anno-con">' +
            '<a><i class="fa fa-check-square" aria-hidden="true"></i>條件列表<span class="fa arrow"></span></a> ' +
            '<ul class="nav nav-second-level collapse"> ' +
            '<li><hr style="padding:0px;margin:0px;"></li> ' +
            '<li class="anno-conditions"></li> ' +
            '</ul> ' +
            '</li>');


        var keywords = $('<li class="anno-keywords";><a href="#"><i class="fa fa-bar-chart-o fa-fw"></i>匯入權威檔<span class="fa arrow"></span></a><ul class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;"></ul></li>');
        var users = $('<li class="anno-users";>' +
            '<a><i class="fa fa-child" aria-hidden="true"></i> 在此網頁標籤的人<span class="fa arrow"></span></a>' +
            '<ul class="nav nav-second-level collapse"> ' +
            '<p align="right"><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p> ' +
            '<li><hr style="padding:0px;margin:0px;"></li> ' +
            '</ul>' +
            '</li> ');

        var anno_lists = $('<ul class="nav in side-menu" id ="anno-lists" ></ul>');
        var anno_bodys = $('<ul class="nav in side-menu" id ="anno-body"></ul>');



        /*Panel little infos Layer1*/
        var panel_less = $('<div class = "anno_panel_less"></div>');
        /*Layer 2*/
        var appear = $('<div class="btn-appear" ><i class="fa fa-chevron-right " aria-hidden="true"></i></div> ');
        var less_visible = $('<div class="btn-show" style="color:brown"><i class="fa fa-eye" aria-hidden="true"></i></div> ');
        var less_count = $('<div class="btn-appear-count"><p id="anno-numer">0</p></div>');
        var loader1 = $('<div class="loader"></div>'); //讀取中的動畫

        /**/

        /*產生panel HTML*/
        $('body').append(panel, panel_less);
        $('.anno-panel').append(toolbar, login, div);
        $('.panel1').append(filter, anno_lists, anno_bodys, loader1);
        $('#panel_filter').append(search, search_list, keywords, users)
        $('.anno_panel_less').append(appear, less_visible, less_count);
        $('.selection').append(panel_anno, function_list, panel_list, panel_count, panel_show,list_transform);
        $('.loader').hide();
		$('#list_bug_up').hide();
        /*bindding ui*/
        _this.ui = $('.anno-panel');
        /*控制註記的顯示*/
        $('.btn-show').click(function(e) {
            if (_this.annotation_show == true) {
                _this.showing = [];
                _this.show_annotations();
                _this.annotation_show = false;
                e.target.style.color = "black";
                $('.annotator-hl-focus').removeClass('annotator-hl-focus');
                $('#anno-lists').empty();
                $('.panel-anno-show').css('color', 'black');
				$('.list_transform').css('color', 'black');
				$('.list_bug').css('color', 'black');
            } else if (_this.annotation_show == false) {
                _this.showing = _this.data;
                _this.annotation_show = true;
                _this.loadAnnotations(_this.showing);
                e.target.style.color = "blue";
                $('.annotator-hl').unbind('click')
                $('.panel-anno-show').css('color', 'blue');
				$('.list_transform').css('color', 'blue');
				$('.list_bug').css('color', 'blue');
            }
        });

        /*註記列表(複數筆)*/
        panel_list.click(function(e) {
            $(e.target).css({
                'color': "blue"
            });
            function_list.css({
                'color': 'black'
            });
            panel_anno.css({
                'color': 'black'
            });
            anno_lists.show();
            anno_bodys.hide();
            filter.hide();
        });
        /*搜尋過濾功能介面*/
        function_list.click(function(e) {
            $(e.target).css({
                'color': "blue"
            })
            panel_anno.css({
                'color': 'black'
            });
            panel_list.css({
                'color': 'black'
            });
            anno_lists.hide();
            anno_bodys.hide();
            filter.show();
        });
        /*註記內容的顯示(單筆*/
        panel_anno.click(function(e) {

            anno_lists.hide();
            anno_bodys.show();
            filter.hide();
            $(e.target).css({
                'color': "blue"
            });
            function_list.css({
                'color': 'black'
            });
            panel_list.css({
                'color': 'black'
            });
        });
		
        $('#side-menu').metisMenu();
        //綁定搜尋按鈕事件
        $('#anno-search-submit').click(function(e) {
            e.preventDefault(); //prevent from getting empty input 
            //從Store插件找到搜尋的網址            
            refresh();
        });



        $(document).on('click', '.anno-delete', function(e) {

            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            var anno_id = $(e.target).attr('data-id');

            $.ajax({
                url: _this.settings.urls.delete_anno_url + '/' + $(e.target).attr('data-id'),
                data: data,
                dataType: 'json',
                method: 'POST',
                success: function(data) {
                    $('.annotator-hl').unbind('click');
                    $('.annotator-hl-focus').removeClass('annotator-hl-focus annotator-hl-level2');

                    $('.panel-annolist').click();

                    var tem_data = _this.data;
                    _this.data = [];
                    for (var i in tem_data) {
                        if (tem_data[i].id != anno_id)
                            _this.data.push(tem_data[i]);
                    };
                    refresh('delete');
                }
            });
        });




        $(document).on('click', '.delete-condition', function(e) {
            var id = e.target.parentElement.parentElement.id;
            _this.condition = _this.condition.replace(id + ",", "");
            $(e.target.parentElement.parentElement).remove();
            $('#anno-search-input')[0].value = "";
            refresh();
        });

        //綁定所有按讚事件
        $(document).on('click', '.anno-like', function(e) {
            e.preventDefault(); //The preventDefault() method will prevent the link above from following the URL.
            var target = $(e.target); //事件驅動的目標
            //標記ID
            var anno_id = target.attr('data-id');
            var aid = target.attr('data-bid'); //取得like的ID bodymember
            var state = 1;
            if (target.hasClass("click")) {
                state = 0
            }
            $.post(_this.settings.urls.postlikeUrl + "/" + aid, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                like: state
            }).success(function(likes) {

                var count = 0 //
                for (var i in $(element).data('annotator-user').like) {
                    /*更新前台like資料*/
                    if ($(element).data('annotator-user').like[i].bg_id == aid) {
                        $(element).data('annotator-user').like[i].like = state;
                        count++;
                    }
                }
                if (count == 0)
                    $(element).data('annotator-user').like.push({
                        'bg_id': aid,
                        'like': state
                    });
                refresh();
                target.parent().find('.annotator-likes-total').text(likes);
                if (state == 1) {
                    target.css('color', 'blue');
                    target.parent().find('.anno-dislike').css('color', 'black');
                    target.addClass('click');
                } else {
                    target.css('color', 'black');
                    target.parent().find('.anno-dislike').css('color', 'black');
                    target.removeClass('click');
                }
            });

        }).on('click', '.anno-dislike', function(e) {
            e.preventDefault();
            var target = $(e.target);
            var aid = target.attr('data-bid');
            var anno_id = target.attr('data-id');
            var state = -1;
            if (target.hasClass("click")) {
                state = 0
            }
            $.post(_this.settings.urls.postlikeUrl + "/" + aid, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                like: state
            }).success(function(likes) {
                var count = 0
                $('.annotator-hl').unbind('click')
                for (var i in $(element).data('annotator-user').like) {

                    if ($(element).data('annotator-user').like[i].bg_id == aid) {
                        $(element).data('annotator-user').like[i].like = state;
                        count++;
                    }
                }
                if (count == 0)
                    $(element).data('annotator-user').like.push({
                        'bg_id': aid,
                        'like': state
                    });
                refresh();
                target.parent().find('.annotator-likes-total').text(likes);
                if (state == -1) {
                    target.css('color', 'red');
                    target.parent().find('.anno-like').css('color', 'black');
                    target.addClass('click');
                } else {
                    target.css('color', 'black');
                    target.parent().find('.anno-like').css('color', 'black');
                    target.removeClass('click');
                }

            });

        }).on('click', '.anno-collect', function(e) {
            e.preventDefault();
            var target = $(e.target);
            var id = target.attr('data-id');

            $.post(_this.settings.urls.collecturl, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                anno_id: id
            }).success(function(e) {
                if (target.hasClass('collecting')) {
                    target.html('收藏');
                    target.removeClass('collecting');

                } else {
                    target.addClass('collecting');
                    target.html('取消收藏');
                }
            })
        });



        //登出事件
        $(document).on('click', '#btn-anno-logout', function(e) {
            e.preventDefault();

            $.post(_this.settings.urls.logoutUrl, {
                    anno_token: _this.anno_token,
					domain:_this.domain
                })
                .success(function(e) {
                    setCookie('anno_token', '');
                    setCookie('user_id', 0);
                    _this.is_authed = false;
                    _this.anno_token = '';
                    _this.checkLoginState(false);
                    // window.location.href = window.location.href.split('#')[0];
                    location.reload();
                })

        });
        $('.panel-anno-show').bind('click', function(e) {
            $('.btn-show').click();
            if (_this.annotation_show == false) {
                e.target.style.color = "black";
                $('.btn-show').css('color', "black");
            } else {
                e.target.style.color = "brown";
                $('.btn-show').css('color', "brown");
            }
        })
		$('.list_bug').bind('click', function(e) {
			
			$('#list_bug_up').show();
		})
		
		
		$('.list_transform').bind('click', function(e) {
			e.preventDefault();
			if($('.anno-infos-item').length==0){
				return alert('無新增任何註記');
				
			}
            var annotation = $($('.anno-infos-item')[0]).data('annotation');
			var temp = annotation.img.parentElement.children[0];
			var annolist = getImgAnnotation(temp);//get annolist
			var manifest={};			
			var h=annotation.img.naturalHeight;
			var w=annotation.img.naturalWidth;
			manifest={				
				"@context":"http://iiif.io/api/presentation/2/context.json",
				"@id":"test",
				"@type":"sc:Manifest",
				sequences:[]
			};
			manifest['sequences'][0]={
				'@type' : "sc:Sequence",
				label : "test",//mirador需要
				canvases:[]
			};
			manifest['sequences'][0]['canvases'][0]={
				'@id' : annotation.uri,
				'@type' : "sc:Canvas",
				label : "test",
				height : h,
				width : w,
				images:[],
				otherContent:{}
			};			
			manifest['sequences'][0]['canvases'][0]['images'][0]={
				'@id' : annotation.img.src,
				'@type' : "oa:Annotation",
				motivation : 'sc:painting',
				resource:{},
				on : annotation.uri
			};
			manifest['sequences'][0]['canvases'][0]['images'][0]['resource']={
				'@id' : annotation.img.src,//$(element).find('canvas')[0].parentElement.children[0].src,
				'@type' : "dctypes:Image",
				format: "image/jpeg",
				height: h,
				width: w,
				service:{}
			};
			var str = annotation.img.src.split('/');
			var newImgSrc = '';
			for(var i=0 ; i<str.length ; i++){
				if( str[i] != 'full'){
					newImgSrc += str[i]+'/';
				}else{
					break;
				}
				
			}
			if(newImgSrc.substring(newImgSrc.length-1)=='/'){
				newImgSrc = newImgSrc.substring(0,newImgSrc.length-1);
			}
			manifest['sequences'][0]['canvases'][0]['images'][0]['resource']['service']={
				'@context' : "http://iiif.io/api/presentation/2/context.json",
				'@id' : newImgSrc,
				profile : "http://iiif.io/api/image/2/level1.json"
			};
			manifest['sequences'][0]['canvases'][0]['otherContent']=[];
			manifest['sequences'][0]['canvases'][0]['otherContent'][0]={
				'@id' : '',
				'@type' : "sc:AnnotationList"
			};
			
			var arr1 ={};	
			var arr2={};			
			arr1= {src : annolist[0].src,anno_id : annolist[0].id,canvas : annotation.uri,h:h,w:w};	
			$.ajax({            
				url: "http://dev.annotation.taieol.tw/api/canvas/add",
				method: "POST",
				data: arr1,
				async: false,//ajax 同步執行改異步執行
				success: function(response) {
					manifest['sequences'][0]['canvases'][0]['otherContent'][0]['@id']='http://dev.annotation.taieol.tw/list/'+response+'';
					
				},
				error: function(xhr, status, error) {
					console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
				}
			});	
			arr2.Manifest=manifest;
			arr2.url='';
			arr2.creator=$('.anno-login')[0].getElementsByTagName('span')[1].innerText;
			arr2.id='';
			
			$.ajax({
				url:'http://dev.annotation.taieol.tw/manage/manifest/importManifest',
				method: "POST",
				data: arr2,
				async: false,
				success: function(response) {
					arr2.id=response;
					arr2.url='http://dev.annotation.taieol.tw/manifest/'+response+'.json';
					alert(arr2.url);
				},
				error: function(xhr, status, error) {
					console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
				}
			});
			//manifest['@id']=arr2.id;
			/*這部分要將剛做好的manifest id 新增到裡面的url*/
			$.ajax({
				url:'http://dev.annotation.taieol.tw/manage/manifest/updateManifestID',
				method: "POST",
				data:arr2,
				async: false,
				success: function(response) {
				},
				error: function(xhr, status, error) {
					console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
				} 
			})
        })
		
		
        appear.bind('click', function(e) {
            if (showUI) {
                _this.ui.stop().animate({
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
                _this.ui.stop().animate({
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


        $("#checkboxid").change(function() {
            if (this.checked) {
                var checkboxs = document.getElementsByName("c");
                for (var i = 0; i < checkboxs.length; i++) {
                    checkboxs[i].checked = "checked";
                }

            } else {
                var checkboxs = document.getElementsByName("c");
                for (var i = 0; i < checkboxs.length; i++) {
                    $(checkboxs[i]).prop("checked", false);
                }
            }
            _this.refreshHighLights();
        });

    };
	function nextMove(arr2){
		$.ajax({
			url:'http://dev.annotation.taieol.tw/manage/manifest/importManifest',
			method: "POST",
			data: arr2,
			success: function(response) {
				console.log(response);
				alert('http://dev.annotation.taieol.tw/manifest/'+response+'.json');
				
			},
			error: function(xhr, status, error) {
				console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
			}
		});
	};
	function getImgAnnotation(element) {
        return $(element).data("annotation") !== undefined ? $(element).data("annotation") : [];
    };
	
	
    //檢查登入狀態函數
    this.checkLoginState = function(showUI, async) {

        if (!_this.is_authed) {
			var xhr;
            $.ajax({
                crossDomain: true,
                async: false,
                dataType: 'json',
                url: _this.settings.urls.authCheckurl,
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
				error: function(xhr, status, error) {
					xhr=xhr; 
					console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
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
    };


    this.refreshHighLights = function() {
        var filter_users = [];
        // var filter_tags = [];
        var i;
        //抓出user list 跟 tag list 的勾選input
        var checkboxs = $('.anno-users ul li input[type=checkbox]');
        // var tags_count = $('.anno-tags ul li input[type=checkbox]').length;
        var user_count = $('.anno-users ul li input[type=checkbox]').length;
        for (i = 0; i < checkboxs.length; i++) {
            if (checkboxs[i].checked) {
                //種類
                var cls = $(checkboxs[i]).attr('data-search').split('-')[0];
                //id
                var val = $(checkboxs[i]).attr('data-search').split('-')[1];
                if (cls == 'user') {
                    filter_users.push(val);
                } else if (cls == 'tag') {
                    filter_tags.push(val);
                }
            }
        }
        var data = [];
        if (_this.conditionData.length > 0)
            data = _this.conditionData;
        else
            data = _this.data;
        //顯示用的資料，完整的資料存在_this.data
        _this.showing = [];
        //開始搜尋
        for (i = 0; i < data.length; i++) {
            var user = data[i].user;
            data[i].highlights = [];
            if (filter_users.indexOf(user.id.toString()) != -1) {
                if (filter_users.length != user_count) {
                    var users = data;
                    for (j = 0; j < users.length; j++) {
                        var user = users[j].user.id.toString();
                        if (filter_users.indexOf(user) != -1) {
                            _this.showing.push(data[i]);
                            break;
                        }
                    }
                } else {
                    _this.showing = data;
                }
            }
        }
        _this.show_annotations();
    };

    this.addReference = function(annotation) {

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

        if (annotation.id == undefined) annotation.id = '-1';

        // check user is added to userlist
        if (_this.ui.find('#anno-user-' + user_id).length == 0 && annotation.id.toString().indexOf('keyword') == -1) {

            //add user list item and bind to user list
            this.ui.find('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                    '<a><input type="checkbox" checked data-search="user-' + user_id + '" name = "c"/>' +
                    '<img class="gravatar" src="' + gravatar_url + '" alt=""/>' +
                    '<span>' + user.name + '</span></a>' +
                    '</li>');
            $('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(_this.refreshHighLights);
        }

    };


    /*call when user want to see the annotation body
     *@param annotations  註記物件的array
     *return null
     */
    ViewPanel.showAnnoOnpanel = function(annotations) {
        var id = [];
        var collect_text = "收藏";
        $('#anno-body').html('');

        if (annotations != null)
            $('.panel-message').click();
        else
            $('.panel-annolist').click();
        for (var i in annotations) {
            var annotation = annotations[i];
            var anno_body = $('#anno-body');
            var anno_list_recored = $('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">');
            var user = $('<p><b>註記建立者:' + annotation.user.name + '</b></p>');

            anno_list_recored.append(user);

            for (var j = 0; j < annotation.otherbodys.length; j++) {

                var tags = "";

                for (var i = 0; i <= annotation.otherbodys[j].tags.length - 1; i++) {
                    tags += '<span class="anno-body-tag">' + annotation.otherbodys[j].tags[i] + ' </span>';
                }
                var metas = "";
                

                id.push(annotation.otherbodys[j].bid);
                var body = $('<div id ="anno-body' + annotation.otherbodys[j].bid + '" class = "anno-body-item"></div>');
                var creator = $('<a href=manage/profile/' + annotation.otherbodys[j].creator + ' class="anno-user-name">' + annotation.otherbodys[j].creator + '</a>');
                var time = $('<span class="anno-body-time">' + annotation.otherbodys[j].created_time + '</span>');
                var content = $('<div class="anno-body-text">' + annotation.otherbodys[j].text[0] + '</div>');


                var rating = $('<p><b><strong>評分:</strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.otherbodys[j].like + '</span>' +
                    '<a href="#" id="anno-like-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + 'title="讚" " data-id="' + annotation.id + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" id="anno-dislike-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + 'title="噓" "data-id="' + annotation.id + '" class="anno-dislike fa fa-thumbs-down" ></a>' +
                    '</span></b></p>');
                body = body.append(creator, time, content, $(tags), $(metas), rating);
                anno_body.append(anno_list_recored);
                anno_list_recored.append(body);

                /*Body修改權限*/
                if ($(_this.element).data('annotator-user') != undefined)
                    if ($(_this.element).data('annotator-user').name == annotation.otherbodys[j].creator||annotator.data('annotator-user').level=='s') {
                        var edit = $('<a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;" title="修改內容" data-id=' + annotation.otherbodys[j].bid + '></a>').data('annobody_data', annotation.otherbodys[j]).data('anno_id', annotation.id);
                        var del = $('<a class="anno-body-delete fa fa-times" style="background-position: 0 -75px;" title="刪除(有BUG版)" data-id=' + annotation.otherbodys[j].bid + '></a>');
                        var span = $('<span class="annotator-controls">').append(edit, del);
                        $('#anno-body  #anno-body' + annotation.otherbodys[j].bid).append(span);
                    }
            }

            /*讚的顏色判斷*/
            if ($(_this.element).data('annotator-user') != undefined) {
                var likes = $(_this.element).data('annotator-user').like
                for (var i in likes) {
                    if (id.indexOf(likes[i].bg_id) != -1) {
                        if (likes[i].like == "-1") {
                            $("#anno-dislike-" + likes[i].bg_id).css({
                                'color': "red"
                            });
                            $("#anno-dislike-" + likes[i].bg_id).addClass('click');
                        } else if (likes[i].like == "1") {
                            $("#anno-like-" + likes[i].bg_id).css({
                                'color': "blue"
                            });
                            $("#anno-like-" + likes[i].bg_id).addClass('click');
                        }
                    }
                }
                $.post(_this.settings.urls.checkcollect_url, {
                        anno_id: annotation.id,
                        anno_token: settings.anno_token,
                        domain: settings.domain
                    })
                    .success(function(data) {
                        if (data == "true") {
                            $('#anno-collect-' + annotation.id).addClass('collecting');
                            $('#anno-collect-' + annotation.id).html('取消收藏');
                        } else {
                            $('#anno-collect-' + annotation.id).html('收藏');
                            $('#anno-collect-' + annotation.id).removeClass('collecting');
                        }
                    });
            }

            var collect_button = $('<a class="anno-collect fa fa-diamond" id ="anno-collect-' + annotation.id + '" data-id="' + annotation.id + '" style="padding-left:5px;display:inline;">收藏</a>');
            var reply_button = $('<a class="anno-reply fa fa-comment" data-id="' + annotation.id + '" style="padding-left:5px;display:inline;">增加本文</a>');

            $('#anno-body #anno-info-id' + annotation.id).append(collect_button, reply_button);

            if ($(_this.element).data('annotator-user') != undefined)
                if ($(_this.element).data('annotator-user').id == annotation.user.id||annotator.data('annotator-user').level=='s')
                    $('#anno-body #anno-info-id' + annotation.id).append(
                        '<a class="anno-delete fa fa-trash-o" data-id="' + annotation.id + '" style="padding-left:5px;display:inline;">刪除</a>');
        }

        /*詢問使用者改善註記的部份*/
        if (annotation.fix != undefined && annotation.user.id == getCookie('user_id')) {
            var a = confirm('是否要保存該註記');
            if (a == true) {
                edit_target(annotation);
            } else {
                $('.anno-delete').click();
            }
        }
    }
    /*讀取中圖示顯示判斷*/
    function loadingPic(defaults='start') {
        if (defaults == 'start')
            $('.loader').show();
        else
            $('.loader').hide();
    };
    /*重新整理*/
    function refresh(defaults = 'normal') { //defaults 判斷是否為刪除最後一個的情況
        var url_search = _this.annotator.plugins.Store.options.urls.search;
        var data = _this.annotator.plugins.Store.options.loadFromSearch;
        var condition = _this.ui.find('#anno-search-input').val(); //搜尋用Textbox的value

        if (condition != "") { //搜尋有文字，判斷為搜尋狀況，使用搜尋條件過濾資料
            _this.ui.find('.anno-conditions')
                .append($('<div class="annotator-condition">').attr('id', condition)
                    .append($('<span>').text(condition + " "))
                    .append('<a><i class="fa fa-times delete-condition" aria-hidden="true"></i></a>'));
            _this.condition += condition + ",";
        }

        data.search = _this.condition;
        $.ajax({ //search(action) 取得annotation
            url: url_search,
            data: data,
            dataType: 'json',
            success: function(data) {
                if (data.total == 0 && defaults == 'normal') {
                    alert("查詢不到相關結果,顯示全部註記");
                }
                $('.annotator-hl').unbind('click')
                $('.anno-users ul li').remove();
                _this.showing = data.rows;
                _this.show_annotations();
            }
        });
    };
    /*when user confirm the text's target change,update postion info
     *@param annotation 被本工具改善定位的註記]
     */
    function edit_target(annotation) {
        $.ajax({
            crossDomain: true,
            url: _this.settings.urls.edit_target_url,
            method: "POST",
            data: {
                id: annotation.id,
                uri: location.href.split('#')[0],
                start: annotation.ranges[0].start,
                end: annotation.ranges[0].end,
                startOffset: annotation.ranges[0].startOffset,
                endOffset: annotation.ranges[0].endOffset,
                anno_token: _this.anno_token,
                domain: _this.domain
            },
            success: function(data) {
                $('.annotator-hl-focus').removeClass('annotator-hl-level2');
                annotation.fix = undefined;
            },
            error: function(xhr, status, error) {
                console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
            }
        });
    }
    /*使用者新增評論回覆的輸入介面與相關事件
     */
    this.insertReply = function() {

        var action; //body修改與新增共用同一個view 因此用此區分
        var cyberisland_meta = ['圖像內容人物: schema:contributor', '圖像內容時間: schema:temporalCoverage', '圖像內容物件: schema:mainEntity', '圖像內容地點: schema:contentLocation', '圖像事件/動作 schema:keyword'];
        var cyberisland_key = ['contributor', 'temporalCoverage', 'mainEntity', 'contentLocation', 'keyword'];
         $('.annotator-wrapper')
            .append('<div id="editorDiv" style="position:fixed;right:0px;bottom:0px;z-index:1800;width:300px;display:none">' +
                '<input type="hidden" id="editor_anno_id">' +
                '<textarea name="editor" id="editor" cols="30" rows="10"></textarea>' +
                '<div style="padding: 8px 6px;"><input id="tags" placeholder="請輸入標籤…" style="width:100%;border:0px;outline:none;font-size: 12px;"></div>' +
                //meta_inputs +
                '<div class =annotator-item-checkbox>' +
                '<input id="annotator-field-3" name="anno-body-public" placeholder="公開這個標記" type="checkbox" checked="checked"><label class="editor-label" for="annotator-field-3">公開這個標記</label></li>' +
                '</div>' +
                '<div class="add_body_control">' +
                '<button class="anno-reply-cancel" >取消</button>' +
                '<button class="anno-reply-save">儲存</button>' +
                '</div>' +
                '</div>')

        tinymce.init({
            selector: '#editor',
            menubar: false,
            plugins: "media image insertdatetime link code",
            height: 50,
            toolbar_items_size: "small",
            extended_valid_elements: "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "
        });
        var bid = "";
        var aid = "";
        $(document)
            .on('click', '.anno-reply', function(e) {
                if (_this.is_authed) {
                    e.preventDefault();
                    aid = $(e.target).attr('data-id');
                    $('#editorDiv').show();
                    clearEditorDiv();
                    action = "reply";
                } else alert('請先登入');
            })
            .on('click', '.anno-reply-cancel', function(e) {
                $('#editorDiv').hide();
            })
            .on('click', '.anno-reply-save', function(e) {
                var cyberisland_key = ['contributor', 'temporalCoverage', 'mainEntity', 'contentLocation', 'keyword'];
                //var temp= new Object();
                var temp = {
                    contributor: '',
                    temporalCoverage: "500",
                    mainEntity: '',
                    contentLocation: '',
                    keyword: ''
                };
                for (var i = 0; i < cyberisland_key.length; i++) {
                    temp[cyberisland_key[i]] = $('#editorDiv #' + cyberisland_key[i]).val();
                }
                var metas = JSON.stringify(temp);
                if (action == "reply") {

                    var content = tinyMCE.activeEditor.getContent();
                    var tags = $('#tags').val();
                    $.ajax({
                        crossDomain: true,
                        url: _this.settings.urls.postreplyurl,
                        method: "POST",
                        data: {
                            id: aid,
                            text: content,
                            tags: tags,
                            metas: metas,
                            public: $('input[name=anno-body-public]')[0].checked,
                            uri: location.href.split('#')[0],
                            anno_token: _this.anno_token,
                            domain: _this.domain
                        },
                        success: function(data) {
                            // editor hide and clean
                            $('#editorDiv').hide();
                            $('.annotator-hl').unbind('click')
                            //clean the tinymce's value
                            tinyMCE.activeEditor.setContent('');
                            $('#tags').val('');
                            //update this_data
                            _this.data = data[0].rows;
                            //update the showing data
                            refresh();
                            //show on right panel
                            for (var i in _this.data) {

                                if (_this.data[i].id == aid) {
                                    var anno = new Array();
                                    anno.push(_this.data[i]);
                                    ViewPanel.showAnnoOnpanel(anno); // @param anno is array data
                                }
                            };

                        },
                        error: function(xhr, status, error) {
                            alert('請重新整理,或重新點擊註記');
                            //alert("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
                        }
                    });
                } else if (action == 'edit') {
                    var id = bid;
                    var content = tinyMCE.activeEditor.getContent();
                    var tags = $('#tags').val();
                    $.ajax({
                        crossDomain: true,
                        url: _this.settings.urls.postupdateurl,
                        method: "POST",
                        data: {
                            id: id,
                            text: content,
                            tags: tags,
                            metas: metas,
                            public: $('input[name=anno-body-public]')[0].checked,
                            uri: location.href.split('#')[0],
                            anno_token: _this.anno_token,
                            domain: _this.domain
                        },
                        success: function(data) {
                            //editor clean and hide
                            $('#editorDiv').hide();
                            tinyMCE.activeEditor.setContent('');
                            $('#tags').val('');
                            //update Annotations 'Data'
                            _this.data = data.rows;
                            $('.annotator-hl').unbind('click')
                            $('#anno-body #anno-body' + id).find('#anno-body-text').html(content);
                            $('#anno-body #anno-body' + id).find('#anno-body-tag').html(tags);
                            refresh();

                            for (var i in _this.data) {
                                if (_this.data[i].id == aid) {
                                    var anno = new Array();
                                    anno.push(_this.data[i]);
                                    console.log('edit');
                                    ViewPanel.showAnnoOnpanel(anno);
                                }
                            };

                        },
                        error: function(xhr, status, error) {
                            alert('請重新整理,或重新點擊註記');
                            console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
                        }
                    });
                }
            })
            .on('click', '.anno-body-edit', function(e) {
                e.preventDefault();
                $('#editorDiv').show();
                clearEditorDiv();
                action = "edit";
                bid = $(e.target).attr('data-id');
                var anno = $(e.target).data('annobody_data');
                aid = $(e.target).data('anno_id');
                //tinyMCE.activeEditor.setContent(anno.text.lenght==0?"":anno.text[0]);
                tinymce.get('editor').setContent(anno.text.lenght == 0 ? "" : anno.text[0]);
                $('#tags').val(anno.tags.lenght == 0 ? "" : anno.tags.join(' '));
                for (var i = 0; i <= anno.metas.length - 1; i++) {
                    $('#editorDiv #' + anno.metas[i].purpose.split(':')[1]).val(anno.metas[i].text);
                    //$($('#editorDiv').find('.annotator-item div')[i]).find('input').val(anno.metas[i].text);
                }
            })
            .on('click', '.anno-body-delete', function(e) {
                var id = $(e.target).attr('data-id'); // body's id 
                $.ajax({
                    crossDomain: true,
                    url: _this.settings.urls.postdeleteurl + "/" + id,
                    method: "POST",
                    data: {
                        id: id,
                        uri: location.href.split('#')[0],
                        anno_token: _this.anno_token,
                        domain: _this.domain
                    },
                    success: function(data) {
                        $('.annotator-hl').unbind('click')
                        _this.data = data.rows; //更新data
                        _this.show_annotations();
                        $('#anno-body' + id).remove();
                        refresh();

                    },
                    error: function(xhr, status, error) {
                        console.log("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
                    }
                });
            });
    }

    function clearEditorDiv() {
        $inputs = $('#editorDiv :input');
        $inputs.each(function() {
            $(this).val('');
        });
    }
    /*游標事件*/
    $(document).on('mouseenter', '.anno-infos-item', function(e) {
        var annotation = $(e.target).data('annotation');
        if (annotation != undefined)
            if (annotation.type == 'text') {
                $(annotation.highlights).addClass('annotator-hl-focus');
            }


    });
    $(document).on('mouseleave', '.anno-infos-item', function(e) {
        var annotation = $(e.target).data('annotation');
        if (annotation != undefined)
            for (var i = 0; i < annotation.highlights.length; i++)
                $(annotation.highlights[i]).removeClass('annotator-hl-focus');
    });
    /*從右手邊panel對應到頁面上的註記 img and text都會使用到 */
    ViewPanel.annoinfos = function(annotation) {
        var anno_lists = $("#anno-lists");
        var anno_list_recored = $('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">');
        var user = $('<p><b>註記建立者:' + annotation.user.name + '</b></p>');
        anno_list_recored.data('annotation', annotation);
        var tags = "";
        for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
            tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
        }
        var metas = "";
        var body = $('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item"></div>');
        var creator = $('<a href=manage/profile/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>');
        var time = $('<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>');
        var content = $('<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>');
        var readmore = $('<div ><a style="text-align:right">readmore</a></div>');
        body = body.append(creator, time, content, $(tags), $(metas));
        anno_lists.append(anno_list_recored);
        anno_list_recored.append(user, body);
        anno_list_recored.append(readmore);
        anno_list_recored.click(function() {
            ViewPanel.showAnnoOnpanel(new Array(annotation));
        });
        return anno_list_recored;
    };

    function find_highlight(anno_list_recored) {
        var annotation = anno_list_recored.data('annotation');
        var scrollTop = $(annotation.highlights).offset().top;

        $('#anno-lists #anno-info-id' + annotation.id).click(function() {
            $('html,body').animate({
                scrollTop: scrollTop - 100
            }, 800);
        });
    }
    /* autocomplete 過濾重複的字詞
     */
    function unique1(array) {
        var n = [];
        for (var i = 0; i < array.length; i++) {
            if ($.inArray(array[i], n) == -1) {
                n.push(array[i]);
            }
        }
        var n1 = [];
        for (var i in n) {
            n1.push({
                "tags": n[i]
            });
        }
        return n1;
    }

    function autocomplete() {
        var options = {
            data: _this.autocompleteData,
            getValue: "tags",
            list: {
                maxNumberOfElements: 8,
                match: {
                    enabled: true
                },
                sort: {
                    enabled: true
                }
            }
        };
        $('#anno-search-input').easyAutocomplete(options);
    };
    /*當annotation-hl被點即，呈現註記在panel上 */
    function handler(event) {
        var annotations = event.data.annotations;
        $('.annotator-hl-focus').removeClass('annotator-hl-focus');
        console.log('handler');
        ViewPanel.showAnnoOnpanel(annotations);
        for (var i in annotations) $(annotations[i].highlights).addClass('annotator-hl-focus');
        _this.ui.stop().animate({
            'right': '0px'
        }, 1000, 'linear');
        $(".btn-appear").stop().animate({
            'right': '300px'
        }, 1000, 'linear');
        $(".btn-appear").html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
        showUI = true;
    }

    function addotherbody(annotation) {
       
        var time = MygetTime();

        var object = {
            body_member_id: '-1',
            bg_id: '-1',
            creator: $(element).data('annotator-user').name,
            is_public: '1',
            like: 0,
            //metas : metasarray,
            created_time: time,
            tags: annotation.tags,
            text: new Array(annotation.text)
        }
        annotation.img = undefined;
        annotation.otherbodys = [];
        annotation.otherbodys.push(object);
        return annotation;
    }

    function MygetTime() {
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1
        var date = myDate.getDate();
        var hour = myDate.getHours();
        var min = myDate.getMinutes();
        var second = myDate.getSeconds();
        var string = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ":" + second;
        return string;
    }
    var created_search_timeout;

    function created_search() {



        clearTimeout(created_search_timeout);

    }
    ViewPanel.pluginInit = function() {
        panel_Init();
        _this.insertKeywordUI();
        _this.insertAuthUI();
        _this.checkLoginState(false);
        _this.insertReply();
        $('#panel_filter').metisMenu();
        $('.panel-annolist').click();
        _this.annotator
            .subscribe("annotationsLoaded", function(annotations) {
                if (_this.data.length == 0)
                    _this.data = annotations;

                $("#anno-numer").html(annotations.length);
                $('.panel-annolist-count').html(annotations.length);
                annotations.forEach(function(annotation, index, annotations) {
                    var isInArray = $.inArray(_this.data, annotation);
                    if (~isInArray)
                        _this.data.push(annotation);
                    _this.addReference(annotation);
                    if (annotation.type == 'text') {
                        var anno_info_object = ViewPanel.annoinfos(annotation);
                        find_highlight(anno_info_object);
                    }
                    //取得Annotation 所有Tags
                    if (annotation.otherbodys.length > 0) {
                        for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
                            _this.allTags.push(annotation.otherbodys[0].tags[i]);
                        }
                    }
                    /*建立 id以及被標記元素的map
                    if (annotation.highlights != null) {
                        _this.maptoid[annotation.id] = annotation.highlights;
                    }*/
                    // 當要顯示特定標記時，刪除其他標記的高亮
                    if (_this.target_anno != 0 && annotation.id.toString() != _this.target_anno) {
                        if (annotation.id.toString() != _this.target_anno && annotation.highlights != null) {
                            annotation.highlights.forEach(function(highlight, index, highlights) {
                                $(highlight).removeClass('annotator-hl');
                            });
                        }
                    }
                });
                /*for search easy-autocomplete*/
                _this.autocompleteData = unique1(_this.allTags);
                autocomplete();

            }).subscribe("annotationCreated", function(annotation) {
                _this.data.push(annotation);
                _this.addReference(annotation);
                $("#anno-numer").html(_this.data.length);
                //ViewPanel.showAnnoOnpanel(_this.data);			
                if (annotation.type == 'text') {
                    var anno_info_object = ViewPanel.annoinfos(annotation);
                    find_highlight(anno_info_object);
                }
                $('.panel-annolist-count').html(_this.data.length);
                created_search_timeout = setTimeout(created_search, 5000);

            }).subscribe("annotationUpdated", function(annotation) {
                _this.checkLoginState();
                _this.addReference(annotation);
                ViewPanel.annoinfos(annotation);

            }).subscribe("annotationDeleted", function(annotation) {
                _this.checkLoginState();
                var index = -1;
                for (var i in _this.data) {
                    /*keyword*/
                    if (annotation.id == _this.data[i].id) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) // "~"  >>> not 
                    _this.data.splice(index, 1);

            }).subscribe('annotationViewerShown', function(viewer, annotations) {
                $('.annotator-hl').unbind('click');
                /*我們隱藏viewer 用panel秀出多筆annotaiton*/
                $('.annotator-hl').bind('click', {
                    annotations: annotations
                }, handler);

            }).subscribe("annotationEditorHidden", function(editor) {
                window.getSelection().removeAllRanges();

            }).subscribe("annotationEditorShown", function(editor, annotation) {
                /*決定編即視窗的位置*/
                editor.element[0].style.position = "fixed";
                editor.element[0].style.right = "0px";
                editor.element[0].style.bottom = "0px";
                editor.element[0].style.float = 'right';
                /*we 取得前後文 when editor show*/
                if (annotation.ranges.length > 0) {
                    var prefix_node = nodeFromXPath(annotation.ranges[0].start, _this.element.children[0]);
                    var prefix = prefix_node.innerText.substring(0, annotation.ranges[0].startOffset);
                    var suffix_node = nodeFromXPath(annotation.ranges[0].end, _this.element.children[0]);
                    var suffix = suffix_node.innerText.substring(annotation.ranges[0].endOffset);
                    annotation.suffix = suffix;
                    annotation.prefix = prefix;
                }

            }).subscribe("annotationEditorSubmit", function(editor, annotation) { //按下儲存時執行的區域
                loadingPic('start');//讀取中圖案開始
                annotation = addotherbody(annotation);

            }).subscribe("createdBack", function(annotation) { //儲存結束回傳成功後的區域
                loadingPic('end');//讀取中圖案開始
                refresh();

            }).subscribe("annotationEditorShown", function(editor, annotation) {
                $('#editorDiv').hide();

            });

        /*原先AnnotatorJs浮動顯示
        _this.annotator.viewer.addField({
            load: _this.updateCreatorViewer 
        });

        _this.annotator.viewer.addField({
            load: _this.updateLikeViewer
        });

        _this.annotator.viewer.addField({
            load: _this.updateDateViewer
        });

        _this.annotator.viewer.addField({
            load: _this.replyViewer
        });
        _this.annotator.viewer.addField({
            load: _this.reply
        });*/
    }

    return ViewPanel;
};