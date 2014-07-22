var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_RIGHT = 39;
var KEY_LEFT = 37;
var KEY_SPACE = 32;

var gestStartX = 0;
var gestStartY = 0;

function pauseClick() {
    switch(tetris.state) {
        case tetris.STATE_RUNNING: 
            tetris.stop();
            document.getElementById('start').innerHTML = '▶';
            break;     
        
        case tetris.STATE_FINISHED: 
            tetris.reset();
            
        case tetris.STATE_STOPPED: 
            tetris.start();
            document.getElementById('start').innerHTML = '&#8214;';
            break;                                     
    }    
}

function supportsLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function showRecord() {
    var placeholder = document.getElementById('record');
    var record = localStorage.getItem('record');
    if (!record) record = "0";
    placeholder.innerHTML = record;    
}

tetris.onGameFinish = function() {
    alert('Game over !');    
    document.getElementById('start').innerHTML = '▶';
    if (supportsLocalStorage()) {
        var record = localStorage.getItem('record');
        if (record < tetris.score) {
            localStorage.setItem('record', tetris.score);        
        }
    }
    showRecord();    
};

tetris.onNextLevel = function(level) {
    document.getElementById('level').innerHTML = level;
};

tetris.onScoreChanged = function(score) {
    document.getElementById('score').innerHTML = score;
};

tetris.init('stack', 'preview');

document.onkeydown = function(e) {
    var key = (window.event) ? event.keyCode : e.keyCode;     
    
    switch(key) {
        case KEY_UP: {
            tetris.rotate();
            break
        }
        case KEY_DOWN: {
            tetris.down();
            break;
        }
        case KEY_RIGHT: {
            tetris.right();
            break;
        }
        case KEY_LEFT: {
            tetris.left();
            break;
        }
        case KEY_SPACE: {
            pauseClick();
            break;
        }
    }
}; 

document.getElementById('left').onclick = function(e) {
    tetris.left();
};

document.getElementById('right').onclick = function(e) {
    tetris.right();
};

document.getElementById('down').onclick = function(e) {
    tetris.down();
};

document.getElementById('rotate').onclick = function(e) {
    tetris.rotate();
};

document.getElementById('start').onclick = function(e) {
    pauseClick();
};

if (supportsLocalStorage()) {
    showRecord();
} else {
    document.getElementById('record-block').style.visibility = 'hidden';
}

document.ontoushctart = function(e) {
    var touch = e.touches[0];
    gestStartX = touch.pageX;
    gestStartY = touch.pageY;
};

document.ontouchend = function(e) {
    var touch = e.touches[0];
    down(touch.pageX, touch.pageY);
};


document.onmousedown = function(e) {
    gestStartX = e.pageX;
    gestStartY = e.pageY;
};

function down(x, y) {
    var xDiff = x - gestStartX;
    var yDiff = y - gestStartY;
    
    gestStartX = 0;
    gestStartY = 0;
    
    document.getElementById('cx').innerHTML = xDiff;
    document.getElementById('cy').innerHTML = yDiff;    
}



document.onmouseup = function(e) {
    var x = e.pageX;
    var y = e.pageY;

    down(x,y);
};
