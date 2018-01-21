var socketIo = require('socket.io');

module.exports = {
    init: function (server) {
        var io = socketIo.listen(server);
        io.sockets.on('connection', handleIncomingRequests);
    }
};

function handleIncomingRequests(socket) {

    //getBoard
    socket.on('getBoardData', function (data) {
        sendBoardData(socket);
    });

    //revealSquare
    socket.on('revealSquare', function (data) {
        try {
            minesweeperEngine.revealSquare(data.x, data.y);
        } catch (ex) {
            if (ex === 'You win!!!') {
                sendBoardData(socket);
                socket.emit('win');
            }
        }
        sendBoardData(socket);
    });

    //toggleFlag
    socket.on('toggleFlag', function (data) {
        minesweeperEngine.toggleFlag(data.x, data.y);
        sendBoardData(socket);
    });
}

function sendBoardData(socket) {
    socket.emit('setBoardData', {
        revealedBoard: minesweeperEngine.getRevealedBoard(),
        remainingMineCount: minesweeperEngine.getRemainingMineCount()
    });
}




var minesweeperEngine = require('./minesweeperEngine');