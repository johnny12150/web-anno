<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateArticles extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('articles', function(Blueprint $table)
		{
            $table->increments('id');
            $table->integer('author_id')->unsigned();
            $table->string('title');
            $table->text('content');
            $table->timestamps();
		});
        Schema::table('articles', function(Blueprint $table)
        {
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('articles');
	}

}
