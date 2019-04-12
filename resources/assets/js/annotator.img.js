/**
 * Created by flyx on 7/22/15.
 */
Annotator.Plugin.ImageAnnotation = function(element, settings) {

    var scope = this;
    var _element = element;
    this.posturl = 'http://' + settings.server + '/api/checkcollect';
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

    /* 判斷選取的是否回字串
     *return text 滑鼠反白的字串
     */
    this.getSelectionText = function() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };
    /*初始化圖片註記之值*/
    this.initimgsetting = function() {
        if (scope.inEdit == false) {
            scope.target = null;
            scope.x = 0;
            scope.y = 0;
            scope.endx = 0;
            scope.endy = 0;
            for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                clear(document.getElementsByClassName("annoitem select")[i]);
            }
        }

        $(".annotator-adder").css('left', 0).css('top', 0).hide();
    }

    this.addHook = function() {
        $('.annotator-wrapper')
            .on('mousemove', function(e) {
                if (scope.getSelectionText() == '') {
                    var curX = e.pageX;
                    var curY = e.pageY;
                    var target = $(scope.target);
                    if (scope.target != null && !(scope.target != null && (curX >= target.offset().left && curX <= target.offset().left + target.width() && curY >= target.offset().top && curY <= target.offset().top + target.height()))) {
                        scope.initimgsetting();
                    }
                }
            });
    }
    /*取得節點相對應的XPath
     *@elem   html element
     *@root   搜尋的根元素  
     */
    function getxpath(elem, relativeRoot) {
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
    $(window).resize(function(e) {
        var canvas = $(_element).find('canvas');
        for (var i = 0; i < canvas.length; i++) {
            canvas[i].width = canvas[i].parentElement.children[0].width;
            canvas[i].height = canvas[i].parentElement.children[0].height;
        }
    });

    function hyperlink_prevent() {
        var a = $(_element).find('a');

        $(a).bind('click', function(event) {
            if (event.target.nodeName == "CANVAS")
                event.preventDefault();
        });
    }


    function CanvasInit() {
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
            if (img[i].parentElement.parentElement.nodeName == 'A') {
                $(img[i].parentElement)
                    .append('<a href style="position:absolute;top:5px;left:5px;display:none;color:#FF1493;" title =""><div style="position:relative;width:20px;height:20px;" ><i class="fa fa-link" style="font-size:18px"; aria-hidden="true"></i></div></a>');
                $(img[i].parentElement.parentElement).find('a').attr('href', img[i].parentElement.parentElement.href);
                $(img[i].parentElement).find('a').find('div').mousemove(function(e) {
                    $(e.target.parentElement).css('display', 'block');
                });
                $(img[i].parentElement.children[2]).mouseenter(function(e) {
                    $(e.target.parentElement).find('a').css('display', 'block');
                });
                $(img[i].parentElement.children[2]).mouseleave(function(e) {
                    $(e.target.parentElement).find('a').css('display', 'none');
                });

            }
            /*當選取範圍時，紀錄選取範圍起始點*/
            $(img[i].parentElement.children[2]).mousedown(function(e) {
                e.preventDefault();
                if (scope.inselection == false && scope.getSelectionText() == '') {
                    var editor = $('.annotator-editor');
                    if (editor.css('display') != 'none' && !editor.hasClass('annotator-hide')) {
                        editor.addClass('annotator-hide');
                    }
                    scope.x = e.offsetX;
                    scope.y = e.offsetY;
                    scope.inselection = true;
                    var range = document.createRange();
                    range.selectNodeContents(this);
                    scope.Xpath = getxpath(range.startContainer.parentElement, document.getElementsByClassName("annotator-wrapper")[0]);

                }

            });
            $(img[i].parentElement.children[2]).mouseleave(function(e) {
                $(e.target.parentElement.children[1]).attr("class", "annoitem-unfocus draw");
				
                var annotation = getImgAnnotation(this.parentElement.children[0]);
				for(var i in annotation){
					$('#anno-info-id'+annotation[i].id).removeClass('panel-anno-selected-gray');
				}
            });
            $(img[i].parentElement.children[2]).mouseenter(function(e) {
                $(e.target.parentElement.children[1]).attr("class", "annoitem-focus draw");
                if (scope.getSelectionText() != '') {
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


                if (scope.show.length != 0)
                    //scope.annotator.plugins.ViewPanel.showAnnoOnpanel(scope.show,e.target);
                    scope.annotator.plugins.ViewPanel.showAnnoOnpanel(scope.show);
                else
                    $('.panel-annolist').click();

                if (scope.getSelectionText() != '') {
                    $(".annotator-adder").hide();
                    window.getSelection().removeAllRanges();

                }
                if (scope.endx - scope.x < 10)
                    scope.initimgsetting();
            });

            $(img[i].parentElement.children[2]).mousemove(function(e) {
                /*顯示adder位置，這裡有BUG(因為照理說adder顯示應該在mouseup上面，可是使用mouseup時，adder不知為啥會消失，所以暫時寫在mousemove事件*/

                scope.show = [];
                if (scope.x > 0 && scope.y > 0 && scope.endx > 0 && scope.endy > 0)
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
                    var temp = ""; 
                    var near = 10000;
                    var w_ratio = this.parentElement.children[0].width / 100;
                    var h_ratio = this.parentElement.children[0].height / 100;
					var scrollTop = 0;
                    if (annotation.length > 0) {
                        for (var i in annotation) {
                            if (e.offsetX >= annotation[i].position.x * w_ratio &&
                                e.offsetY >= parseInt(annotation[i].position.y * h_ratio) &&
                                e.offsetX <= (parseInt(annotation[i].position.x) + parseInt(annotation[i].position.width)) * w_ratio &&
                                e.offsetY <= (parseInt(annotation[i].position.y) + parseInt(annotation[i].position.height)) * h_ratio) {
                                var anno_center = (parseInt(annotation[i].position.x * w_ratio) + parseInt(annotation[i].position.y * h_ratio) + parseInt(annotation[i].position.width * w_ratio) + parseInt(annotation[i].position.height * h_ratio)) / 4;
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
					if (temp != ""){
						Reaction4Img2Panel(temp,scrollTop,annotation);	//位置2註記反白控制					
					}
                }
            });
			function Reaction4Img2Panel(temp,scrollTop,annolist){				 		
					if($('#anno-info-id'+annolist[temp].id).hasClass('panel-anno-selected-gray')!=true){	
						for(var i in annolist)
							$('#anno-info-id'+annolist[i].id).removeClass('panel-anno-selected-gray');
						$('#anno-info-id'+annolist[temp].id).addClass('panel-anno-selected-gray');						
						var test1=$('#anno-info-id'+annolist[temp].id);
						scrollTop = test1.offset().top;								
						$('.anno-panel').animate({scrollTop: scrollTop-100},0);						
					}											
			}
            /*紀錄選取範圍終點，並且控制adder顯示位置*/
            $(img[i].parentElement.children[2]).mouseup(function(e) {
                e.preventDefault();
                if (scope.inselection == true && scope.getSelectionText() == '') {
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

        /*annotator-adder出現位置*/
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


    /*使用者對圖片選擇範圍的呈現
     *@param element img element
     */
    function select(element) {
        var c1 = element.parentElement.children[2];
        var ctx = c1.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.clearRect(0, 0, c1.width, c1.height);
        ctx.rect(scope.x, scope.y, scope.endx - scope.x, scope.endy - scope.y);
        ctx.stroke();
    };

    /*清除繪畫層的註記
     *@param element: select canvas
     */
    function clear(element) {
        var c1 = element.parentElement.children[2];
        var ctx = c1.getContext("2d");
        ctx.clearRect(0, 0, c1.width, c1.height);
    };
    /*註記層 顯示註記在該圖上
     *@param element 圖片元素
     *@param position      selection part 
     *@param strokeStyle   line color
     */
    function show(element, position, strokeStyle) {
        var c = element.parentElement.children[1];
        var ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.rect(position.x / 100 * element.width, position.y / 100 * element.height, position.width / 100 * element.width, position.height / 100 * element.height);
        ctx.stroke();
    };
    /*將圖片註記顯視白線
     *@param element    img element
     */
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
    $(document).on('mouseenter', '.anno-infos-item', function(e) {  //游標移入事件

        var annotation = $(e.target).data('annotation');  //該事件處理的annotation
		
        if (annotation != undefined)
            if (annotation.type == 'image') {
                if (annotation.img === undefined) {
                    annotation = find_img_by_Xpath(annotation);
                }
				if(annotation.img.parentElement !== undefined){
					anno_selected(annotation,'Enter'); //註記2位置轉藍
				}
				
					
            }

    }).on('mouseleave', '.anno-infos-item', function(e) {  //游標移出事件
        var annotation = $(e.target).data('annotation');
        if (annotation != undefined)
            if (annotation.type == 'image') {
                if (annotation.type === undefined) {
                    annotation = find_img_by_Xpath(annotation);
                }
				if(annotation.img.parentElement !== undefined){
					anno_selected(annotation,'Leave');//註記2位置轉白
				}
					
            }

    });
	
	function anno_selected(annotation,cond){//游標事件
		var annolist = getImgAnnotation(annotation.img.parentElement.children[0]);//get annolist
		var annoitem = annotation.img.parentElement.children[1];
		if(cond=='Enter'){//全白再藍
			for(var i=0; i<annolist.length ;i++)
				show(annotation.img, annolist[i].position, 'white');  
			show(annotation.img, annotation.position, 'blue');//將目標的highlight轉換顏色(blue)
			$(annoitem).attr("class", "annoitem-focus draw");  //將其class等於focus
		}else{//全白
			for(var i=0; i<annolist.length ;i++)
				show(annotation.img, annolist[i].position, 'white');  
			$(annoitem).attr("class", "annoitem-unfocus draw"); //將其class等於unfocus
		}
	}
    /*當 binding annotationlist事件 找到該註記的位置 
     *@param  annotation 
     */
    function find_anno_onimgae(anno_info_object) {
        var img = $(_element).find('img');
        var annotation = anno_info_object.data('annotation');
        anno_info_object.click(function() {
            show(annotation.img, annotation.position, "blue");
            var scrollTop = $(annotation.img).offset().top;
            $('html,body').animate({
                scrollTop: scrollTop - 100
            }, 800);
            scope.annotator.plugins.ViewPanel.showAnnoOnpanel(new Array(annotation));
        });
    }

    function find_img_by_Xpath(annotation) {
        var img = $(_element).find('img');
        for (var i = 0; i < img.length; i++) {
            var range = document.createRange();
            range.selectNodeContents(img[i]);
            /*以XPath區分註記該屬於何圖*/
            var Xpath = getxpath(range.startContainer.parentElement, document.getElementsByClassName("annotator-wrapper")[0]);
            if (Xpath == annotation.Xpath && img[0].src == annotation.src) {
                var scrollTop;
                var img1 = $(_element).find('img');
                var img;
                for (var i = 0; i < img1.length; i++) {
                    var range = document.createRange();
                    range.selectNodeContents(img1[i]);
                    var Xpath = getxpath(range.startContainer.parentElement, document.getElementsByClassName("annotator-wrapper")[0]);
                    if (Xpath == annotation.Xpath) {
                        scrollTop = $(img1[i]).offset().top;
                        img = img1[i];
                    }
                }
                annotation.img = img;
				

            }
        }
        return annotation;
    }
    /* let x1 < x2 and y1 <y2
     *@param x1,y1,x2,y2   startx,starty,endx,endy 
     *@return  xa,ya,xb,yb                
     */
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
    /*取得圖片上的註記
     *@param element // img element
     *return annotations;
     */
    function getImgAnnotation(element) {
        return $(element).data("annotation") !== undefined ? $(element).data("annotation") : [];
    };
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
    /*讀取到註記時，顯示該註記在圖片上*/
    this.addImgAnnotation = function(annotation) {
        var img = $(_element).find('img');
		var switchIIIF = 'iiif';
        for (var i = 0; i < img.length; i++) {
            var range = document.createRange();
            range.selectNodeContents(img[i]);
            /*以XPath區分註記該屬於何圖*/
            var Xpath = getxpath(range.startContainer.parentElement, document.getElementsByClassName("annotator-wrapper")[0]);
			
            if (Xpath == annotation.Xpath && img[0].src == annotation.src) {
                var annotations = getImgAnnotation(img[i]); 
                annotations.push(annotation);
                $(img[i]).data('annotation', annotations);
                show(img[i], annotation.position, "#FFFFFF");
            }else if(switchIIIF == annotation.Xpath && img[0].src == annotation.src){
				var annotations = getImgAnnotation(img[i]);
                annotations.push(annotation);
                $(img[i]).data('annotation', annotations);
                show(img[i], annotation.position, "#FFFFFF");
				switchIIIF = 'panel turn';
			}else if(switchIIIF == 'panel turn'){
				switchIIIF = 'iiif';
				break;
			}
			
			
        }
        var anno_info_object = scope.annotator.plugins.ViewPanel.annoinfos(annotation);
        find_anno_onimgae(anno_info_object);

    };

    /*清除圖片上的註記*/
    this.initImgAnnotation = function() {
        var img1 = $('.annotator-wrapper').find('img');

        for (var i = 0; i < img1.length; i++) {
            $(img1[i]).removeData("annotation");
            scope.reshow($(img1)[i]);
        }
    };



    var now; //追蹤目前annotation最高的ID
    return {
        pluginInit: function() {
            CanvasInit();
            scope.addHook();
            hyperlink_prevent();
            this.annotator
                .subscribe("annotationCreated", function(annotation) {
                    if (scope.target != null) {
                        annotation.type = 'image';
                        annotation.src = scope.target.parentElement.children[0].src;

                        var img = scope.target.parentElement.children[0];
                        annotation.Xpath = scope.Xpath;
                        annotation.position = {
                            x: scope.x / img.width * 100,
                            y: scope.y / img.height * 100,
                            width: (scope.endx - scope.x) / img.width * 100,
                            height: (scope.endy - scope.y) / img.height * 100,
                        };

						scope.addImgAnnotation(annotation);
                        scope.target = null;

                    }
                }).subscribe("annotationDeleted", function(annotation) {
                    if (annotation.type == 'image') {
                        //$('#img-anno-' + annotation.id).remove();
                        scope.deleteAnnotation(annotation);
                    }

                })
                .subscribe("annotationsLoaded", function(annotations) {

                    scope.initImgAnnotation();
                    scope.initimgsetting();
                    for (var i = 0; i < annotations.length; i++) {
                        var annotation = annotations[i];

                        if (annotation.type == 'image') {

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
                    if (scope.inEdit == true)
                        scope.inEdit = false;

                }).subscribe("annotationViewerShown", function(editor) {
                    for (var i = 0; i < document.getElementsByClassName("annoitem select").length; i++) {
                        clear(document.getElementsByClassName("annoitem select")[i]);
                    }
                }).subscribe("cratedback", function(annotation) {
                    scope.addImgAnnotation(annotation);
                });
        }
    }
}