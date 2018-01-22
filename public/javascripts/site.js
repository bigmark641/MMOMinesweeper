document.addEventListener("DOMContentLoaded", function (event) {


    /**
     * Initialize game
     */

    let socket = io.connect();
    initializeRemoteRequestListeners();
    let boardElement = document.getElementById('board');
    getBoardData();


    /**
     * Incoming request listeners
     */

    function initializeRemoteRequestListeners() {

        socket.on('setBoardData', function (data) {
            displayBoardHtml(data.revealedBoard, data.remainingMineCount);
        });

        socket.on('setWin', function (data) {
            alert('You win!!!');
        });
    }


    /**
     * Outgoing calls
     */

    function getBoardData() {
        socket.emit('getBoardData');
    }

    function revealSquare(x, y) {
        socket.emit('revealSquare', {
            x: x,
            y: y
        });
    }

    function toggleFlag(x, y) {
        socket.emit('toggleFlag', {
            x: x,
            y: y
        });
    }


    /**
     * UI functionality
     */

    function displayBoardHtml(revealedBoard, remainingMineCount) {

        //Get board data
        var boardArray = revealedBoard;
        boardElement.setAttribute('style', 'width: ' + 52 * boardArray.length + 'px');

        //Initialize empty board
        if (!Boolean(boardElement.firstElementChild)) {

            //Build row
            for (var y = 0; y < boardArray[0].length; y++) {
                var rowElement = document.createElement('div');
                rowElement.setAttribute('class', 'row');

                //Build cell
                for (var x = 0; x < boardArray.length; x++) {
                    var cellElement = document.createElement('div');

                    //Set data
                    cellElement.setAttribute('data-x', x);
                    cellElement.setAttribute('data-y', y);

                    //Set class
                    cellElement.setAttribute('class', 'cell unknown');

                    //Set text
                    var textElement = document.createTextNode('');

                    //Set click handlers
                    cellElement.addEventListener('click', function (e) {
                        e.preventDefault();
                        handleCellClick.call(this, 'click');
                        return false;
                    });
                    cellElement.addEventListener('contextmenu', function (e) {
                        e.preventDefault();
                        handleCellClick.call(this, 'contextmenu');
                        return false;
                    });

                    //Attach                            
                    cellElement.appendChild(textElement);
                    rowElement.appendChild(cellElement);
                }
                boardElement.appendChild(rowElement);
            }
        }

        //Update existing board
        for (var y = 0; y < boardElement.childNodes.length - 1; y++) {
            var rowElement = boardElement.childNodes[y + 1];
            for (var x = 0; x < rowElement.childNodes.length; x++) {
                var cellElement = rowElement.childNodes[x];

                //Set class and text
                var cellClass;
                var cellText;
                if (boardArray[x][y].isRevealed) {
                    cellClass = 'cell revealed';
                    cellText = boardArray[x][y].mineCount;
                } else if (boardArray[x][y].isFlagged) {
                    cellClass = 'cell flagged';
                    cellText = 'F';
                } else {
                    cellClass = 'cell unknown';
                    cellText = '';
                }
                if (cellElement.getAttribute('class') !== cellClass)
                    cellElement.setAttribute('class', cellClass);
                if (cellElement.childNodes[0].textContent !== cellText) {
                    cellElement.removeChild(cellElement.childNodes[0]);
                    cellElement.appendChild(document.createTextNode(cellText));
                }
            }
        }

        //Set remaining mines
        var remainingMineCountElement = document.getElementById('remaining-mine-count');
        while (remainingMineCountElement.firstChild)
            remainingMineCountElement.removeChild(remainingMineCountElement.firstChild);
        remainingMineCountElement.appendChild(document.createTextNode(remainingMineCount));
    }

    function handleCellClick(event) {

        //Get coordinates
        var x = Number(this.getAttribute('data-x'));
        var y = Number(this.getAttribute('data-y'));

        //Left click
        if (event === 'click')
            revealSquare(x, y);

        //Right click
        else if (event === 'contextmenu')
            toggleFlag(x, y);
    }
});