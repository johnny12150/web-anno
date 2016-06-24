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

    // API URLS
    this.postlikeUrl = 'http://' + this.server + '/api/likes';
    this.authCheckurl = 'http://' + this.server + '/api/check';
    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url=' + encodeURIComponent(this.callback_url) + '&uri=' + this.uri + '&domain=' + this.domain;
    this.logoutUrl = 'http://' + this.server + '/api/logout';

    this.showUI = true;
    this.user = null;

    this.loadAnnotations = function(data) {
        _this.annotator.loadAnnotations(data);
    }

    this.initkeyword = function() {
        _this.show_annotations();
    }


    this.show_annotations = function() {
        $('.annotator-hl').removeClass('annotator-hl');
        for (x in _this.keywords) {
            $('.keyword-hl-' + _this.keywords[x].color).not('.anno-keywords ul li span.keyword-hl-' + _this.keywords[x].color).removeClass('keyword-hl-' + _this.keywords[x].color);
            if (_this.hide_keywords.indexOf(',' + x + ',') == -1) {
                var tmp = JSON.parse(JSON.stringify(_this.keywords[x].anno));
                _this.loadAnnotations(tmp);
                $('.annotator-hl').not('[class*=keyword-hl]').addClass('keyword-hl-' + _this.keywords[x].color);
            }
        }
        if (_this.showing.length == 0) {
            _this.showing = _this.data;
        }
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

        /* $('body').append(
             '<div class="anno-panel">' +
             '<div class="anno-login">' +
             '</div>' +
             '<div class="anno-keywords">' +
             '<p><strong>匯入權威檔</strong></p>' +
             '<ul>' +
             '</ul>' +
             '</div>' +
             '<div class="anno-search">' +
             '<p><strong>增加搜尋條件</strong></p>' +
             '<form action="#" id="form-search">' +
             '<input id="anno-search-input" type="text" />' +
             '<button id="anno-search-submit" type="submit">' +
             '</button></div>' +
             '</form>' +

             '<div class="anno-tags"><p><strong>條件</strong></p>' +
             '</div>' +
             '<div class="anno-users">' +
             '<p><strong>在此網頁標籤的人</strong><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p>' +

             '<ul>' +
             '</ul>' +
             '</div>' +
             '<div class="anno-search-list">' +
             '<ul>' +
             '</ul>' +
             '</div>' +
             '<div class="anno-viewall">' +
             '<button class="btn-viewall" id="btn-viewall">顯示全部</button>' +
             '</div>' +
             '<div class="btn-appear">' +
             '<i class="fa fa-list fa-2x"></i>' +
             '</div>' +
             '</div>');*/
        $('body').append(
            '<div class="anno-panel">' +

            '<div class="navbar-default sidebar" role="navigation">' +
            '<div class="sidebar-nav navbar-collapse">' +
            '<ul class="nav in" id="side-menu">' +
            '<li class ="anno-login">' +
            '<span></span>' +
            '</li>' +
            '<li class="anno-search">' +
            '<p><strong>增加搜尋條件</strong></p>' +
            '<form action="#" id="form-search">' +
            '<input id="anno-search-input" type="text" />' +
            '<button id="anno-search-submit" type="submit">' +
            '</button>' +
            '</form>' +
            '</li>' +
            '<li class="anno-con">' +
            '<a><i class="fa fa-check-square" aria-hidden="true"></i> 條件列表<span class="fa arrow"></span></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '<li class="anno-conditions">' +
            '</li>' +
            '</ul>' +
            '</li>' +
            '<li class="anno-keywords">' +
            '<a href="#">' + '<i class="fa fa-bar-chart-o fa-fw">' + '</i>匯入權威檔<span class="fa arrow">' + '</span>' + '</a>' +
            '<ul class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">' +
            '</ul>' +
            '</li>' +
            '<li class="anno-users">' +
            '<a><i class="fa fa-child" aria-hidden="true"></i> 在此網頁標籤的人<span class="fa arrow">' + '</span>' + '</a></a>' +
            '<ul class="nav nav-second-level collapse">' +
            '<p align="right"><input type="checkbox" name="all" id ="checkboxid"  checked" />全選/全不選</p>' +
            '<li><hr style="padding:0px;margin:0px;"></li>' +
            '</ul>' +
            '</li>' +
            '<div class ="anno-infos">' +
            '</div>' +
            '</ul>' +
            '</div>' +

            '<!-- /.sidebar-collapse -->' +
            '</div>' +

            '</div>' +
            '<div class="btn-appear">' +
            '<i class="fa fa-chevron-right " aria-hidden="true"></i>' +
            '</div>'
        );
        _this.ui = $('.anno-panel');

        if (_this.target_anno == 0) {
            $('.anno-viewall').hide();
        } else {
            $('.anno-search').hide();
            $('.anno-users').hide();
            $('.anno-tags').hide();
            $('.anno-search-list').hide();
            $('.btn-appear').hide();
        }
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
                        .append('<a><i class="fa fa-times" aria-hidden="true"></i></a>'));
                _this.condition += condition + ",";
            }


            //data.search = _this.ui.find('#anno-search-input').val();
            data.search = _this.condition;
            $.ajax({
                url: url_search,
                data: data,
                dataType: 'json',
                success: function(data) {
                    if (data.total == 0) {
                        alert("查詢不到相關結果");
                    }
                    //_this.data = [];
                    // $('.anno-tags ul li').remove();
                    $('.anno-users ul li').remove();
                    _this.conditionData = data.rows;
                    _this.showing = data.rows;
                    _this.show_annotations();


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
        _this.autocomplete();

        $(document).on('click', '.fa-times', function(e) {
            var id = e.target.parentElement.parentElement.id;
            console.log(_this.condition, id);
            _this.condition = _this.condition.replace(id + ",", "");
            console.log("id:" + id, "condition:" + _this.condition);

            $(e.target.parentElement.parentElement).remove();
            $('#anno-search-input')[0].value = "";
            $('#anno-search-submit').click();
        });
        //綁定所有按讚事件
        $(document).on('click', '.anno-like', function(e) {
            e.preventDefault(); //The preventDefault() method will prevent the link above from following the URL.
            var target = $(e.target); //事件驅動的目標
            //標記ID

            var aid = target.attr('data-id'); //取得like的ID
            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                like: '1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if (_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index, ary) {
                        $(highlight).data('annotation').likes = annotation.likes;


                    });
                }
            });

        }).on('click', '.anno-dislike', function(e) {
            e.preventDefault();
            var target = $(e.target);
            var aid = target.attr('data-id');

            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token: _this.anno_token,
                domain: _this.domain,
                like: '-1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if (_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index, ary) {
                        $(highlight).data('annotation').likes = annotation.likes;

                    });
                }
            });

        });

        $(window).resize(function() {
            _this.show_annotations();
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

        $('.btn-appear').bind('click', function(e) {
            if (_this.showUI) {
                _this.ui.stop().animate({
                    'right': '-260px'
                }, 1000, 'linear');
                $(".btn-appear").stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
                 $(".btn-appear").html('<i class="fa fa-chevron-left " aria-hidden="true"></i>');
                _this.showUI = false;
            } else {
                _this.ui.stop().animate({
                  'right': '0px'
                }, 1000, 'linear');
                $(".btn-appear").stop().animate({
                    'right': '260px'
                }, 1000, 'linear');
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

        //add tag to tag list
        var tags = annotation.tags;

        /*
                if (Array.isArray(tags) && annotation.id.indexOf('keyword') == -1) tags.forEach(function(tagName, index, tagsAry) {

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
        */
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

        if (annotation.created_at != null) {
            $(field)
                .addClass('annotator-date')
                .html($('<strong>').text('建立時間: ')
                    .append($('<span>')
                        .text(annotation.created_at)));
        }
        return '';
    };


    this.updateLikeViewer = function(field, annotation) {
        if (annotation.likes != undefined) {
            $(field)
                .addClass('annotator-mark')
                .html('<strong>評分: </strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.likes + '</span>' +
                    '<a href="#" data-id="' + annotation.id + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" data-id="' + annotation.id + '" class="anno-dislike fa fa-thumbs-down"></a>' +
                    '</span>');
        }

        return '';
    };

    function RemoveHTML(strText) {

        var regEx = /<[^>]*>/g;

        return strText.replace(regEx, "");

    }
    this.annoinfos = function(annotation) {
        var quote = RemoveHTML(annotation.quote);
        quote.anchor(annotation.id);

        $(".anno-infos").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item ">' +
            '<p><b>' + annotation.user.name + '</b></p>' +
            '<a href="#' + annotation.id + '""><p class="annotation-quote"><i>' + annotation.quote + '</i></p></a>' +
            annotation.text +
            '</li>');

    };

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


    return {
        pluginInit: function() {

            _this.insertPanelUI();
            _this.insertKeywordUI();
            _this.insertAuthUI();
            _this.checkLoginState(false);
            _this.annotator

                .subscribe("annotationsLoaded", function(annotations) {
                $(".anno-infos").empty();
                if (_this.data.length == 0)
                    _this.data = annotations;

                annotations.forEach(function(annotation, index, annotations) {
                    var isInArray = $.inArray(_this.data, annotation);
                    if (annotation.tags == "") annotation.tags[0] = "NoTag";
                    if (~isInArray)
                        _this.data.push(annotation);
                    _this.addReference(annotation);
                    _this.annoinfos(annotation);
                    _this.allTags.push(annotation.tags[0]);


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

                _this.autocompleteData = unique1(_this.allTags);

                _this.autocomplete();
            }).subscribe("annotationCreated", function(annotation) {
                _this.checkLoginState();
                if (annotation.tags[0] == undefined) annotation.tags[0] = "NoTag";
                if (annotation.id == undefined) annotation.id = "-1";
                _this.data.push(annotation);
                _this.addReference(annotation);

            }).subscribe("annotationUpdated", function(annotation) {

                _this.checkLoginState();
                _this.addReference(annotation);
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


            });

            /*annotation 註記擴充功deleteAnnotation能*/
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
