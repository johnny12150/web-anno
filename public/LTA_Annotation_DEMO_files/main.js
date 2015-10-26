//========================== subject-tree ==========================//
function replaceSubjectTree(classType) {
  // parse short class, and show active style on clicked anchor
  var shortClass = classType.substr(classType.lastIndexOf('#')+1);
  $('.class-type-section a').removeClass('active')
  $('#class-type-'+shortClass).addClass('active');
  
  // 清空先前點選的 subjects.
  $('#cache-select-subject').val(encodeURIComponent('{}'));
  $('#select_subject_text').val('');
  // 清空 subject-tree，並重新載入點選的 class
  $('#cache-select-class').val(classType);
  //~ $('#cache-filter-class').val(classType);
  $('.subject-tree-section').html('Loading...');
  var inputType = (classType=='http://data.asdc.tw/lod/ontology#Person' ? 'checkbox' : 'radio');
  $.ajax({
    url: 'fragment/subject_tree.php',
    method: 'POST',
    data: {'class':classType},
    dataType: 'html',
    success: function(html) {
      $('.subject-tree-section').html(html);
      $('#subject-tree').bonsai({
        checkboxes: true,
        createInputs: inputType,
      });
      // 消除 subject group 的 radio input.
      $('[name=radio-subject-group]').remove();
      
      $('#subject-tree input').click(selectSubject);
    },
    error: function(e) {
      console.log(e);
    },
  } );
}
function selectTimeSearch() {
  // show active style on clicked anchor
  $('.class-type-section a').removeClass('active')
  $('#class-type-Time').addClass('active');
  // 清空先前點選的 subjects.
  $('#cache-select-subject').val(encodeURIComponent('{}'));
  $('#select_subject_text').val('');
  // 清空 subject-tree
  $('#cache-select-class').val('Time');
  //~ $('#cache-filter-class').val('http://data.asdc.tw/lod/ontology#Person');
  $('.subject-tree-section').html('<div class="subject-tree">From <input id="time-begin-year" type="number" min="1" max="9999"> To <input id="time-end-year" type="number" min="1" max="9999"></div>');
}
function filterSubjectTree(text) {
  // 取得目前點選的 subject class.
  var classType = $('#cache-select-class').val();
  
  var selects = JSON.parse(decodeURIComponent($('#cache-select-subject').val()));
  var selectsTree = JSON.parse(decodeURIComponent($('#cache-subject-tree').val()));
  var firstPlaces = JSON.parse(decodeURIComponent($('#cache-first-places').val()));
  var locationPlaces = ['http://data.asdc.tw/lod/Place/PL0002', 'http://data.asdc.tw/lod/Place/PL0005', 'http://data.asdc.tw/lod/Place/PL0051', 'http://data.asdc.tw/lod/Place/PL0010', 'http://data.asdc.tw/lod/Place/PL0032', 'http://data.asdc.tw/lod/Place/PL0039', 'http://data.asdc.tw/lod/Place/PL0040'];
  var newHTML = '';
  var nowGroup = '';
  for (var id in selectsTree) {
    var label = selectsTree[id];
    var itemLabel = selectsTree[id];
    if ( (classType=='http://data.asdc.tw/lod/ontology#Place') && (locationPlaces.indexOf(id)>=0) ) {
      console.log('id');
      itemLabel = itemLabel + ' (location)';
    }
    // 不顯示 未涵關鍵字 的 subject
    if ( label.toLowerCase().indexOf(text.toLowerCase()) < 0 ) {
      continue;
    }
    if ( classType != 'http://data.asdc.tw/lod/ontology#Person' ) {
      var groupKey = (classType=='http://data.asdc.tw/lod/ontology#Place' ? firstPlaces[id] : label.substr(0, 1));
      if ( nowGroup != groupKey ) {
        if ( nowGroup.length > 0 ) {
          newHTML += '</ol></li>';
        }
        nowGroup = groupKey;
        newHTML += '<li data-name="radio-subject-group">'+nowGroup+'<ol>';
      }
    }
    // 檢查這個 subject 是否為 勾選狀態
    var checked = '';
    if ( id in selects ) {
      checked = 'data-checked="1"';
    }
    // 顯示 subject.
    newHTML += '<li data-name="subject-tree" data-value="'+id+'&&'+label+'"'+checked+'>'+itemLabel+'</li>';
  }
  if ( nowGroup.length > 0 ) {
    newHTML += '</ol></li>';
  }
  
  // 利用 bonsai 產生 input
  var inputType = (classType=='http://data.asdc.tw/lod/ontology#Person' ? 'checkbox' : 'radio');
  $('#subject-tree').html(newHTML);
  $('#subject-tree').bonsai('update');
  // 消除 subject group 的 radio input.
  $('[name=radio-subject-group]').remove();
  $('#subject-tree input').click(selectSubject);
}
function selectSubject() {
  // 取得本次點選 subject 的資料
  var values = $(this).attr('value').split('&&');
  var id = values[0];
  var label = values[1];
  
  // 取得目前點選的 subject class.
  var classType = $('#cache-select-class').val();
  // 只有 Person 有複數，會需要加上前一次的選擇
  var selects = null;
  if ( classType == 'http://data.asdc.tw/lod/ontology#Person' ) {
    // 取得目前暫存的 select json.
    selects = JSON.parse(decodeURIComponent($('#cache-select-subject').val()));
    if ( id in selects ) {
      delete selects[id];
    } else {
      selects[id] = label;
    }
    // 重新組成暫存的 select json.
    $('#cache-select-subject').val(encodeURIComponent(JSON.stringify(selects)));
  } else {
    selects = {};
    selects[id] = label;
    // 重新組成暫存的 select json.
    $('#cache-select-subject').val(encodeURIComponent(JSON.stringify(selects)));
  }
  // 將目前的選擇結果呈現在畫面上.
  var result = '';
  for (var key in selects) {
    if ( result.length > 0 ) {
      result += ' AND ';
    }
    label = selects[key];
    result += '['+label+']';
  }
   $('#select_subject_text').val(result);
}
//========================== list-content ==========================//
function searchListContent() {
  // 檢查 search-bar 有沒有輸入文字，
  // 有的話則使用 search-bar 來搜尋 而不是 subject-tree
  if ( $('#search-bar-input').val().length > 0 ) {
    $('#cache-search-type').val('bar');
    $('#cache-select-bar').val($('#search-bar-input').val());
    //~ $('#cache-select-class').val('http://data.asdc.tw/lod/ontology#Person');
    //~ $('#cache-filter-class').val('http://data.asdc.tw/lod/ontology#Person');
  } else {
    $('#cache-search-type').val('tree');
    // 如果是搜尋時間，改成利用 select-bar 來傳送時間
    if ( $('#cache-select-class').val() == 'Time' ) {
      $('#cache-search-type').val('bar');
      var timeValue = $('#time-begin-year').val() + '@' + $('#time-end-year').val()
      $('#cache-select-bar').val(timeValue);
    }
  }
  $('#cache-page').val('1'),
  $('#cache-total').val('0'),
  $('#cache-filter-class').val('All');
  replaceListContent();
}
function replaceListContent() {
  $('.list-content-panel').html('<div>Searching...</div>');
  $.ajax({
    url: 'fragment/list_content.php',
    method: 'POST',
    data: {
      'search-type': $('#cache-search-type').val(),
      'select-class': $('#cache-select-class').val(),
      'select-subject': $('#cache-select-subject').val(),
      'select-bar': $('#cache-select-bar').val(),
      'filter-class': $('#cache-filter-class').val(),
      'page': $('#cache-page').val(),
      'total': $('#cache-total').val(),
    },
    dataType: 'html',
    success: function(html) {
      $('.list-content-panel').html(html);
    },
    error: function(e) {
      console.log(e);
    },
  });
}
function changePage(page) {
  $('#cache-page').val(page);
  replaceListContent();
}
function changeFilterClass(classIRI) {
  $('#cache-page').val('1'),
  $('#cache-total').val('0'),
  $('#cache-filter-class').val(classIRI);
  replaceListContent();
}
function gotoResource(url) {
  $('#goto-form').attr('action', url);
  $('#goto-form').submit();
}
//========================== resource ==========================//
function openAwardDialog(award) {
  // 利用 ajax 來載入 award dialog 的資料與 html
  $.ajax({
    url: 'api/api_get_award_dialog.php',
    method: 'POST',
    data: {'award':award,},
    dataType: 'html',
    success: function(html) {
      $('#award_dialog').html(html);
      // 呈示 popup 的 dialog
      $('#award_dialog').dialog({
        title: award,
        minWidth: 300,
        minHeight: 300,
        width: 500,
        height: 500,
      });
    },
    error: function(error) {
      console.log(error);
    },
  });
}

//~ function gotoList() {
  //~ $('#goto-form').attr('action', 'index.php');
  //~ $('#goto-form').submit();
//~ }
