// Server as ES6 modules
import { Ball } from './game-objects.js'; 
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

var paddlePlayer1X = 0;
var paddlePlayer2X = 0;

var player1 = '';
var player2 = '';

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
            player1 = playerName;
        } else if (player2 == '')
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
    });
    socket.on('I-lost', function(player) {
        // console.log('Player ' + player + ' lost');
        if (player == 1) {
            io.emit('Gamefinished', player1);
        } else {
            io.emit('Gamefinished', player2);
        }
        player1 = '';
        player2 = '';
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
    ball.moveNextPosition(width, height);

    io.emit('game-position', { "ball": ball.getJSONPosition(), 
        "paddlePlayer1X": paddlePlayer1X, "paddlePlayer2X": paddlePlayer2X });
}
