/**
 * Created by flyx on 8/21/15.
 */
/**
 * Created by flyx on 7/22/15.
 */
Annotator.Plugin.KeywordsAnnotation = function (element, settings) {

    var scope = this;
    var _element = element;

    this.init = function() {
        $.ajax('http://140.109.18.158/api/annotation.jsp', {
            mathod: 'POST',
            crossDomain: true,
            data :{

                text : $(element).html()
            },
            success: function(e) {
                console.log(e);
            }
        });

    };


    return {
        pluginInit: function () {
            scope.init();
            this.annotator
                .subscribe("annotationCreated", function (annotation) {

                })
                .subscribe("annotationDeleted", function (annotation) {


                })
                .subscribe("annotationsLoaded", function (annotations) {

                });
        }
    }
}
