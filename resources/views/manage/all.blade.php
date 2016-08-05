@extends('app')
@section('custom_css')

 <link rel="stylesheet" href="css/easy-autocomplete.css"></script>
@endsection
@section('content')
    <div class="container">
        <div class ="row">
            <div class ="col-lg-5">
               <div class="anno-user">
                    <div class="anno-user-name">
                          <strong>用戶名稱：</strong>  {{ $user['name'] }}
                    </div>
                     <div class="anno-user-email">
                          <strong>用戶email：</strong>  {{ $user['email'] }}
                    </div>
                 
               </div>
                <div id="anno-filter">
                    <form action="" class="form-horizontal" method="GET">
                        <div class="form-group">
                            <h4 class="col-sm-2">搜尋</h4>
                        </div>

                        <div class="form-group">
                            <label for="search_text" class="col-sm-3 control-label">標記內容</label>
                            <div class="col-sm-9">
                                <input type="text" name="search_text" class="form-control" id="search_text" value="{{ $old['search_text'] }}" placeholder="標記內容" >                        
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="search_tag" class="col-sm-3 control-label">標籤</label>
                            <div class="col-sm-9">
                                <select class="form-control" name="search_tag" id="search_tag">
                                    <option value="">所有</option>
                                    @foreach($tags as $tag)
                                        <option value="{{ $tag }}" {{ $old['search_tag'] == $tag ? 'selected' :'' }}>{{$tag}}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="search_public" class="col-sm-3 control-label">可見度</label>
                            <div class="col-sm-9">
                                <select class="form-control" name="search_public" id="search_public">
                                    <option value="" {{ $old['search_public'] == '' ? 'selected' :'' }}>所有</option>
                                    <option value="1" {{ $old['search_public'] === '1' ? 'selected' :'' }}>公開</option>
                                    <option value="0" {{ $old['search_public'] === '0' ? 'selected' :'' }}>不公開</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-1 col-md-offset-6">
                                <button class="btn btn-default" type="submit">搜尋</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class = "col-lg-6">
                <div id="anno-alert">

                </div>
                
                <div class="anno-list">

                    @foreach( $annos as $anno  )
                        <div class="anno-list-item">
                            <div class="anno-item-bottom"  id="anno-{{ $anno['id'] }}">

                           
                               <strong>標記：</strong>
                                @if($anno['type'] == 'text')
                                <div class="anno-quote">
                                    {{ $anno['quote'] }}
                                </div>
                                @else
                                   <div class="anno-quote">
                                   <img src="{{ $anno['src'] }}">
                                </div>
                                @endif

                                 <span class="body-content"> {!! $anno['text'] !!} </span>
                                   
                                <div class="anno-tags">
                                    <div><i class="fa fa-tags" aria-hidden="true"></i>
                                        @foreach($anno['tags'] as $tag)
                                            <span class="anno-tag">{{ $tag }}</span>
                                        @endforeach
                                    </div>
                                </div>


                                <div class="anno-public">
                                    <div>
                                        <strong>可見度：</strong>
                                        <span>{{ count($anno['permissions']['read']) == 0 ? "公開" : "不公開" }}</span>
                                    </div>
                                </div>

                                <div class="anno-likes">
                                    <div>
                                        <strong>評分：</strong>
                                        @if($anno['likes'] >= 0)
                                        <span  class="fa fa-thumbs-up"><span>{{ $anno['likes'] }}</span></span>
                                        @else
                                        <span class="fa fa-thumbs-down"><span>{{ $anno['likes'] }}</span></span>
                                        @endif
                                    </div>
                                </div>
                                        {{ $anno['created_at'] }}
                            
                                <hr>
                                 @foreach($anno['otherbodys'] as $body)
                                    <div class="anno-body">
                                        <span class="body-user">{{$body['creator']}}</span> 
                                        <span class="body-time">{{ $body['created_time'] }}</span>
                                        <span class="body-content">{!!$body['text'][0]!!}</span>
                                        
                                          <strong>評分：</strong>
                                            @if($body['like'] >= 0)
                                            <span  class="fa fa-thumbs-up"><span>{{ $body['like'] }}</span></span>
                                            @else
                                            <span class="fa fa-thumbs-down"><span>{{ $body['like'] }}</span></span>
                                            @endif
                                            <div class="anno-tags">
                                             <div><strong>標籤：</strong>
                                            @foreach($body['tags'] as $tag)
                                                <span class="anno-tag">{{ $tag }}</span>
                                            @endforeach
                                            </div>
                                            </div>
                                    </div>
                                 @endforeach
                            </div>
                        </div>
                    @endforeach
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
    <script src="js/jquery.easy-autocomplete.js"></script>
   
    <script src="{{ url('js/tinymce/tinymce.min.js') }}"></script>
    <script>
       

        $(document).ready(function() {
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: '/manage/search',
                method: "get",
                success: function (data) {
                    console.log(data);
                    var options = {
                        data: data,
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
                    $("#search_text").easyAutocomplete(options);
                },
                error: function(data) {
                    console.log("fail");
                }
            });

       
        });
        $(document).on('click','.anno-user-follow',function(e){
            
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
                        $('#anno-' + id + ' .anno-text').html(content);
                        $('#anno-' + id + ' .anno-tag').html(tags);
                        newAlert('success', '編輯成功');
                        $('#editorDiv').hide();
                    } else {
                        newAlert('danger', '編輯失敗');
                    }
                },
                error: function(data) {
                    location.reload();
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

            var rect =$('#anno-' + id)[0].getBoundingClientRect();
            tinyMCE.editors[0].setContent($('#anno-' + id + ' .anno-text').html());
            $('#tags').val($('#anno-' + id + ' .anno-tag').html());
            $('#editor_anno_id').val(id);
            $('#editorDiv').css('position', 'absolute')
                    .css('left', e.pageX)
                    .css('top', e.pageY - rect.height / 2)
                    .show();

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
                        location.reload();
                    },
                    dataType: 'json'
                });
            }
        });
    </script>
@endsection