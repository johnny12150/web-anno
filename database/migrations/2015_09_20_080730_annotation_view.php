<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AnnotationView extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
        DB::statement('create or replace view `annotations_view` as
            select annotations.* , tags_view.tags AS tags, likes_view.likes as likes
            from annotations
            left join tags_view ON ( tags_view.annotation_id = annotations.id)
            left join likes_view ON ( likes_view.aid = annotations.id )');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        DB::statement( 'DROP VIEW annotations_view' );
	}

}
