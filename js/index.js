// hide login page
$('#login-button').click(function() {
	$('#email-field').fadeOut(200);
	$('#password-field').fadeOut(200);
	$('#login-button').fadeOut(200);
	$('#loading-animation').fadeIn(200);
	$('#login-container').delay(2000).animate({'margin-left': -$(window).width() + "px"}, 300);
	/*$('#login-container').fadeOut(300);*/
});

var map;
var colours = ['#47d282', '#dd6ca2', '#f4d248'];
var selectedColour = 0;
var polygonArray = [];
var permanentPolygons = [];
var spaceLeft = 10000;

function formattedNumber(number){ 
    return number.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 "); 
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
$('#number-left').text(formattedNumber(spaceLeft));

google.maps.event.addDomListener(window, 'load', initialize);

$('#map-canvas').click(function(){
    setTimeout(function(){
        if($('#popup').is(":visible") && !$('#popup').hasClass('scaling')) hidePopup();
    }, 50);
});

$('#popup-close').click(function(){
    hidePopup();
});
    
function drawFreeHand(){

    var polyline = new google.maps.Polyline({ map: map, clickable: false, strokeColor: colours[selectedColour] });

    // move listener
    var move = google.maps.event.addListener(map, 'mousemove touchmove', function(e){
        polyline.getPath().push(e.latLng);        
    });
    
    //mouseup listener
    var mouseup = google.maps.event.addListenerOnce(map, 'mouseup touchend', function(e){
        google.maps.event.removeListener(move);
        var path = polyline.getPath();
        polyline.setMap(null);             
        
        var pointsArray = GDouglasPeucker(path.j, 10);
        
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
            $('#number-left').text(formattedNumber(spaceLeft));
            if(polygonArray.length == 0){
                showUndoButton();
            }
            polygonArray.push({"shape": polygon, "type": selectedColour});
        }
    });
    
    google.maps.event.clearListeners(map.getDiv(), 'mousedown touchstart');
    
    google.maps.event.addDomListener(map.getDiv(), 'mousedown touchstart', function(){
        drawFreeHand();
    });   
}

function beginDraw(){
            
    map.setOptions({
        draggable: false, 
        scrollwheel: false, 
        disableDoubleClickZoom: true
    });
    
    google.maps.event.addDomListener(map.getDiv(), 'mousedown touchstart', function(){
        drawFreeHand();
    });   
}

function endDraw(){
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
        
        if($(this).attr("id") == "pan-map"){           
            endDraw();
        }
        else {
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
    
    hideDrawTypes();

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

    if(typeof polygon !== "undefined") polygon.shape.setMap(null);
    if(polygonArray.length == 0) {
        hideUndoButton();
    }
});

// expand menu
$('#outer-menu-button').click(function() {
	if(!$('#menu-button-duplicate').is(':visible')) {
		$('#draw-button').fadeOut(200);
		$('#mask-layer').fadeIn(400);
		$('#menu-button').fadeOut(300);
		$('#menu-button-duplicate').fadeIn(300);
		$('#outer-menu-button').animate({'margin-left': '265px'}, 400);
		$('#side-menu').animate({'left': '0px'}, {duration: 400});
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