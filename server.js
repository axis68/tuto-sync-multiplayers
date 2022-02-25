const { Console } = require('console');

console.log('starting server...');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var width = 480;
var height = 640;

var ballposition = { "x": width/2, "y": height/2, "dx": 4, "dy": -3 };
var ballX = width/2;
var ballY = height/2;
var dx = 4;
var dy = -4;

var ballRadius = 10;

var paddlePlayer1X = 0;
var paddlePlayer2X = 0;


var clientCounter = 0;

var socketIdPlayer1 = '';
var socketIdPlayer2 = '';

app.get("/", function(req, res) {   // means the root path of the url
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(socket) {

    console.log('client connected');


 

    socket.on('disconnect', function() {
        console.log('client disconnected');
    });
    socket.on('wannaplay', function() {
        console.log('Client wanna play');
        var whichPlayer = -1;
        if (socketIdPlayer1 == '')
        {
            whichPlayer = 1;
            socketIdPlayer1 = socket.id;
        }
        else if (socketIdPlayer2 == '')
        {
            whichPlayer = 2;
            socketIdPlayer2 = socket.id;
        }
        if (whichPlayer != -1) {
            io.to(socket.id).emit('welcome-to-the-play', whichPlayer);
        }
    });
    socket.on('player-position', function(position) {
        console.log('Player position received: () ' + position.player + ' ' + position.paddleX);
        if (position.player == 1)
        {
            paddlePlayer1X = position.paddleX;
        }
        else
        {
            paddlePlayer2X = position.paddleX;
        }
        ballposition = position;
    });
    socket.on('I-lost', function(player) {
        console.log('Player ' + player + ' lost');
        if (player == 1) {
            socketIdPlayer1 = '';
        } else if (player == 2) {
            socketIdPlayer2 = '';
        }
    });

    
})

Console.log('Port process.env.PORT = ' + process.env.PORT);
http.listen(process.env.PORT || 80, function() {        // Heroku dynamically assigns a port
    console.log("Server running on heraku port, 80");
})

/*
setInterval(syncToClients, 16);
function syncToClients() {
    console.log('Ball position sent: ' + ballposition.x + ' ' + ballposition.y);
    io.emit('ball-position', ballposition);
}*/

setInterval(makeItLive, 16);
function makeItLive() {

    if(ballX + dx > width-ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
    }
    if(ballY + dy < ballRadius || ballY + dy > height-ballRadius) {
        dy = -dy;
    }

    ballX += dx;
    ballY += dy;

    io.emit('game-position', { "x": ballX, "y": ballY, "dx": dx, "dy": dy , 
        "paddlePlayer1X": paddlePlayer1X, "paddlePlayer2X": paddlePlayer2X });

}
