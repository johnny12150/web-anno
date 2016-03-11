/**
 * Created by flyx on 8/21/15.
 */
/**
 * Created by flyx on 7/22/15.
 */
//Annotator.Plugin.Keyword
var keywordInit = function (element, settings) {

    var _this = this;
    var _element = element;
    var keyword_index = 1;
    this.data = [];
    this.keywordUrl = settings.host;

    this.init = function() {
        $.ajax(_this.keywordUrl , {
            method: 'POST',
            crossDomain: true,
            async: false,
            dataType: 'json',
            data :{
                text : $(element).html()
            },
            success: function(data) {

                for( i in data) {
                    var row = data[i];
                    $(_element).html(
                        $(_element)
                            .html()
                            .replace(new RegExp(row.keyword, "g"),
                            $('<div>').append(
                                $('<span>').addClass('keyword-' + row.id).addClass('annotator-hl').html(row.keyword)).html()
                        )
                    );
                }

                for ( var i in data) {
                    var row = data[i];
                    var keywords = $('.annotator-hl').filter('.keyword-' + row.id);
                    for(var j = 0; j < keywords.length; j++) {
                        var obj = new function() {
                            return {
                                "id": "keyword-" + keyword_index.toString(),  // unique id (added by backend)
                                "text": row.description,                  // content of annotation
                                "quote": row.description,    // the annotated text (added by frontend)
                                "uri": "",
                                "domain": "",
                                "link": "",
                                "ranges": [                                // list of ranges covered by annotation (usually only one entry)
                                    {
                                        "start": "",           // (relative) XPath to start element
                                        "end": "",             // (relative) XPath to end element
                                        "startOffset": 0,                      // character offset within start element
                                        "endOffset": 0                       // character offset within end element
                                    }
                                ],
                                "user": {
                                    id: '0',
                                    gravatar:'',
                                    email: ''
                                },                           // user id of annotation owner (can also be an object with an 'id' property)
                                "type": "text",
                                "position": {
                                    "x": "0",
                                    "y": "0"
                                },
                                "tags": [],             // list of tags (from Tags plugin)
                                "likes": 0,
                                "src": "",
                                "permissions": {                           //annotation permissions (from Permissions/AnnotateItPermissions plugin)
                                    "read": [],
                                    "update": [0],
                                    "delete": [0]
                                }
                            };
                        }();

                        $(keywords[j]).addClass('hl-keywords').data('annotation',obj);
                        keyword_index++;
                    }
                }

                var a = $('.annotator-hl');
                for(var i = 0 ; i < a.length; i++)
                    console.log($(a[i]).data('annotation'));
            }
        });

    };

    //return {
    //    pluginInit: function () {
    //        _this.init();
    //    }
    //};
    this.init();
};
