const { Console } = require('console');

console.log('starting server...');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var width = 480;
var height = 640;

// all this to be replaced with Ball
var ballposition = { "x": width/2, "y": height/2, "dx": 4, "dy": -3 };
var ballX = width/2;
var ballY = height/2;
var dx = 4;
var dy = -4;
var ballRadius = 10;

var paddlePlayer1X = 0;
var paddlePlayer2X = 0;

var player1 = '';
var player2 = '';

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get("/client.js", function(req, res) {
    res.sendFile(__dirname + '/client.js');
});
app.get("/game-objects.js", function(req, res) {
    res.sendFile(__dirname + '/game-objects.js');     // can probably be optimized
});

io.on('connection', function(socket) {
    console.log('client connected');
    socket.on('disconnect', function() {
        console.log('client disconnected');
    });
    socket.on('wannaplay', function(playerName) {
        console.log('Client wanna play: ' + playerName);
        var whichPlayer = -1;
        if (player1 == '')
        {
            whichPlayer = 1;
            player1 = playerName;
        }
        else if (player2 == '')
        {
            whichPlayer = 2;
            player2 = playerName;
        }
        if (whichPlayer != -1) {
            console.log('welcome-to-the-play ' + whichPlayer);
            io.to(socket.id).emit('welcome-to-the-play', whichPlayer);
        }
    });
    socket.on('player-position', function(position) {
        // console.log('Player position received: () ' + position.player + ' ' + position.paddleX);
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
            io.emit('Gamefinished', player1);
        } else {
            io.emit('Gamefinished', player2);
        }
    });
    socket.on('latency-ping', function() {
        socket.emit('latency-pong');
      });
});

console.log('Port process.env.PORT = ' + process.env.PORT);
server.listen(process.env.PORT || 80, function() {        // Heroku dynamically assigns a port
    console.log("Server running on heraku port or 80");
});

setInterval(makeItLive, 16);
function makeItLive() {
    // to be refactorized in ball class
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
