@extends('app')
@section('custom_css')
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
@endsection
@section('content')
    <div class="container">
        <div id="anno-alert">

        </div>
        <div id="anno-filter">
            <form action="" class="form-horizontal">
                <div class="form-group">
                    <label for="search" class="col-sm-2 control-label">標記內容</label>
                    <div class="col-sm-10">
                        <input type="search" class="form-control" id="search" placeholder="標記內容">
                    </div>
                </div>
                <button class="btn btn-default" type="submit">搜尋</button>
            </form>
        </div>
        <div class="anno-list">
            @foreach( $annos as $anno )
                <div class="anno-list-item" id="anno-{{ $anno['id'] }}">
                    <div class="anno-item-top">
                        <p class="anno-title">
                            <a href="{{$anno['uri']}}">{{ $titles[$anno['uri']] }}</a>
                        </p>
                        <p>
                            <span>網址：</span>
                            <a href="{{ $anno['uri'] }}">{{ $anno['uri'] }}</a>
                        </p>
                    </div>
                    <div class="anno-item-bottom">
                        <p>標記：</p>
                        <div class="anno-quote">
                            {{ $anno['quote'] }}
                        </div>
                        <p>標記內容：</p>
                        <div class="anno-text">
                            {!! $anno['text'] !!}
                        </div>
                        <div class="anno-tags">
                            <div><strong>標籤：</strong>
                                @foreach($anno['tags'] as $tag)
                                    <span class="anno-tag">{{ $tag }}</span>
                                @endforeach
                            </div>
                        </div>
                        <!--<a href="#">
                            <i class="fa fa-share-alt" style="color: dodgerblue"></i>
                            <span>分享</span>
                        </a>-->
                        <a href="{{ $anno['uri'] . '#anno_id=' .$anno['id'] }}">
                            <i class="fa fa-reply" style="color: dodgerblue"></i>
                            <span>瀏覽此標記</span>
                        </a>
                        <a href="#" class="anno-edit" data-id="{{ $anno['id'] }}">
                            <i class="fa fa-edit "></i>
                        <span>編輯標記內容</span>
                        </a>
                        <a href="#" class="anno-delete" data-id="{{ $anno['id'] }}">
                            <i class="fa fa-times " style="color: #ff0000"></i>
                            <span>刪除標記</span>
                        </a>
                    </div>
                </div>
            @endforeach
        </div>
        <div class="anno-pages">
            @for($i = 1 ; $i < $pagesCount ;$i++)
                @if($i != $page)
                    <span><a href="/manage/page/{{ $i }}">{{ $i }}</a></span>
                @else
                    <span>{{ $i }}</span>
                @endif
            @endfor
        </div>
    </div>
    <div id="editorDiv" style="display: none;">
        <input type="hidden" id="editor_anno_id">
        <textarea name="editor" id="editor" cols="30" rows="10"></textarea>
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
    <script src="{{ url('js/tinymce/tinymce.min.js') }}"></script>
    <script>

        function postEdit() {
            var id = $('#editor_anno_id').val();
            var content = tinyMCE.activeEditor.getContent();

            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                url: '/manage/edit',
                method: "POST",
                data: {id: id, 'text' : content},
                success: function (data) {
                    if (data.result) {
                        $('#anno-' + id + ' .anno-text').html(content);
                        newAlert('success', '編輯成功');
                        $('#editorDiv').hide();
                    } else {
                        newAlert('danger', '編輯失敗');
                    }
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
            $('#editorDiv').css('position', 'absolute');
            $('#editorDiv').css('left', e.pageX);
            $('#editorDiv').css('top', e.pageY - rect.height / 2);
            $('#editor_anno_id').val(id);
            $('#editorDiv').show();

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
                    success: function (data) {
                        if (data.result) {
                            $('#anno-' + id).remove();
                            newAlert('success', '刪除成功');
                        } else {
                            newAlert('danger', '刪除失敗');
                        }
                    },
                    dataType: 'json'
                });
            }
        });
    </script>
@endsection