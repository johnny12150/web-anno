/**
 * Created by flyx on 7/6/15.
 */

function deleteCookie( name, path, domain ) {
    if( getCookie( name ) ) {
        document.cookie = name + "=" +
        ((path) ? ";path="+location.host:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";path=" + location.host +  "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) 
            return c.substring(name.length, c.length);
    }
    return "";
}

function getHashParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[&#]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var annotation = function(e) {


    //this.server_host = '172.16.0.140:8022';


    this.server_host = 'annotation.ipicbox.tw';    

    this.element = e;
    this.annotator = null;   
    this.host = location.host;
    var _annotation = this;  
    

    this.init = function(setting) {

        if( setting.uri == null ) {
            console.error('[Annotation Init Error]', 'uri undefined');
            return;
        }
        _annotation.uri = setting.uri

        // get Token from hash
        var anno_token = getHashParam('anno_token');
        // get user id from hash
     
        var user_id = parseInt(getHashParam('user_id'));

        if(isNaN(user_id)) //判斷是否為數字 數字 =false , 字串=true
            user_id = 0;

        var target_anno = parseInt(getHashParam('anno_id')); //後台瀏覽標記用~~~
        
        if(isNaN(target_anno)) 
            target_anno = 0;
        /* 將anno_token,user_id 記錄在cookie中 */
        var old_anno_token = getCookie('anno_token'); 
        var old_user_id = getCookie('user_id');

            /*假設從hash中抓不到anno_token跟user_ID則從cookie中取得*/
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

        // Keywords init ********

        var keywords=keywordInit(_annotation.element, setting.keywords);


        //keywordInit(_annotation.element, { host: 'http://140.109.18.158/api/annotation.jsp'});
       


        // init annotator
        this.annotator = $(_annotation.element).annotator();     //Use "annotator()" Setting up Annotator
        
        // set richText editor options
        
        var optionsRichText = {
            tinymce:{
                language: 'zh_TW',
                selector: "li.annotator-item textarea",
                plugins: "media image insertdatetime link code",
                menubar: false,
                toolbar_items_size: 'small',
                extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "
            }
        };

        if(setting.imageAnnotation === true) {
            this.annotator
                .annotator('addPlugin', 'ImageAnnotation', {
                    server: this.server_host
                });
        }
           
        // set user's permission options(delete,edit)
        var permissionsOptions = {};
        permissionsOptions['showEditPermissionsCheckbox'] =  false ; //public and unpublic
        
        this.annotator
            .annotator('addPlugin', 'Store', {
            prefix: '',
            urls: {
                create:  'http://' + this.server_host + '/api/annotations/',
                read:    'http://' + this.server_host + '/api/annotations/:id/',
                update:  'http://' + this.server_host + '/api/annotations/:id/',
                destroy: 'http://' + this.server_host + '/api/annotations/:id/',
                search:  'http://' + this.server_host + '/api/search/'
            },
            annotationData: {
                uri: _annotation.uri,        //var uri = 'http://testing';
                domain : _annotation.host,   //var x = location.host;  >> www.w3schools.com
                anno_token : anno_token,
                likes: 0,
                link : location.href.split('#')[0]  //var x = location.href; >> http://www.w3schools.com/jsref/prop_loc_href.asp
            },
            loadFromSearch: {
                limit: 0,
                uri: _annotation.uri,
                domain : _annotation.host, 

                anno_token : anno_token
            }
        })
            .annotator('addPlugin','RichText',optionsRichText)
            .annotator('addPlugin', 'Tags')
            .annotator('addPlugin', 'ViewPanel', {
                target_anno : target_anno,
                anno_token : anno_token,
                uri: _annotation.uri,
                server : _annotation.server_host,
                domain : _annotation.host,
				keywords : keywords
            });

		this.annotator.loadannotation
        var user = this.annotator.data('annotator-user');


            /*this.annotator.data('annotator-user')
            Object {id: "1", name: "jonathan", email: "jonathan@gmail.com", 
            gravatar: "https://secure.gravatar.com/avatar/6b8838d8cfe36333788d1565c358b962?s=80&amp;r=g&amp;d=identicon"}*/
        //var user = this.annotator.data('annotator-user');// confirm the permission is right

        this.annotator.annotator('addPlugin', 'Permissions', {
                showEditPermissionsCheckbox: false,
                user: user != null ? parseInt(user.id) : 0
            });
        //.annotator('addPlugin', 'Keyword', {})
        


    };
   
    return this;
}//;
