@extends('app')

@section('content')
<div class="container-fluid">
	<div class="row">
		<div class="col-md-8 col-md-offset-2">
			<div class="panel panel-default">
				<div class="panel-heading">Login</div>
				<div class="panel-body">
                    @if(isset($callback_uri))
                        <a class="btn btn-primary btn-block" href="/auth/facebook?callback_uri={{$callback_uri}}">Login with Facebook</a>
                    @else
                        <a class="btn btn-primary btn-block" href="/auth/facebook">Login with Facebook</a>
                    @endif
				</div>
			</div>
		</div>
	</div>
</div>
@endsection
