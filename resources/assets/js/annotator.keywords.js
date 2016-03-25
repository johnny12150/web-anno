/**
 * Created by flyx on 8/21/15.
 */
/**
 * Created by flyx on 7/22/15.
 */
//Annotator.Plugin.Keyword 
function keywordInit(element, settings) {
	var keyword_index=1;
	var keywords=[];
    this.annotator = $(element).annotator().data('annotator');
	for(w in settings){
		var post_data={
			text :$(element).html()
		};
		for(var k in settings[w].data)
		{
			post_data[k]=settings[w].data[k];
		}
		$.ajax(settings[w].host , {
			method: 'POST',
			crossDomain: true,
			async: false,
			dataType: 'json',
			data :post_data,
			success: function(data) {
				var keyword_obj={name:settings[w].name,anno:[],color:settings[w].color,id:w};
				rangy.init();
				var textrange = rangy.createRange();
				var searchScopeRange = rangy.createRange();
				var serachelement=document.getElementsByClassName("annotator-wrapper")[0];
					searchScopeRange.selectNodeContents(serachelement);
				var options = {
						caseSensitive: false,
						wholeWordsOnly: false,
						withinRange: searchScopeRange,
						direction: "forward" // This is redundant because "forward" is the default
					};
				textrange.selectNodeContents(serachelement);
			   // searchResultApplier.undoToRange(range);
				for (i in data )
				{
					var row = data[i];
					 while (textrange.findText(row.keyword, options)) {
						var obj = {
								"id": "keyword-" + keyword_index.toString(),  // unique id (added by backend)
								"text": row.description,                  // content of annotation
								"quote": row.keyword,    // the annotated text (added by frontend)
								"uri": "",
								"domain": "",
								"link": "",
								"ranges": [                                // list of ranges covered by annotation (usually only one entry)
									{
										"start": getxpath(textrange.startContainer.parentElement,serachelement),           // (relative) XPath to start element
										"end":  getxpath(textrange.endContainer.parentElement,serachelement),             // (relative) XPath to end element
										"startOffset": textrange.startOffset,                      // character offset within start element
										"endOffset": textrange.endOffset                       // character offset within end element
									}
								],
								"user": {
									id: '0',
									gravatar:'',
									email: '',
									name:settings[w].name
								},                           // user id of annotation owner (can also be an object with an 'id' property)
								"type": "text",
								"position": {
									"x": "0",
									"y": "0"
								},
								"tags": [],             // list of tags (from Tags plugin)
								"likes": undefined,
								"src": "",
								"permissions": {                           //annotation permissions (from Permissions/AnnotateItPermissions plugin)
									"read": [],
									"update": [0],
									"delete": [0]
								}
							};
						keyword_obj.anno.push(obj);
						keyword_index++;
						textrange.collapse(false);
					}
				}
				keywords.push(keyword_obj);
			}
		});
	}
	return keywords;
};
function getxpath(elem,relativeRoot) {
	var idx, path, tagName;
	path = '';
	while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
		tagName = elem.tagName.replace(":", "\\:");
		idx = $(elem.parentNode).children(tagName).index(elem) + 1;
		idx = "[" + idx + "]";
		path = "/" + elem.tagName.toLowerCase() + idx + path;
		elem = elem.parentNode;
	}
	return path;
};