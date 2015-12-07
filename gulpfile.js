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
    mix.sass(
        [
            "style.scss"
        ],
        'public/css/style.css',
        {
            includePaths:
                [
                    paths.bootstrap + 'stylesheets/'
                ]
        })
        .sass([
            "annotation.scss"
        ],
        "public/css/annotation.css")
        .copy(paths.bootstrap + 'fonts/bootstrap/**', 'public/fonts')
        .scripts(
        [
            'gettext.js',
            'annotator-full.js',
            'richText-annotator.min.js',
            'annotator.img.js',
            'annotator.panel.js',
            'annotator.keywords.js',
            'annotation.js'
        ],
        'public/js/annotation.full.js',
        'resources/assets/js');
});


