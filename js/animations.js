// hide login page
$('#login-button').click(function() {
	$('#email-field').fadeOut(200);
	$('#password-field').fadeOut(200);
	$('#login-button').fadeOut(200);
	$('#loading-animation').fadeIn(200);
	$('#login-container').delay(2000).animate({'margin-left': -$(window).width() + "px"}, 300);
	//$('#login-container').fadeOut(300);
});

function hidePopup(){
    $('#popup').addClass('scaling').css("transform", "scale(0.01)");
    setTimeout(function(){
        $('#popup').removeClass('scaling').hide();
    }, 200);
}

function showPopup(){
    $('#popup').css("transform", "scale(0.01)").show();
    setTimeout(function(){
        $('#popup').addClass('scaling').css("transform", "scale(1)");
        setTimeout(function(){
            $('#popup').removeClass('scaling');
        }, 200);
    }, 0);
}

function showDrawMenu(){
    
    $('#default-menu').children().css("transform", "scale(0.01)");
    
    setTimeout(function(){
        $('#default-menu').hide();
        $('#draw-menu').children().css("transform", "scale(0.01)");
        $('#draw-menu').show();
        setTimeout(function(){
            $('#draw-menu').children().css("transform", "scale(1)");
        }, 100);
    }, 100);
}

function hideDrawMenu(){
    
    $('#draw-menu').children().css("transform", "scale(0.01)");
    
    setTimeout(function(){
        $('#draw-menu').hide();
        $('#default-menu').children().css("transform", "scale(0.01)");
        $('#default-menu').show();
        setTimeout(function(){
            $('#default-menu').children().css("transform", "scale(1)");
        }, 100);
    }, 100);
}
    
function showDrawTypes(){
    $('#draw-types').show();    
    $('.ind-draw').each(function(key, val){
        $(val).delay(50 * key).animate({bottom: 0}, 150);
    });
}

function hideDrawTypes(){
    $('.ind-draw').each(function(key, val){
        $(val).delay(50 * key).animate({bottom: -160}, 150);
    });   
    $('.ind-draw').promise().done(function() { $('#draw-types').hide(); });
}

function showUndoButton(){   
    $('#area-left').addClass('area-small');
    setTimeout(function(){
        $('#undo-button').css('transform', 'scale(0.01)').show().css('transform', 'scale(1)');
    }, 100);
}
    
function hideUndoButton(){
    $('#undo-button').css('transform', 'scale(0.01)');
    setTimeout(function(){
        $('#undo-button').hide();
        $('#area-left').removeClass('area-small');
    }, 100); 
}

function expandMenu() {
	$('#draw-button').fadeOut(300);		
	$('#menu-button').fadeOut(300);
	$('#menu-button-duplicate').fadeIn(300);
	$('#outer-menu-button').animate({'margin-left': '265px'});
    $('#side-menu').animate({'left': '0px'});
    $('#mask-layer').fadeIn(400);
}

function collapseMenu() {
	$('#draw-button').fadeIn(200);
	$('#mask-layer').fadeOut(400);
	$('#menu-button').fadeIn(300);
	$('#menu-button-duplicate').fadeOut(300);
	$('#outer-menu-button').animate({'margin-left': '15px'}, 400);
	$('#side-menu').animate({'left': '-260px'}, {duration: 400});
}

// expand menu
$('#outer-menu-button').click(function() {
	if(!$('#menu-button-duplicate').is(':visible'))
		expandMenu();
	else 
		collapseMenu();
});

// collapse menu when click outside of italics
$('#mask-layer').click(function() {
	collapseMenu();
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