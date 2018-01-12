"use strict";

(function () {

    //Constants
    var NUMBER_OF_MINES = 10;
    var BOARD_WIDTH = 9;
    var BOARD_HEIGHT = 9;

    //Variables
    var board = [];

    //Main
    initializeBoard(3,3)
    printVisibleBoard();
    revealSquare(8,8);
    printVisibleBoard();
    var x = 1;



    function revealSquare(x, y) {

        //Reveal square
        board[x][y].isRevealed = true;

        //Handle loss
        if (board[x][y].isMine)
            throw "You lose!";

        //Reveal surrounding squares if necessary
        if (board[x][y].mineCount === 0)
            for (var i = getSurroundingMinX(x); i <= getSurroundingMaxX(x); i++)
                for (var j = getSurroundingMinY(y); j <= getSurroundingMaxY(y); j++)
                    if (!board[i][j].isRevealed)
                        revealSquare(i, j);
        
        //Handle win
        var unrevealedEmptySquares = 0
        for (var x = 0; x < BOARD_WIDTH; x++)
            for (var y = 0; y < BOARD_HEIGHT; y++)
                unrevealedEmptySquares+= !board[x][y].isRevealed && !board[x][y].isMine ? 1: 0;
        if (unrevealedEmptySquares === 0)
            throw "You win!";
    }

    function initializeBoard(firstX, firstY) {
        do {

            //Initialize empty board
            initializeEmptyBoard();

            //Place mines
            for (var i = 0; i < NUMBER_OF_MINES; i++) {
                do {
                    var mineX = Math.floor(BOARD_WIDTH * Math.random());
                    var mineY = Math.floor(BOARD_HEIGHT * Math.random());
                } while (board[mineX][mineY].isMine);
                board[mineX][mineY].isMine = true;
            }

            //Count mines
            for (var x = 0; x < BOARD_WIDTH; x++) {
                for (var y = 0; y < BOARD_HEIGHT; y++) {
                    board[x][y].mineCount = 0;
                    for (var i = getSurroundingMinX(x); i <= getSurroundingMaxX(x); i++)
                        for (var j = getSurroundingMinY(y); j <= getSurroundingMaxY(y); j++)
                            if (board[i][j].isMine)
                                board[x][y].mineCount++;        
                }
            }
        } while (board[firstX][firstY].mineCount != 0);

        revealSquare(firstX, firstY);
    }

    function initializeEmptyBoard() {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            board[x] = [];
            for (var y = 0; y < BOARD_WIDTH; y++) {
                board[x][y] = {
                    isMine: false,
                    mineCount: 0,
                    isRevealed: false
                };
            }
        }
    }

    function printVisibleBoard() {
        process.stdout.write("\n");
        for (var y = 0; y < BOARD_HEIGHT; y++) {
            for (var x = 0; x < BOARD_WIDTH; x++) {
                if (board[x][y].isRevealed)
                    process.stdout.write(board[x][y].mineCount + "  ");
                else
                    process.stdout.write("-  ");
            }
            process.stdout.write("\n");
        }
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

    function debugBoard() {
        process.stdout.write("\n");
        for (var y = 0; y < BOARD_HEIGHT; y++) {
            for (var x = 0; x < BOARD_WIDTH; x++) {
                if (board[x][y].isMine)                
                    process.stdout.write("X  ");
                else
                    process.stdout.write(board[x][y].mineCount + "  ");
            }
            process.stdout.write("\n");
        }
    }

})();