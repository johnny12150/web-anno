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
    this.ui = null;
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
    this.showUI = true;
    this.annotation_show = true;
    this.user = null;
    this.maptoid = {};
    this.loadAnnotations = function(data) {
         $('.anno-lists').empty();
        _this.annotator.loadAnnotations(data);
    }

    this.initkeyword = function() {
        _this.show_annotations();
    }

    $(window).resize(function(e){
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
    *
    *
    *
    *
    */
    this.insertPanelUI = function() {

        $('body').append(
            '<div class="anno-panel">' +

            '<div class="navbar-default sidebar anno-test" role="navigation">' +

            '<div class ="selection">' +
            '<i class="fa fa-comments panel-message" style="font-size: 1.5em" aria-hidden="true" title="註記資訊"></i>' +
            '<i class="fa fa-search panel-main" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="搜尋條件"></i>' +
            '' +
            '<i class="fa fa-list-alt panel-annolist" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="註記列表"></i>' +
            '<span class="label label-danger panel-annolist-count" style="top:0px;left:95px;position:absolute"></span>' +
            '<i class="fa fa fa-eye panel-anno-show" aria-hidden="true" style="padding-left:10px;font-size: 1.5em;color:brown;"  title="show"></i>' +
            '</div>' +

            '<div class="sidebar-nav navbar-collapse panel1" >' +
            '<ul class="nav in" id="side-menu">' +

            '<li class ="anno-login">' +
            '<span></span>' +
            '</li>' +

            '<li class="anno-search" style="display:none">' +
            '<p><strong>增加搜尋條件</strong></p>' +
            '<form action="#" id="form-search">' +
				'<input id="anno-search-input" type="text" />' +
				'<button id="anno-search-submit" type="submit">' +
				'</button>' +
            '</form>' +
            '</li>' +

            '<li class="anno-con" style="display:none">' +
            '<a><i class="fa fa-check-square" aria-hidden="true"></i> 條件列表<span class="fa arrow"></span></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '<li class="anno-conditions">' +
            '</li>' +
            '</ul>' +
            '</li>' +

            /*'<li class="anno-keywords" ;>' +
            '<a href="#">' + '<i class="fa fa-bar-chart-o fa-fw">' + '</i>匯入權威檔<span class="fa arrow">' + '</span>' + '</a>' +
            '<ul class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">' +
            '</ul>' +
            '</li>' +*/

            '<li class="anno-users" style="display:none";>' +
            '<a><i class="fa fa-child" aria-hidden="true"></i> 在此網頁標籤的人<span class="fa arrow">' + '</span>' + '</a></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<p align="right"><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p>' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '</ul>' +
            '</li>' +
            '<li class="anno-lists" >' +

            '<li>' +
            '<li class ="anno-body" style="display:none">' +

            '</li>' +

            '<!-- /.sidebar-collapse -->' +
            '</div>' +

            '</div>' + //navbar default

            '</div>' + //anno panel
            '<div class="btn-appear" >' +
            '<i class="fa fa-chevron-right " aria-hidden="true"></i>' +
            '</div>' +
            '<div class="btn-show" style="display:none;color:brown">' +
            '<i class="fa fa-eye" aria-hidden="true"></i>' +
            '</div>' +
            '<div class="btn-appear-count" style="display:none">' +
            '<p id="anno-numer">0' +
            '</div>'
        );
        _this.ui = $('.anno-panel');
        /*控制註記的顯示*/
        $('.btn-show').click(function(e){
           if(_this.annotation_show == true){
            _this.showing = [];
            _this.show_annotations();
            _this.annotation_show = false;
            e.target.style.color ="black";
            $('.annotator-hl-focus').removeClass('annotator-hl-focus');
            $('.anno-lists').empty();
            $('.panel-anno-show').css('color','black');
            }
            else if(_this.annotation_show == false){
                _this.showing =_this.data;
                _this.annotation_show = true;
                 _this.loadAnnotations(_this.showing);
                 e.target.style.color ="blue";
                 $('.annotator-hl').unbind('click')
                 $('.panel-anno-show').css('color','blue');
            }
        });
        /*搜尋過濾功能介面*/
        $('.panel-main').click(function(e) {
            $(e.target).css({ 'color': "blue" })
            $('.panel-message').css({ 'color': 'black' });
            $('.panel-annolist').css({ 'color': 'black' });
            $('.anno-search').show();
            $('.anno-users').show();
            $('.anno-keywords').show();
            $('.anno-con').show();
            $('.anno-body').hide();
            $('.anno-lists').hide();
        });
        /*註記列表*/
        $('.panel-annolist').click(function(e) {
            $(e.target).css({ 'color': "blue" });
            $('.panel-main').css({ 'color': 'black' });
            $('.panel-message').css({ 'color': 'black' });
            $('.anno-search').hide();
            $('.anno-users').hide();
            $('.anno-keywords').hide();
            $('.anno-con').hide();
            $('.anno-body').hide();
            $('.anno-lists').show();
        });
        /*註記內容的顯示*/
        $('.panel-message').click(function(e) {
            $(e.target).css({ 'color': "blue" });
            $('.panel-main').css({ 'color': 'black' });
            $('.panel-annolist').css({ 'color': 'black' });
            $('.anno-search').hide();
            $('.anno-users').hide();
            $('.anno-keywords').hide();
            $('.anno-con').hide();
            $('.anno-body').show();
            $('.anno-lists').hide();
        });
        //目前沒用到
        /*if (_this.target_anno == 0) {
            $('.anno-viewall').hide();
        } else {
            $('.anno-search').hide();
            $('.anno-users').hide();
            $('.anno-tags').hide();
            $('.anno-search-list').hide();
            $('.btn-appear').hide();
        }
      
        $('#btn-viewall').click(function(e) {
            _this.target_anno = 0;
            $('.anno-tags').remove();
            $('.anno-users ul li').remove();
            _this.show_annotations();
            $('.anno-search').fadeIn();
            $('.anno-users').fadeIn();
            $('.anno-tags').fadeIn();
            $('.btn-appear').fadeIn();
            $('.anno-search-list').fadeIn();
            $('.anno-viewall').hide();

        });

        */
        $('#side-menu').metisMenu();
        //綁定搜尋按鈕事件
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
       $(document).on('click','.anno-delete',function(e){
           
            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            var anno_id =   $(e.target).attr('data-id');
            $.ajax({
                url: _this.delete_anno_url +'/'+ $(e.target).attr('data-id') ,
                data: data,
                dataType: 'json',
                method :'POST',
                success: function(data) {
                     $('.annotator-hl').unbind('click')
                     $('.annotator-hl-focus').removeClass('annotator-hl-focus annotator-hl-level2');

                     $('.panel-annolist').click();

                     var tem_data = _this.data;
                     _this.data = [];
                      for (var i in tem_data) {
                        if(tem_data[i].id != anno_id )
                        _this.data.push(tem_data[i]);
                        };
                    $('#anno-search-submit').click();   
                }
            });
        });

        this.autocomplete = function() {
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


        $(document).on('click', '.delete-condition', function(e) {
            var id = e.target.parentElement.parentElement.id;
            _this.condition = _this.condition.replace(id + ",", "");
            $(e.target.parentElement.parentElement).remove();
            $('#anno-search-input')[0].value = "";
            $('#anno-search-submit').click();
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
            $.post(_this.postlikeUrl + "/" + aid, {
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
                    $(element).data('annotator-user').like.push({ 'bg_id': aid, 'like': state });
                $('#anno-search-submit').click();
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
            $.post(_this.postlikeUrl + "/" + aid, {
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
                    $(element).data('annotator-user').like.push({ 'bg_id': aid, 'like': state });
                $('#anno-search-submit').click();
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

            $.post(_this.collecturl, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                anno_id: id
            }).success(function(e) {
                if(target.hasClass('collecting')){
                    target.html('收藏');
                    target.removeClass('collecting');

                }
                else{
                    target.addClass('collecting');
                     target.html('取消收藏');
                }
            })
        });



        //登出事件
        $(document).on('click', '#btn-anno-logout', function(e) {
            e.preventDefault();
           
             $.post(_this.logoutUrl, {
                anno_token: _this.anno_token,
                domain: _this.domain,
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
        $('.panel-anno-show').bind('click',function(e){
            $('.btn-show').click();
            if(_this.annotation_show == false){
                e.target.style.color = "black";
                $('.btn-show').css('color',"black");
            }
            else{
                e.target.style.color = "brown";
                 $('.btn-show').css('color',"brown");
            }
        })
        $('.btn-appear').bind('click', function(e) {
            if (_this.showUI) {
                _this.ui.stop().animate({
                    'right': '-300px'
                }, 1000, 'linear');
                $(".btn-appear").stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
               $(".btn-show").show();
               $(".btn-appear-count").show();
               $(".btn-appear").html('<i class="fa fa-chevron-left " aria-hidden="true"></i>');
                _this.showUI = false;
            } else {
                _this.ui.stop().animate({
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
                _this.showUI = true;
            }
        });


        $("#checkboxid").change(function() {
            if (this.checked) {
                var checkboxs = document.getElementsByName("c");
                for (var i = 0; i < checkboxs.length; i++) { checkboxs[i].checked = "checked"; }

            } else {
                var checkboxs = document.getElementsByName("c");
                for (var i = 0; i < checkboxs.length; i++) { $(checkboxs[i]).prop("checked", false); }
            }
            _this.refreshHighLights();
        });
    };

    //檢查登入狀態函數
    this.checkLoginState = function(showUI, async) {

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

        if(annotation.id == undefined) annotation.id = '-1';

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

    // add user filed to Annotation View
    this.updateCreatorViewer = function(field, annotation) {
        var user = annotation.user;
        if (user == null)
            user = _this.user; //登入的使用者
        if (user.name != null) {
            $(field)
                .addClass('annotator-user')
                .html($('<strong>').text('建立者: ')
                    .append($('<span>')
                        .text(user.name)));
        }
        return '';
    };

    this.updateDateViewer = function(field, annotation) {

        if (annotation.created_at != undefined) {
            $(field)
                .addClass('annotator-date')
                .html($('<strong>').text('建立時間: ')
                    .append($('<span>')
                        .text(annotation.created_at)));
        }
        return '';
    };
    /*call when user want to see the annotation body
     *@param annotations  註記物件的array
     *return null
    */
    function showAnnoOnpanel(annotations) {
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
				for (var i = 0; i <= annotation.otherbodys[j].metas.length - 1; i++) {
                    metas += '<br/><span class="anno-body-meta">' + annotation.otherbodys[j].metas[i].purpose.split(':')[1] + ':' + annotation.otherbodys[j].metas[i].text + ' </span>';
                }
                if(annotation.otherbodys[j].text[0] =='') annotation.otherbodys[j].text[0] = 'No Comment';
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
						var edit = $('<a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;"data-id=' + annotation.otherbodys[j].bid + '></a>').data('anno_data',annotation.otherbodys[j]);
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
                $.post('api/checkcollect',{anno_id : annotation.id, anno_token :settings.anno_token ,domain: settings.domain })
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
    /*when user confirm the text's target change,update postion info
    *@param annotation 被本工具改善定位的註記]
    */
    function edit_target(annotation){
        $.ajax({
            crossDomain: true,
            url: _this.edit_target_url,
            method: "POST",
            data: {
                id: annotation.id,
                uri: location.href.split('#')[0],
                start:annotation.ranges[0].start,
                end: annotation.ranges[0].end,
                startOffset: annotation.ranges[0].startOffset,
                endOffset:annotation.ranges[0].endOffset,
                anno_token: _this.anno_token,
                domain: _this.domain
            },
            success: function(data) {
                 $('.annotator-hl-focus').removeClass('annotator-hl-level2');
                annotation.fix = undefined;
            },
            error: function(xhr, status, error) {
                alert("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
            }
        });
    }
    /*使用者新增評論回覆的輸入介面與相關事件
    */
    this.insertReply = function() {

		var action;  //body修改與新增共用同一個view 因此用此區分
		var cyberisland_meta=['圖像內容人物: schema:contributor','圖像內容時間: schema:temporalCoverage','圖像內容物件: schema:mainEntity','圖像內容地點: schema:contentLocation','圖像事件/動作 schema:keyword'];
		var cyberisland_key=['contributor','temporalCoverage','mainEntity','contentLocation','keyword'];
		var meta_inputs="<div class='annotator-item'>";
		for (i = 0; i < cyberisland_meta.length; i++) {
			meta_inputs += '<div style="padding: 8px 6px;"><input id="'+cyberisland_key[i]+'" placeholder="'+cyberisland_meta[i]+'" style="width:100%;border:0px;outline:none;font-size: 12px;"></div>';
		}
		meta_inputs += "</div>";
		$('.annotator-wrapper')
		.append('<div id="editorDiv" style="position:fixed;right:0px;bottom:0px;z-index:1800;width:300px;display:none">' +
			'<input type="hidden" id="editor_anno_id">' +
			'<textarea name="editor" id="editor" cols="30" rows="10"></textarea>' +
			'<div style="padding: 8px 6px;"><input id="tags" placeholder="請輸入標籤…" style="width:100%;border:0px;outline:none;font-size: 12px;"></div>' +
			meta_inputs +
			'<div class =annotator-item-checkbox>' +
			'<input id="annotator-field-3" name="anno-body-public" placeholder="公開這個標記" type="checkbox" checked="checked"><label class="editor-label" for="annotator-field-3">公開這個標記</label></li>'+
			'</div>'+
			'<div class="add_body_control">' +
			'<button class="anno-reply-cancel" >取消</button>' +
			'<button class="anno-reply-save">儲存</button>' +
			'</div>' +
			'</div>')

        tinymce.init({ selector: '#editor', menubar: false, plugins: "media image insertdatetime link code", height: 50, toolbar_items_size: "small", extended_valid_elements: "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]", toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code " });
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
				var cyberisland_key=['contributor','temporalCoverage','mainEntity','contentLocation','keyword'];
				var temp=new Object();;
				for (i = 0; i < cyberisland_key.length; i++) {
					temp[cyberisland_key[i]]=$('#'+cyberisland_key[i]).val();
				}
				var metas=JSON.stringify(temp);
                if (action == "reply") {

                    var content = tinyMCE.activeEditor.getContent();
                    var tags = $('#tags').val();
                    $.ajax({
                        crossDomain: true,
                        url: _this.postreplyurl,
                        method: "POST",
                        data: {
                            id: aid,
                            text: content,
                            tags: tags,
							metas: metas,
                            public : $('input[name=anno-body-public]')[0].checked ,
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
                            _this.show_annotations();
                            //update the showing data
                            $('#anno-search-submit').click();
                            //show on right panel
                            for (var i in _this.data) {

                                if (_this.data[i].id == aid) {
                                    var anno = new Array();
                                    anno.push(_this.data[i]);
                                    console.log('reply');
									showAnnoOnpanel(anno); // @param anno is array data
                                }
                            };

                        },
                        error: function(xhr, status, error) {
                            alert("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
                        }
                    });
                } else if (action == 'edit') {
                    var id = bid;
                    var content = tinyMCE.activeEditor.getContent();
                    var tags = $('#tags').val();
                    $.ajax({
                        crossDomain: true,
                        url: _this.postupdateurl,
                        method: "POST",
                        data: {
                            id: id,
                            text: content,
                            tags: tags,
							metas: metas,
                            public : $('input[name=anno-body-public]')[0].checked ,
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
                            _this.show_annotations();
                            $('.annotator-hl').unbind('click')
                            $('.anno-body #anno-body' + id).find('.anno-body-text').html(content);
                            $('.anno-body #anno-body' + id).find('.anno-body-tag').html(tags);
                            $('#anno-search-submit').click();
                            for (var i in _this.data) {
                                if (_this.data[i].id == aid) {
                                    var anno = new Array();
                                    anno.push(_this.data[i]);
                                    console.log('edit');
									showAnnoOnpanel(anno);
                                }
                            };

                        },
                        error: function(xhr, status, error) {
                            alert("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
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
				var anno =$(e.target).data('anno_data');
				tinyMCE.activeEditor.setContent(anno.text.lenght==0?"":anno.text[0]);
				$('#tags').val(anno.tags.lenght==0?"":anno.tags.join(' '));
				for (var i = 0; i <= anno.metas.length - 1; i++) {
					$('#'+anno.metas[i].purpose.split(':')[1]).val(anno.metas[i].text);
				}
            })
            .on('click', '.anno-body-delete', function(e) {
                var id = $(e.target).attr('data-id'); // body's id 
                $.ajax({
                    crossDomain: true,
                    url: _this.postdeleteurl + "/" + id,
                    method: "POST",
                    data: {
                        id: id,
                        uri: location.href.split('#')[0],
                        anno_token: _this.anno_token,
                        domain: _this.domain
                    },
                    success: function(data) {
                        $('.annotator-hl').unbind('click')
                        _this.data = data.rows;  //更新data
                        _this.show_annotations();
                        $('#anno-body' + id).remove();
                        $('#anno-search-submit').click();
                     
                    },
                    error: function(xhr, status, error) {
                        alert("xhr:" + xhr + '\n' + "status:" + status + '\n' + "error:" + error);
                    }
                });



            });
    }
    function clearEditorDiv(){
		$inputs=$('#editorDiv :input');
		$inputs.each(function() {
			$(this).val('');
		});
	}
    $(document).on('mouseenter','.anno-infos-item',function(e){
        var annotation  = $(e.target).data('annotation');
        if(annotation != undefined)
            if(annotation.type =='text')
            $(annotation.highlights).addClass('annotator-hl-focus');

    });
    $(document).on('mouseleave','.anno-infos-item',function(e)
    {
        var annotation  = $(e.target).data('annotation');
		if(annotation != undefined)
			for (var i = 0 ; i < annotation.highlights.length;i++)
				$(annotation.highlights[i]).removeClass('annotator-hl-focus');
    });
    /*從右手邊panel對應到頁面上的註記 img and text都會使用到 */ 
    this.annoinfos = function(annotation) {
		$(".anno-lists").html();
        $(".anno-lists").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
                '<p><b>註記建立者:' + annotation.user.name + '</b></p>');

        var tags = "";
        $('.anno-lists #anno-info-id' + annotation.id).data('annotation',annotation);
        if(annotation.otherbodys[0].text[0] =='') annotation.otherbodys[0].text[0] = 'No Comment';
        for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
            tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
        }
		var metas = "";
		for (var i = 0; i <= annotation.otherbodys[0].metas.length - 1; i++) {
            metas += '<br/><span class="anno-body-metas">'+  annotation.otherbodys[0].metas[i].purpose.split(':')[1] + ':' + annotation.otherbodys[0].metas[i].text + ' </span>';
        }
		$('.anno-lists #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item">' +
            '<a href=manage/profile/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>' +
            '<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>' +
            '<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>' +
            tags+metas);
        
		
       
        $('.anno-lists #anno-info-id' + annotation.id).append('<div ><a style="text-align:right">readmore</a></div>');
        if(annotation.type == 'text')
			var scrollTop = $(annotation.highlights).offset().top;

        $('#anno-info-id' + annotation.id).click(function() {
             $('html,body').animate({ scrollTop: scrollTop - 100 }, 800);
              console.log('annoinfo');
			  showAnnoOnpanel(new Array(annotation)); 
        });
		
    };
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
            n1.push({ "tags": n[i] });
        }
        return n1;
    }
    /*當annotation-hl被點即，呈現註記在panel上 */
    function handler(event) {
        var annotations = event.data.annotations;
        $('.annotator-hl-focus').removeClass('annotator-hl-focus');
        console.log('handler');
		showAnnoOnpanel(annotations);
        for (var i in annotations) $(annotations[i].highlights).addClass('annotator-hl-focus');
        _this.ui.stop().animate({
            'right': '0px'
        }, 1000, 'linear');
        $(".btn-appear").stop().animate({
            'right': '300px'
        }, 1000, 'linear');
        $(".btn-appear").html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
        _this.showUI = true;
    }

    return {
        pluginInit: function() {

            _this.insertPanelUI();
            _this.insertKeywordUI();
            _this.insertAuthUI();
            _this.checkLoginState(false);
            _this.insertReply();
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
                   if(annotation.type == 'text') _this.annoinfos(annotation);
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
                _this.autocomplete();
            }).subscribe("annotationCreated", function(annotation) {
                _this.data.push(annotation);
                _this.addReference(annotation);
                $("#anno-numer").html(_this.data.length);
				console.log('created');
				showAnnoOnpanel(_this.data);
				$('.panel-annolist-count').html(_this.data.length);
				
            }).subscribe("annotationUpdated", function(annotation) {
                _this.checkLoginState();
                _this.addReference(annotation);
				_this.annoinfos(annotation);
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
                $('.annotator-hl').bind('click',{annotations:annotations},handler);
            }).subscribe("annotationEditorHidden", function(editor) {
                window.getSelection().removeAllRanges();
            }).subscribe("annotationEditorShown", function(editor,annotation) {
                /*決定編即視窗的位置*/
                editor.element[0].style.position = "fixed";
                editor.element[0].style.right = "0px";
                editor.element[0].style.bottom = "0px";
                editor.element[0].style.float = 'right';
                /*we 取得前後文 when editor show*/
                if(annotation.ranges.length >0){
                    var prefix_node = nodeFromXPath(annotation.ranges[0].start,_this.element.children[0]);
                    var prefix = prefix_node.innerText.substring(0,annotation.ranges[0].startOffset);
                    var suffix_node = nodeFromXPath(annotation.ranges[0].end,_this.element.children[0]);
                    var suffix = suffix_node.innerText.substring(annotation.ranges[0].endOffset);
                    annotation.suffix = suffix;
                    annotation.prefix = prefix;
                }
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
    }
};
