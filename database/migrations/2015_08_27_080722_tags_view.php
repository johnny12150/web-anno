<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class TagsView extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{

        DB::statement("create or replace view `tags_view` as
            select group_concat(tags.name separator ',') AS tags , tags_use.annotation_id
            from  tags join  tags_use
            where  tags.id = tags_use.tag_id
            group by tags_use.annotation_id ;");

	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        DB::statement( 'DROP VIEW tags_view' );
	}

}
