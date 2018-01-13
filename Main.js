"use strict";


var minesweeperEngine = new MinesweeperEngine();
minesweeperEngine.revealSquare(10, 20);
minesweeperEngine.resetArea(1, 1);
"Use the debugger to call minesweeperEngine.revealSquare(x,y).";


function MinesweeperEngine() {
    var self = this;


    //////////////////////////////
    // PRIVATE MEMBER CONSTANTS //
    ////////////////////////////// 

    var NUMBER_OF_MINES = 99;
    var BOARD_WIDTH = 16;
    var BOARD_HEIGHT = 30;


    //////////////////////////////
    // PRIVATE MEMBER VARIABLES //
    //////////////////////////////

    var board = [];


    //////////////////////////
    // PUBLIC FUNCTIONALITY // 
    //////////////////////////

    self.resetArea = function (x, y) {

        var RESET_RADIUS = 1;

        //Count mines
        var minX = x > RESET_RADIUS ? x - RESET_RADIUS : 0;
        var minY = y > RESET_RADIUS ? y - RESET_RADIUS : 0;
        var maxX = BOARD_WIDTH - x > RESET_RADIUS ? x + RESET_RADIUS : BOARD_WIDTH - 1;
        var maxY = BOARD_HEIGHT - y > RESET_RADIUS ? y + RESET_RADIUS : BOARD_HEIGHT - 1;
        var mineCount = 0;
        for (var i = minX; i <= maxX; i++)
            for (var j = minY; j <= maxY; j++)
                if (board[i][j].isMine)
                    mineCount++;

        do {
            //Clear area
            for (var i = minX; i <= maxX; i++) {
                for (var j = minY; j <= maxY; j++) {
                    board[i][j].isMine = false;
                    board[i][j].mineCount = 0;
                    board[i][j].isRevealed = false;
                }
            }

            //Place mines
            for (var i = 0; i < mineCount; i++) {
                do {
                    var mineX = minX + Math.floor((1 + maxX - minX) * Math.random());
                    var mineY = minY + Math.floor((1 + maxY - minY) * Math.random());
                } while (board[mineX][mineY].isMine);
                board[mineX][mineY].isMine = true;
            }

            //While invalid
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
                        if (board[i][j].mineCount !== getSurroundingMineCount(i, j))
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
            for (var i = getSurroundingMinX(x); i <= getSurroundingMaxX(x); i++)
                for (var j = getSurroundingMinY(y); j <= getSurroundingMaxY(y); j++)
                    if (!board[i][j].isRevealed)
                        self.revealSquare(i, j);

        //Handle win
        var unrevealedEmptySquares = 0
        for (var i = 0; i < BOARD_WIDTH; i++)
            for (var j = 0; j < BOARD_HEIGHT; j++)
                unrevealedEmptySquares += !board[i][j].isRevealed && !board[i][j].isMine ? 1 : 0;
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
            for (var i =
                    0; i < NUMBER_OF_MINES; i++) {
                do {
                    var mineX = Math.floor(BOARD_WIDTH * Math.random());
                    var mineY = Math.floor(BOARD_HEIGHT * Math.random());
                } while (board[mineX][mineY].isMine);
                board[mineX][mineY].isMine = true;
            }

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
        for (var i = getSurroundingMinX(x); i <= getSurroundingMaxX(x); i++)
            for (var j = getSurroundingMinY(y); j <= getSurroundingMaxY(y); j++)
                if (board[i][j].isMine)
                    mineCount++;
        return mineCount;
    }

    function getSurroundingMinX(x) {
        return (x > 0) ? x - 1 : x;
    }

    function getSurroundingMinY(y) {
        return (y > 0) ? y - 1 : y;
    }

    function getSurroundingMaxX(x) {
        return (x < BOARD_WIDTH - 1) ? x + 1 : x;
    }

    function getSurroundingMaxY(y) {
        return (y < BOARD_HEIGHT - 1) ? y + 1 : y;
    }

    function printVisibleBoard() {
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