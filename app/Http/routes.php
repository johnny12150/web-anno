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

Route::get('/', function() { return redirect('/manage');});

Route::get('testing', function() {
    return view('testing');
});
Route::get('article/{aid}', 'ArticleController@show')->where('id', '[0-9]+');

Route::post('article/add', 'ArticleController@add');
Route::post('article/edit', 'ArticleController@edit');
Route::delete('article/del', 'ArticleController@delete');

/* Annotation API routing */
Route::group(['prefix' => '/api', 'middleware' => 'crossdomain'], function()
{
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
    Route::get('user', function() {});
    Route::get('annotations', 'AnnotationController@index');
    Route::get('search', 'AnnotationController@search');

    Route::group(['middleware' => ['crossdomain', 'api_auth'] ], function() {
        Route::post('likes', 'AnnotationController@like');
        Route::post('annotations', 'AnnotationController@add');
        Route::put('annotations/{id}', 'AnnotationController@update');
        Route::get('annotations/{id}', 'AnnotationController@add');
        Route::delete('annotations/{id}', 'AnnotationController@delete');
        Route::get('check', 'AnnotationController@check');
        Route::post('logout', 'AnnotationController@logout');

    });


});

Route::group(['prefix' => '/manage', 'middleware' => 'auth'], function() {
    Route::get('/', 'ManageController@index');
    Route::post('/', 'ManageController@index');
    Route::post('delete', 'ManageController@delete');
    Route::post('edit', 'ManageController@edit');
});


Route::get('gravatar/{email}', 'GravatarController@get');
/* Test Article routing */
Route::get('articles', 'ArticleController@index');
Route::get('articles/{page}', 'ArticleController@index')->where('id', '[0-9]+');

/* Auth login routing */
Route::controller('auth', 'AuthController');
;