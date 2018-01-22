var minesweeperEngine = require('./minesweeperEngine');

module.exports = {
    handleIncomingRequests: function (socket, sockets) {


        /**
         * Incoming request listeners
         */

        //getBoard
        socket.on('getBoardData', getBoardData);

        //revealSquare
        socket.on('revealSquare', function (data) {
            revealSquare(data.x, data.y);
        });

        //toggleFlag
        socket.on('toggleFlag', function (data) {
            toggleFlag(data.x, data.y);
        });


        /**
         * Incoming request implementations
         */

        function getBoardData() {
            pushLatestBoard(false);
        }

        function revealSquare(x, y) {
            try {
                minesweeperEngine.revealSquare(x, y);
            } catch (ex) {
                if (ex === 'win') {
                    pushLatestBoard(true);
                    setWin();
                } else {
                    throw ex;
                }
            }
            pushLatestBoard(true);
        }

        function toggleFlag(x, y) {
            minesweeperEngine.toggleFlag(x, y);
            pushLatestBoard(true);
        }


        /**
         * Outgoing calls
         */

        function sendBoardData(revealedBoard, remainingMineCount, sendToEveryone) {
            if (sendToEveryone) {
                sockets.emit('setBoardData', {
                    revealedBoard: revealedBoard,
                    remainingMineCount: remainingMineCount
                });
            } else {
                socket.emit('setBoardData', {
                    revealedBoard: revealedBoard,
                    remainingMineCount: remainingMineCount
                });
            }
        }

        function setWin() {
            socket.emit('setWin');
        }


        /**
         * Private functionality
         */

        function pushLatestBoard(sendToEveryone) {
            sendBoardData(minesweeperEngine.getRevealedBoard(), minesweeperEngine.getRemainingMineCount(), sendToEveryone);
        }
    }
};