@extends('app')
@section('custom_css')

 <link rel="stylesheet" href="/css/jquery.tokenize.css"></script>
 <link rel="stylesheet" href="/css/easy-autocomplete.css"></script>
@endsection
@section('content')
    <div class="container">
        <div class ="row">
           
            <div class="col-lg-12">
                <div id="anno-filter">
                    <form action="" class="form-horizontal" method="POST">
                      <div class="form-group search_all">
                            <label for="search_all" class="col-sm-3 control-label">全文檢索</label>
                            <div class="col-sm-6">
                                <input type="text" name="search_all" class="form-control" id="search_all"  placeholder="全文檢索"
                                value ="{{ $old['search_all'] }}" > 
                            </div>
                            <div class="col-sm-3">
                                  <button class="btn btn-default search" type="submit">搜尋</button>
                                  <span onclick="getdetail()">進階搜尋</span>
                            </div>
                       </div>

                       <div class="form-group detail">
                            <label for="search_text" class="col-sm-3 control-label">標記內容</label>
                            <div class="col-sm-9">
                                <input type="text" name="search_text" class="form-control" id="search_text" value="{{ $old['search_text'] }}" placeholder="標記內容" >                        
                            </div>
                        </div>
                        <div class="form-group detail">
                            <label for="search_uri" class="col-sm-3 control-label">uri</label>
                            <div class="col-sm-9">
                                <input type="text" name="search_uri" class="form-control" id="search_uri" value="{{ $old['search_uri'] }}" placeholder="uri" >                                           
                            </div>
                        </div>
                        <div class="form-group  detail">
                            <label for="search_tag" class="col-sm-3 control-label" >標籤(新增後請用tag鍵)</label>
                            <div class="col-sm-9">
                                <select id="tokenize" multiple="multiple" class="tokenize-sample" style="width: 100%"   >
                                </select>
                            </div>
                        </div>
                        <div class="form-group " style="display: none">
                            <label for="search_tag" class="col-sm-3 control-label" >標籤</label>
                            <div class="col-sm-9">
                                <input type="text" name="search_tag" class="form-control" id="search_tag"  >
                            </div>
                        </div>
                        <div class="form-group detail">
                            <label for="search_public" class="col-sm-3 control-label">可見度</label>
                            <div class="col-sm-9">
                                <select class="form-control" name="search_public" id="search_public">
                                    <option value="" {{ $old['search_public'] == '' ? 'selected' :'' }}>所有</option>
                                    <option value="1" {{ $old['search_public'] === '1' ? 'selected' :'' }}>公開</option>
                                    <option value="0" {{ $old['search_public'] === '0' ? 'selected' :'' }}>不公開</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="display: none">
                            <label for="search_public" class="col-sm-3 control-label">Pages</label>
                            <input type="text" name="search_page" class="form-control" id="search_page"  placeholder="uri"
                            >
                        </div>
                        <div class="form-group" style="display: none">
                            <label for="search_sort" class="col-sm-3 control-label">排序方式</label>
                            <div class="col-sm-9">
                                <input class="form-control" name="search_sort" id="search_sort"
                                      value ="{{ $old['search_sort'] }}">>  
                            </div>
                        </div>
                        <div class="form-group" style="display: none">
                            <label for="search_user_first" class="col-sm-3 control-label"></label>
                            <div class="col-sm-9">
                                <input class="form-control" name="search_user_first" id="search_user_first">

                            </div>
                        </div>
                
                        <div class="detail" style="display: block;text-align: center;"> 
                            <button class="btn btn-default" type="submit" style="text-align:center">搜尋</button>
                            <span id="search_all" onclick="searchall()">基本搜尋</span>
                        </div>
                            
                        
                    </form>
                </div>
            </div>
            <div class = "col-lg-12">
                <div id="anno-alert">

                </div>
                <div class ="anno-sort">
                    <!--<label>使用者優先</label>
                    <select >
                        <option value="true" >true</option>
                        <option value="false">false</option>      
                    </select>
                    -->
                    <label>排序方式</label>
                    <select id ="sorting" onchange="sorting()">
                        <option value="time" {{ $old['search_sort'] == 'time' ? 'selected' :'' }}>Time</option>
                        <option value="likes"{{ $old['search_sort'] == 'likes' ? 'selected' :'' }}>Likes</option>  
                    </select>
                </div>
                <div class="anno-list">

                    @foreach( $annoData as $uri => $annos )
                       @foreach( $annos as $index => $anno)
                        <div class="anno-list-item">
                        
                     

                            <div class="anno-item-bottom"  id="anno-{{ $anno['id'] }}">
                                
                               
                                @if($anno['type'] == 'text')
                                <div class="anno-quote">
                                     <a href="{{ $anno['uri'] . '#anno_id=' .$anno['id']. '&token=' .$user['token'] }}"> {{ $anno['quote'] }}</a>
                                </div>
                                @else	
                                <div class="anno-quote">
                                    <a href="{{ $anno['uri'] . '#anno_id=' .$anno['id']. '&user_id=' .session('auth')->uid .'&anno_token=' .session('auth')->auth_token }}">  <img src="{{ $anno['src'] }}"width="250" height="200" id ="{{ $anno['id'] }}"></a>
                                </div>
                                @endif

                                <div class="anno-content">
                                 <a href="{{ $anno['uri'] . '#anno_id=' .$anno['id']. '&user_id=' .session('auth')->uid .'&anno_token=' .session('auth')->auth_token }}"> {{ $anno['uri'] }}</a>
                                   <br><span class="body-user">{{ $anno['user']['name']}}</span> 
                                  <span class="body-time">{{  $anno['created_at'] }}</span>
                               
                                  @if(count($anno['permissions']['read']) == 0)
                                    <i class="fa fa-globe" aria-hidden="true" title="public"></i>
                                  @else
                                    <i class="fa fa-lock" aria-hidden="true" title="private"></i>
                                   @endif
                                </div>
                               
                 
                               
                               
                                @foreach($anno['otherbodys'] as $key => $body)
                                    @if($key < 2 )
                                        <div class ="anno-body-show">
                                            <div class="anno-body" id ="anno-body-{{ $body['bid'] }}">
                                                <span class="body-user">{{$body['creator']}}</span> 
                                                <span class="body-time">{{ $body['created_time'] }}</span>
                                                <span class="body-content">{!!$body['text'][0]!!}</span>
                                                
                                           
                                                    <div class="anno-tags">
                                                     <div><i class="fa fa-tags" aria-hidden="true"></i>
                                                    @foreach($body['tags'] as $tag)
                                                        <span class="anno-tag">{{ $tag }}</span>
                                                    @endforeach
                                                    </div>
                                                    </div>
                                                    <strong>評分：</strong>
                                                    @if($body['like'] >= 0)
                                                    <span  class="fa fa-thumbs-up"><span>{{ $body['like']  }}</span></span>
                                                    @else
                                                    <span class="fa fa-thumbs-down"><span>{{ $body['like'] }}</span></span>
                                                    @endif
                                                    @if( $body['creator'] == $user['name'])
                                                    <a href="#" class="anno-edit" data-id="{{ $body['bid'] }}">
                                                        <i class="fa fa-edit "></i>
                                                    <span>編輯</span>
                                                    </a>
                                                    <a href="#" class="anno-delete" data-id="{{ $body['bid'] }}">
                                                        <i class="fa fa-times " style="color: #ff0000"></i>
                                                        <span>刪除</span>
                                                    </a>
                                                    @endif
                                            </div>
                                        </div> 
                                    @elseif($key>=2)
                                        <div class="anno-body more_hide" id ="anno-body-{{ $body['bid'] }}"style="display:none">
                                            <span class="body-user">{{$body['creator']}}</span> 
                                            <span class="body-time">{{ $body['created_time'] }}</span>
                                            <span class="body-content">{!!$body['text'][0]!!}</span>
                                            
                                            <strong>評分：</strong>
                                                @if($body['like'] >= 0)
                                                <span  class="fa fa-thumbs-up"><span>{{ $body['like']  }}</span></span>
                                                @else
                                                <span class="fa fa-thumbs-down"><span>{{ $body['like'] }}</span></span>
                                                @endif
                                                <div class="anno-tags">
                                                 <div><i class="fa fa-tags" aria-hidden="true"></i>
                                                @foreach($body['tags'] as $tag)
                                                    <span class="anno-tag">{{ $tag }}</span>
                                                @endforeach
                                                </div>
                                                </div>
                                                @if( $body['creator'] == $user['name'])
                                                <a href="#" class="anno-edit" data-id="{{ $body['bid'] }}">
                                                    <i class="fa fa-edit "></i>
                                                <span>編輯</span>
                                                </a>
                                                <a href="#" class="anno-delete" data-id="{{ $body['bid'] }}">
                                                    <i class="fa fa-times " style="color: #ff0000"></i>
                                                    <span>刪除</span>
                                                </a>
                                                @endif
                                        </div>
                                    @endif
                                 @endforeach
                                    @if( count($anno['otherbodys']) > 2  )
                                    <a class ="read_more" style="text-align: right;display: block;">read more</a>
                                    <a class ="read_less" style="text-align: right;display: none;">read less</a>
                                    @endif
                                </div>

                    
                            
                         
                 </div>
                 @endforeach
                    @endforeach
              


            </div>
                <div class="anno-pages">
                    @for($i = 1 ; $i <= $pagesCount ;$i++)
                        @if($i != $page)
                            <span><a onclick="page({{ $i }})">{{ $i }}</a></span>
                        @else
                         {{ $i }}
                        @endif
                    @endfor
                        <span> 共{{ $pagesCount }}頁 </span>
                </div>
            
            </div>

        
        </div>
    </div>
 
    <div id="editorDiv" style="display: none;">
        <input type="hidden" id="editor_anno_id">
        <textarea name="editor" id="editor" cols="30" rows="10"></textarea>
        <input id="tags" placeholder="請輸入標籤…">
        <div class="buttons ">
            <div class="pull-right">
                <button class="btn btn-primary" onclick="postEdit();">確定</button>
                <button class="btn btn-default" onclick="hideEditor();">取消</button>
            </div>
        </div>
    </div>

    <div class="share-buttons">

    </div>
