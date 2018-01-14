"use strict";


function MinesweeperEngine() {
    var self = this;


    //////////////////////////////
    // PRIVATE MEMBER CONSTANTS //
    ////////////////////////////// 

    var NUMBER_OF_MINES = 99;
    var BOARD_WIDTH = 16;
    var BOARD_HEIGHT = 30;
    var RESET_RADIUS = 5;
    var REVEAL_RADIUS = 1;
    var MINE_COUNT_RADIUS = 1;


    //////////////////////////////
    // PRIVATE MEMBER VARIABLES //
    //////////////////////////////

    var board = [];


    //////////////////////////
    // PUBLIC FUNCTIONALITY // 
    //////////////////////////

    self.revealSquare = function (x, y) {

        //Initialize board if first revealed square
        var revealedSquares = 0
        for (var i = 0; i < BOARD_WIDTH; i++)
            for (var j = 0; j < BOARD_HEIGHT; j++)
                if (board[i][j].isRevealed)
                    revealedSquares++;
        if (revealedSquares === 0)
            initializeBoard(x, y);

        //Handle mine
        if (board[x][y].isMine) {
            resetArea(x, y);
        } else {

            //Reveal square
            board[x][y].isRevealed = true;
            board[x][y].isFlagged = false;

            //Reveal surrounding squares
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
                throw "You win!!!";
            }
        }
    };

    self.toggleFlag = function (x, y) {
        if (!board[x][y].isRevealed)
            board[x][y].isFlagged = !board[x][y].isFlagged;
    }

    self.getRevealedBoard = function () {

        //Create board
        var revealedBoard = [];
        for (var x = 0; x < BOARD_WIDTH; x++) {
            revealedBoard[x] = [];
            for (var y = 0; y < BOARD_HEIGHT; y++) {

                //Add revealed
                if (board[x][y].isRevealed) {
                    revealedBoard[x][y] = {
                        isRevealed: true,
                        mineCount: board[x][y].mineCount,
                        isFlagged: board[x][y].isFlagged
                    };

                    //Add hidden
                } else {
                    revealedBoard[x][y] = {
                        isRevealed: false,
                        isFlagged: board[x][y].isFlagged
                    };
                }
            }
        }
        return revealedBoard;
    };

    self.getRemainingMineCount = function () {
        var flagCount = 0;
        for (var x = 0; x < BOARD_WIDTH; x++)
            for (var y = 0; y < BOARD_HEIGHT; y++)
                if (board[x][y].isFlagged)
                    flagCount++;
        return NUMBER_OF_MINES - flagCount;
    };


    //////////////////////
    // CONSTRUCTOR CODE //
    //////////////////////

    (function () {
        initializeEmptyBoard();
    })();


    /////////////////////
    // PRIVATE METHODS //
    /////////////////////

    function initializeBoard(firstX, firstY) {
        do {

            //Initialize empty board
            initializeEmptyBoard();

            //Place mines
            seedMines(NUMBER_OF_MINES, 0, 0, BOARD_WIDTH - 1, BOARD_HEIGHT - 1);

            //Number squares
            numberSquares(0, 0, BOARD_WIDTH - 1, BOARD_HEIGHT - 1);

            //Validate and retry
        } while (board[firstX][firstY].mineCount !== 0);
    }

    function resetArea(x, y) {

        //Get bounds to renumber
        var renumberMinX = getSurroundingMinX(x, RESET_RADIUS);
        var renumberMinY = getSurroundingMinY(y, RESET_RADIUS);
        var renumberMaxX = getSurroundingMaxX(x, RESET_RADIUS);
        var renumberMaxY = getSurroundingMaxY(y, RESET_RADIUS);

        //Get bounds to remine
        var remineMinX = getSurroundingMinX(x, RESET_RADIUS - 1);
        var remineMinY = getSurroundingMinY(y, RESET_RADIUS - 1);
        var remineMaxX = getSurroundingMaxX(x, RESET_RADIUS - 1);
        var remineMaxY = getSurroundingMaxY(y, RESET_RADIUS - 1);

        //Clear visibility
        for (var i = renumberMinX; i <= renumberMaxX; i++)
            for (var j = renumberMinY; j <= renumberMaxY; j++)
                board[i][j].isRevealed = false;

        //Count mines
        var mineCount = 0;
        for (var i = remineMinX; i <= remineMaxX; i++)
            for (var j = remineMinY; j <= remineMaxY; j++)
                if (board[i][j].isMine)
                    mineCount++;

        //Clear mines
        for (var i = remineMinX; i <= remineMaxX; i++)
            for (var j = remineMinY; j <= remineMaxY; j++) {
                board[i][j].isMine = false;
                board[i][j].isFlagged = false;
            }

        //Add mines
        seedMines(mineCount, remineMinX, remineMinY, remineMaxX, remineMaxY);

        //Renumber
        numberSquares(renumberMinX, renumberMinY, renumberMaxX, renumberMaxY);
    }

    function initializeEmptyBoard() {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            board[x] = [];
            for (var y = 0; y < BOARD_HEIGHT; y++) {
                board[x][y] = {
                    isMine: false,
                    mineCount: 0,
                    isRevealed: false,
                    isFlagged: false
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

    function seedMines(mineCount, minX, minY, maxX, maxY) {
        for (var i = 0; i < mineCount; i++) {
            do {
                var mineX = minX + Math.floor((1 + maxX - minX) * Math.random());
                var mineY = minY + Math.floor((1 + maxY - minY) * Math.random());
            } while (board[mineX][mineY].isMine);
            board[mineX][mineY].isMine = true;
        }
    }

    function numberSquares(minX, minY, maxX, maxY) {
        for (var x = minX; x <= maxX; x++) {
            for (var y = minY; y <= maxY; y++) {
                board[x][y].mineCount = getSurroundingMineCount(x, y);
            }
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
}