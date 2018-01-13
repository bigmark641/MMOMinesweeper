"use strict";


//TODO: remove following debugging lines
var minesweeperEngine = new MinesweeperEngine();
minesweeperEngine.revealSquare(10, 20);
minesweeperEngine.resetArea(4, 4);
"Use the debugger to call minesweeperEngine.revealSquare(x,y).";


function MinesweeperEngine() {
    var self = this;


    //////////////////////////////
    // PRIVATE MEMBER CONSTANTS //
    ////////////////////////////// 

    var NUMBER_OF_MINES = 199;
    var BOARD_WIDTH = 16;
    var BOARD_HEIGHT = 30;
    var RESET_RADIUS = 3;
    var REVEAL_RADIUS = 1;
    var MINE_COUNT_RADIUS = 1;


    //////////////////////////////
    // PRIVATE MEMBER VARIABLES //
    //////////////////////////////

    var board = [];


    //////////////////////////
    // PUBLIC FUNCTIONALITY // 
    //////////////////////////

    self.resetArea = function (x, y) {

        //Count mines
        var minX = getSurroundingMinX(x, RESET_RADIUS);
        var minY = getSurroundingMinY(y, RESET_RADIUS);
        var maxX = getSurroundingMaxX(x, RESET_RADIUS);
        var maxY = getSurroundingMaxY(y, RESET_RADIUS);
        var mineCount = 0;
        for (var i = minX; i <= maxX; i++)
            for (var j = minY; j <= maxY; j++)
                if (board[i][j].isMine)
                    mineCount++;

        //Clear area
        do {
            for (var i = minX; i <= maxX; i++) {
                for (var j = minY; j <= maxY; j++) {
                    board[i][j].isMine = false;
                    board[i][j].mineCount = 0;
                    board[i][j].isRevealed = false;
                }
            }

            //Place mines
            randomlyAddMines(mineCount, minX, minY, maxX, maxY);

            //Validate
            var outsideIsValid = true;
            var surroundingMinX = minX > 0 ? minX - 1 : minX;
            var surroundingMaxX = maxX < BOARD_WIDTH - 1 ? maxX + 1 : maxX;
            var surroundingMinY = minY > 0 ? minY - 1 : minY;
            var surroundingMaxY = maxY < BOARD_HEIGHT - 1 ? maxY + 1 : maxY;
            for (var i = surroundingMinX; i <= surroundingMaxX; i++) {
                for (var j = surroundingMinY; j <= surroundingMaxY; j++) {
                    var iIsWithin = i >= minX && i <= maxX;
                    var jIsWithin = j >= minY && j <= maxY;
                    if (!iIsWithin || !jIsWithin)
                        if (!board[i][j].isMine && board[i][j].mineCount !== getSurroundingMineCount(i, j))
                            outsideIsValid = false;
                }
            }
        } while (!outsideIsValid);

        //Number squares
        for (var i = minX; i <= maxX; i++)
            for (var j = minY; j <= maxY; j++)
                board[i][j].mineCount = getSurroundingMineCount(i, j);

        printVisibleBoard();
    }

    self.revealSquare = function (x, y) {

        //Initialize board if first revealed square
        var revealedSquares = 0
        for (var i = 0; i < BOARD_WIDTH; i++)
            for (var j = 0; j < BOARD_HEIGHT; j++)
                if (board[i][j].isRevealed)
                    revealedSquares++;
        if (revealedSquares === 0)
            initializeBoard(x, y);

        //Reveal square
        board[x][y].isRevealed = true;

        //Handle loss
        if (board[x][y].isMine) {
            printVisibleBoard();
            throw "You lose!";
        }

        //Reveal surrounding squares if necessary
        if (board[x][y].mineCount === 0)
            for (var i = getSurroundingMinX(x, REVEAL_RADIUS); i <= getSurroundingMaxX(x, REVEAL_RADIUS); i++)
                for (var j = getSurroundingMinY(y, REVEAL_RADIUS); j <= getSurroundingMaxY(y, REVEAL_RADIUS); j++)
                    if (!board[i][j].isRevealed)
                        self.revealSquare(i, j);

        //Handle win
        var unrevealedEmptySquares = 0
        for (var i = 0; i < BOARD_WIDTH; i++)
            for (var j = 0; j < BOARD_HEIGHT; j++)
                if (!board[i][j].isRevealed && !board[i][j].isMine)
                    unrevealedEmptySquares++;
        if (unrevealedEmptySquares === 0) {
            printVisibleBoard();
            throw "You win!";
        }

        printVisibleBoard();
    };


    //////////////////////
    // CONSTRUCTOR CODE //
    //////////////////////

    (function () {
        initializeEmptyBoard();
        printVisibleBoard();
    })();


    /////////////////////
    // PRIVATE METHODS //
    /////////////////////

    function initializeBoard(firstX, firstY) {
        do {

            //Initialize empty board
            initializeEmptyBoard();

            //Place mines
            randomlyAddMines(NUMBER_OF_MINES, 0, 0, BOARD_WIDTH - 1, BOARD_HEIGHT - 1);

            //Count mines
            for (var x = 0; x < BOARD_WIDTH; x++) {
                for (var y = 0; y < BOARD_HEIGHT; y++) {
                    board[x][y].mineCount = getSurroundingMineCount(x, y);
                }
            }
        } while (board[firstX][firstY].mineCount != 0);
    }

    function initializeEmptyBoard() {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            board[x] = [];
            for (var y = 0; y < BOARD_HEIGHT; y++) {
                board[x][y] = {
                    isMine: false,
                    mineCount: 0,
                    isRevealed: false
                };
            }
        }
    }

    function getSurroundingMineCount(x, y) {
        var mineCount = 0;
        for (var i = getSurroundingMinX(x, MINE_COUNT_RADIUS); i <= getSurroundingMaxX(x, MINE_COUNT_RADIUS); i++)
            for (var j = getSurroundingMinY(y, MINE_COUNT_RADIUS); j <= getSurroundingMaxY(y, MINE_COUNT_RADIUS); j++)
                if (board[i][j].isMine)
                    mineCount++;
        return mineCount;
    }

    function randomlyAddMines(mineCount, minX, minY, maxX, maxY) {
        for (var i = 0; i < mineCount; i++) {
            do {
                var mineX = minX + Math.floor((1 + maxX - minX) * Math.random());
                var mineY = minY + Math.floor((1 + maxY - minY) * Math.random());
            } while (board[mineX][mineY].isMine);
            board[mineX][mineY].isMine = true;
        }
    }

    function getSurroundingMinX(x, radius) {
        return x > radius ? x - radius : 0;
    }

    function getSurroundingMinY(y, radius) {
        return y > radius ? y - radius : 0;
    }

    function getSurroundingMaxX(x, radius) {
        return BOARD_WIDTH - x > radius ? x + radius : BOARD_WIDTH - 1;
    }

    function getSurroundingMaxY(y, radius) {
        return BOARD_HEIGHT - y > radius ? y + radius : BOARD_HEIGHT - 1;
    }

    function printVisibleBoard() {
        //This ugly method is intended for degubbing only
        process.stdout.write(" /--");
        for (var x = 0; x < BOARD_WIDTH; x++) {
            process.stdout.write(x + "-");
            if (x < 10)
                process.stdout.write("-");
        }
        process.stdout.write("\\");
        process.stdout.write("\n");
        for (var y = 0; y < BOARD_HEIGHT; y++) {
            process.stdout.write(y + "| ");
            if (y < 10)
                process.stdout.write(" ");
            for (var x = 0; x < BOARD_WIDTH; x++) {
                //TODO: fix next line
                if (true) //board[x][y].isRevealed)
                    if (board[x][y].isMine)
                        process.stdout.write("X");
                    else
                        process.stdout.write(board[x][y].mineCount + "");
                else
                    process.stdout.write("-");
                if (x !== BOARD_WIDTH - 1)
                    process.stdout.write("  ");
            }
            process.stdout.write(" |" + y);
            process.stdout.write("\n");
        }
        process.stdout.write(" \\--");
        for (var x = 0; x < BOARD_WIDTH; x++) {
            process.stdout.write(x + "-");
            if (x < 10)
                process.stdout.write("-");
        }
        process.stdout.write("/");
        process.stdout.write("\n");
        process.stdout.write("\n");
    }
}