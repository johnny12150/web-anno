<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAnnotations extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('annotations', function(Blueprint $table)
		{
            $table->increments('id');
            $table->integer('creator_id')->unsigned();
            $table->text('text')->default('');
            $table->text('quote')->default('');
            $table->text('uri')->default('');
            $table->text('link')->default('');
            $table->string('type')->default('text');
            $table->integer('x')->default(0);
            $table->integer('y')->default(0);
            $table->string('src')->default('');
            $table->text('ranges_start')->default('');
            $table->text('ranges_end')->default('');
            $table->integer('ranges_startOffset')->unsigned();
            $table->integer('ranges_endOffset')->unsigned();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
		});

        Schema::table('annotations', function(Blueprint $table)
        {
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('cascade');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('annotations');
	}

}
