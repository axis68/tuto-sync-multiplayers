// Javascript ES6 module for the client side
import { Ball, PaddleType, Paddle } from '/game-objects.js';       // Only possible from a module

console.log('Starting client.js');
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var screenWidth = window.screen.width;
var glideBarHeight = 60;
var ball = new Ball(canvas.width/2, canvas.height-30);
var player = -1;    // -1: no player, 1, 2 
var backgroundText = 'Enter a player name and press key UP to play!';

var paddleHeight = 10;
var paddleWidth = 75;
var paddles = [
    new Paddle(PaddleType.VerticalLowerSide, (canvas.width-paddleWidth)/2, canvas.height-paddleHeight - glideBarHeight),
    new Paddle(PaddleType.VerticalUpperSide, (canvas.width-paddleWidth)/2, 0)
];

var fingerMovedPositionOnCanvas = -1;
var rightPressed = false;
var leftPressed = false;

var lastRedrawTimestamp = Date.now();       // FPS

// Server interaction

var socket = io();      // optional: url as argument
function startPlay(assignedPlayer)
{
    document.getElementById('player').innerText = assignedPlayer;
    player = assignedPlayer;
}

function syncToServer()
{
    if (player != -1) {
        socket.emit('player-position', 
            {
                "player": player, "paddleX": paddles[player - 1].x
            });
    }
};

var syncFromServer = function(position) {
    ball.setJSONPosition(position.ball);
    if (player != 1) {
        paddles[0].setPosition(position.paddlePlayer1X);
    }
    if (player != 2) {
        paddles[1].setPosition(position.paddlePlayer2X);
    }
    paddles[0].setScore(position.paddlePlayer1Score);
    paddles[1].setScore(position.paddlePlayer2Score);
}
socket.on('welcome-to-the-play', startPlay)
socket.on('new-player-in-game', function(newPlayer) {
    document.getElementById('player' + newPlayer.playerNb).innerText = "Player " + newPlayer.playerNb  +  " " + newPlayer.name;
});
socket.on('game-position', syncFromServer);
socket.on('player-lost', function(result) {
        document.getElementById('player').innerText = "Player lost";
        backgroundText = 'Player ' + result.whoLost + ' lost!';
        
        let hallOfFame = JSON.parse(result.hallOfFame);
        let myList = document.getElementById('halloffame');
        var child = myList.lastElementChild;
        while (child) {
            myList.removeChild(child);
            child = myList.lastElementChild;
        }
        hallOfFame.playerArray.forEach(item => {
            let li = document.createElement('li');
            li.innerText = item.player + ": " + item.score;
            myList.appendChild(li);
        })

        if (result.playerNbLost == player) {
            player = -1;
        }
        document.getElementById('player' + result.playerNbLost).innerText = "Player1";
    });

// Own latency calculation as built-in pong messages are not working
var latencyStartTime;
var latency;
setInterval(function() {            
    latencyStartTime = Date.now();
    socket.emit('latency-ping');
}, 5000);
socket.on('latency-pong', function() {
    latency = (Date.now() - latencyStartTime) / 2;
    document.getElementById('latency').innerText = latency;
});

// Commands
document.getElementById('btnStartGame').addEventListener('click', userWannaPlay);

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// document.addEventListener("mousemove", mouseMoveHandler, false);
// canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.key == "ArrowUp" && player == -1) {     // Up arrow to start playing
        userWannaPlay();
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function handleTouchMove(evt) {
    evt.preventDefault();
    let touches = evt.changedTouches;
    if (touches.length > 0 && player > 0) {   // array: one "touch" per finger
        fingerMovedPositionOnCanvas = Math.min(touches[0].screenX - paddles[player - 1].width / 2, 
            canvas.width - paddles[player - 1].width);
        if (fingerMovedPositionOnCanvas < 0) {
            fingerMovedPositionOnCanvas = 0;
        }
    }
}

function handleTouchEnd(evt) {
    evt.preventDefault();
    rightPressed = false;
    leftPressed = false;
    fingerMovedPositionOnCanvas = -1;
}

function userWannaPlay() {
    let playerName = document.getElementById('playerName').value;
    console.log(playerName);
    if (playerName.length == 0) {
        backgroundText = 'To play please enter a valid player name';
    } else {
        document.getElementById('player').innerText = 'wannaplay';
        socket.emit('wannaplay', playerName);
    }
}

function drawBackgroundText() 
{
    if (player == -1) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText(backgroundText, 110, 300);
    }
}

function redraw(timestamp)
{
    document.getElementById('fps').innerText = 1000 / (timestamp - lastRedrawTimestamp);
    lastRedrawTimestamp = timestamp;
    draw();
}

function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.drawBall(ctx);
    paddles[0].drawScore(ctx);
    paddles[0].drawPaddle(ctx);
    paddles[1].drawScore(ctx);
    paddles[1].drawPaddle(ctx);

    ctx.beginPath();
    ctx.rect(0, canvas.height - glideBarHeight, canvas.width, canvas.height);
    ctx.fillStyle = "#E3E3E3";
    ctx.fill();
    ctx.closePath();

    drawBackgroundText();

    if (player != -1) {
        let index = player - 1;
        if (rightPressed) {
            paddles[index].moveRight(canvas);
        } else if (leftPressed) {
            paddles[index].moveLeft(canvas);
        } else if (fingerMovedPositionOnCanvas != -1) {
            paddles[index].x = fingerMovedPositionOnCanvas;
        }
        syncToServer();
    }
    requestAnimationFrame(redraw);
}

draw();