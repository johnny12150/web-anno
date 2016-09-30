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
/*文字註記定位的XPath get*/
 function nodeFromXPath(xp, root) {
        var idx, name, node, step, steps, _i, _len, _ref1;
        steps = xp.substring(1).split("/");
        node = root;
        for (_i = 0, _len = steps.length; _i < _len; _i++) {
          step = steps[_i];
          _ref1 = step.split("["), name = _ref1[0], idx = _ref1[1];
          idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
          node = findChild(node, name.toLowerCase(), idx);
        }
        return node;
    };
function findChild(node, type, index) {
    var child, children, found, name, _i, _len;
        if (!node.hasChildNodes()) {
          throw new Error("XPath error: node has no children!");
        }
        children = node.childNodes;
        found = 0;
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          name = getNodeName(child);
          if (name === type) {
            found += 1;
            if (found === index) {
              return child;
            }
          }
        }
        throw new Error("XPath error: wanted child not found.");
  };
function getNodeName(node) {
    var nodeName;
    nodeName = node.nodeName.toLowerCase();
    switch (nodeName) {
      case "#text":
        return "text()";
      case "#comment":
        return "comment()";
      case "#cdata-section":
        return "cdata-section()";
      default:
        return nodeName;
    }
};
 /*文字註記定位的改善*/
    function checkranges(annotation){
       var prefix_node = nodeFromXPath(annotation.ranges[0].start,document.getElementsByClassName("annotator-wrapper")[0]);
       var prefix = prefix_node.innerText.substring(0,annotation.prefix.length);
       var suffix_node = nodeFromXPath(annotation.ranges[0].end,document.getElementsByClassName("annotator-wrapper")[0]);
       var suffix = suffix_node.innerText.substring(suffix_node.innerText.length-annotation.suffix.length,suffix_node.length);
       var quote = suffix_node.innerText.substring(annotation.ranges[0].startOffset,annotation.ranges[0].endOffset);
       if(quote == annotation.quote){
            console.log('quote as same as before');
            return annotation.ranges;
       }
       else{
         if(annotation.suffix == suffix){
            var quote = suffix_node.innerText.substring(suffix_node.innerText.length-annotation.quote.length-annotation.suffix.length,suffix_node.innerText.length-annotation.suffix.length);
            if( quote == annotation.quote){
                console.log('prefix is wrong');
                annotation.ranges[0].startOffset = suffix_node.innerText.length-annotation.quote.length-annotation.suffix.length;
                annotation.ranges[0].endOffset = suffix_node.innerText.length-annotation.suffix.length;
                return annotation.ranges;
            }
         }
         if(annotation.prefix == prefix && annotation.suffix == suffix){
              annotation.ranges[0].startOffset = annotation.prefix.length;
              annotation.ranges[0].endOffset = suffix_node.innerText.length-annotation.suffix.length;
             console.log("use prefix and suffix to locate the postion");
             return annotation.ranges;
         }     
      }
      console.log('use Xpath');
      use_XPath(annotation)
      return annotation.ranges;
    };
    function use_XPath(annotation){
             var textrange = rangy.createRange();
             textrange.selectNodeContents(document.getElementsByClassName("annotator-wrapper")[0]);
             var searchScopeRange = rangy.createRange();
             var serachelement = document.getElementsByClassName("annotator-wrapper")[0];
                 searchScopeRange.selectNodeContents(serachelement);
             var total = annotation.prefix+annotation.quote+annotation.suffix;
             var origin_offet =  nodeFromXPath((annotation.ranges[0].start),serachelement).offsetTop;
             var origin_distance = 1000 ;
             var new_Xpath = '';
             var options = {
                    caseSensitive: false,
                    wholeWordsOnly: false,
                    withinRange: searchScopeRange,
                    direction: "forward" // This is redundant because "forward" is the default
                };
              while (textrange.findText(total, options)) {

                var now = Math.abs(textrange.startContainer.parentElement.offsetTop - origin_offet);
                if( now < origin_distance) {
                    origin_distance = now ;
                     
                     annotation.ranges[0].start = getxpath(textrange.startContainer.parentElement,serachelement);
                     annotation.ranges[0].end = getxpath(textrange.endContainer.parentElement,serachelement);
                }
                textrange.collapse(false);
              }        
    }

var annotation = function(e) {

    //from setting.js
    this.server_host = server_host;    

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
                    server: this.server_host,
                    anno_token : anno_token,
                    domain : _annotation.host
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
                    uri : location.href.split('#')[0] ,
                    domain : _annotation.host,   //var x = location.host;  >> www.w3schools.com
                    anno_token : anno_token,
                    likes: 0
                },
                loadFromSearch: {
                    limit: 0,
                    uri: location.href.split('#')[0],
                    domain : _annotation.host, 
                    anno_token : anno_token,
                    user :  user_id

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

        //		this.annotator.loadannotation
        var user = this.annotator.data('annotator-user');


        this.annotator.annotator('addPlugin', 'Permissions', {
                showEditPermissionsCheckbox: false,
                user: user != null ? parseInt(user.id) : 0
            });
    };
   
    return this;
}
