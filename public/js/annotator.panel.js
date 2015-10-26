/**
 * 顯示Annotation的插件
 */
var x =  0;
Annotator.Plugin.ViewPanel = function (element, settings) {

    var _this = this;
    this.annotator = $(element).annotator().data('annotator');
    this.uri = settings.uri;
    if(this.uri == null)
        this.uri = location.href.split('#')[0];

    this.anno_token = settings.anno_token;
    this.user_id = settings.user_id;
    this.target_anno = settings.target_anno;

    this.domain = location.host;
    this.callback_url = location.href.split('#')[0];
    this.data = [];
    this.is_authed = false;
    this.search = [];
    this.ui = null;
    //確認是否登入的網址
    this.postlikeUrl = 'http://140.109.143.48/api/likes';
    this.authCheckurl = 'http://140.109.143.48/api/check';
    this.loginUrl = 'http://140.109.143.48/auth/login?callback_url='
    + encodeURIComponent(_this.callback_url)  + '&uri=' + _this.uri + '&domain=' + _this.domain ;



    //登入Anntation的 Madal UI
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
                location.href =_this.loginUrl;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
                return false;
            });
    };

    this.checkAuth = function() {

        if(!this.is_authed) {
            $.ajax({
                crossDomain : true,
                async : false,
                dataType: 'json',
                data: {
                    'anno_token': _this.anno_token,
                    'domain' : _this.domain
                },
                url: _this.authCheckurl,

                statusCode: {
                    200 : function() {
                        _this.is_authed = true;
                        $('.anno-login').html('');
                    },
                    401: function () {
                        $('.anno-login').html('login');
                        $('#openAuthUI').addClass('show');
                    }
                }
            });
        }
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
        /*var ui = $('<div>').addClass('anno-panel')
            .append(
            $('<div>').addClass('anno-login').append(
                $('<p><strong>').text('在此網頁標記的人')).append(
                $('<ul>'))
            )
            .append(
            $('<div>').addClass('anno-search').append(
                $('<p><strong>').text('搜尋標記內容')).append(
                $('<form>').attr('action','#').attr('id','form-search').append(
                    $('<button>').attr('id','anno-search-submit').attr('type','submit').append(
                        $('<i>').addClass('fa').addClass('fa-search').addClass('fa-2x'))).append(
                    $('<input>').attr('id','anno-search-input').attr('type','text')))
            ).append(
                $('<div>').addClass('anno-users').append(
                    $('<p><strong>').text('在此網頁標記的人')).append(
                    $('<ul>'))
            ).append(
                $('<div>').addClass('anno-tags').append(
                    $('<p><strong>').text('標籤')).append(
                    $('<ul>'))
            ).append($('<hr>')
            ).append(
                $('<div>').addClass('anno-search-list').append(
                        $('<ul>'))
            ).append($('<div>').addClass('btn-appear'));
        $('body').append(ui);*/
        _this.ui = $('.anno-panel');
        /*
         <div class="anno-panel">
            <div class="anno-search">
                <p><strong>搜尋標記內容</strong></p>
                <form action="#" id="form-search">
                    <button id="anno-search-submit" type="submit">
                        <i class="fa fa-search fa-2x"></i></button>
                    <input id="anno-search-input" type="text" />
                </form>
            </div>
            <div class="anno-users">
                <p><strong>在此網頁標記的人</strong></p>
                <ul></ul>
            </div>
            <div class="anno-tags">
                <p><strong>標籤</strong></p>
                <ul></ul>
            </div>
            <hr/>
            <div class="anno-search-list">
                <ul>
                    <!-- <li >
                    <img src="gravatar.jpg" class="gravatar" />
                    <div class="anno-quote">
                        Annotation
                    </div>
                    </li> -->
                </ul>
            </div>
            <div class="btn-appear">
            </div>
         </div>
        * */

        $('#anno-search-submit').click(function(e) {
            e.preventDefault();
            var url_search = _this.annotator.plugins.Store.options.urls.search;

            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            data.search = _this.ui.find('#anno-search-input').val();
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: url_search,
                data: data,
                success: function(data) {
                    _this.data = [];
                    $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');
                    $('.anno-tags ul li').remove();
                    $('.anno-users ul li').remove();
                    _this.annotator.loadAnnotations(data.rows);
                },
                dataType: 'json'
            });
        });

        $(document).on( 'click', '.anno-like',function(e) {
            var target = $(e.target);
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl, {
                aid : aid,
                uri : _this.uri,
                anno_token : _this.anno_token,
                'like' : '1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
            }).error(function(e) {

            })
            e.preventDefault();
        }).on( 'click', '.anno-dislike',function(e) {
            var target = $(e.target);
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl, {
                aid : aid,
                uri : _this.uri,
                anno_token : _this.anno_token,
                'like' : '-1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
            }).error(function(e) {

            })
            e.preventDefault();
        }).on('mouseover');
    };

    this.refreshHighLights = function() {

        var filter_users = [];
        var filter_tags = [];
        var i;

        //抓出user list 跟 tag list 的勾選input
        var checkboxs = $('.anno-tags ul li input[type=checkbox],.anno-users ul li input[type=checkbox]');

        var tags_count = $('.anno-tags ul li input[type=checkbox]').length;

        for(i = 0 ; i < checkboxs.length; i++)
        {
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
        var new_tmp_data = [];

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
                            new_tmp_data.push(_this.data[i]);
                            break;
                        }
                    }
                } else {
                    new_tmp_data.push(_this.data[i]);
                }
            }

        }

        $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');

        _this.annotator.loadAnnotations(new_tmp_data);

    };

    this.addReference = function(annotation) {

        var user_id;
        var gravatar_url = '#';

        // get user id from annotation
        if( annotation.user != null)
            user_id = annotation.user.id;

        if( user_id == null )
            user_id = this.user_id;

        // not authed
        if(user_id == null || user_id == 0 )
            return;

        var user = annotation.user;

        // get user gravatar url
        if( user != null)
            gravatar_url = user.gravatar;

        // check user is added to userlist
        if( _this.ui.find('#anno-user-'+ user_id ).length == 0) {
            //add user list item and bind to user list
            _this.ui.find('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                            '<input type="checkbox" checked data-search="user-' + user_id + '"/>' +
                            '<img class="gravatar" src="'+ gravatar_url +'" alt=""/>' +
                            '<span>user_' + user_id + '</span>' +
                        '</li>');
            $('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(_this.refreshHighLights);
        }

        //add tag to tag list
        var tags = annotation.tags;

        if ( tags != null ) {
            for (var i = 0; i < tags.length; i++) {
                var tagName = tags[i];

                if(tagName != '') {
                    var tagId = 'anno-tag-' + tagName;

                    if (_this.ui.find('#' + tagId).length == 0) {

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

            }
        }


    };

    // add user filed to Annotation View
    this.updateCreatorViewer = function(field, annotation) {
        if(annotation.user.id != 0 ) {
            $(field)
                .addClass('annotator-user')
                .html($('<strong>').text('建立者: ')
                    .append($('<span>')
                        .text('user_' + annotation.user.id.toString())));
        }
        return '';
    };

    this.updateStarsViewer = function(field, annotation) {
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
            _this.annotator = this.annotator;
            _this.checkAuth();
            _this.insertPanelUI();
            _this.insertAuthUI();
            this.annotator.subscribe("annotationsLoaded", function (annotations) {
                    if( _this.data.length == 0 )
                        _this.data = annotations;
                    for(var i = 0 ; i < annotations.length; i++) {
                        var index = $.inArray(_this.data, annotations[i]);
                        if(~index)
                            _this.data.push(annotations[i]);
                        _this.addReference(annotations[i]);

                        // display only one annotation if target_anno is bigger than zero
                        if(_this.target_anno != 0) {

                            if (annotations[i].id.toString() != _this.target_anno && annotations[i].highlights != null) {

                                for(var j = 0 ; j < annotations[i].highlights.length; j++) {
                                    $(annotations[i].highlights[j]).not('.hl-keywords').removeClass('annotator-hl');
                                }
                            }
                        }

                    }
            }).subscribe("annotationCreated", function (annotation) {
                _this.checkAuth();
                if(_this.data.indexOf(annotation) == -1)
                    _this.data.push(annotation);
                _this.addReference(annotation);
            }).subscribe("annotationUpdated", function (annotation) {
                _this.checkAuth();
                _this.addReference(annotation);
            }).subscribe("annotationDeleted", function (annotation) {
                _this.checkAuth();
                //console.log(_this.data.length);
                var index = $.inArray(annotation, _this.data);
                if( ~index )
                    _this.data.splice(index, 1);
                //console.log(_this.data.length);
            });

            this.annotator.viewer.addField({
                load: _this.updateCreatorViewer
            });

            this.annotator.viewer.addField({
                load: _this.updateStarsViewer
            });



        }
    }
};
