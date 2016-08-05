/**
 * Created by flyx on 7/22/15.
 */
Annotator.Plugin.ImageAnnotation = function(element, settings) {

    var scope = this;
    var _element = element;
    this.template = '';
    this.target = null;
    this.x = 0;
    this.y = 0;
    this.endx = 0;
    this.endy = 0;
    this.show = [];
    this.inEdit = false;
    this.annotator = $(element).annotator().data('annotator');
    this.init = function() {
        $('.annotator-wrapper') //可使用Annotator的element範圍
            .append($('<div>').attr('id', 'img-anno-list'));

    };
    /* 判斷選取的是否回字串*/
    this.getSelectionText = function() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };
    this.addHook = function() {
        /*網頁要使用註記範圍時*/
        $('.annotator-wrapper')
            .on('mousemove', function(e) {

                if (scope.getSelectionText() == '') {
                    var curX = e.pageX;
                    var curY = e.pageY;
                    var target = $(scope.target);
                    if (scope.target != null && !(scope.target != null && (curX >= target.offset().left && curX <= target.offset().left + target.width() && curY >= target.offset().top && curY <= target.offset().top + target.height()))) {

                        $('.annotator-adder').hide();

                    }
                }
            });

        /*圖片hook,將網頁要使用註記範圍時，對圖片作控制，產生兩個canvas以及一些控制的事件*/
        var img = $(_element).find('img');
        var edit = false;
        for (var i = 0; i < img.length; i++) {
            $(img[i]).attr("id", img[i].src);
            $(img[i]).wrap("<div class='annotationlayer' style='position:relative;display: inline-block;'></div>");
            $(img[i].parentElement)
                .append("<canvas  class ='annoitem-unfocus draw' style='position:absolute;top:0;left:0;'" +
                    "width='" + img[i].width + "' " +
                    "height='" + img[i].height + "'" +
                    "></canvas>")
                .append("<canvas class ='annoitem select' style='position:absolute;top:0;left:0;'" +
                    "width='" + img[i].width + "' " +
                    "height='" + img[i].height + "'" +
                    "></canvas>");
            /*當選取範圍時，紀錄選取範圍起始點*/
            $(img[i].parentElement.children[2]).mousedown(function(e) {
                scope.x = e.offsetX;
                scope.y = e.offsetY;
                edit = true;
            });
            $(img[i].parentElement.children[2]).mouseleave(function(e) {

                $(e.target.parentElement.children[1]).attr("class", "annoitem-unfocus draw");

            });
            $(img[i].parentElement.children[2]).mouseenter(function(e) {
                $(e.target.parentElement.children[1]).attr("class", "annoitem-focus draw");
            });
            $(img[i].parentElement.children[2]).click(function(e) {
                scope.showAnnoOnpanel(scope.show);
            });
            $(img[i].parentElement.children[2]).dblclick(function(e) {
                e.preventdefault();
            });
            $(img[i].parentElement.children[2]).mousemove(function(e) {
                /*顯示adder位置，這裡有BUG(因為照理說adder顯示應該在mouseup上面，可是使用mouseup時，adder不知為啥會消失，所以暫時寫在mousemove事件*/
                scope.show = [];
                $('.annotator-adder')
                    .removeClass('annotator-hide')
                    .show();
                /*當選取範圍時,紀錄暫時終點並且先讓顯示DIV消失，避免接觸到新的DIV所產生的問題*/
                if (edit == true) {
                    scope.endx = e.offsetX;
                    scope.endy = e.offsetY;
                    $("#img-anno-list").css("display", "none");
                    clear(this.parentElement.children[0]); //清除所有在canvas_select的繪畫。
                    select(this.parentElement.children[0]); //繪製CANVAS在canvas_select上面

                }
                /*當選取範圍結束時，則讓img-anno-list顯示，讓使用者觀看註解*/
                else {
                    $("#img-anno-list").css("display", "block");
                }

                /*處理MOUSE在canvas上的事件，顯示所在的註記*/
                var annotation = getImgAnnotation(this.parentElement.children[0]);
                if (edit == false) {

                    var temp = ","; //文字比較法
                    var near = 10000;
                    if (annotation.length > 0) {
                        for (var i in annotation) {
                            if (e.offsetX >= annotation[i].position.x && e.offsetY >= parseInt(annotation[i].position.y) && e.offsetX <= parseInt(annotation[i].position.x) + parseInt(annotation[i].position.width) && e.offsetY <= parseInt(annotation[i].position.y) + parseInt(annotation[i].position.height)) {
                                var anno_center = (parseInt(annotation[i].position.x) + parseInt(annotation[i].position.y) + parseInt(annotation[i].position.width) + parseInt(annotation[i].position.height)) / 4;
                                if (anno_center < near) {
                                    near = anno_center;
                                    temp = i;
                                }

                            }

                        }
                    }

                    for (var i in annotation) {
                        var strokeStyle = "#FFFFFF";
                        if (temp.indexOf(i) > -1) {
                            strokeStyle = "#FFFF77";
                            if ($.inArray(annotation[i], scope.show) == -1)
                                scope.show.push(annotation[i]);
                        }

                        /*if (scope.show.length > 0 && edit == false) {
                              
                                    // scope.showAnnoOnpanel(scope.show);                            
                        } else {
                            $('.annotator-viewer').addClass('annotator-hide');
                        }*/

                        show(this.parentElement.children[0], annotation[i].position, strokeStyle);
                    }
                }
            });
            /*紀錄選取範圍終點，並且控制adder顯示位置*/
            $(img[i].parentElement.children[2]).mouseup(function(e) {
                scope.endx = e.offsetX;
                scope.endy = e.offsetY;
                var img = e.target.parentElement.children[0];
                flipCoords(scope.x, scope.y, scope.endx, scope.endy);

                edit = false;
                if (scope.getSelectionText() == '' && scope.endx - scope.x > 10 && scope.endy - scope.y > 10) {
                    scope.target = e.currentTarget;
                    var offset = $('.annotator-wrapper').offset();

                    var editor = $('.annotator-editor');
                    if (editor.css('display') == 'none' || editor.hasClass('annotator-hide')) {
                        $('.annotator-adder')
                            .css('left', $(img).offset().left + scope.endx - offset.left)
                            .css('top', $(img).offset().top + scope.endy - offset.top);


                    }
                }


            });



        }

        /*adder點選事件
            1、出現Editor
            2、設定出現位置*/
        $('.annotator-adder')
            .on('click', function(e) {
                var offset = $('.annotator-wrapper').offset();
                var curX = e.pageX - offset.left;
                var curY = e.pageY - offset.top + 15;

                if (scope.getSelectionText() == '') {
                    scope.inEdit = true;
                    $('.annotator-editor')
                        .css('left', curX)
                        .css('top', curY)
                        .removeClass('annotator-hide')
                        .show();
                }
            });
    };

    /*function selelct 跟 clear 功能為拉取註記選擇範圍
    對象為 canvas's select 暫時的canvas*/
    function select(element) {
        var c1 = element.parentElement.children[2];
        var ctx = c1.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.clearRect(0, 0, c1.width, c1.height);
        ctx.rect(scope.x, scope.y, scope.endx - scope.x, scope.endy - scope.y);
        ctx.stroke();
    };
    this.showAnnoOnpanel = function(annotations) {
        var id = [];
        var collect_text = "收藏";
        $('.anno-body').html('');
        $('.panel-message').click();

        for (var i in annotations) {
            var annotation = annotations[i];

            /*$.post('api/checkcollect',{anno_id : annotation.id, anno_token :settings.anno_token ,domain: settings.domain })
            .success(function(data){
                if(data == "true")
                collect_text="取消收藏";
            }); 
            */
            $('.anno-body').append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
                '<p><b>annotation_id' + annotation.id + '</b></p>');

            for (var j = 0; j < annotation.otherbodys.length; j++) {

                var tags = "";

                for (var i = 0; i <= annotation.otherbodys[j].tags.length - 1; i++) {
                    tags += '<span class="anno-body-tag">' + annotation.otherbodys[j].tags[i] + ' </span>';
                }

                id.push(annotation.otherbodys[j].bid);
                $('.anno-body #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[j].bid + '" class = "anno-body-item">' +
                    '<a href=manage/' + annotation.otherbodys[j].creator + ' class="anno-user-name">' + annotation.otherbodys[j].creator + '</a>' +
                    '<span class="anno-body-time">' + annotation.otherbodys[j].created_time + '</span>' +
                    '<div class="anno-body-text">' + annotation.otherbodys[j].text[0] + '</div>' +
                    tags +
                    '<p><b><strong>評分:</strong>' +
                    '<span class="annotator-likes">' +
                    '<span class="annotator-likes-total">' + annotation.otherbodys[j].like + '</span>' +
                    '<a href="#" id="anno-like-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '" class="anno-like fa fa-thumbs-up"></a>' +
                    '<a href="#" id="anno-dislike-' + annotation.otherbodys[j].bid + '"data-bid="' + annotation.otherbodys[j].bid + '" class="anno-dislike fa fa-thumbs-down" ></a>' +
                    '</span></b></p>'
                );
                if ($(_element).data('annotator-user') != undefined)
                    if ($(_element).data('annotator-user').name == annotation.otherbodys[j].creator) {
                        $('.anno-body  #anno-body' + annotation.otherbodys[j].bid).append('<span class="annotator-controls">' +
                            '<a class="anno-body-edit fa fa-pencil-square-o" style="background-position: 0 -60px;"data-id=' + annotation.otherbodys[j].bid + '></a>' +
                            '<a class="anno-body-delete fa fa-times" style="background-position: 0 -75px;" data-id=' + annotation.otherbodys[j].bid + '></a></span></div>');
                    }
            }

            if ($(_element).data('annotator-user') != undefined) {
                var likes = $(_element).data('annotator-user').like
                for (var i in likes) {
                    if (id.indexOf(likes[i].bg_id) != -1) {
                        if (likes[i].like == "-1")
                            $("#anno-dislike-" + likes[i].bg_id).css({ 'color': "red" });
                        else if (likes[i].like == "1")
                            $("#anno-like-" + likes[i].bg_id).css({ 'color': "blue" });
                    }
                }
            }
            $('.anno-body #anno-info-id' + annotation.id).append(
                '<a class="anno-collect fa fa-diamond" data-id=' + annotation.id + '>' + collect_text + '</a>' +
                '<a class="anno-reply fa fa-comment" data-id=' + annotation.id + '>回覆</a>'
            );
        }


    }

    function clear(element) {
        var c1 = element.parentElement.children[2];
        var ctx = c1.getContext("2d");
        ctx.clearRect(0, 0, c1.width, c1.height);
    };
    /*繪製註記範圍在canvas's draw之上*/
    function show(element, position, strokeStyle) {
        var c = element.parentElement.children[1];
        var ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.rect(position.x, position.y, position.width, position.height);
        ctx.stroke();
    };
    /*重新繪製*/
    this.reshow = function(element) {
        var c1 = element.parentElement.children[1];
        var ctx = c1.getContext("2d");
        ctx.clearRect(0, 0, c1.width, c1.height);
        if ($(element).data("annotation") !== undefined) {
            var annotation = $(element).data("annotation");
            for (var i in annotation)
                show(element, annotation[i].position, "#FFFFFF");
        }

    };

    this.annoinfos = function(annotation) {

        $(".anno-lists").html();
        $(".anno-lists").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50"></li>');


        var tags = "";
        console.log(annotation.otherbodys.length );
        if (annotation.otherbodys.length > 0) {
            for (var i = 0; i <= annotation.otherbodys[0].tags.length - 1; i++) {
                tags += '<span class="anno-body-tag">' + annotation.otherbodys[0].tags[i] + ' </span>';
            }

            $('.anno-lists #anno-info-id' + annotation.id).append('<div id ="anno-body' + annotation.otherbodys[0].bid + '" class = "anno-body-item">' +
                '<a href=manage/' + annotation.otherbodys[0].creator + ' class="anno-user-name">' + annotation.otherbodys[0].creator + '</a>' +
                '<span class="anno-body-time">' + annotation.otherbodys[0].created_time + '</span>' +
                '<div class="anno-body-text">' + annotation.otherbodys[0].text[0] + '</div>' +
                tags);
        }
        else{
             $('.anno-lists #anno-info-id' + annotation.id).append('<p>hightlight</p>');
        }
        var hl = $('.annotator-hl');
        var scrollTop;
        var annotatorhl;
        var img;
        for (var i in hl) {
            if (hl[i].innerHTML == annotation.quote) {
                scrollTop = $(hl[i]).offset().top;
                annotatorhl = $(hl[i]);
            }
        }

        var img1 = $(document).find('img');
        for (var i = 0 in img1) {
            if (img1[i].src == annotation.src && annotation.type == "image")
                img = img1[i];
        }

        $('#anno-info-id' + annotation.id).mouseenter(function() {
            $(annotatorhl).addClass('annotator-hl-focus');
            if (annotation.type == "image") {
                $(img.parentElement.children[1]).attr("class", "annoitem-focus draw");
                show(img, annotation.position, "blue");
            }


        });
        $('#anno-info-id' + annotation.id).mouseleave(function() {
            $(annotatorhl).removeClass('annotator-hl-focus');
            if (annotation.type == "image") {
                scope.reshow(img);
                $(img.parentElement.children[1]).attr("class", "annoitem-unfocus draw");
            }
        });
        $('#anno-info-id' + annotation.id).click(function() {
            if (annotation.type == "image")
                show(img, annotation.position, "blue");
            $('html,body').animate({ scrollTop: scrollTop - 100 }, 800);

        });

    };

    function flipCoords(x1, y1, x2, y2) {
        var xa = x1,
            xb = x2,
            ya = y1,
            yb = y2;
        if (x2 < x1) {
            xa = x2;
            xb = x1;
        }
        if (y2 < y1) {
            ya = y2;
            yb = y1;
        }
        scope.x = xa;
        scope.endx = xb;
        scope.y = ya;
        scope.endy = yb;
        return [xa, ya, xb, yb];
    }

    /*取得圖片上的註記*/
    function getImgAnnotation(element) {
        return $(element).data("annotation") !== undefined ? $(element).data("annotation") : [];
    }
    /*當Annotation 執行Delete時，將所屬圖片上把該資料刪除，並且重繪*/
    this.deleteAnnotation = function(annotation) {
        var img = document.getElementById(annotation.src);
        var annotations = getImgAnnotation(img);
        var index = $.inArray(annotation, annotations);
        if (index != -1) {
            $(img).data("annotation").splice(index, 1);
            scope.reshow(img);
        };

    };
    /*當Annotation 執行load或是created時，將資料存在所屬的圖片中，並且顯示在canvas上*/
    this.addImgAnnotation = function(annotation) {
        var img = document.getElementById(annotation.src);
        var annotations = getImgAnnotation(img);
        annotations.push(annotation);
        $(img).data('annotation', annotations);
        show(img, annotation.position, "#FFFFFF");
    };

    /*當panel checkbox執行時，先去除圖片element所有關於
    annotation註記，並且重繪*/
    this.initImgAnnotation = function() {

        var img1 = $(_element).find('img');
        for (var i = 0; i < img1.length; i++) {
            $(img1[i]).removeData("annotation");
            scope.reshow($(img1)[i]);
        }
    };




    var now; //追蹤目前annotation最高的ID
    return {
        pluginInit: function() {

            scope.init();
            scope.addHook();

            this.annotator
                .subscribe("annotationCreated", function(annotation) {
                    if (scope.target != null) {
                        annotation.type = 'image';
                        annotation.src = scope.target.parentElement.children[0].src;
                        annotation.position = {
                            x: scope.x,
                            y: scope.y,
                            width: scope.endx - scope.x,
                            height: scope.endy - scope.y
                        };
                        scope.addImgAnnotation(annotation);
                        scope.target = null;
                    }


                }).subscribe("annotationDeleted", function(annotation) {
                    if (annotation.type == 'image') {
                        $('#img-anno-' + annotation.id).remove();
                    }
                    scope.deleteAnnotation(annotation);
                })
                .subscribe("annotationsLoaded", function(annotations) {
                    $('.anno-lists').empty();
                    scope.initImgAnnotation();

                    for (var i = 0; i < annotations.length; i++) {
                        var annotation = annotations[i];
                        scope.annoinfos(annotation);
                        if (annotation.type == 'image') {


                            now = annotation.id;
                            scope.addImgAnnotation(annotation);

                        }
                    }
                })
                .subscribe("annotationEditorHidden", function(editor) {
                    for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                        clear(document.getElementsByClassName("annoitem select")[i]);
                        $(".annotator-adder").css("left", 10000)
                            .css("top", 10000);
                    }


                }).subscribe("annotationViewerShown", function(editor) {
                    for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                        clear(document.getElementsByClassName("annoitem select")[i]);
                        $(".annotator-adder").css("left", 10000)
                            .css("top", 10000);
                    }


                }).subscribe('annotationViewerShown', function(viewer, annotations) {

                    $(document).on('click', '.annotator-hl', function(e) {
                        $(e.target).css('backgroung-color', '#99BBFF');
                        scope.showAnnoOnpanel(annotations);
                    });

                });
        }
    }
}
