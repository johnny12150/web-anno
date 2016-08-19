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
    this.inEdit = false; // adder.click => true , editor.hide() =>false
    this.inselection = false;
    this.Xpath = "";
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
    this.initimgsetting  =function(){
        if(scope.inEdit == false)
            {
            scope.target = null;
                scope.x = 0 ;
                scope.y =0 ;
                scope.endx = 0;
                scope.endy = 0 ;
            for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                clear(document.getElementsByClassName("annoitem select")[i]);
            }
        }
        $(".annotator-adder").css('left',0).css('top',0).hide();
    }
    this.addHook = function() {
        /*當離開圖片時  初始化沒使用的值*/
        $('.annotator-wrapper')
            .on('mousemove', function(e) {

                if(scope.getSelectionText() == '') {
                    var curX = e.pageX;
                    var curY = e.pageY;
                    var target = $(scope.target);
                    if (scope.target != null && !(scope.target != null && (curX >= target.offset().left && curX <= target.offset().left + target.width() && curY >= target.offset().top && curY <= target.offset().top + target.height()))) {

                        scope.initimgsetting();
                    }
                }
        });
    function getxpath(elem,relativeRoot) {
        var idx, path, tagName;
        path = '';
        while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
            tagName = elem.tagName.replace(":", "\\:");
            idx = $(elem.parentNode).children(tagName).index(elem) + 1;
            idx = "[" + idx + "]";
            path = "/" + elem.tagName.toLowerCase() + idx + path;
            elem = elem.parentNode;
        }
        return path;
    };   
        /*圖片hook,將網頁要使用註記範圍時，對圖片作控制，產生兩個canvas以及一些控制的事件*/

    $(window).resize(function(e){
         var canvas = $(_element).find('canvas');        
        for (var i = 0 ;i< canvas.length; i++)
        {
            canvas[i].width = canvas[i].parentElement.children[0].width;
            canvas[i].height = canvas[i].parentElement.children[0].height;
        }
    })
    var img = $(_element).find('img');        
        var state = false //紀錄範圍有沒有使用
        for (var i = 0; i < img.length; i++) {
            $(img[i]).wrap("<div class='annotationlayer' style='position:relative;'></div>");
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
                e.preventDefault();
                if(scope.inselection == false && scope.getSelectionText() == ''){
                    scope.x = e.offsetX;
                    scope.y = e.offsetY;
                    scope.inselection = true;
                    var range = document.createRange();
                    range.selectNodeContents(this);
                    scope.Xpath = getxpath(range.startContainer.parentElement,document.getElementsByClassName("annotator-wrapper")[0]);
              
                }
                
            });
            $(img[i].parentElement.children[2]).mouseleave(function(e) {
                $(e.target.parentElement.children[1]).attr("class", "annoitem-unfocus draw");
            });
            $(img[i].parentElement.children[2]).mouseenter(function(e) {
                $(e.target.parentElement.children[1]).attr("class", "annoitem-focus draw");
                if(scope.getSelectionText() != '')
                {
                    $(".annotator-adder").hide();
                    window.getSelection().removeAllRanges();
                   
                }
            });
            $(img[i].parentElement.children[2]).click(function(e) {
                /*show annotations on panel*/
                $('.annotator-hl-focus').removeClass('annotator-hl-focus');
                $('.anno-panel').stop().animate({
                    'right': '0px'
                }, 1000, 'linear');
                $(".btn-appear").stop().animate({
                    'right': '300px'
                }, 1000, 'linear');

                $(".btn-appear").html('<i class="fa fa-chevron-right " aria-hidden="true"></i>');
         
                   
                if(scope.show.length != 0 )
                    showAnnoOnpanel(scope.show,e.target);
                else 
                    $('.panel-annolist').click();
                
                if(scope.getSelectionText() != '')
                {
                    $(".annotator-adder").hide();
                    window.getSelection().removeAllRanges();
               
                }
                if(scope.endx -scope.x <10)
                    scope.initimgsetting();
            });
            
            $(img[i].parentElement.children[2]).mousemove(function(e) {
                /*顯示adder位置，這裡有BUG(因為照理說adder顯示應該在mouseup上面，可是使用mouseup時，adder不知為啥會消失，所以暫時寫在mousemove事件*/
               
                scope.show = [];
                if(scope.x > 0 && scope.y >0 && scope.endx > 0 &&scope.endy > 0 )
                    $('.annotator-adder')
                        .removeClass('annotator-hide')
                        .show();
                /*當選取範圍時,紀錄暫時終點並且先讓顯示DIV消失，避免接觸到新的DIV所產生的問題*/
                if (scope.inselection == true) {
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
                if (scope.inselection == false) {
                    var temp = ","; //文字比較法
                    var near = 10000;
                    var w_ratio = this.parentElement.children[0].width / 100;
                    var h_ratio = this.parentElement.children[0].height / 100
                    if (annotation.length > 0) {
                        for (var i in annotation) {
                            if (e.offsetX >= annotation[i].position.x *w_ratio &&
                             e.offsetY >= parseInt(annotation[i].position.y*h_ratio) &&
                             e.offsetX <= (parseInt(annotation[i].position.x) + parseInt(annotation[i].position.width)) * w_ratio &&
                             e.offsetY <= (parseInt(annotation[i].position.y) + parseInt(annotation[i].position.height))*h_ratio)
                              {
                                var anno_center = (parseInt(annotation[i].position.x *w_ratio) + parseInt(annotation[i].position.y*h_ratio) + parseInt(annotation[i].position.width *w_ratio) + parseInt(annotation[i].position.height*h_ratio)) / 4;
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
                            strokeStyle = "blue";
                            if ($.inArray(annotation[i], scope.show) == -1)
                                scope.show.push(annotation[i]);
                        }
                        show(this.parentElement.children[0], annotation[i].position, strokeStyle);
                    }
                }
            });
            /*紀錄選取範圍終點，並且控制adder顯示位置*/
            $(img[i].parentElement.children[2]).mouseup(function(e) {
                e.preventDefault();
                if(scope.inselection == true && scope.getSelectionText() == ''){
                    scope.endx = e.offsetX;
                    scope.endy = e.offsetY;
                    scope.inselection = false;
                    var img = e.target.parentElement.children[0];
                    flipCoords(scope.x, scope.y, scope.endx, scope.endy);
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

    function showAnnoOnpanel(annotations) {
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
                '<p><b>註記建立者:' + annotation.user.name + '</b></p>');


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
                        if (likes[i].like == "-1"){
                            $("#anno-dislike-" + likes[i].bg_id).css({ 'color': "red" });
                            $("#anno-dislike-" + likes[i].bg_id).addClass('click');
                        }
                        else if (likes[i].like == "1"){
                            $("#anno-like-" + likes[i].bg_id).css({ 'color': "blue" });
                            $("#anno-like-" + likes[i].bg_id).addClass('click');
                        }
                    }
                }
            }
            $('.anno-body #anno-info-id' + annotation.id).append(
                '<a class="anno-collect fa fa-diamond" data-id=' + annotation.id + '>' + collect_text + '</a>' +
                '<a class="anno-reply fa fa-comment" data-id=' + annotation.id + '>回覆</a>'
            );
        }


    };
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
        ctx.rect(position.x /100 * element.width , position.y /100 *element.height, position.width /100 *element.width, position.height /100 *element.height);
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


        $(".anno-lists").append('<li id="anno-info-id' + annotation.id + '" class="anno-infos-item" style="z-index:50">' +
                '<p><b>註記建立者:' + annotation.user.name + '</b></p>');

        var tags = "";
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
             $('.anno-lists #anno-info-id' + annotation.id).append('<div class = "anno-body-item">' +
                    '<a href=manage/' + annotation.user.name + ' class="anno-user-name">' + annotation.user.name + '</a>' +
                    '<span class="anno-body-time">' + annotation.created_at + '</span>' 
                       );
        }
        $('.anno-lists #anno-info-id' + annotation.id).append('<div ><a style="text-align:right">readmore</a></div>');
        var scrollTop;
        var img1 =  $(_element).find('img');
        var img
        for (var i = 0 ;i< img1.length ; i++){
            var range = document.createRange();
            range.selectNodeContents(img1[i]);
            var Xpath = getxpath(range.startContainer.parentElement,document.getElementsByClassName("annotator-wrapper")[0]);
            if(Xpath == annotation.Xpath){
            scrollTop = $(img1[i]).offset().top;
            img =img1[i];
            }
        }
        $('#anno-info-id' + annotation.id).mouseenter(function() {
            if (annotation.type == "image") {
                $(img.parentElement.children[1]).attr("class", "annoitem-focus draw");
                show(img, annotation.position, "blue");
            }
        });
        $('#anno-info-id' + annotation.id).mouseleave(function() {
            if (annotation.type == "image") {
                scope.reshow(img);
                $(img.parentElement.children[1]).attr("class", "annoitem-unfocus draw");
            }
        });
        $('#anno-info-id' + annotation.id).click(function() {
            if (annotation.type == "image")
                show(img, annotation.position, "blue");
            $('html,body').animate({ scrollTop: scrollTop - 100 }, 800);
            showAnnoOnpanel(new Array(annotation));
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
        var img =  $(_element).find('img');

        for (var i = 0 ;i< img.length ; i++){
            var range = document.createRange();
            range.selectNodeContents(img[i]);
            var Xpath = getxpath(range.startContainer.parentElement,document.getElementsByClassName("annotator-wrapper")[0]);
            if(Xpath == annotation.Xpath)
            {
                var annotations = getImgAnnotation(img[i]);
                annotations.push(annotation);
                $(img[i]).data('annotation', annotations);
                show(img[i], annotation.position, "#FFFFFF");
            }
        }
      
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
                      
                        var img = scope.target.parentElement.children[0];
                        annotation.Xpath = scope.Xpath;
                        annotation.position = {
                            x: scope.x / img.width*100,
                            y: scope.y / img.height*100,
                            width: (scope.endx - scope.x)/img.width*100,
                            height:(scope.endy - scope.y) /img.height*100,
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
                     scope.initimgsetting();
                    for (var i = 0; i < annotations.length; i++) {
                        var annotation = annotations[i];
                       
                        if (annotation.type == 'image') {
                            scope.annoinfos(annotation);
                            now = annotation.id;
                            scope.addImgAnnotation(annotation);

                        }
                    }
                })
                .subscribe("annotationEditorHidden", function(editor) {
                    for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                        clear(document.getElementsByClassName("annoitem select")[i]);
                        $(".annotator-adder").hide();

                    }
                    if(scope.inEdit ==true)
                    scope.inEdit =false ;

                }).subscribe("annotationViewerShown", function(editor) {
                    for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                        clear(document.getElementsByClassName("annoitem select")[i]);
                        
                    }


                });
        }
    }
}
