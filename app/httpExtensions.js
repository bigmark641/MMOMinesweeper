var socketIo = require('socket.io');
var serviceEngine = require('./serviceEngine');

module.exports = {
    init: function (server) {
        var io = socketIo.listen(server);
        io.sockets.on('connection', serviceEngine.handleIncomingRequests);
    }
};