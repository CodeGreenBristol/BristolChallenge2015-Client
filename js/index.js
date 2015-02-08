// hide login page
$('#login-button').click(function() {
	$('#email-field').fadeOut(200);
	$('#password-field').fadeOut(200);
	$('#login-button').fadeOut(200);
	$('#loading-animation').fadeIn(200);
	$('#login-container').delay(2000).animate({'margin-left': -$(window).width() + "px"}, 300);
	//$('#login-container').fadeOut(300);
});

var map;
var colours = ['#47d282', '#dd6ca2', '#f4d248'];
var selectedColour = 0;
var polygonArray = [];
var permanentPolygons = [];
var spaceLeft = 10000;
var drawListener;

function formattedNumber(number){ 
    return number.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 "); 
}

function refreshSpaceLeft(){
    $('#number-left').text(formattedNumber(spaceLeft));
}
    
function initialize() {
    
    var mapOptions = {
        center: new google.maps.LatLng(51.45, -2.6),
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}]
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
   
}
refreshSpaceLeft();

google.maps.event.addDomListener(window, 'load', initialize);

$('#popup-close').click(function(){
    hidePopup();
});
    
function drawFreeHand(){
    
    if($('#popup').is(":visible") && !$('#popup').hasClass('scaling')) hidePopup();
    
    var polyline = new google.maps.Polyline({ map: map, clickable: false, strokeColor: colours[selectedColour] });

    // move listener
    var move = google.maps.event.addListener(map, 'mousemove', function(e){
        polyline.getPath().push(e.latLng);        
    });
    
    //mouseup listener
    google.maps.event.addListenerOnce(map, 'mouseup', function(e){
        google.maps.event.removeListener(move);
        var path = polyline.getPath();
        polyline.setMap(null);             
        
        var pointsArray = GDouglasPeucker(path.j, 3);
        
        // make sure at least 3 points
        if(pointsArray.length < 3) return;       
        
        var polygon = new google.maps.Polygon({
            map: map,
            fillColor: colours[selectedColour],
            fillOpacity: 0.7,
            strokeColor: colours[selectedColour],
            strokeWeight: 2,
            clickable: false,
            zIndex: 1,
            path: pointsArray,
            editable: false
        });
        
        // area calculations
        var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
        var newArea = spaceLeft - area;
        if(newArea < 0){
            polygon.setMap(null);
            showPopup();
        }
        else {
            spaceLeft = newArea;
            refreshSpaceLeft();
            if(polygonArray.length == 0){
                showEditButtons();
            }
            polygonArray.push({"shape": polygon, "type": selectedColour, "area": area});
        }
    });
    
    //google.maps.event.clearListeners(map.getDiv(), 'mousedown');
    
    //google.maps.event.addDomListener(map.getDiv(), 'mousedown', drawFreeHand);  
    
}

function beginDraw(){
    
    drawListener = google.maps.event.addDomListener(map.getDiv(), 'mousedown', drawFreeHand); 
    
    map.setOptions({
        draggable: false, 
        scrollwheel: false, 
        disableDoubleClickZoom: true
    });
}

function endDraw(){
    
    google.maps.event.removeListener(drawListener);
    // google.maps.event.clearListeners(map.getDiv(), 'mousedown');
    
    map.setOptions({
        draggable: true, 
        scrollwheel: true, 
        disableDoubleClickZoom: false
    });         
}

// draw type click handler
$('.ind-draw').click(function(){
    if(!$(this).hasClass('draw-active')) {
        $('.ind-draw.draw-active').removeClass('draw-active');
        $(this).addClass('draw-active');
        
        endDraw();
        if($(this).attr("id") != "pan-map"){
            if($(this).attr("id") == "draw-flowers") selectedColour = 1;
            else if($(this).attr("id") == "draw-park") selectedColour = 2;
            else selectedColour = 0;            
            
            beginDraw();                    
        }
    }
});

// draw button click handler
$('#draw-button').click(function(){
    
    showDrawMenu();
    showDrawTypes();
    
    $('.draw-active').removeClass('draw-active');
    $('#pan-map').addClass('draw-active');
});

// cancel draw button click handler
$('#cancel-button').click(function(){
    
    hideDrawMenu();
    hideDrawTypes();
    hidePopup();
    hideEditButtons();
    
    $.each(polygonArray, function(key, val){
        val.shape.setMap(null);
    });
    polygonArray = [];
    
    endDraw();
});

// submit draw button click handler
 $('#submit-button').click(function(){
    
    hideDrawMenu();
    hideDrawTypes();      
    hidePopup();
    
    var polygonData = [];
    $.each(polygonArray, function(key, val){
        var indPolygonData = [];
        $.each(val.shape.getPath().getArray(), function(key, val){
            indPolygonData.push({"lat": val.lat(), "lon": val.lng()});
        });
        polygonData.push({"type": val.type, "points": indPolygonData, "center": centerCoords(indPolygonData)});
    });
       
    permanentPolygons = permanentPolygons.concat(polygonData);
    polygonArray = [];
    endDraw();
    
    $.ajax({
        type: "POST",
        url: "http://178.62.54.23:3000/post",
        data: JSON.stringify(polygonData),
        contentType: "text/plain",
        success: function(data){ }
    });
});

