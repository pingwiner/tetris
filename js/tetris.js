 
var tetris = {
    STATE_STOPPED: 0,
    STATE_RUNNING: 1,
    STATE_FINISHED: 2,
    
    cellSize: 20,
    stackWidth: 10,
    stackHeight: 17,
    tickTime: 1000,
    stack: null,
    ctx: null,
    field: [],    
    timer: null,
    state: 0,
    score: 0,
    onGameFinish: null,
    onNextLevel: null,
    onScoreChanged: null,
    preview: null,
    previewCtx: null,
    lineCount: 0,
    level: 1,
    
    colors: [
        '#FFFFFF',
        '#6633FF',
        '#FF0099',
        '#33CC33',
        '#FFCC33',
        '#99CC99',
        '#990099',
        '#FF6600'
    ],    
    
    figure: {
        TYPE_SQUARE: 0,
        TYPE_STICK: 1,
        TYPE_L: 2,
        TYPE_REVERSE_L: 3,
        TYPE_S: 4,
        TYPE_REVERSE_S: 5,
        TYPE_T: 6,
        
        masks: [[[1,0,0,0],
                 [1,0,0,0],
                 [1,0,0,0],
                 [1,0,0,0]],
                
                [[1,1,0,0],
                 [1,1,0,0],
                 [0,0,0,0],
                 [0,0,0,0]],

                [[1,0,0,0],
                 [1,0,0,0],
                 [1,1,0,0],
                 [0,0,0,0]],

                [[0,1,0,0],
                 [0,1,0,0],
                 [1,1,0,0],
                 [0,0,0,0]],

                [[0,1,1,0],
                 [1,1,0,0],
                 [0,0,0,0],
                 [0,0,0,0]],

                [[1,1,0,0],
                 [0,1,1,0],
                 [0,0,0,0],
                 [0,0,0,0]],

                [[0,1,0,0],
                 [1,1,1,0],
                 [0,0,0,0],
                 [0,0,0,0]]],
         
        transform: [[[[-1, 1], [0,0], [ 1,-1], [ 2,-2]],
                     [[ 1,-1], [0,0], [-1, 1], [-2, 2]],
                     [[-1, 1], [0,0], [ 1,-1], [ 2,-2]],
                     [[ 1,-1], [0,0], [-1, 1], [-2, 2]]],    
                
                    [[[0, 0], [0, 0], [0, 0], [0, 0]],
                     [[0, 0], [0, 0], [0, 0], [0, 0]],
                     [[0, 0], [0, 0], [0, 0], [0, 0]],
                     [[0, 0], [0, 0], [0, 0], [0, 0]]],

                    [[[ 0, 2], [ 1, 1], [ 2, 0], [ 1,-1]],
                     [[ 2, 0], [ 1,-1], [ 0,-2], [-1,-1]],
                     [[ 0,-2], [-1,-1], [-2, 0], [-1, 1]],
                     [[-2, 0], [-1, 1], [ 0, 2], [ 1, 1]]],
                 
                    [[[-2, 0], [-1,-1], [ 1,-1], [ 0,-2]],
                     [[ 0, 2], [-1, 1], [-1,-1], [-2, 0]],
                     [[ 2, 0], [ 1, 1], [-1, 1], [ 0, 2]],
                     [[ 0,-2], [ 1,-1], [ 1, 1], [ 2, 0]]],

                    [[[ 0, 1], [-1, 0], [ 2, 1], [ 1, 0]],
                     [[ 0,-1], [ 1, 0], [-2,-1], [-1, 0]],
                     [[ 0, 1], [-1, 0], [ 2, 1], [ 1, 0]],
                     [[ 0,-1], [ 1, 0], [-2,-1], [-1, 0]]],

                    [[[ 2, 0], [ 1,  1], [0, 0], [-1, 1]],
                     [[-2, 0], [-1, -1], [0, 0], [ 1,-1]],
                     [[ 2, 0], [ 1,  1], [0, 0], [-1, 1]],
                     [[-2, 0], [-1, -1], [0, 0], [ 1,-1]]],

                    [[[-1, 1], [ 1, 1], [0, 0], [-1,-1]],
                     [[ 1, 1], [ 1,-1], [0, 0], [-1, 1]],
                     [[ 1,-1], [-1,-1], [0, 0], [ 1, 1]],
                     [[-1,-1], [-1, 1], [0, 0], [ 1,-1]]]],
            
        cells: [],
        cellsBackup: null,
        type : -1,
        nextFigureType: -1,
        angle: 0,
        
        init: function() {
            if (this.type === -1) {
                this.type = Math.floor(Math.random() * this.masks.length);
            } else {
                this.type = this.nextFigureType;
            }
            this.nextFigureType = Math.floor(Math.random() * this.masks.length);
            var mask = this.masks[this.type];
            var cellCount = 0;
            this.cells = [];
            this.angle = 0;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++ ) {
                    if (mask[i][j] === 1) {
                        this.cells.push({x: j, y: i});
                        if (++cellCount === 4) {
                            if (this.hasCollision()) {
                                tetris.stop();
                                tetris.showGameOverMessage();                               
                            }
                            return;
                        }                        
                    }
                }
            }
        },
        
        getMaskForNextFigure: function() {
            return this.masks[this.nextFigureType];
        },
        
        canMoveDown: function() {
            for (var i = 0; i < 4; i++) {
                if (this.cells[i].y === tetris.stackHeight - 1) return false;
                if (tetris.field[this.cells[i].y + 1][this.cells[i].x] !== 0) return false;
            }
            return true;
        },
        
        canMoveRight: function() {
            for (var i = 0; i < 4; i++) {
                if (this.cells[i].x === tetris.stackWidth - 1) return false;
                if (tetris.field[this.cells[i].y][this.cells[i].x + 1] !== 0) return false;
            }
            return true;
        },
        
        canMoveLeft: function() {
            for (var i = 0; i < 4; i++) {
                if (this.cells[i].x === 0) return false;
                if (tetris.field[this.cells[i].y][this.cells[i].x - 1] !== 0) return false;
            }
            return true;
        },
        
        canRotate: function() {
            return true;
        },
        
        moveDown: function() {
            for (var i = 0; i < 4; i++) { 
                this.cells[i].y++;
            }
        },
        
        moveRight: function() {
            for (var i = 0; i < 4; i++) { 
                this.cells[i].x++;
            }            
        },

        moveLeft: function() {
            for (var i = 0; i < 4; i++) { 
                this.cells[i].x--;
            }            
        },
        
        rotate: function() {           
            this.backup();
            var vector = this.transform[this.type][this.angle];
            for (var i = 0; i < 4; i++) {
                this.cells[i].x += vector[i][0];
                this.cells[i].y += vector[i][1];
            }
            for (var i = 0; i < 4; i++) {
                if (this.cells[i].x < 0) {
                    this.moveRight();
                }
                if (this.cells[i].x > tetris.stackWidth - 1) {
                    this.moveLeft();
                }
            }
            if (this.hasCollision()) {
                this.restore();            
            } else {
                this.angle++;
                this.angle &= 3;                
            }
        },
            
        hasCollision: function() {
            for (var i = 0; i < 4; i++) {
                var x = this.cells[i].x;
                var y = this.cells[i].y;
                if (tetris.field[y][x] !== 0) {
                    return true;
                }
            }            
            return false;
        },
        
        backup: function() {                    
            this.cellsBackup = [];
            for (var i = 0; i < 4; i++) {
                this.cellsBackup.push({x: this.cells[i].x, y: this.cells[i].y});
            }
        },
          
        restore: function() {
            this.cells = [];
            for (var i = 0; i < 4; i++) {
                this.cells.push({x: this.cellsBackup[i].x, y: this.cellsBackup[i].y});
            }            
        }        
        
    }, //end of figure
    
    init: function(stack, preview) { 
        this.stack = document.getElementById(stack);
        this.stack.width = this.stackWidth * this.cellSize;
        this.stack.height = this.stackHeight * this.cellSize;
        this.stack.style.border = '1px solid black';        
        this.preview = document.getElementById(preview);
        if (this.preview !== null) {
            this.preview.width = 3 * this.cellSize;
            this.preview.height = 4 * this.cellSize;
        }
        this.initScene();    
        this.reset();
        this.start();             
        if (this.onNextLevel !== null) {
            this.onNextLevel(this.level);
        }        
    },
    
    freezeFigure: function() {
        for (var i = 0; i < 4; i++) {
            var x = this.figure.cells[i].x;
            var y = this.figure.cells[i].y;
            this.field[y][x] = this.figure.type + 1;
        }
    },
    
    clearLine: function(line) {
        for (var i = 0; i < this.stackWidth; i++) {
            this.field[line][i] = 0;
        }
    },
    
    shift: function(line) {
        for (var i = line; i > 0; i--) {
            for (var j = 0; j < this.stackWidth; j++) {
                this.field[i][j] = this.field[i - 1][j];    
            }            
        }
        for (var j = 0; j < this.stackWidth; j++) {
            this.field[0][j] = 0;
        }
    },
    
    dropLines: function(clearedlines) {
        for (var i = 0; i < clearedlines.length; i++) {
            this.shift(clearedlines[i]);
        }
    },
    
    checkCompleteLines: function() {
        var linesCleared = [];
        for (var i = 0; i < this.stackHeight; i++) {
            var complete = true;
            for (var j = 0; j< this.stackWidth; j++) {
                if (this.field[i][j] === 0) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                this.clearLine(i);
                linesCleared.push(i);
            }            
        }        
        if (linesCleared.length > 0) {
            this.dropLines(linesCleared);
            this.increaseScore(linesCleared.length);
            this.lineCount += linesCleared.length;
            if (this.lineCount > this.level * 20) {
                this.level++;
                this.stop();
                this.start();
                if (this.onNextLevel !== null) {
                    this.onNextLevel(this.level);
                }
            }
        } else {
            this.score += 10;
        }
    },
    
    tick: function() {
        if (this.figure.canMoveDown()) {
            this.figure.moveDown();
        } else {            
            this.freezeFigure();
            this.checkCompleteLines();
            this.figure.init();
            this.drawScore();
            this.drawPreview();            
        }
        this.draw();
    },
    
    stop: function() {
        clearInterval(this.timer);
        this.state = this.STATE_STOPPED;
    },
    
    start: function() {
        var time = this.tickTime - (this.level * 100);
        if (time <= 0) time = 100;
        this.timer = setInterval(function() {
            tetris.tick();
        }, time);        
        this.state = this.STATE_RUNNING;
    },
    
    reset: function() {
        this.state = this.STATE_RUNNING;
        this.score = 0;
        this.field = [];
        this.level = 1;
        
        for (var i = 0; i < this.stackHeight; i++) {
            var row = [];
            for (var j = 0; j< this.stackWidth; j++) {
                row.push(0);
            }
            this.field.push(row);
        }
        this.figure.init();           
        this.draw();
        this.drawScore();        
    },
    
    initScene: function() {         
        this.ctx = this.stack.getContext("2d");
        if (this.preview !== null) {
            this.previewCtx = this.preview.getContext("2d");
        }
    },
    
    drawCell: function(ctx, i, j, color) {
        var x = j * this.cellSize;
        var y = i * this.cellSize;
        ctx.fillStyle = this.colors[color]; 
        ctx.fillRect(x, y, this.cellSize , this.cellSize );        
    },        
    
    draw: function() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        
        for (var i = 0; i < this.stackHeight; i++) {
            for (var j = 0; j < this.stackWidth; j++) {
                this.drawCell(this.ctx, i, j, this.field[i][j]);
            } 
        } 
        
        for (var i = 0; i < 4; i++) {
            this.drawCell(this.ctx, this.figure.cells[i].y, this.figure.cells[i].x, this.figure.type + 1);
        }

    },
    
    drawScore: function() {
        if (this.onScoreChanged !== null) {
            this.onScoreChanged(this.score);
        }
    },
    
    drawPreview: function() {
        var mask = this.figure.getMaskForNextFigure();
        var figType = this.figure.nextFigureType;        
        
        this.previewCtx.lineWidth = 1;
        this.previewCtx.strokeStyle = 'black';
        
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {                
                this.drawCell(
                    this.previewCtx, 
                    i, j, 
                    mask[i][j] ? figType + 1 : 0);
            } 
        }         
        
    },
    
    left: function() {
        if (this.state !== this.STATE_RUNNING) {
            return;
        }
        if (this.figure.canMoveLeft()) {
            this.figure.moveLeft();
        }         
        this.draw();
    },
    
    increaseScore: function(linesCount) {
        this.score += linesCount * 100;
        if (linesCount === 4) {
            this.score += 200;   
        }
        this.drawScore();
    },
    
    right: function() {
        if (this.state !== this.STATE_RUNNING) {
            return;
        }        
        if (this.figure.canMoveRight()) {
            this.figure.moveRight();
        }         
        this.draw();
    },
    
    down: function() {
        if (this.state !== this.STATE_RUNNING) {
            return;
        }        
        if (this.figure.canMoveDown()) {
            this.figure.moveDown();
        } 
        this.draw();
    },
    
    rotate: function() {
        if (this.state !== this.STATE_RUNNING) {
            return;
        }        
        if (this.figure.canRotate()) {
            this.figure.rotate();
        }
        this.draw();
    },
            
    showGameOverMessage: function() {
        if (this.onGameFinish !== null) {
            this.onGameFinish();
        }        
        this.state = this.STATE_FINISHED;
    }
};

