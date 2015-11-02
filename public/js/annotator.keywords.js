/**
 * Created by flyx on 8/21/15.
 */
/**
 * Created by flyx on 7/22/15.
 */
function Keyword(element, settings) {

    var _this = this;
    var _element = element;
    var keyword_index = 1;
    this.data = [];
    this.keywordUrl = 'http://140.109.18.158/api/annotation.jsp';

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }


    this.init = function() {
        $.ajax(_this.keywordUrl , {
            method: 'POST',
            async: false,
            crossDomain: true,
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
                                $('<span/>').attr('id', 'keyword-' + row.id).addClass('annotator-hl').html(row.keyword)).html()
                        )
                    );
                }

                for ( var i in data) {
                    var row = data[i];

                    $('.annotator-hl').filter('#keyword-' + row.id).each(function(index) {

                            var obj = new function() {
                                return {
                                    "id": "keyword-" + keyword_index.toString(),  // unique id (added by backend)
                                    "text": row.description,                  // content of annotation
                                    "quote": row.description,    // the annotated text (added by frontend)
                                    "ranges": [                                // list of ranges covered by annotation (usually only one entry)
                                        {
                                            "start": "",           // (relative) XPath to start element
                                            "end": "",             // (relative) XPath to end element
                                            "startOffset": 0,                      // character offset within start element
                                            "endOffset": 0                       // character offset within end element
                                        }
                                    ],
                                    "user": {
                                        id: '0'
                                    },                           // user id of annotation owner (can also be an object with an 'id' property)
                                    "tags": [],             // list of tags (from Tags plugin)
                                    "permissions": {                           //annotation permissions (from Permissions/AnnotateItPermissions plugin)
                                        "read": [],
                                        "update": [0],
                                        "delete": [0]
                                    }
                                };
                            }();

                            $(this).addClass('hl-keywords').data('annotation',obj);
                            keyword_index++;
                        });
                }
            }
        });

    };
    this.init();
};
