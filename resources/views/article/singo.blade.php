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

    <div class="anno-panel">
        <div class="anno-search">
            <form action="#" id="form-search">
                <button id="anno-search-submit" type="submit"><i class="fa fa-search fa-2x"></i></button>
                <input id="anno-search-input" type="text" />
            </form>
        </div>
        <div class="anno-users">
            <p><strong>在此網頁標記的人</strong></p>
            <ul>
            </ul>
        </div>
        <div class="anno-tags">
            <p><strong>標籤</strong></p>
            <ul></ul>
        </div>
        <hr/>
        <div class="anno-search-list">

            <ul>
                <!-- <li >
                    <img src="gravatar.jpg" class="gravatar" />
                    <div class="anno-quote">
                        Annotation
                    </div>
                </li> -->

            </ul>
        </div>
        <div class="btn-appear">
        </div>
    </div>

@endsection


@section('custom_script')
    <script src="{{ asset('js/gettext.js') }}"></script>
    <script src="{{ asset('js/annotator-full.js') }}"></script>
    <script src="{{ asset('js/tinymce/tinymce.min.js')}}"></script><!--tinymce for richText-->
    <script src="{{ asset('js/richText-annotator.min.js')}}"></script>
    <script src="{{ asset('js/annotorious.okfn.0.3.js')}}"></script>
    <script src="{{ asset('js/annotator.myauth.js')}}"></script>
    <script src="{{ asset('js/annotator.panel.js')}}"></script>

    <script type="text/javascript">

        var uri = '{{ asset('/') }}article/{{ $aid }}';

        //---------------------------------------------------------------
        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";path=" + location.pathname +  "; " + expires;
        }

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        }

        function getHashParam(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[&#]" + name + "=([^&#]*)"),
                    results = regex.exec(location.hash);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        var anno_token = getHashParam('anno_token');
        var user_id = parseInt(getHashParam('user_id'));

        var old_anno_token = getCookie('anno_token');
        var old_user_id = getCookie('user_id');

        if( anno_token == '') {
            if (old_anno_token != "") {
                anno_token = old_anno_token;
            }
            if( old_user_id != "") {
                user_id = parseInt(old_user_id);
            }
        } else {
            setCookie('anno_token', anno_token, 30);
            setCookie('user_id', user_id, 30);
        }


        var content = $('#content').annotator();

        var permissionsOptions = {};
        permissionsOptions['user'] = user_id;
        permissionsOptions['showEditPermissionsCheckbox'] = false;

        var optionsRichText = {
            tinymce:{
                selector: "li.annotator-item textarea",
                plugins: "media image insertdatetime link code",
                menubar: false,
                toolbar_items_size: 'small',
                extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "
            }
        };

        content.annotator('addPlugin', 'ViewPanel', {
                     user_id: user_id
                }).annotator('addPlugin', 'Store', {
                    prefix: '',
                    urls: {
                        create:  'http://annotator.local:8000/api/annotations/',
                        read:    'http://annotator.local:8000/api/annotations/:id/',
                        update:  'http://annotator.local:8000/api/annotations/:id/',
                        destroy: 'http://annotator.local:8000/api/annotations/:id/',
                        search:  'http://annotator.local:8000/api/search/'
                    },
                    annotationData: {
                        'uri': uri,
                        'anno_token' : anno_token
                    },
                    loadFromSearch: {
                        'limit': 0,
                        'all_fields': 1,
                        'uri': uri,
                        'anno_token' : anno_token
                    }
                })
                .annotator('addPlugin','RichText',optionsRichText)
                .annotator('addPlugin', 'Tags')
                .annotator('addPlugin', 'MyAuth', {
                    anno_token : anno_token,
                    'uri': uri
                })
                .annotator('addPlugin', 'Permissions', permissionsOptions)
                ;

    </script>
@endsection
