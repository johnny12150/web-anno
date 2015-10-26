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
    mix.sass(["style.scss","anno.scss"], 'public/css', {includePaths: [paths.bootstrap + 'stylesheets/']})
        .copy(paths.bootstrap + 'fonts/bootstrap/**', 'public/fonts')
        .scripts(['./public/js/gettext.js',
            './public/js/annotator-full.js',
            './public/js/richText-annotator.min.js',
            './public/js/annotator.img.js',
            './public/js/annotator.panel.js',
            './public/js/annotator.keywords.js',
            './public/js/annotation.js'],
        'public/js/annotation.full.js', './');
});


