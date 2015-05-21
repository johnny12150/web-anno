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

Route::get('/', 'WelcomeController@index');

Route::get('home', 'HomeController@index');



Route::get('article/{aid}', 'ArticleController@show')->where('id', '[0-9]+');
Route::post('article/add', 'ArticleController@add');
Route::post('article/edit', 'ArticleController@edit');
Route::delete('article/del', 'ArticleController@delete');

/* Annotation API routing */
Route::group(['prefix' => '/api', 'middleware' => 'api_auth'], function()
{
    Route::get('/', 'AnnotationController@index');
    Route::get('user', function() {});
    Route::get('annotations', 'AnnotationController@all');
    Route::post('annotations', 'AnnotationController@add');
    Route::put('annotations/{id}', 'AnnotationController@update');
    Route::get('annotations/{id}', 'AnnotationController@add');
    Route::delete('annotations/{id}', 'AnnotationController@delete');
    Route::get('search', 'AnnotationController@search');
    Route::get('check', 'AnnotationController@check');
});


Route::group([], function()
{
    Route::get('dashboard', 'DashboardController@index');
});

/* Test Article routing */
Route::get('articles', 'ArticleController@index');
Route::get('articles/{page}', 'ArticleController@index')->where('id', '[0-9]+');

/* Auth login routing */
Route::controller('auth', 'AuthController');

