var map;
var colours = ['#47d282', '#dd6ca2', '#f4d248'];
var selectedColour = 0;
var polygonArray = [];
var permanentPolygons = [];

function initialize() {
    
    var mapOptions = {
        center: new google.maps.LatLng(51.45, -2.6),
        zoom: 14,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}]
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
   
}

google.maps.event.addDomListener(window, 'load', initialize);

function drawFreeHand(){

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

        var polygon = new google.maps.Polygon({
            map: map,
            fillColor: colours[selectedColour],
            fillOpacity: 0.7,
            strokeColor: colours[selectedColour],
            strokeWeight: 2,
            clickable: false,
            zIndex: 1,
            path: GDouglasPeucker(path.j, 10),
            editable: false
        });
        
        if(polygonArray.length == 0) $('#undo-button').show();
        polygonArray.push(polygon);
     
    });
}


function beginDraw(){
            
    map.setOptions({
        draggable: false, 
        scrollwheel: false, 
        disableDoubleClickZoom: true
    });
    
    google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(){
        drawFreeHand();
    });   
}

function endDraw(){
    
    map.setOptions({
        draggable: true, 
        scrollwheel: true, 
        disableDoubleClickZoom: false
    });
    
    google.maps.event.clearListeners(map.getDiv(), 'mousedown');
    
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
    $('#default-menu').hide();
    $('#draw-menu').show();
    $('#draw-types').show();      
    $('.draw-active').removeClass('draw-active');
    $('#pan-map').addClass('draw-active');
});

// cancel draw button click handler
$('#cancel-button').click(function(){
    $('#draw-menu').hide();
    $('#draw-types').hide();
    $('#default-menu').show();
 
    $.each(polygonArray, function(key, val){
        val.setMap(null);
    });
    polygonArray = [];
    
    endDraw();
});

// submit draw button click handler
 $('#submit-button').click(function(){
    $('#draw-menu').hide();
    $('#draw-types').hide();
    $('#default-menu').show();
                    
    var polygonData = [];
    $.each(polygonArray, function(key, val){
        var indPolygonData = [];
        $.each(val.getPath().getArray(), function(key, val){
            indPolygonData.push({"lat": val.lat(), "lon": val.lng()});
        });
        polygonData.push({"type": selectedColour, "points": indPolygonData});
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

// undo draw button click handler
$('#undo-button').click(function(){
    
    var polygon = polygonArray.pop();
    if(typeof polygon !== "undefined") polygon.setMap(null);
    if(polygonArray.length == 0) $('#undo-button').hide();
});