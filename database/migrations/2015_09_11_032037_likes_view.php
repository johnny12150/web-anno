<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LikesView extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::Raw('create or replace view `likes_view` as
            select likes.aid, sum(likes.like) from likes group by likes.aid;');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::Raw( 'DROP VIEW likes_view' );
    }

}
