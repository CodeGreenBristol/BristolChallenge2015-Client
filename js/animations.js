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
    
function showEditButtons(){   
    $('#area-left').addClass('area-small');
    setTimeout(function(){
        $('#undo-button').css('transform', 'scale(0.01)').show().css('transform', 'scale(1)');
        $('#submit-button').css('transform', 'scale(0.01)').show().css('transform', 'scale(1)');
    }, 150);
}
    
function hideEditButtons(){
    $('#undo-button').css('transform', 'scale(0.01)');
    $('#submit-button').css('transform', 'scale(0.01)');
    setTimeout(function(){
        $('#undo-button').hide();
        $('#submit-button').hide();
        $('#area-left').removeClass('area-small');
    }, 100); 
}