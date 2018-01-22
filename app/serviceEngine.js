var minesweeperEngine = require('./minesweeperEngine');

module.exports = {
    handleIncomingRequests: function (socket) {


        /**
         * Incoming request listeners
         */

        //getBoard
        socket.on('getBoardData', getBoardData);
    
        //revealSquare
        socket.on('revealSquare', function (data) { revealSquare(data.x, data.y); });
    
        //toggleFlag
        socket.on('toggleFlag', function (data) { toggleFlag(data.x, data.y); });


        /**
         * Incoming request implementations
         */
        
         function getBoardData() {
            pushLatestBoard();
         }
        
         function revealSquare(x, y) {
            try {
                minesweeperEngine.revealSquare(x, y);
            } catch (ex) {
                if (ex === 'win') {
                    pushLatestBoard(socket);
                    setWin();
                }
                else {
                    throw ex;
                }
            }
            pushLatestBoard();
         }
        
         function toggleFlag(x, y) {
            minesweeperEngine.toggleFlag(x, y);
            pushLatestBoard();
        }


        /**
         * Outgoing calls
         */
        
        function sendBoardData(revealedBoard, remainingMineCount) {
            socket.emit('setBoardData', {
                revealedBoard: revealedBoard,
                remainingMineCount: remainingMineCount
            });
        }

        function setWin() {
            socket.emit('setWin');
        }
        
        
         /**
          * Private functionality
          */
        
        function pushLatestBoard() {
            sendBoardData(minesweeperEngine.getRevealedBoard(), minesweeperEngine.getRemainingMineCount());
        }
    }
};