// Javascript module for the client side

console.log('Starting client.js');

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

import { Ball } from '/game-objects.js';       // Only possible from a module
var ball = new Ball(canvas.width/2, canvas.height-30, ctx);
console.log('balle: ' + ball.x);

var player = -1;    // -1: no player, 1, 2 
var backgroundText = 'Press SPACE to play! (then: Left/Right)';

var paddleHeight = 10;
var paddleWidth = 75;
var paddleCharacteristics = {
    "paddle": [
        {
            "player": 0,
            "paddleHeight": 10,
            "paddleWidth": 75,
            "defaultX": (canvas.width-paddleWidth)/2,
            "defaultY": canvas.height-paddleHeight,
            "moveXPlus": 14,
        },
        {
            "player": 1,
            "paddleHeight": 10,
            "paddleWidth": 75,
            "defaultX": (canvas.width-paddleWidth)/2,
            "defaultY": 0,
            "moveXPlus": 14,
        }
    ]
};

var paddlePosition = {
    "paddle": [
        {
            "x": paddleCharacteristics.paddle[0].defaultX
        },
        {
            "x": paddleCharacteristics.paddle[1].defaultX
        }
    ]
};

var rightPressed = false;
var leftPressed = false;

var intervalSyncToServerMs = 100;
var lastRedrawTimestamp = Date.now();
var lastSyncToServer = 0;

// Communication with server

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
                "player": player, "paddleX": paddlePosition.paddle[player - 1].x
            });
    }
};

var syncFromServer = function(position) {
    ball.setPosition(position);

    if (player != 1) {
        paddlePosition.paddle[0].x = position.paddlePlayer1X;
    }
    if (player != 2) {
        paddlePosition.paddle[1].x = position.paddlePlayer2X;
    }
}
socket.on('welcome-to-the-play', startPlay)
socket.on('game-position', syncFromServer);
socket.on('Gamefinished', function(playerWhoLost) {
        console.log('Received Gamefinished ' + playerWhoLost);
        document.getElementById('player').innerText = "Game finished";
        backgroundText = 'Game finished; player ' + playerWhoLost + " lost!";
        player = -1;
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
});

// Commands

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
    else if (e.keyCode == 32 && player == -1) {     // Space char
        document.getElementById('player').innerText = 'wannaplay';
        socket.emit('wannaplay');
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

/// <summary>
/// paddle: paddle number (0, 1)
/// </summary>
function drawPaddle(paddle)
{
    ctx.beginPath();
    ctx.rect(paddlePosition.paddle[paddle].x, paddleCharacteristics.paddle[paddle].defaultY, 
        paddleCharacteristics.paddle[paddle].paddleWidth, paddleCharacteristics.paddle[paddle].paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
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
    document.getElementById('latency').innerText = latency;
    document.getElementById('fps').innerText = 1000 / (timestamp - lastRedrawTimestamp);
    lastRedrawTimestamp = timestamp;

    draw();
}

function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.drawBall();
    drawPaddle(0);
    drawPaddle(1);
    drawBackgroundText();

    if (player != -1) {
        var index = player - 1;            
        if(ball.x <= paddlePosition.paddle[index].x || ball.x >= paddlePosition.paddle[index].x + paddleCharacteristics.paddle[index].paddleWidth) {  // Dangerous zone
            if ((player == 1 && ball.y + ball.dy > canvas.height - ball.radius)
                || (player == 2 && ball.y + ball.dy <= paddleCharacteristics.paddle[1].paddleHeight))
            {
                document.getElementById('player').innerText = "Aaaarg";
                socket.emit('I-lost', player);
                player = -1;
                backgroundText = 'You have lost, type SPACE to replay'
            }
        }

        if(rightPressed && paddlePosition.paddle[index].x < canvas.width - paddleCharacteristics.paddle[index].paddleWidth) {   // Left/Right movement
            paddlePosition.paddle[index].x = (paddlePosition.paddle[index].x + paddleCharacteristics.paddle[index].moveXPlus);
        } else if(leftPressed && paddlePosition.paddle[index].x > 0) {
            paddlePosition.paddle[index].x = (paddlePosition.paddle[index].x - paddleCharacteristics.paddle[index].moveXPlus);       
        }            
        syncToServer();
    }
    requestAnimationFrame(redraw);
}

draw();