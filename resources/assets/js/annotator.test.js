Annotator.Plugin.myPlugin = function (element) {
  var myPlugin  = {};
  myPlugin.test = function(){
	   alert('sadsad');  
  }
  myPlugin.pluginInit = function () {
      this.annotator.viewer.addField({
        load: function (field, annotation) {
          field.innerHTML = message;
        }
      })
  };
  // Create your plugin here. Then return it.
  return myPlugin ;
};