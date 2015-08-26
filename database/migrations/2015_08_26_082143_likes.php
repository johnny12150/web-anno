<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Likes extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::create('likes', function(Blueprint $table)
        {
            $table->integer('uid')->unsigned();
            $table->integer('aid')->unsigned();
            $table->integer('like');
        });
        Schema::table('likes', function(Blueprint $table)
        {
            $table->foreign('uid')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('aid')->references('id')->on('annotations')->onDelete('cascade');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('likes');
	}

}
