@extends('app')

@section('content')
    <div class="container">
        <div class="row">

            <div class="col-md-10 col-md-offset-1">
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
                    Create a Article
                </button>
                <hr/>
                <div class="list-group" id="articles">
                    @foreach($articles as $article)
                    <a href="/article/{{ $article->id }}" class="list-group-item">{{ $article->title }} <span class="pull-right">{{ $article->created_at }}</span></a>
                    @endforeach
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="myModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create a Article </h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal" id="form_article">
                        <div class="form-group">
                            <label for="title" class="col-sm-2 control-label">Title</label>
                            <div class="col-sm-10">
                                <input name="title" type="text" class="form-control" id="title" placeholder="Title">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="content" class="col-sm-2 control-label">Content</label>
                            <div class="col-sm-10">
                                <textarea name="content" type="text" class="form-control"  id="content" placeholder="Content" style="resize: vertical;"></textarea>
                            </div>
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button id="btn_add" type="button" class="btn btn-primary">Add</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal --
@endsection

@section('custom_script')
    <script src="{{ asset("/js/articles.js") }}"></script>
@endsection