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
let glideBarHeight = 60;

var ball = new Ball(width/2, height/2);

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
        if (paddles[0].playerName == '') {
            whichPlayer = 1;
            paddles[0].setPlayerName(playerName);
        } else if (paddles[1].playerName == '') {
            whichPlayer = 2;
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
        if (position.player > 0) {
            paddles[position.player - 1].setPosition(position.paddleX);
        }
    });
    /*
    socket.on('I-lost', function(playerNb) {
        // console.log('Player ' + player + ' lost');
        if (playerNb > 0) {
            hallOfFame.addSingleScore(new SingleScore(paddles[playerNb - 1].playerName, paddles[playerNb - 1].score));
            io.emit('player-lost', { "playerNbLost": playerNb, "whoLost": paddles[playerNb - 1].playerName, "hallOfFame": JSON.stringify(hallOfFame) });
            paddles[playerNb - 1].resetForNewGame();
        } 
        if (paddles[0].playerName == '' && paddles[1].playerName == '') { // game finished 
            ball.resetVector();
        }
    });*/
    socket.on('latency-ping', function() {
        socket.emit('latency-pong');
      });
});

server.listen(5000, function() {        // Port used by Vericel - Heroku has a different implementation
    console.log("Server running on vercel on port 5000.");
});

function playerLooses(playerNb) {
    if (playerNb > 0) {
        hallOfFame.addSingleScore(new SingleScore(paddles[playerNb - 1].playerName, paddles[playerNb - 1].score));
        io.emit('player-lost', { "playerNbLost": playerNb, "whoLost": paddles[playerNb - 1].playerName, "hallOfFame": JSON.stringify(hallOfFame) });
        paddles[playerNb - 1].resetForNewGame();
    } 
    if (paddles[0].playerName == '' && paddles[1].playerName == '') { // game finished 
        ball.resetVector();
    }
}

setInterval(makeItLive, 32);
function makeItLive() {
    let border = ball.isReachingBorder(width, height - glideBarHeight);
    switch (border) {
        case Border.Bottom: {            
            if (paddles[0].isActive()) {
                if (paddles[0].willMissBall(ball, height - glideBarHeight))
                {
                    playerLooses(1);
                } else {
                    paddles[0].setScore(paddles[0].score + 1);
                    ball.increaseSpeed();
                }
            }
            break;
        }
        case Border.Top: {
            if (paddles[1].isActive()) {
                if (paddles[1].willMissBall(ball, 0)) {             // duplicated code
                    playerLooses(2);
                } else {
                    paddles[1].setScore(paddles[1].score + 1);
                    ball.increaseSpeed();  
                }
            }
            break;
        }
    }

    ball.moveNextPosition(width, height, glideBarHeight);

    io.emit('game-position', { "ball": ball.getJSONPosition(),
        "paddlePlayer1X": paddles[0].x,       // obsolete
        "paddlePlayer1Score": paddles[0].score, 
        "paddlePlayer2X": paddles[1].x,
        "paddlePlayer2Score": paddles[1].score});
}