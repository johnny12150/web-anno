@extends('app')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel panel-default">
                    <div class="panel-heading">登入</div>
                    <div class="panel-body">
                        <form class="form-horizontal" role="form" method="POST" action="{{ url('/auth/login') }}">
                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" class="form-control" name="callback_url" value="{{ isset($callback_url) ? $callback_url : old('callback_url')  }}">
                            <input type="hidden" class="form-control" name="uri" value="{{ isset($uri) ? $uri : old('uri') }}">
                            <input type="hidden" class="form-control" name="domain" value="{{ isset($domain) ? $domain : old('domain') }}">

                            @if( $errors->has('email') )
                                <div class="form-group has-error has-feedback">
                                    <label class="col-md-4 control-label">Email信箱</label>
                                    <div class="col-md-6">
                                        <input type="email" class="form-control" name="email" value="{{ old('email') }}" aria-describedby="descEmail">
                                        <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                                        <span id="descEmail"  class="help-block">{{ $errors->first('email') }}</span>
                                    </div>
                                </div>
                            @else
                                <div class="form-group">
                                    <label class="col-md-4 control-label">Email信箱</label>
                                    <div class="col-md-6">
                                        <input type="email" class="form-control" name="email" value="{{ old('email') }}">
                                    </div>
                                </div>
                            @endif

                            @if( $errors->has('password') )
                                <div class="form-group has-error has-feedback">
                                    <label class="col-md-4 control-label">密碼</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="password">
                                        <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                                        <span id="descPass"  class="help-block">{{ $errors->first('password') }}</span>
                                    </div>
                                </div>
                            @else
                                <div class="form-group">
                                    <label class="col-md-4 control-label">密碼</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="password">
                                    </div>
                                </div>
                            @endif

                            <div class="form-group">
                                <div class="col-md-6 col-md-offset-4">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" name="remember"> 記住我
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-md-6 col-md-offset-4">
                                    <button type="submit" class="btn btn-primary">登入</button>
                                    <a class="btn btn-default" href="{{ $register_url }}">註冊新帳號</a>
                                    <!--<a class="btn btn-link" href="{{ url('/password/email') }}">忘記密碼</a>-->
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('custom_script')
<script>

</script>
@endsection
