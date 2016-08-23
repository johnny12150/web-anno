/**
 * 顯示Annotation的插件
 */
Annotator.Plugin.ViewPanel = function(element, settings) {

    // storing object scope
    /* settings:
    target_anno : target_anno,
    anno_token : anno_token,
    uri: _annotation.uri,
    server : _annotation.server_host,
    domain : _annotation.host
    */
    var _this = this;
    this.settings = settings;
    this.annotator = $(element).annotator().data('annotator');
    this.element = element;
    this.uri = settings.uri;
    this.keywords = settings.keywords;
    this.hide_keywords = "";
    // if uri not set , use web url in default
    if (this.uri == null)
        this.uri = location.href.split('#')[0];
    this.userlike;
    this.anno_token = settings.anno_token;
    this.target_anno = settings.target_anno;
    this.server = settings.server;
    this.condition = "";
    this.domain = settings.domain;
    this.callback_url = location.href.split('#')[0];
    this.allTags = [];
    // Storing entire data;
    this.data = [];
    // Storing data that only showed;`
    this.showing = [];
    // Mapping hights elements by id;
    this.maptoid = {};
    this.autocompleteData = [];
    // Authed variable
    this.is_authed = false;
    this.conditionData = [];
    // Panel Object
    this.ui = null;

    this.editaction = false;
    // API URLS
    this.postlikeUrl = 'http://' + this.server + '/api/likes';
    this.authCheckurl = 'http://' + this.server + '/api/check';
    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url=' + encodeURIComponent(this.callback_url) + '&uri=' + this.uri + '&domain=' + this.domain;
    this.logoutUrl = 'http://' + this.server + '/api/logout';
    this.postreplyurl = 'http://' + this.server + '/api/addbody';
    this.postdeleteurl = 'http://' + this.server + '/api/body';
    this.postupdateurl = 'http://' + this.server + '/api/updatebody';
    this.collecturl = 'http://' + this.server + '/api/collect';
    this.delete_anno_url = 'http://' + this.server + '/api/delete_anno';
    this.showUI = true;
    this.annotation_show = true;
    this.user = null;

    this.loadAnnotations = function(data) {
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
        var tmp = JSON.parse(JSON.stringify(_this.showing));
        _this.loadAnnotations(tmp);
      
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


    /*panel 主體*/
    this.insertPanelUI = function() {

        $('body').append(
            '<div class="anno-panel">' +

            '<div class="navbar-default sidebar anno-test" role="navigation">' +

            '<div class ="selection">' +
            '<i class="fa fa-comments panel-message" style="font-size: 1.5em" aria-hidden="true" title="註記資訊"></i>' +
            '<i class="fa fa-search panel-main" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="搜尋條件"></i>' +
            '' +
            '<i class="fa fa-list-alt panel-annolist" aria-hidden="true" style="padding-left:10px;font-size: 1.5em" title="註記列表"></i>' +
            '<span class="label label-danger panel-annolist-count" style="top:0px;left:95px;position:absolute">2</span>' +
            '<i class="fa fa fa-eye panel-anno-show" aria-hidden="true" style="padding-left:10px;font-size: 1.5em;color:brown;"  title="show"></i>' +
            '</div>' +

            '<div class="sidebar-nav navbar-collapse panel1" >' +
            '<ul class="nav in" id="side-menu">' +

            '<li class ="anno-login">' +
            '<span></span>' +
            '</li>' +

            '<li class="anno-search" >' +
            '<p><strong>增加搜尋條件</strong></p>' +
            '<form action="#" id="form-search">' +
            '<input id="anno-search-input" type="text" />' +
            '<button id="anno-search-submit" type="submit">' +
            '</button>' +
            '</form>' +
            '</li>' +

            '<li class="anno-con" >' +
            '<a><i class="fa fa-check-square" aria-hidden="true"></i> 條件列表<span class="fa arrow"></span></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '<li class="anno-conditions">' +
            '</li>' +
            '</ul>' +
            '</li>' +

            '<li class="anno-keywords" ;>' +
            '<a href="#">' + '<i class="fa fa-bar-chart-o fa-fw">' + '</i>匯入權威檔<span class="fa arrow">' + '</span>' + '</a>' +
            '<ul class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">' +
            '</ul>' +
            '</li>' +

            '<li class="anno-users" ;>' +
            '<a><i class="fa fa-child" aria-hidden="true"></i> 在此網頁標籤的人<span class="fa arrow">' + '</span>' + '</a></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<p align="right"><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p>' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '</ul>' +
            '</li>' +
            '<li class="anno-lists" style="display:none">' +

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
        $('.btn-show').click(function(e){
           if(_this.annotation_show == true){
            _this.showing = [];
            _this.show_annotations();
            _this.annotation_show = false;
            e.target.style.color ="black";
            $('.annotator-hl-focus').removeClass('annotator-hl-focus');
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
        /*if (_this.target_anno == 0) {
            $('.anno-viewall').hide();
        } else {
            $('.anno-search').hide();
            $('.anno-users').hide();
            $('.anno-tags').hide();
            $('.anno-search-list').hide();
            $('.btn-appear').hide();
        }*/
        /*The action After we click the view all button */
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


            data.search = _this.ui.find('#anno-search-input').val();
            data.search = _this.condition;
            $.ajax({
                url: url_search,
                data: data,
                dataType: 'json',
                success: function(data) {
                    if (data.total == 0) {
                        alert("查詢不到相關結果");
                    }
                    $('.annotator-hl').unbind('click')
                    $('.anno-users ul li').remove();
                    _this.conditionData = data.rows;
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
                     $('.annotator-hl-focus').removeClass('annotator-hl-focus');
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

                var count = 0
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

            $.ajax({
                method: 'POST',
                cookies: true,
                async: false,
                data: {
                    'anno_token': _this.anno_token,
                    'domain': _this.domain
                },
                url: _this.logoutUrl
            });
            setCookie('anno_token', '');
            setCookie('user_id', 0);
            _this.is_authed = false;
            _this.anno_token = '';

            _this.checkLoginState(false);
            location.reload();
            return false;
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
                        var user = users[j].user.id;
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



        // check user is added to userlist
        if (_this.ui.find('#anno-user-' + user_id).length == 0 && annotation.id.indexOf('keyword') == -1) {

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
    this.replyViewer = function(field, annotation) {

        if (annotation.otherbodys.length != 0) {

            for (var j = 0; j < annotation.otherbodys.length; j++) {
                var tags = "";
                for (var i = 0; i < annotation.otherbodys[j].tags.length; i++) {
                    tags += '<span class="annotator-tag">' + annotation.otherbodys[j].tags[i] + ' </span>';

                }
                $(field)
                    .addClass('annotator-replyViewer');
                $('.annotator-replyViewer').append(
                        '<span class="annotator-controls"><a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;" data-id=' + annotation.otherbodys[j].bid + '></a>' +
                        '<a class="anno-body-delete fa fa-times" style="background-position: 0 -75px;" data-id=' + annotation.otherbodys[j].bid + '></a></span')
                    .append('<div class="richText-annotation" style="padding-top:22px";>' + annotation.otherbodys[j].text[0] + '</div>');
                if (tags != "") {
                    $('.annotator-replyViewer').append('<div class="annotator-tags">' + tags + '</div>');
                }

                $('.annotator-replyViewer').append('<div class="annotator-user"><strong>建立者: <span>' + annotation.otherbodys[j].creator + '</span></strong></div>' +
                    '<div class="annotator-date"><strong>建立時間: <span>' + annotation.otherbodys[j].created_time + '</span></strong></div>');
                $('.annotator-replyViewer').append('<div class="annotator-mark"><strong>評分: </strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.otherbodys[j].like + '</span>' +
                    '<a href="#" data-id="' + annotation.id + '"data-bid="' + annotation.otherbodys[j].bid + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" data-id="' + annotation.id + '"data-bid="' + annotation.otherbodys[j].bid + '" class="anno-dislike fa fa-thumbs-down"></a>' +
                    '</span>');
            }
        } else {
            $(field).hide();
        }
        return '';
    };
    this.reply = function(field, annotation) {
        $(field)
            .addClass('annotator-reply')
            .append('<a class="anno-reply" data-id=' + annotation.id + '>留言</a>');
    }

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

                id.push(annotation.otherbodys[j].bid);
                $('.anno-body #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[j].bid + '" class = "anno-body-item">' +
                    '<a href=manage/' + annotation.otherbodys[j].creator + ' class="anno-user-name">' + annotation.otherbodys[j].creator + '</a>' +
                    '<span class="anno-body-time">' + annotation.otherbodys[j].created_time + '</span>' +
                    '<div class="anno-body-text">' + annotation.otherbodys[j].text[0] + '</div>' +
                    tags +
                    '<p><b><strong>評分:</strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.otherbodys[j].like + '</span>' +
                    '<a href="#" id="anno-like-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '" data-id="' + annotation.id + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" id="anno-dislike-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '"data-id="' + annotation.id + '" class="anno-dislike fa fa-thumbs-down" ></a>' +
                    '</span></b></p>'
                );
                if ($(_this.element).data('annotator-user') != undefined)
                    if ($(_this.element).data('annotator-user').name == annotation.otherbodys[j].creator) {
                        $('.anno-body  #anno-body' + annotation.otherbodys[j].bid).append('<span class="annotator-controls">' +
                            '<a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;"data-id=' + annotation.otherbodys[j].bid + '></a>' +
                            '<a class="anno-body-delete fa fa-times" style="background-position: 0 -75px;" data-id=' + annotation.otherbodys[j].bid + '></a></span></div>');
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
                '<a class="anno-reply fa fa-comment" data-id="' + annotation.id + '" style="padding-left:5px;">回覆</a>'
            );
            if($(_this.element).data('annotator-user') != undefined)
                if ($(_this.element).data('annotator-user').id == annotation.user.id)
                    $('.anno-body #anno-info-id' + annotation.id).append(
                       '<a class="anno-delete fa fa-trash-o" data-id="' + annotation.id + '" style="padding-left:5px;">刪除</a>');
        }



    }
    this.insertReply = function() {
        var action;
        $('.annotator-wrapper')
            .append('<div id="editorDiv" style="position:fixed;right:0px;bottom:0px;z-index:1800;width:300px;display:none">' +
                '<input type="hidden" id="editor_anno_id">' +
                '<textarea name="editor" id="editor" cols="30" rows="10"></textarea>' +
                
                '<div style="padding: 8px 6px;"><input id="tags" placeholder="請輸入標籤…" style="width:100%;border:0px;outline:none;font-size: 12px;"></div>' +
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
                    action = "reply";
                } else alert('請先登入');
            })
            .on('click', '.anno-reply-cancel', function(e) {
                $('#editorDiv').hide();
            })
            .on('click', '.anno-reply-save', function(e) {
                if (action == "reply") {

                    var content = tinyMCE.activeEditor.getContent();
                    var tags = $('#tags').val();
                    console.log($('input[name=anno-body-public]')[0].checked);
                    $.ajax({
                        crossDomain: true,
                        url: _this.postreplyurl,
                        method: "POST",
                        data: {
                            id: aid,
                            text: content,
                            tags: tags,
                            public : $('input[name=anno-body-public]')[0].checked ,
                            uri: location.href.split('#')[0],
                            anno_token: _this.anno_token,
                            domain: _this.domain
                        },
                        success: function(data) {
                            // editor hide and clean
                            $('#editorDiv').hide();
                            $('.annotator-hl').unbind('click')
                            tinyMCE.activeEditor.setContent('');
                            $('#tags').val('');
                            //update this_data
                            _this.data = data[0].rows;
                            _this.show_annotations();
                            $('#anno-search-submit').click();
                            //show on right panel
                            for (var i in _this.data) {

                                if (_this.data[i].id == aid) {
                                    var anno = new Array();
                                    anno.push(_this.data[i]);
                                    showAnnoOnpanel(anno);
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
                action = "edit";
                bid = $(e.target).attr('data-id');
            })
            .on('click', '.anno-body-delete', function(e) {
                var id = $(e.target).attr('data-id');
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
                        _this.data = data.rows;
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
    this.updateLikeViewer = function(field, annotation) {
        if (annotation.likes != undefined) {
            $(field)
                .addClass('annotator-mark')
                .html('<strong>評分: </strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.likes + '</span>' +
                    '<a href="#" data-id="' + annotation.id + '"data-bid="' + annotation.bid + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" data-id="' + annotation.id + '"data-bid="' + annotation.bid + '" class="anno-dislike fa fa-thumbs-down"></a>' +
                    '</span>');
        }

        return '';
    };
    $(document).on('mouseenter','.anno-infos-item',function(e){
        var annotation  = $(e.target).data('annotation');
        if(annotation != undefined)
            if(annotation.type =='text')
            $(annotation.highlights).addClass('annotator-hl-focus');

    });
    this.annoinfos = function(annotation) {

        $(".anno-lists").html();
        $(".anno-lists").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
                '<p><b>註記建立者:' + annotation.user.name + '</b></p>');

        var tags = "";

        if (annotation.otherbodys.length > 0) {
            for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
                tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
            }

            $('.anno-lists #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item">' +
                '<a href=manage/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>' +
                '<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>' +
                '<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>' +
                tags);
        }
        else{
             $('.anno-lists #anno-info-id' + annotation.id).append('<div class = "anno-body-item">' +
                    '<a href=manage/' + annotation.user.name + ' class="anno-user-name">' + annotation.user.name + '</a>' +
                    '<span class="anno-body-time">' + annotation.created_at + '</span>' 
                       );
        }
       
        $('.anno-lists #anno-info-id' + annotation.id).append('<div ><a style="text-align:right">readmore</a></div>');
        if(annotation.type == 'text')
        var scrollTop = $(annotation.highlights).offset().top;
        $('#anno-info-id' + annotation.id).mouseenter(function() {
          
            $(annotation.highlights).addClass('annotator-hl-focus');
        });
        $('#anno-info-id' + annotation.id).mouseleave(function() {
            $(annotation.highlights).removeClass('annotator-hl-focus');
        });
        $('#anno-info-id' + annotation.id).click(function() {
             $('html,body').animate({ scrollTop: scrollTop - 100 }, 800);
              showAnnoOnpanel(new Array(annotation));
        });
        

    };
    function RemoveHTML(strText) {

        var regEx = /<[^>]*>/g;

        return strText.replace(regEx, "");

    }


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

    function handler(event) {

        var annotations = event.data.annotations;
        $('.annotator-hl-focus').removeClass('annotator-hl-focus');
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
                $('.anno-lists').empty();
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

                    //建立 id以及被標記元素的map
                    if (annotation.highlights != null) {
                        _this.maptoid[annotation.id] = annotation.highlights;
                    }
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
                $('.panel-annolist-count').html(_this.data.length);
            }).subscribe("annotationUpdated", function(annotation) {
                _this.checkLoginState();
                _this.addReference(annotation);
                _this.annoinfos(annotation);
            }).subscribe("annotationDeleted", function(annotation) {

                _this.checkLoginState();
                var index = -1;
                for (var i in _this.data) {

                    if (annotation.id == _this.data[i].id) {
                        index = i;
                        break;
                    }
                }

                if (index != -1) // "~"  >>> not 
                    _this.data.splice(index, 1);


            }).subscribe('annotationViewerShown', function(viewer, annotations) {
                $('.annotator-hl').unbind('click');
                $('.annotator-hl').bind('click',{annotations:annotations},handler);
            }).subscribe("annotationEditorHidden", function(editor) {
                window.getSelection().removeAllRanges();
            }).subscribe("annotationEditorShown", function(editor) {
                editor.element[0].style.position = "fixed";
                editor.element[0].style.right = "0px";
                editor.element[0].style.bottom = "0px";
                editor.element[0].style.float = 'right';
           
            });

            /*annotation 註記擴充功deleteAnnotation能*/
            /*_this.annotator.viewer.addField({
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
