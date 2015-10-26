<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AuthTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::create('auth_table', function(Blueprint $table)
        {
            $table->increments('id');
            $table->integer('uid')->unsigned();
            $table->string('domain');
            $table->string('auth_token');
            $table->timestamp('auth_expire');
        });
        Schema::table('auth_table', function(Blueprint $table)
        {
            $table->foreign('uid')->references('id')->on('users')->onDelete('cascade');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('auth_table');
	}

}
