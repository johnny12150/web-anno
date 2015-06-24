/**
 * 顯示Annotation的插件
 */
var x =  0;
Annotator.Plugin.ViewPanel = function (element, settings) {

    var _this = this;

    this.user_id = settings.user_id;
    this.data = [];

    this.search = [];
    this.ui = $('.anno-panel');


    this.insertPanelUI = function() {


        $('#anno-search-submit').click(function(e) {
            e.preventDefault();
            var url_search = _this.annotator.plugins.Store.options.urls.search;
            var data = _this.annotator.plugins.Store.options.annotationData;
            data.search = _this.ui.find('#anno-search-input').val();
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: url_search,
                data: data,
                success: function(data) {
                    _this.data = [];
                    $('.annotator-hl').removeClass('annotator-hl');
                    $('.anno-tags ul li').remove();
                    $('.anno-users ul li').remove();
                    _this.annotator.loadAnnotations(data.rows);
                },
                dataType: 'json'
            });
        })
    };

    this.refreshHighLights = function() {

        var filter_users = [];
        var filter_tags = [];

        var tags_count = 0;

        var checkboxs = $('.anno-tags ul li input[type=checkbox],.anno-users ul li input[type=checkbox]');

        tags_count = $('.anno-tags ul li input[type=checkbox]').length;

        for(var i = 0 ; i < checkboxs.length; i++)
        {
            if(checkboxs[i].checked) {
                var cls = $(checkboxs[i]).attr('data-search').split('-')[0];
                var val = $(checkboxs[i]).attr('data-search').split('-')[1];
                if( cls == 'user')
                {
                    filter_users.push(val);
                } else if ( cls == 'tag' ) {
                    filter_tags.push(val);
                }
            }
        }

        var new_tmp_data = [];



        for(var i = 0 ; i < _this.data.length; i++)
        {
            _this.data[i].highlights = [];
            if (filter_users.indexOf(_this.data[i].user.id) != -1) {
                if(filter_tags.length != tags_count) {
                    for (var j = 0; j < _this.data[i].tags.length; j++) {
                        if (filter_tags.indexOf(_this.data[i].tags[j]) != -1) {
                            new_tmp_data.push(_this.data[i]);
                            isadd = true;
                            break;
                        }
                    }
                } else {
                    new_tmp_data.push(_this.data[i]);
                }
            }

        }
        $('.annotator-hl').removeClass('annotator-hl');
        _this.annotator.loadAnnotations(new_tmp_data);

    }

    this.addReference = function(annotation) {
        console.log(annotation);
        var user_id = null
        var gravatar = '#';

        if( annotation.user != null)
            user_id = annotation.user.id;


        if( annotation.user != null)
            gravatar = annotation.user.gravatar;

        if( user_id == null )
            user_id = this.user_id;

        if( _this.ui.find('#anno-user-'+ user_id ).length == 0) {

            _this.ui.find('.anno-users ul').append('<li id="anno-user-'
            + user_id + '"><input type="checkbox" checked data-search="user-' + user_id + '"/><img class="gravatar" src="'+ gravatar +'" alt=""/><span>user_' + user_id + '</span></li>');

            $('#anno-user-' + user_id).find('input[type=checkbox]').click(_this.refreshHighLights);
        }
        var tags = annotation.tags;

        if ( tags != null ) {
            for (var i = 0; i < tags.length; i++) {
                var tagName = tags[i];
                var tagId = 'anno-tag-' + tagName;

                if(_this.ui.find('#' + tagId ).length == 0) {

                    _this.ui.find('.anno-tags ul').append('<li id="'
                    + tagId + '"><input type="checkbox" checked data-search="tag-' + tagName + '"/><span>' + tagName + '</span></li>');

                }

                $('#' + tagId).find('input[type=checkbox]').click(_this.refreshHighLights);
            }
        }


    };

    this.updateViewer = function(field, annotation) {
        $(field).addClass('annotator-user').html('<strong>Creator: </strong><span>user_' + annotation.user.id.toString() + '</span>');
        return field;
    };



    return {
        pluginInit: function () {
            _this.annotator = this.annotator;
            _this.insertPanelUI();
            this.annotator
                .subscribe("annotationsLoaded", function (annotations) {
                    for(var i = 0 ; i < annotations.length; i++) {
                        if(_this.data.indexOf(annotations[i]) == -1)
                            _this.data.push(annotations[i]);
                        _this.addReference(annotations[i]);

                    }
                })
                .subscribe("annotationCreated", function (annotation) {
                    if(_this.data.indexOf(annotation) == -1)
                        _this.data.push(annotation);
                    _this.addReference(annotation);

                })
                .subscribe("annotationUpdated", function (annotation) {
                    _this.addReference(annotation);
                })
                .subscribe("annotationDeleted", function (annotation) {
                    console.log(_this.data.length);
                    var index = $.inArray(annotation, _this.data);
                    if( ~index )
                        _this.data.splice(index, 1);
                    console.log(_this.data.length);
                });

            this.annotator.viewer.addField({
                load: _this.updateViewer
            });



        }
    }
};
