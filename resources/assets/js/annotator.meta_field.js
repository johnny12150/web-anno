Annotator.Plugin.Meta_field = (function(_super) {
      __extends(Meta_field, _super);
	 var cyberisland_key=['contributor','temporalCoverage','mainEntity','contentLocation','keyword'];
	
      function Meta_field() {
          this.setAnnotationMeta_field = __bind(this.setAnnotationMeta_field, this);
          this.updateField = __bind(this.updateField, this);
          return Meta_field.__super__.constructor.apply(this, arguments);
      }


      Meta_field.prototype.field = null;
      Meta_field.prototype.input = null;

      Meta_field.prototype.pluginInit = function() {
          if (!Annotator.supported()) {
              return;
          }
          this.field = this.annotator.editor.addField({
              load:this.updateField,
			  submit: this.setAnnotationMeta_field
          });
          return this.input = $(this.field).find(':input');
      };
      Meta_field.prototype.updateField = function(field, annotation) {
			var cyberisland_meta=['圖像內容人物: schema:contributor','圖像內容時間: schema:temporalCoverage','圖像內容物件: schema:mainEntity','圖像內容地點: schema:contentLocation','圖像事件/動作 schema:keyword'];
			var meta_inputs="";
			var metas;
			if (annotation.metas) {
				metas=JSON.parseJSON(annotation.metas);
			}
			for (i = 0; i < cyberisland_meta.length; i++) {
				var meta_data="";
				if (annotation.metas) {
					meta_data=metas[cyberisland_key[i]];
				}
				meta_inputs += '<div style="padding: 8px 6px;"><input id="'+cyberisland_key[i]+'" placeholder="'+cyberisland_meta[i]+'" value="'+meta_data+'" style="width:100%;border:0px;outline:none;font-size: 12px;"></div>';
			}
			$(this.field).html(meta_inputs);
			return this.input;
      };
      Meta_field.prototype.setAnnotationMeta_field = function(field, annotation) {
		var cyberisland_key=['contributor','temporalCoverage','mainEntity','contentLocation','keyword'];
		var temp=new Object();
		for (i = 0; i < cyberisland_key.length; i++) {
			temp[cyberisland_key[i]]=$('#'+cyberisland_key[i]).val();
		}
        return annotation.metas = JSON.stringify(temp);
      };
     
      return Meta_field;
})(Annotator.Plugin);

