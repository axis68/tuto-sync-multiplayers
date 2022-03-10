// Server as ES6 modules
import { Border, Ball, PaddleType, Paddle, PlayerScore } from './game-objects.js'; 
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as path from 'path';

console.log('starting server...');

const app = express();
var server = new createServer(app);
var io = new Server(server);

var width = 480;
var height = 640;

var ball = new Ball(width/2, height/2);

var paddlePlayer1X = 0;     // obsolete
var paddlePlayer2X = 0;

var player1 = '';       // obsolete
var player2 = '';
var paddles = [
    new Paddle(PaddleType.VerticalLowerSide, 0, 0),
    new Paddle(PaddleType.VerticalUpperSide, 0, 0)
];

const __dirname = path.resolve(path.dirname(''));
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
            player1 = playerName;   // obsolete
            paddles[0].setPlayerName(playerName);
        } else if (player2 == '')
        {
            whichPlayer = 2;
            player2 = playerName;
            paddles[1].setPlayerName(playerName);
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
            paddlePlayer1X = position.paddleX;  // obsolete
        }
        else
        {
            paddlePlayer2X = position.paddleX;  // obsolete
        }
    });
    socket.on('I-lost', function(player) {
        // console.log('Player ' + player + ' lost');
        if (player == 1) {
            io.emit('Gamefinished', player1);
        } else {
            io.emit('Gamefinished', player2);
        }
        player1 = '';   // obsolete
        player2 = '';
        paddles[0].resetForNewGame();
        paddles[1].resetForNewGame();
    });
    socket.on('latency-ping', function() {
        socket.emit('latency-pong');
      });
});

console.log('Port process.env.PORT = ' + process.env.PORT);
server.listen(process.env.PORT || 80, function() {        // Heroku dynamically assigns a port
    console.log("Server running on heraku port or 80");
});

setInterval(makeItLive, 32);
function makeItLive() {
    let border = ball.isReachingBorder(width, height);
    switch (border) {
        case Border.Bottom: {
            paddles[0].setScore(paddles[0].score + 1);
            break;
        }
        case Border.Top: {
            paddles[1].setScore(paddles[0].score + 1);
            break;
        }
    }

    ball.moveNextPosition(width, height);

    io.emit('game-position', { "ball": ball.getJSONPosition(),
        "paddlePlayer1X": paddlePlayer1X,       // obsolete
        "paddlePlayer1Score": paddles[0].score, 
        "paddlePlayer2X": paddlePlayer2X,
        "paddlePlayer2Score": paddles[1].score});
}
