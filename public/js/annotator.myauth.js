/**
 * Created by flyx on 5/5/15.
 */

Annotator.Plugin.MyAuth = function (element, settings) {

    var _this = this;
    //Annotation 物件

    //確認是否登入的網址
    this.authCheckurl = 'http://140.109.143.48/api/check';

    this.user = null;

    this.site = location.href;
    this.uri = settings.uri;
    if(this.uri == null)
        this.uri = location.href.split('#')[0];
    this.domain = location.host;
    this.callback_url = location.href.split('#')[0];


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
                location.href = 'http://annotator.local/auth/login?callback_url='
                    + encodeURIComponent(_this.callback_url)  + '&uri=' + _this.uri + '&domain=' + _this.domain ;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
                return false;
            });
    };

    this.anno_token = settings.anno_token != null ? settings.anno_token : '';
    this.uri = settings.uri != null ? settings.uri : '';
    this.is_authed = false;

    this.checkAuth = function() {

        if(!this.is_authed) {
            $.ajax({
                async: false,
                crossDomain: true,
                dataType: 'json',
                data: {
                    'anno_token': _this.anno_token,
                    'domain' : _this.domain
                },
                url: _this.authCheckurl,
                success: function(data) {
                    _this.user = data.user;
                },
                statusCode: {
                    200 : function() {
                        _this.is_authed = true;
                    },
                    401: function () {
                        $('#openAuthUI').addClass('show');
                    }
                }
            });
        }
    };

    return {
        pluginInit: function () {

            _this.insertAuthUI();
            _this.annotator
                .subscribe("annotationCreated", function (annotation) {
                        _this.checkAuth();
                })
                .subscribe("annotationUpdated", function (annotation) {

                        _this.checkAuth();
                })
                .subscribe("annotationDeleted", function (annotation) {
                        _this.checkAuth();
                });
        }
    }
};
