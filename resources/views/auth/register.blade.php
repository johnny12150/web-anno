@extends('app')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel panel-default">
                    <div class="panel-heading">註冊</div>
                    <div class="panel-body">
                        <form class="form-horizontal" role="form" method="POST" action="{{ url('/auth/register') }}">
                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" class="form-control" name="callback_url" value="{{ isset($callback_url)  ? $callback_url : old('callback_url')  }}">
                            <input type="hidden" class="form-control" name="uri" value="{{ isset($uri)  ? $uri : old('uri') }}">
                            <input type="hidden" class="form-control" name="domain" value="{{ isset($domain) != '' ? $domain : old('domain')  }}">
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
                            @if( $errors->has('name') )
                                <div class="form-group has-error has-feedback">
                                    <label class="col-md-4 control-label">暱稱</label>
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="name" value="{{ old('name') }}">
                                        <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                                        <span id="descName"  class="help-block">{{ $errors->first('name') }}</span>
                                    </div>
                                </div>
                            @else
                                <div class="form-group">
                                    <label class="col-md-4 control-label">暱稱</label>
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="name" value="{{ old('name') }}">
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
                            @if( $errors->has('password_confirmation') )
                                <div class="form-group has-error has-feedback">
                                    <label class="col-md-4 control-label">確認密碼</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="password_confirmation">
                                        <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
                                        <span id="descPass2"  class="help-block">{{ $errors->first('password_confirmation') }}</span>
                                    </div>
                                </div>
                            @else
                                <div class="form-group">
                                    <label class="col-md-4 control-label">確認密碼</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="password_confirmation">
                                    </div>
                                </div>
                            @endif
                            <div class="form-group">
                                <div class="col-md-6 col-md-offset-4">
                                    <?php echo Recaptcha::render() ?>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-md-6 col-md-offset-4">
                                    <button type="submit" class="btn btn-primary">
                                        註冊
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection