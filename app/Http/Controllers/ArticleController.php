<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use App\Article;
use Input;

class ArticleController extends Controller {



	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index($page = 1)
	{

        $articles = Article::getAll($page, 10);
        return view('article.all', [
            'articles' => $articles
        ]);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function add()
	{
        $article = Article::add(Auth::user()->id, [
            'title' => Request::input('title'),
            'content' => Request::input('content')
        ]);
        return [
            'response' => is_object($article) ? 1 : 0,
            'data' => $article
        ];
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($aid)
	{
        $article = Article::get($aid);

        return view('article.singo', [
            'article' => $article,
            'aid' => $aid
        ]);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function delete($aid)
	{
		$result = Article::del(Auth::user()->id, $aid);

        return [
            'response' => !is_string($result)  ? 1 : 0,
            'data' => s_string($result) ? $result :''
        ];
	}

}
