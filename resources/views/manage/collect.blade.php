@extends('app')
@section('custom_css')

 <link rel="stylesheet" href="css/easy-autocomplete.css"></script>
@endsection
@section('content')
    <div class ="container">
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
                                        <button class="collect-delete" data-id="{{ $anno['id'] }}" style="float: right";>取消收藏</button>
                            
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
@endsection
@section('custom_script')
    <script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
    <script src="js/jquery.easy-autocomplete.js"></script>
   
    <script src="{{ url('js/tinymce/tinymce.min.js') }}"></script>
    <script>
        $(document).on('click','.collect-delete',function (e) {
            e.preventDefault();
            var target = $(e.target);
            var id = target.attr('data-id');

             $.post('/manage/cancel',{
                anno_id : id
            }).success(function(data){
                alert(data);
                window.location.reload();
            });
         });
    </script>
@endsection