/**
 * Created by flyx on 7/22/15.
 */
Annotator.Plugin.ImageAnnotation = function (element, settings) {

    var scope = this;
    var _element = element;
    this.template = '';
    this.target = null;
    this.x = 0;
    this.y = 0;
    this.inEdit = false;

    this.init = function() {
        $('.annotator-wrapper')
            .append($('<div>').attr('id','img-anno-list'));

    };

    this.getSelectionText = function(){
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };

    this.imageHoverListener = function(e) {
        if( scope.getSelectionText() == '') {
            scope.target = e.currentTarget;
            var offset = $('.annotator-wrapper').offset();
            var curX = e.pageX - offset.left;
            var curY = e.pageY - offset.top + 25;

            var editor = $('.annotator-editor');
            if (editor.css('display') == 'none'
                || editor.hasClass('annotator-hide')) {
                $('.annotator-adder')
                    .css('left', curX)
                    .css('top', curY)
                    .removeClass('annotator-hide')
                    .show();

            }

            if(!scope.inEdit) {
                scope.target = e.currentTarget;
                scope.x = e.pageX - $(scope.target).offset().left;
                scope.y = e.pageY - $(scope.target).offset().top;
            }


        }

    };

    this.imageInListener = function(e) {
        //滑鼠在圖片上時，是否要更新 adder 的座標
        if(scope.getSelectionText() == '' && !scope.inEdit) {
            scope.target = e.currentTarget;
            scope.x = e.pageX - $(scope.target).offset().left;
            scope.y = e.pageY - $(scope.target).offset().top;
        }
    };

    this.addHook = function() {

        $('.annotator-wrapper')
            .on('mousemove', function (e) {

                if( scope.getSelectionText() == '') {
                    var curX = e.pageX ;
                    var curY = e.pageY ;
                    var target = $(scope.target);
                    if (  scope.target != null
                        && !(scope.target != null
                        && ( curX >= target.offset().left
                        && curX <= target.offset().left + target.width()
                        && curY >= target.offset().top
                        && curY <= target.offset().top + target.height() ))) {

                        $('.annotator-adder').hide();

                    }
                }
            });

        //圖片hook
        $(_element)
            .find('img')
            .on('mousemove', this.imageHoverListener)
            .on('mouseenter', this.imageInListener);


        $('.annotator-adder')
            .on('click', function (e) {
                var offset = $('.annotator-wrapper').offset();
                var curX = e.pageX - offset.left;
                var curY = e.pageY - offset.top + 15;

                if(scope.getSelectionText() == '') {
                    scope.inEdit = true;
                    $('.annotator-editor')
                        .css('left', curX)
                        .css('top', curY)
                        .removeClass('annotator-hide')
                        .show();
                }
            });

        $('#cancel')
            .on('click', function(e) {
                scope.inEdit = false;
            });

        $(_element)
            .on('mouseover', '.anno-img-item', function(e) {
                $('.annotator-adder').hide();
            });
    };




    return {
        pluginInit: function () {

            scope.init();
            scope.addHook();

            this.annotator
                .subscribe("annotationCreated", function (annotation) {
                    if( scope.target != null ) {
                        annotation.type = 'image';
                        annotation.src = scope.target.src;
                        annotation.position = {
                            x: scope.x,
                            y: scope.y
                        };
                        if(annotation.type == 'image') {
                            var origin = $(".annotator-wrapper img[src='"+annotation.src+"']").position();
                            var x = parseInt(origin.left) + parseInt(annotation.position.x);
                            var y = parseInt(origin.top) + parseInt(annotation.position.y);
                            $('#img-anno-list')
                                .append($('<div>')
                                    .attr('id','img-anno-' + annotation.id)
                                    .addClass('fa').addClass('fa-chevron-circle-down')
                                    .addClass('fa-2x').addClass('annotator-hl').addClass('img-anno-item')
                                    .css({
                                        'position' :'absoulte',
                                        'z-index' : '999',
                                        'left' : x + 'px',
                                        'top' : y + 'px'
                                    }));

                            $('#img-anno-' + annotation.id)
                                .data('annotation', annotation);
                        }
                    }
                }).subscribe("annotationDeleted", function (annotation) {

                    if(annotation.type == 'image') {
                        $('#img-anno-' + annotation.id).remove();
                    }
                })
                .subscribe("annotationsLoaded", function (annotations) {
                    for(var i = 0 ; i < annotations.length; i++) {
                        var annotation = annotations[i];
                        if(annotation.type == 'image') {
                            var origin = $(".annotator-wrapper img[src='"+annotation.src+"']").position();
                            var x = parseInt(origin.left) + parseInt(annotation.position.x);
                            var y = parseInt(origin.top) + parseInt(annotation.position.y);
                            $('#img-anno-list')
                                .append($('<div>')
                                    .attr('id'+ 'img-anno-' + annotation.id)
                                    .addClass('fa').addClass('fa-chevron-circle-down').addClass('fa-2x')
                                    .addClass('annotator-hl').addClass('img-anno-item')
                                    .css( {
                                        'position' :'absoulte',
                                        'z-index' : '999',
                                        'left' : x + 'px',
                                        'top' : y + 'px'
                                    }));
                            $('#img-anno-' + annotation.id)
                                .data('annotation', annotation);
                        }
                    }
                });
        }
    }
}
