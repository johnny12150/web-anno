<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

use Illuminate\Support\Facades\Response;
use App\manifest;
Route::get('/', function() { return redirect('/manage');});

Route::get('testing', function() {
    return view('testing');
});



Route::get('mongodb',function(){
    phpinfo();
	$test = manifest::all();
	print_r($test);
});


/* Annotation API routing */
Route::group(['prefix' => '/api', 'middleware' => 'crossdomain'], function()
{
    /* Route Options */
    Route::options('search', function () {});
    Route::options('annotations', function () {});
    Route::options('user', function () {});
    Route::options('search', function () {});
    Route::options('/', function () {});
    Route::options('likes', function () {});
    Route::options('check', function () {});
    Route::options('annotations', function () {});
    Route::options('annotations/{id}', function () {});
   
    Route::get('/', 'AnnotationController@index');
    Route::get('annotations', 'AnnotationController@index');
    Route::get('search', 'AnnotationController@search');
	
	

    Route::group(['middleware' => ['crossdomain', 'api_auth'] ], function() {
        Route::post('likes/{id}', 'AnnotationController@like');
        Route::post('annotations', 'AnnotationController@add');
        Route::put('annotations/{id}', 'AnnotationController@update');
        Route::get('annotations/{id}', 'AnnotationController@add');
        Route::post('addbody', 'AnnotationController@addbody');
        Route::post('delete_anno/{id}', 'AnnotationController@delete');
        Route::post('body/{id}','AnnotationController@deletebody');
        Route::post('updatebody','AnnotationController@updatebody');
        Route::post('collect','collecteController@create');
        Route::delete('annotations/{id}', 'AnnotationController@delete');
        Route::get('check', 'AnnotationController@check');
        Route::post('logout', 'AnnotationController@logout');
        Route::post('edit_target','AnnotationController@edit_target');
        Route::post('checkcollect','collecteController@check');      
		
		
		
    });

    Route::any('{all}', function($uri)
    {
        return [
            'response' => 'error'
        ];
    })->where('all', '.*');
});
/**/
Route::group(['prefix' => '/manage', 'middleware' => 'auth'], function() {
    Route::post('/', 'ManageController@manage');
    Route::get('/', 'ManageController@manage');
    Route::get('/collect', 'ManageController@collect');
    Route::post('/collect', 'ManageController@collect');
    Route::post('/index', 'ManageController@all');
    Route::get('/index', 'ManageController@all');
    Route::get('/search' , 'ManageController@gettags');  //api for get user's tag and text
    Route::post('delete', 'ManageController@delete');
    Route::post('edit', 'ManageController@edit');
    Route::post('/follow','UserController@follow');
    Route::post('/delfollow','UserController@delfollow');
    Route::post('/cancel' , 'collecteController@destroy');

});
Route::get('manifest', function(){
			$user = Auth::user();
			print($user->name);
			return view('manifest');
})->middleware('auth');
Route::group(['prefix' => '/digital'],function(){
	Route::get('digital_island', function() {
		return view('0105_1');
	});
	Route::any('digital_island_api','AnnotationController@digital_island');
	Route::any('modified_annotation','AnnotationController@modified_for_sophy');
});

Route::get('list/{p1}',"ManifestController@IIIFformat");
Route::post('manifest/save', 'ManifestController@save');
Route::get('manifest/{id}.json', 'ManifestController@output_manifest');
Route::post('myprocess','ManifestController@Manifest');


Route::get('gethint','AnnotationController@gethint');
Route::get('gravatar/{email}', 'GravatarController@get');
Route::get('manage/profile/{name}','ManageController@index');
Route::post('manage/profile/{name}','ManageController@index');
Route::controller('auth', 'AuthController');
?>
