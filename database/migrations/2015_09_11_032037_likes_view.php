<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class LikesView extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('create or replace view `likes_view` as
            select likes.aid, sum(likes.like) as likes from likes group by likes.aid;');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */

    public function down()
    {
        DB::statement( 'DROP VIEW likes_view' );
    }

}
