/**
 * 顯示Annotation的插件
 */
Annotator.Plugin.ViewPanel = function (element, settings) {

    // storing object scope
    var _this = this;
    this.annotator = $(element).annotator().data('annotator');
    this.element = element;
    this.uri = settings.uri;
    // if uri not set , use web url in default
    if(this.uri == null)
        this.uri = location.href.split('#')[0];

    this.anno_token = settings.anno_token;
    this.target_anno = settings.target_anno;
    this.server = settings.server;

    this.domain = settings.domain;
    this.callback_url = location.href.split('#')[0];

    // Storing entire data;
    this.data = [];
    // Storing data that only showed;
    this.showing = [];
    // Mapping hights elements by id;
    this.maptoid= {};

    // Authed variable
    this.is_authed = false;

    // Panel Object
    this.ui = null;

    // API URLS
    this.postlikeUrl = 'http://' + this.server + '/api/likes';
    this.authCheckurl = 'http://' + this.server + '/api/check';
    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url='
    + encodeURIComponent(this.callback_url)  + '&uri=' + this.uri + '&domain=' + this.domain ;
    this.logoutUrl = 'http://' + this.server + '/api/logout';

    this.showUI = true;
    this.user = null;

    //登入Anntation的 Modal UI
    this.insertAuthUI = function() {
        $('body').append('<div id="openAuthUI" class="authDialog">'
        + '     <div>'
        + '         <h2>本網站使用了標記的服務</h2>'
        + '         <span><a id="anno-btn-login" class="btn anno-btn-login">永久儲存標記</a></span>'
        + '         <span><a href="#" id="anno-btn-close" class="btn anno-btn-close">關閉視窗</a></span>'
        + '     </div>'
        + '</div>');

        $(document)
            .on('click', '#anno-btn-login', function(e) {
                location.href = _this.loginUrl;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
                return false;
            });
    };

    this.insertPanelUI = function() {

        $('body').append(
            '<div class="anno-panel">' +
                '<div class="anno-login">' +
                '</div>' +
                '<div class="anno-search">' +
                    '<p><strong>搜尋標記內容</strong></p>' +
                    '<form action="#" id="form-search">' +
                        '<button id="anno-search-submit" type="submit">' +
                            '<i class="fa fa-search fa-2x"></i>' +
                        '</button>' +
                        '<input id="anno-search-input" type="text" />' +
                    '</form>' +
                '</div>' +
                '<div class="anno-users">' +
                    '<p><strong>在此網頁標記的人</strong></p>' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<div class="anno-tags"><p><strong>標籤</strong></p>' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<hr/>' +
                '<div class="anno-search-list">' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<div class="btn-appear">' +
                '</div>' +
            '</div>');

        _this.ui = $('.anno-panel');

        //綁定搜尋按鈕事件
        $('#anno-search-submit').click(function(e) {
            e.preventDefault();
            //從Store插件找到搜尋的網址
            var url_search = _this.annotator.plugins.Store.options.urls.search;
            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            data.search = _this.ui.find('#anno-search-input').val();
            $.ajax({
                url: url_search,
                data: data,
                dataType: 'json',
                success: function(data) {
                    _this.data = [];
                    $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');
                    $('.anno-tags ul li').remove();
                    $('.anno-users ul li').remove();
                    _this.annotator.loadAnnotations(data.rows);
                }
            });
        });

        //綁定所有按讚事件
        $(document).on( 'click', '.anno-like',function(e) {
            e.preventDefault();
            var target = $(e.target);
            //標記ID
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token : _this.anno_token,
                domain : _this.domain,
                like : '1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if(_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index , ary) {
                        $(highlight).data('annotation').likes = annotation.likes;
                    });
                }
            });

        }).on( 'click', '.anno-dislike',function(e) {
            e.preventDefault();
            var target = $(e.target);
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token : _this.anno_token,
                domain : _this.domain,
                like : '-1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if(_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index , ary) {
                        $(highlight).data('annotation').likes = annotation.likes;
                    });
                }
            });

        });

        //登出事件
        $(document).on('click','#btn-anno-logout', function(e){
            e.preventDefault();
            $.ajax({
                method: 'POST',
                cookies: true,
                async: false,
                data: {
                    'anno_token': _this.anno_token,
                    'domain' : _this.domain
                },
                url : _this.logoutUrl,
            });
            setCookie('anno_token', '');
            setCookie('user_id', '');
            _this.is_authed = false;
            _this.anno_token = '';
            _this.checkLoginState(false);
            return false;
        });


        _this.ui.bind('mouseover', function(e){
            if(!_this.showUI) {
                _this.ui.stop().animate({
                    'right': '0'
                }, 500, 'linear');
                _this.showUI = true;
            }
        }).bind('mouseleave',  function(e){
            if(_this.showUI) {
                _this.ui.stop().animate({
                    'right': '-260px'
                }, 1000, 'linear');
                _this.showUI = false;
            }
        });
    };


    //檢查登入狀態函數
    this.checkLoginState = function(showUI, async) {

        if(!this.is_authed) {
            $.ajax({
                crossDomain : true,
                async : async === true ? true : false,
                dataType: 'json',
                data: {
                    'anno_token': this.anno_token,
                    'domain' : this.domain
                },
                url: this.authCheckurl,
                success : function(data) {
                    _this.user = data.user;
                    $('.anno-login').html(
                        '<img class="gravatar" src="'+ data.user.gravatar+'"/>' +
                        '<div>' +
                            '<span>'+ data.user.email +'</span>' +
                        '</div>' +
                        '<div>' +
                        '<span>' +
                            '<a href="#" id="btn-anno-logout">登出</a>' +
                        '</span>' +
                        '<span>' +
                            '<a target="_blank" href="http://' + _this.server + '">管理標記</a>' +
                        '</span>' +
                        '</div>');
                },
                statusCode: {
                    200 : function() {
                        _this.is_authed = true;
                    },
                    401: function () {
                        $('.anno-login').html('<div><span><a href="' + _this.loginUrl +'">登入</a></span></div>');
                        if(showUI != false)
                            $('#openAuthUI').addClass('show');
                    }
                }
            });
        }
    };


    this.refreshHighLights = function() {

        var filter_users = [];
        var filter_tags = [];
        var i;

        //抓出user list 跟 tag list 的勾選input
        var checkboxs = $('.anno-tags ul li input[type=checkbox],.anno-users ul li input[type=checkbox]');

        var tags_count = $('.anno-tags ul li input[type=checkbox]').length;



        for(i = 0 ; i < checkboxs.length; i++) {
            if(checkboxs[i].checked) {
                //種類
                var cls = $(checkboxs[i]).attr('data-search').split('-')[0];
                //id
                var val = $(checkboxs[i]).attr('data-search').split('-')[1];
                if( cls == 'user')
                {
                    filter_users.push(val);
                } else if ( cls == 'tag' ) {
                    filter_tags.push(val);
                }
            }
        }


        //顯示用的資料，完整的資料存在_this.data
        _this.showing = [];

        //開始搜尋
        for(i = 0 ; i < _this.data.length; i++)
        {
            var user = _this.data[i].user;

            _this.data[i].highlights = [];

            // 確認建立標記的使用者
            if (filter_users.indexOf(user.id.toString()) != -1) {
                //如果tag清單上沒有全部勾選 則確認標記的tag
                if(filter_tags.length != tags_count) {
                    var tags = _this.data[i].tags;
                    for (var j = 0; j < tags.length; j++) {
                        var tag = tags[j];
                        if (filter_tags.indexOf(tag) != -1) {
                            _this.showing.push(_this.data[i]);
                            break;
                        }
                    }
                } else {
                    _this.showing.push(_this.data[i]);
                }
            }

        }

        $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');

        _this.annotator.loadAnnotations(_this.showing);

    };

    this.addReference = function(annotation) {

        var user_id;
        var gravatar_url = '#';

        // get user id from annotation
        if( annotation.user != null)
            user_id = annotation.user.id;

        if( user_id == null )
            user_id = _this.user.id;

        // not authed
        if( annotation.id == 0 || annotation.id == null)
            annotation.user = _this.user;

        var user = annotation.user;

        if ( user.gravatar == null)
            user = _this.user;

        // get user gravatar url
        gravatar_url = user.gravatar;



        // check user is added to userlist
        if( _this.ui.find('#anno-user-'+ user_id ).length == 0) {
            //add user list item and bind to user list
            _this.ui.find('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                            '<input type="checkbox" checked data-search="user-' + user_id + '"/>' +
                            '<img class="gravatar" src="'+ gravatar_url +'" alt=""/>' +
                            '<span>' + user.name +'</span>' +
                        '</li>');
            $('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(_this.refreshHighLights);
        }

        //add tag to tag list
        var tags = annotation.tags;

        if( Array.isArray(tags)) tags.forEach(function (tagName, index, tagsAry) {
            if (tagName !== '') {
                var tagId = 'anno-tag-' + tagName;
                if (!_this.ui.find('#' + tagId).length) {
                    _this.ui.find('.anno-tags ul')
                        .append($('<li>').attr('id', tagId)
                            .append($('<input>').attr('type', 'checkbox')
                                .attr('checked', '')
                                .attr('data-search', 'tag-' + tagName))
                            .append($('<span>').text(tagName)));
                    $('#' + tagId).find('input[type=checkbox]')
                        .click(_this.refreshHighLights);
                }
            }
        });
    };

    // add user filed to Annotation View
    this.updateCreatorViewer = function(field, annotation) {
        var user = annotation.user;
        console.log(user);
        if(user == null)
            user = _this.user;
        if(user.name != null ) {
            $(field)
                .addClass('annotator-user')
                .html($('<strong>').text('建立者: ')
                    .append($('<span>')
                        .text(user.name)));
        }
        return '';
    };

    this.updateDateViewer = function(field, annotation) {

        if(annotation.created_at != null ) {
            $(field)
                .addClass('annotator-date')
                .html($('<strong>').text('建立時間: ')
                    .append($('<span>')
                        .text(annotation.created_at)));
        }
        return '';
    };

    this.updatePublicViewer = function(field, annotation) {


        if(annotation.created_at != null ) {
            $(field)
                .addClass('annotator-public')
                .html($('<strong>').text('公開: ')
                    .append($('<span>')
                        .text(annotation.)));
        }
        return '';
    };

    this.updateLikeViewer = function(field, annotation) {
        if(annotation.likes != undefined ){
            $(field)
                .addClass('annotator-mark')
                .html('<strong>評分: </strong>' +
                '<span class="annotator-likes">' +
                '<span class="annotator-likes-total">'+annotation.likes+'</span>' +
                '<a href="#" data-id="'+ annotation.id +'" class="anno-like fa fa-thumbs-up"></a>' +
                '<a href="#" data-id="'+ annotation.id +'" class="anno-dislike fa fa-thumbs-down"></a>' +
                '</span>');
        }

        return '';
    };

    return {
        pluginInit: function () {

            _this.insertPanelUI();
            _this.insertAuthUI();
            _this.checkLoginState(false);
            _this.annotator
                .subscribe("annotationsLoaded", function (annotations) {
                    if( _this.data.length == 0 )
                        _this.data = annotations;
                    annotations.forEach(function(annotation, index, annotations) {
                        var isInArray = $.inArray(_this.data, annotation);
                        if(~isInArray)
                            _this.data.push(annotation);
                        _this.addReference(annotation);
                        //建立 id以及被標記元素的map
                        if( annotation.highlights != null) {
                            _this.maptoid[annotation.id] = annotation.highlights;
                        }
                        // 當要顯示特定標記時，刪除其他標記的高亮
                        if(_this.target_anno != 0) {
                            if (annotation.id.toString() != _this.target_anno && annotation.highlights != null) {
                                annotation.highlights.forEach(function(highlight, index, highlights){
                                    $(highlight).not('.hl-keywords').removeClass('annotator-hl');
                                });
                            }

                        }
                    });

            }).subscribe("annotationCreated", function (annotation) {
                _this.checkLoginState();
                if(_this.data.indexOf(annotation) == -1)
                    _this.data.push(annotation);
                _this.addReference(annotation);
            }).subscribe("annotationUpdated", function (annotation) {
                _this.checkLoginState();
                _this.addReference(annotation);
            }).subscribe("annotationDeleted", function (annotation) {
                _this.checkLoginState();
                var index = $.inArray(annotation, _this.data);
                if( ~index )
                    _this.data.splice(index, 1);
            });

            _this.annotator.viewer.addField({
                load: _this.updateCreatorViewer
            });

            _this.annotator.viewer.addField({
                load: _this.updateLikeViewer
            });

            _this.annotator.viewer.addField({
                load: _this.updateDateViewer
            });
        }
    }
};
