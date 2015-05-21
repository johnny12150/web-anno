var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */

var paths = {
    'jquery': './vendor/bower_components/jquery/',
    'bootstrap': './vendor/bower_components/bootstrap-sass-official/assets/'
}

elixir(function(mix) {
    mix.sass("style.scss", 'public/css/', {includePaths: [paths.bootstrap + 'stylesheets/']})
        .sass("anno.scss", 'public/css/')
        .copy(paths.bootstrap + 'fonts/bootstrap/**', 'public/fonts')
        .scripts([
            paths.jquery + 'dist/jquery.min.js',
            paths.bootstrap + 'javascripts/bootstrap.min.js'
        ],'./public/js/all.js', './');
});
