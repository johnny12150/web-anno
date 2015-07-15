/**
 * Created by flyx on 7/6/15.
 */
var annotation = function(e) {

    this.element = e;
    var _annotation = this;


    this.init = function(setting) {

        if( setting.uri == null ) {
            console.error('[Annotation Init Error]', 'uri undefined');
            return;
        }
        _annotation.uri = setting.uri
        //---------------------------------------------------------------
        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";path=" + location.pathname +  "; " + expires;
        }

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        }

        function getHashParam(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[&#]" + name + "=([^&#]*)"),
                results = regex.exec(location.hash);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        // get Token from hash
        var anno_token = getHashParam('anno_token');
        // get user id from hash
        var user_id = parseInt(getHashParam('user_id'));

        if(isNaN(user_id))
            user_id = 0;

        var target_anno = parseInt(getHashParam('anno_id'));

        if(isNaN(target_anno))
            target_anno = 0;

        var old_anno_token = getCookie('anno_token');

        var old_user_id = getCookie('user_id');


        if( anno_token == '') {
            if (old_anno_token != "") {
                anno_token = old_anno_token;
            }
            if( old_user_id != "") {
                user_id = parseInt(old_user_id);
            }
        } else {
            setCookie('anno_token', anno_token, 30);
            setCookie('user_id', user_id, 30);
        }

        // init annotator
        var content = $(_annotation.element).annotator();

        // set permission options
        var permissionsOptions = {};
        permissionsOptions['user'] = user_id;
        permissionsOptions['showEditPermissionsCheckbox'] = false;
        // set richText editor options
        var optionsRichText = {
            tinymce:{
                selector: "li.annotator-item textarea",
                plugins: "media image insertdatetime link code",
                menubar: false,
                toolbar_items_size: 'small',
                extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "
            }
        };

        content.annotator('addPlugin', 'ViewPanel', {
            user_id: user_id ,
            target_anno : target_anno
        }).annotator('addPlugin', 'Store', {
            prefix: '',
            urls: {
                create:  'http://annotator.local:8000/api/annotations/',
                read:    'http://annotator.local:8000/api/annotations/:id/',
                update:  'http://annotator.local:8000/api/annotations/:id/',
                destroy: 'http://annotator.local:8000/api/annotations/:id/',
                search:  'http://annotator.local:8000/api/search/'
            },
            annotationData: {
                uri: _annotation.uri,
                anno_token : anno_token
            },
            loadFromSearch: {
                limit: 0,
                all_fields: 1,
                uri: uri,
                anno_token : anno_token
            }
        })
            .annotator('addPlugin','RichText',optionsRichText)
            .annotator('addPlugin', 'Tags')
            .annotator('addPlugin', 'MyAuth', {
                anno_token : anno_token,
                uri: _annotation.uri
            })
            .annotator('addPlugin', 'Permissions', permissionsOptions);
    }

    return this;
}
