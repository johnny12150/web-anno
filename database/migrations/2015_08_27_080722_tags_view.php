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

        DB::Raw('create or replace view `tags_view` as
            select group_concat(tags.name separator ',') AS tags , tags_use.annotation_id
            from ( tags join  tags_use )
            where ( tags.id = tags_usetag_id )
            group by tags_use,annotation_id);');

	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        DB::Raw( 'DROP VIEW tags_view' );
	}

}
