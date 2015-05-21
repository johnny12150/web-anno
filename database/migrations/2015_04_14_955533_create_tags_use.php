<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTagsUse extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('tags_use', function(Blueprint $table)
		{
            $table->integer('tag_id')->unsigned();
            $table->integer('annotation_id')->unsigned();
        });

        Schema::table('tags_use', function(Blueprint $table)
        {
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
            $table->foreign('annotation_id')->references('id')->on('annotations')->onDelete('cascade');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('tags_use');
	}

}
