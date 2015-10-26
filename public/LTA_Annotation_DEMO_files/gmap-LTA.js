var gmaps = null;
var infoWindow = new google.maps.InfoWindow({ content: '', });


function replaceMapInfoSection(mapInfos) {
  var baseURL = 'https://maps.gstatic.com/mapfiles/ms2/micons/';
  var html = '';
  for (var markerType in mapInfos) {
    var color = mapInfos[markerType];
    // 檢查 icon 是圖片，還是只是一個色塊而已
    if ( color.indexOf('#') < 0 ) {
      var icon = baseURL + color + '-dot.png';
      html += '<div class="gmap-info"><span>'+markerType;
      html += ' : </span><img src="'+icon+'"/></div>';
    } else {
      html += '<div class="gmap-info"><span>'+markerType;
      html += ' : </span><span class="gmap-info-color-brick" style="background-color:'+color+';"/></div>';
    }
  }
  $('.gmap-info-section').html(html);
}

function initializeMap(centralize) {
  var latitude = 27.117150;
  var longitude = 123.635542;
  // 如果有給與 centralize，則使用給與的 lat、lng
  if ( (centralize!=null) && (centralize['latitude']!=null) && (centralize['longitude']!=null) ) {
    latitude = parseFloat(centralize['latitude']);
    longitude = parseFloat(centralize['longitude']);
  }
  console.log(latitude);
  console.log(longitude);
  
  gmaps = new GMaps({
    div: '#gmap-container',
    lat: latitude, 
    lng: longitude,
    zoom: 6,
    disableDefaultUI: true,
  });
}

function addMakers(markerList) {
  // 檢查此地圖是否有 marker
  if ( markerList == null ) {
    return;
  }
  
  var baseURL = 'https://maps.gstatic.com/mapfiles/ms2/micons/';
  for (var i=0; i<markerList.length; i++) {
    var data = markerList[i];
    var marker = gmaps.addMarker({
      lat: data['latitude'],
      lng:  data['longitude'],
      title: data['title'],
      icon: baseURL + data['color'] + '-dot.png',
      zIndex: 10,
      //~ optimized: false,
      subject: data['subject'],
    });
    
    marker.addListener('click', clickMarker);
  }
}

function addCircles(circleList) {
  // 檢查此地圖是否有 circle
  if ( circleList == null ) {
    return;
  }
  
  for (var i=0; i<circleList.length; i++) {
    var data = circleList[i]
    // 決定 circle 的 尺寸
    var number = data['number'];
    var radisu = 0;
    if ( number == 0 ) {
      return;
    } else if ( (number>0) && (number<=5) ) {
      radius = 40000;
    } else if ( (number>5) && (number<=10) ) {
      radius = 80000;
    } else {
      radius = 120000;
    }
    
    var circle = gmaps.drawCircle({
      lat: data['latitude'],
      lng:  data['longitude'],
      fillColor: data['color'],
      fillOpacity: 0.5,
      strokeWeight: 1,
      strokeColor: data['color'],
      radius: radius,
      title: data['number'],
    });
    
    circle.addListener('mouseover', function() {
      this['map'].getDiv().setAttribute('title', 'Participants: '+this['title']);
    });
    circle.addListener('mouseout', function() {
      this['map'].getDiv().removeAttribute('title');
    });
  }
}

function addPolygons(polygonList) {
  // 檢查此地圖是否有 polygon
  if ( polygonList == null ) {
    return;
  }
  
  var polygons = [];
  for (var i=0; i<polygonList.length; i++) {
    var points = JSON.parse(polygonList[i]);
    // 將每個點的 latitude 首 longtitude 交換，
    // 因為 GeoJSON 的 point 格式為 [longtitude, latitude]
    for (var pointIndex=0; pointIndex<points.length; pointIndex++) {
      var buffer = points[pointIndex][0];
      points[pointIndex][0] = points[pointIndex][1];
      points[pointIndex][1] = buffer;
    }
    
    polygons[polygons.length] = [points];
  }

  var polygon = gmaps.drawPolygon({
    paths: polygons,
    useGeoJSON: true,
    strokeColor: '#F33',
    strokeOpacity: 0.75,
    strokeWeight: 1,
    fillColor: '#F33',
    fillOpacity: 0.5,
  });
}

function clickMarker() {
  infoWindow.close();
  var self = this;
  var subject = self['subject'];
  $.ajax({
    url: 'api/api_get_map_click_data.php',
    method: 'POST',
    data: {'location':subject,},
    dataType: 'html',
    success: function(html) {
      infoWindow.setContent(html);
      infoWindow.open(self['map'], self);
    },
    error: function(error) {
      console.log(error);
    },
  });
}
