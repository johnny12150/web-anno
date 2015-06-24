@extends('app')
@section('custom_css')
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
@endsection
@section('content')
    <div class="container">
        <div class="anno-dashboard">
            @foreach( $annos as $anno )
                <div class="anno-list-item" data-id="{{ $anno['id'] }}">
                    <div class="anno-item-top">
                        <p class="anno-title">
                            <a href="{{$anno['uri']}}">{{ $titles[$anno['uri']] }}</a>
                        </p>

                    </div>
                    <div class="anno-item-bottom">
                        <div class="anno-quote">
                            {{ $anno['quote'] }}
                        </div>
                        <div class="anno-text">
                            {!! $anno['text'] !!}
                        </div>
                        <a href="#">
                            <i class="fa fa-share-alt" style="color: dodgerblue"></i>
                            <span>分享</span>
                        </a>
                        <a href="#">
                            <i class="fa fa-reply" style="color: dodgerblue"></i>
                            <span>瀏覽標記</span>
                        </a>
                        <a href="#">
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
                    <span><a href="/manage/{{ $i }}">{{ $i }}</a></span>
                @else
                    <span>{{ $i }}</span>
                @endif
            @endfor
        </div>
    </div>
@endsection