// get center lat long of polygon
function centerCoords(pointsArray){
    var lat = 0, lon = 0;
    for(var i = 0; i < pointsArray.length; i++){
         lat += pointsArray[i].lat;
         lon += pointsArray[i].lon;
    }
    lat /= pointsArray.length;
    lon /= pointsArray.length;
    return {"lat": lat, "lon": lon};
}
    
// undo draw button click handler
$('#undo-button').click(function(){
    
    var polygon = polygonArray.pop();

    if(typeof polygon !== "undefined"){
        polygon.shape.setMap(null);
        spaceLeft += polygon.area;
        refreshSpaceLeft();
    }
    if(polygonArray.length == 0) {
        hideEditButtons();
    }
});


// expand menu
$('#outer-menu-button').click(function() {
	if(!$('#menu-button-duplicate').is(':visible')) {
		$('#draw-button').fadeOut(300);		
		$('#menu-button').fadeOut(300);
		$('#menu-button-duplicate').fadeIn(300);
		$('#outer-menu-button').animate({'margin-left': '265px'});
        $('#side-menu').animate({'left': '0px'});
        $('#mask-layer').fadeIn(400);
	}
	else {
		$('#draw-button').fadeIn(200);
		$('#mask-layer').fadeOut(400);
		$('#menu-button').fadeIn(300);
		$('#menu-button-duplicate').fadeOut(300);
		$('#outer-menu-button').animate({'margin-left': '15px'}, 400);
		$('#side-menu').animate({'left': '-260px'}, {duration: 400});
	}
});

// toggle Community Map
$('#toggle-map-container').click(function() {
	if(!$('#toggle-map-container').hasClass('toggled')) {
		$('#toggle-map-button').css({'background-color': '#fc4700'});
		$('#toggle-map-cursor').animate({'margin-left': '18px'}, 200);
		$('#toggle-map-container').addClass('toggled');
	}
	else {
		$('#toggle-map-button').css({'background-color': '#26df35'});
		$('#toggle-map-cursor').animate({'margin-left': '0px'}, 200);
		$('#toggle-map-container').removeClass('toggled');
	}
});

var treePoints = [], flowerPoints = [], parkPoints = [];
$.ajax({
  url: "http://178.62.54.23:3000/getdata",
  dataType: "json",
  success: function (data) {

      for(j in data){
        var obj = data[j];

        var weight_trees = obj["weight_tree"];
        var weight_flowers = obj["weight_flower"];
        var weight_park = obj["weight_park"];
        var max = Math.max(weight_park, weight_flowers, weight_trees)
        var lat = parseFloat(obj["lat"]) / 10000;
        var lon = parseFloat(obj["lon"]) / 10000;

        if(max == weight_flowers){
            while(weight_flowers!=0.0) {
                flowerPoints.push(new google.maps.LatLng(lat, lon));
                weight_flowers = weight_flowers - 1.0;
            }
        }
        else if(max == weight_park) {
            while(weight_park != 0.0) {
                parkPoints.push(new google.maps.LatLng(lat, lon));
                weight_park = weight_park - 1.0;
            }
        }
        else {
            while(weight_trees != 0.0) {
                treePoints.push(new google.maps.LatLng(lat, lon));
                weight_trees = weight_trees - 1.0;
            }
        }      
    }
    initializeHeatmap();
  }
});

function initializeHeatmap() {

  var pointArray = new google.maps.MVCArray(treePoints);

  var pointArray2 = new google.maps.MVCArray(flowerPoints);
  var pointArray3 = new google.maps.MVCArray(parkPoints);
  var gradient_trees = [
    'rgba(71, 210, 130, 0)',
    'rgba(71, 210, 130, 1)',
    'rgba(43, 139, 84, 1)'
  ];
  var gradient_flowers = [
    'rgba(0, 255, 0, 0)',
    'rgba(221, 108, 162, 1)',
    'rgba(154, 65, 108, 1)'
  ];
  var gradient_park = [
    'rgba(255, 0, 0, 0)',
    'rgba(244, 201, 72, 1)',
    'rgba(197, 170, 58, 1)'
  ];
  heatmap_trees = new google.maps.visualization.HeatmapLayer({
    data: pointArray
  });
  heatmap_flowers = new google.maps.visualization.HeatmapLayer({
    data: pointArray2
  });
  heatmap_park = new google.maps.visualization.HeatmapLayer({
    data: pointArray3
  });
  heatmap_trees.set('gradient', heatmap_trees.get('gradient') ? null : gradient_trees);
  heatmap_flowers.set('gradient', heatmap_flowers.get('gradient') ? null : gradient_flowers);
  heatmap_park.set('gradient', heatmap_park.get('gradient') ? null : gradient_park);
  heatmap_trees.set('radius', heatmap_trees.get('radius') ? null : 15);
  heatmap_flowers.set('radius', heatmap_flowers.get('radius') ? null : 15);
  heatmap_park.set('radius', heatmap_park.get('radius') ? null : 15);
  heatmap_park.setMap(map);
  heatmap_trees.setMap(map);
  heatmap_flowers.setMap(map);
}
