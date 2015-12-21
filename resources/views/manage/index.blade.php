@extends('app')
@section('custom_css')
@endsection
@section('content')
    <div class="container">
        <div id="anno-alert">

        </div>
        <div id="anno-filter">
            <form action="" class="form-horizontal" method="GET">
                <div class="form-group">
                    <h4 class="col-sm-2">搜尋</h4>
                </div>
                <div class="form-group">
                    <label for="search_text" class="col-sm-2 control-label">標記內容</label>
                    <div class="col-sm-10">
                        <input type="text" name="search_text" class="form-control" id="search_text" value="{{ $old['search_text'] }}" placeholder="標記內容">
                    </div>
                </div>
                <div class="form-group">
                    <label for="search_tag" class="col-sm-2 control-label">標籤</label>
                    <div class="col-sm-10">
                        <select class="form-control" name="search_tag" id="search_tag">
                            <option value="">所有</option>
                            @foreach($tags as $tag)
                                <option value="{{ $tag }}" {{ $old['search_tag'] == $tag ? 'selected' :'' }}>{{$tag}}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="search_public" class="col-sm-2 control-label">可見度</label>
                    <div class="col-sm-10">
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
        <hr/>
        <div class="anno-list">

            @foreach( $annoData as $uri => $annos )
                <div class="anno-list-item">
                    <div class="anno-item-top">
                        <p>
                            <span>識別路徑：</span>
                            <a href="#">{{ $uri }}</a>
                        </p>
                    </div>
                @foreach( $annos as $index => $anno)

                    <div class="anno-item-bottom"  id="anno-{{ $anno['id'] }}">
                        <strong>標記：</strong>
                        <div class="anno-quote">
                            {{ $anno['quote'] }}
                        </div>
                        <strong>標記內容：</strong>
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
                        <div class="anno-likes">

                        </div>
                        <div class="anno-public">
                            <div>
                                <strong>可見度：</strong>
                                <span>{{ count($anno['permissions']['read']) == 0 ? "公開" : "非公開" }}</span>
                            </div>
                        </div>
                        <!--<a href="#">
                            <i class="fa fa-share-alt" style="color: dodgerblue"></i>
                            <span>分享</span>
                        </a>-->
                        <a href="{{ $anno['link'] . '#anno_id=' .$anno['id'] }}">
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
                        <hr/>
                    @endforeach
                </div>
            @endforeach
        </div>
        <div class="anno-pages">
            @for($i = 1 ; $i < $pagesCount ;$i++)
                @if($i != $page)
                    <span><a href="/manage/page/{{ $i }}{{ "?search_text=".$old["search_text"]."&search_tag=".$old["search_tag"]."&search_public=".$old["search_public"] }}">{{ $i }}</a></span>
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