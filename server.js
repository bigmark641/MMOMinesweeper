var http = require('http');
var url = require('url');
var fs = require('fs');
var server;

//this is a little node server, just using things packaged in node (http, url, fs)
// if could be replaced with something like express.js which people use
//but I'm not sure we need a bigger solution here.
server = http.createServer(serverRouting);

function serverRouting(request, response) {
    var path = url.parse(request.url).pathname;
    switch (path) {
        case '/game.html':
            fs.readFile(__dirname + path, (err, data) => {
                if (err) {
                    return errorPage(response);
                }
                response.writeHead(200, { 'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html' });
                response.write(data, 'utf8');
                response.end();
            });
            break;
        default: errorPage(response);
    }
}

function errorPage(response) {
    response.writeHead(404);
    response.write('404');
    response.end();
};

server.listen(8001);


//socket stuff
var io = require('socket.io').listen(server);

var users = [];

io.sockets.on('connection', (socket) => {
    console.log("New Connection: ", socket.id);
    
    //recieve client data
    socket.on('client_login', (data) => {
        let newUser = {id:socket.id, username:data.username};
        users.push(newUser);
        //emit just goes to one client/socket
        socket.emit('message', {'message':"Successfully Joined The Game!"});
        //broadcast goes to everyone else
        socket.broadcast.emit('message', {'message': data.username + " Joined The Game!"});
        //this broadcasts to EVERYONE including client;
        io.sockets.emit('message', {'message': "Everyone!"});
        //this logs to node console
        console.log("New Client Logged In: ", newUser);
    });

    socket.on('client_move', (data) => {
        console.log("client moved:", data);
    });

    socket.on('client_click', (data) => {
        console.log("client clicked", data);
    });

    socket.on('disconnect', () => {
        users = users.splice(users.indexOf(users.filter(f=>f.id === socket.id)),1);
        console.log('Client disconnected: ' + socket.id);
    });



});