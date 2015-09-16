/**
 * Created by flyx on 5/5/15.
 */

Annotator.Plugin.MyAuth = function (element, settings) {

    //Annotation 物件
    this.annotator = $(element).annotator().data('annotator');
    //確認是否登入的網址
    this.authCheckurl = 'http://annotator.local:8000/api/check';

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
                location.href = 'http://annotator.local:8000/auth/login?callback_uri=' + location.href;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
            });
    };

    var _this = this;

    this.anno_token = settings.anno_token != null ? settings.anno_token : '';
    this.uri = settings.uri != null ? settings.uri : '';
    this.is_authed = false;

    this.checkAuth = function() {

        if(!this.is_authed) {
            $.ajax({
                data: {
                    'anno_token': _this.anno_token,
                    'uri': _this.uri
                },
                url: this.authCheckurl,
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
