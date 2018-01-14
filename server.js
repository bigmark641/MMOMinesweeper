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

io.sockets.on('connection', (client) => {
    process.stdout.write("New Connection: " + client.id + "\n");
    console.log("New Connection: ", client);

    //recieve client data
    client.on('client_login', (data) => {
        console.log("logindata", data);
        process.stdout.write(data.username);
    });

    client.on('disconnect', () => {
        console.log('Client disconnected: ' + client.id);
    });
});