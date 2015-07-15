@extends('app')

@section('custom_css')
    <link rel="stylesheet" href="{{ asset('css/anno.css') }}"/>
    <link rel="stylesheet" href="{{ asset('css/annotator.min.css') }}"/>
    <link rel="stylesheet" href="{{ asset('css/richText-annotator.min.css')}}">
    <link rel="stylesheet" href="{{ asset('css/annotorious.css')}}" />

    <link rel="gettext" type="application/x-po" href="{{ asset('locale/annotator.po') }}">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
@endsection

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">{{ $article->title }}</div>

                    <div class="panel-body">
                        <article>
                            <h2></h2>
                            <div id="content">

                                {!!$article->content!!}
                            </div>
                        </article>
                        <div class="article-panel pull-right">
                            <button class="btn btn-success ">Edit</button>
                            <button class="btn btn-danger ">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>



@endsection


@section('custom_script')

    <script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script>
    <script src="{{ asset('js/annotation.full.js')}}"></script>
    <script type="text/javascript">

        var uri = '{{ asset('/') }}article/{{ $aid }}';

        var anno = annotation('#content');
        anno.init({
            uri : uri
        });

    </script>
@endsection
