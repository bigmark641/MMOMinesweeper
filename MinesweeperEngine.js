"use strict";


//TODO: remove these debugging lines
var minesweeperEngine = new MinesweeperEngine();
minesweeperEngine.revealSquare(10, 20);
minesweeperEngine.resetArea(5, 5);
"Use the debugger to call minesweeperEngine.revealSquare(x,y).";


function MinesweeperEngine() {
    var self = this;


    //////////////////////////////
    // PRIVATE MEMBER CONSTANTS //
    ////////////////////////////// 

    var NUMBER_OF_MINES = 199;
    var BOARD_WIDTH = 16;
    var BOARD_HEIGHT = 30;
    var RESET_RADIUS = 4;
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

        //Get bounds to reset
        if (getSurroundingMinX(x, RESET_RADIUS) === getSurroundingMinX(x, RESET_RADIUS + 1))
            var minX = getSurroundingMinX(x, RESET_RADIUS);
        else
            var minX = getSurroundingMinX(x, RESET_RADIUS) + 1;
        if (getSurroundingMaxX(x, RESET_RADIUS) === getSurroundingMaxX(x, RESET_RADIUS + 1))
            var maxX = getSurroundingMaxX(x, RESET_RADIUS);
        else
            var maxX = getSurroundingMaxX(x, RESET_RADIUS) - 1;
        if (getSurroundingMinY(y, RESET_RADIUS) === getSurroundingMinY(y, RESET_RADIUS + 1))
            var minY = getSurroundingMinY(y, RESET_RADIUS);
        else
            var minY = getSurroundingMinY(y, RESET_RADIUS) + 1;
        if (getSurroundingMaxY(y, RESET_RADIUS) === getSurroundingMaxY(y, RESET_RADIUS + 1))
            var maxY = getSurroundingMaxY(y, RESET_RADIUS);
        else
            var maxY = getSurroundingMaxY(y, RESET_RADIUS) - 1;

        //Count mines
        var mineCount = 0;
        for (var i = minX; i <= maxX; i++)
            for (var j = minY; j <= maxY; j++)
                if (board[i][j].isMine)
                    mineCount++;

        //Clear area
        for (var i = minX; i <= maxX; i++) {
            for (var j = minY; j <= maxY; j++) {
                board[i][j].isMine = false;
                board[i][j].mineCount = 0;
                board[i][j].isRevealed = false;
            }
        }

        //Add mines
        randomlyAddMines(mineCount, minX, minY, maxX, maxY);

        //Renumber
        numberSquares(getSurroundingMinX(x, RESET_RADIUS), getSurroundingMinY(y, RESET_RADIUS), getSurroundingMaxX(x, RESET_RADIUS), getSurroundingMaxY(y, RESET_RADIUS));

        //Print
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

            //Number squares
            numberSquares(0, 0, BOARD_WIDTH - 1, BOARD_HEIGHT - 1);

            //Validate and retry
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

    function numberSquares(minX, minY, maxX, maxY) {
        for (var x = minX; x <= maxX; x++) {
            for (var y = minY; y < maxY; y++) {
                board[x][y].mineCount = getSurroundingMineCount(x, y);
            }
        }
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