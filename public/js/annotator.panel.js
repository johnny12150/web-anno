/**
 * 顯示Annotation的插件
 */
var x =  0;
Annotator.Plugin.ViewPanel = function (element, settings) {

    this.users = [];

    this.insertPanelUI = function() {
        $('body').append('<div id="anno_panel">'
                        + '</div>');
    };

    this.addReference = function(annotation) {

        console.log(annotation);

        for( var i = 0 ; i < annotation.highlights.length ;i++) {
            if(annotation.id == null)
                annotation.id = Math.floor(Math.random()*100000).toString() + "_t";
            var id = annotation.id + "_" + i.toString();

            var ui = '<div class="anno_ref" id="anno_ref_' + id +'">'
                + '<div class="text">'
                + annotation.text
                + '</div>'
                + '<div class="quote">'
                + annotation.quote
                + '</div>'
                + '<div class="tags">'
                + '</div>'
                + '</div>';

            var tags = annotation.tags;
            $('#anno_panel').append(ui);

            var ref_element = $('#anno_ref_' + id);
            ref_element.attr('data-ref',"anno_" + id);

            annotation.highlights[i].id = "anno_" + id;

            ref_element.click(function(e){
                var element = $(e.currentTarget);
                var target = $('#' + element.attr('data-ref'));

                $('html, body').animate({
                    scrollTop: target.offset().top - 30
                }, 500);

            }).mouseover(function(e) {

                var element = $(e.currentTarget);
                var target = $('#' + element.attr('data-ref'));

                target.addClass('anno-hl');

            }).mouseout(function(){

                $('.anno-hl').removeClass('anno-hl');

            });
        }

        if ( tags != null ) {
            for (var i = 0; i < tags.length; i++) {
                ref_element.find('.tags').append('<span>' + tags[i] + '</span>')
            }
        }
    };

    this.updateViewer = function(field, annotation) {
        $(field).addClass('annotator-user').html('<strong>Creator: </strong><span>user_' + annotation.user.id.toString() + '</span>');
        return field;
    };

    var _this = this;

    return {
        pluginInit: function () {

            _this.insertPanelUI();
            this.annotator
                .subscribe("annotationsLoaded", function (annotations) {
                    for(var i = 0 ; i < annotations.length; i++) {
                        _this.addReference(annotations[i]);
                    }
                })
                .subscribe("annotationCreated", function (annotation) {
                    console.log(annotation);
                    _this.addReference(annotation);
                })
                .subscribe("annotationUpdated", function (annotation) {
                    _this.addReference(annotation);
                })
                .subscribe("annotationDeleted", function (annotation) {
                    _this.addReference(annotation);
                });

            this.annotator.viewer.addField({
                load: _this.updateViewer
            });



        }
    }
};
