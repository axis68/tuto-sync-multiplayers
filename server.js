// Server as ES6 modules
import { Border, Ball, PaddleType, Paddle, PlayerScore } from './game-objects.js'; 
import { HallOfFame, SingleScore } from './hall-of-fame.js';
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

var hallOfFame = new HallOfFame(10);

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
app.get("/hall-of-fame.js", function(req, res) {
    res.sendFile(__dirname + '/hall-of-fame.js');     // can probably be optimized
});

io.on('connection', function(socket) {
    console.log('client connected');
    socket.on('disconnect', function() {
        console.log('client disconnected');
    });
    socket.on('wannaplay', function(playerName) {
        console.log('Client wanna play: ' + playerName);
        let whichPlayer = -1;
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
        io.emit('new-player-in-game', { "playerNb": whichPlayer, "name": playerName });
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
        hallOfFame.addSingleScore(new SingleScore(paddles[1].playerName, paddles[1].score));
        hallOfFame.addSingleScore(new SingleScore(paddles[0].playerName, paddles[0].score));        
        if (player == 1) {
            io.emit('Gamefinished', { "lost": player1, "hallOfFame": JSON.stringify(hallOfFame) });            
        } else {
            io.emit('Gamefinished', { "lost": player2, "hallOfFame": JSON.stringify(hallOfFame) });
        }
        player1 = '';   // obsolete
        player2 = '';
        paddles[0].resetForNewGame();
        paddles[1].resetForNewGame();
        ball.resetVector();

        // hallOfFame.logHallOfFame();
        // console.log('--------');
        // console.log(JSON.stringify(hallOfFame));
        // console.log('--------');
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
            if (paddles[0].isActive()) {
                paddles[0].setScore(paddles[0].score + 1);
                ball.increaseSpeed();
            }
            break;
        }
        case Border.Top: {
            if (paddles[1].isActive()) {
                paddles[1].setScore(paddles[0].score + 1);
                ball.increaseSpeed();                
            }
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