@endsection
@section('custom_script')
    <script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
    <script src="/js/jquery.tokenize.js"></script>
    <script src="/js/jquery.easy-autocomplete.js"></script>
    <script src="{{ url('js/tinymce/tinymce.min.js') }}"></script>
    <script>

   
        $(document).ready(function() {
             var search_tag ='';
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: '/manage/search', //search tags
                method: "get",
                success: function (data) {
                    /*easy-complete for tags  by tokenize*/
                    
                     for(var i in data.tags ){
                        $('#tokenize').append('<option value="' + data.tags[i] + '">'+ data.tags[i]+'</option>');
                     }
          
                        autocomplete($('#search_text'),data.text);
                        autocomplete($('#search_uri'),data.uri);
                },
                error: function(data) {
                }
            });
            

              $('#tokenize').tokenize({
                   onAddToken : function(value,text,e){
                   
                   search_tag += value +',';
                   $('#search_tag').val(search_tag);
                 
                },
                   onRemoveToken : function(value, e){
                   search_tag = search_tag.replace(value +',','');
                   $('#search_tag').val(search_tag);
                }
              });
             var search_tags = "<?php echo $old['search_tag']  ?>";
             var tags =  search_tags.split(',');
              for (var i in tags){
                $('#tokenize').tokenize().tokenAdd(tags[i],tags[i]);
            };
            canvas();
            navbar();
            
        });
        var data =  <?php  $arr =[] ; foreach  ($annoData as $annos)   foreach ($annos as $anno) array_push($arr,$anno); echo json_encode($arr) ?> ;
        $(window).load(function(e){
            $('.detail').hide();
           for(var i in data )
           {  
      
             if(data[i].type =='image')
                show($('#'+data[i].id)[0],data[i].position,'red' );
                
           }
        });
       function navbar(){
        if(location.href == 'http://annotation.ipicbox.tw/manage')
            $('#manage').addClass('active');
        else if(location.href == 'http://annotation.ipicbox.tw/manage/index')
            $('#index').addClass('active');
        else if(location.href == 'http://annotation.ipicbox.tw/manage/collect')
            $('#collect').addClass('active');
       }
       function sorting(){
            var sort_value = $('#sorting').val();
            $('#search_sort').val(sort_value);
            $('.form-horizontal').submit();
        }
       function getdetail(){
            $('.detail').show();
            $('.search_all').hide();
            $('#search_all').val('');
        }
       function searchall(){
            $('.detail').hide();
            $('.search_all').show();
            $('#search_tags').val('');
            $('#search_text').val('');
            $('#search_uri').val('');
       }
       function page(page){
          $('#search_page').val(page);
          $('.form-horizontal').submit();
       }
       function autocomplete(element,autocompleteData) {
            var options = {
                data: autocompleteData,
                list: {
                    maxNumberOfElements: 8,
                    match: {
                        enabled: true
                    },
                    sort: {
                        enabled: true
                    }
                }

            };
            element.easyAutocomplete(options);
        }; 
        function canvas(){
            var img = $(document).find('img');
            var edit = false;
            for (var i = 0; i < img.length; i++) {
                $(img[i]).wrap("<div class='annotationlayer' style='position:relative;display: inline-block;'></div>");
                $(img[i].parentElement)
                    .append("<canvas  class ='annoitem-unfocus draw' style='position:absolute;top:0;left:0;'" +
                        "width='" + img[i].width + "' " +
                        "height='" + img[i].height + "'" +
                        "></canvas>");
                   
                }

        }

        function show(element, position, strokeStyle) {
            
            var c = element.parentElement.children[1];
            var ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 2;
            ctx.rect(position.x /100 * element.width , position.y /100 *element.height, position.width /100 *element.width, position.height /100 *element.height);
            ctx.stroke();
        };

        $(document).on('click','.read_more',function(e){
            var target = e.target;
            $(e.target).parent().find('.more_hide').css('display','block');
            $(e.target).parent().find('.read_less').css('display','block');
            $(e.target).hide();
        });
        $(document).on('click','.read_less',function(e){
            var target = e.target;
            $(e.target).parent().find('.more_hide').css('display','none');
            $(e.target).parent().find('.read_more').css('display','block');
            $(e.target).hide();
        });
        function postEdit() {
            var id = $('#editor_anno_id').val();
            var content = tinyMCE.activeEditor.getContent();
            var tags = $('#tags').val();
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: '/manage/edit',
                method: "POST",
                data: {id: id, 'text' : content,'tags':tags},
                success: function (data) {
                    if (data.result) {
                        $('#anno-body-' + id + ' .body-content').html(content);
                        $('#anno-body-' + id + ' .anno-tags div').remove();
                        $('#anno-body-' + id + ' .anno-tags').append('<div><i class="fa fa-tags" aria-hidden="true"></i>'+
                            '<span class="anno-tag">'+tags+'</span></div>');
                    
                        newAlert('success', '編輯成功');
                        $('#editorDiv').hide();
                    } else {
                        newAlert('danger', '編輯失敗');
                    }
                },
                error: function(data) {
                   // location.reload();
                },
                dataType: 'json'
            });
        }

        function hideEditor() {
            $('#editorDiv').hide();
        }

        tinymce.init({selector:'#editor',menubar : false,plugins:"media image insertdatetime link code", height : 50,toolbar_items_size:"small",extended_valid_elements:"iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",toolbar:"insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "});

        function newAlert (type, message) {
            var t = Date.now()
            $("#anno-alert").append($("<div id='alert-"+t+"' class='alert alert-" + type + " fade in' data-alert><p> " + message + " </p></div>"));
            $("#alert-" + t).delay(2000).fadeOut("slow", function () { $(this).remove(); });
        }

        $('.anno-edit').click(function(e){
            e.preventDefault();

            var id = $(e.currentTarget).attr('data-id');
            var rect =$('#anno-body-' + id)[0].getBoundingClientRect();
            tinyMCE.editors[0].setContent($('#anno-body-' + id + ' .body-content').html());
            $('#tags').val($('#anno-body-' + id + ' .anno-tag').html());
            $('#editor_anno_id').val(id);
            $('#editorDiv').css('position', 'absolute')
                    .css('left', e.pageX)
                    .css('top', e.pageY - rect.height / 2)
                    .show();

        });
        $('.anno-user-following').click(function(e){
               e.preventDefault();
                var target = $(e.target); //事件驅動的目
                var fid = target.attr('data-id'); 
                $.post('/manage/follow',{'fid': fid}).success(function(data) {
                    alert('成功追隨'); 
                    location.reload();
                });
         });
        $('.anno-user-refollowing').click(function(e){
               e.preventDefault();
                var target = $(e.target); //事件驅動的目
                var fid = target.attr('data-id'); 
                $.post('/manage/delfollow',{'fid': fid}).success(function(data) {
                    alert('取消追隨'); 
                    location.reload();
                });
         });
        $('.anno-delete').click(function(e){
            e.preventDefault();

            var check = confirm('確定要刪除此標記？');

            if(check) {
                var id = $(e.currentTarget).attr('data-id');

                $.ajax({
                    xhrFields: {
                        withCredentials: true
                    },
                    url: '/manage/delete',
                    method: "POST",
                    data: {id: id},
                    success: function (data, textStatus) {

                        if (data.result) {
                            newAlert('success', '刪除成功');
                            location.reload();
                        } else {
                            newAlert('danger', '刪除失敗');
                        }
                    },
                    error: function(data) {
                        //location.reload();
                    },
                    dataType: 'json'
                });
            }
        });
    </script>
@endsection