// Javascript module for the client side
import { Ball, PaddleType, Paddle } from '/game-objects.js';       // Only possible from a module

console.log('Starting client.js');
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ball = new Ball(canvas.width/2, canvas.height-30);
var player = -1;    // -1: no player, 1, 2 
var backgroundText = 'Press arrow UP to play! (then: Left/Right)';

var paddleHeight = 10;
var paddleWidth = 75;
var paddles = [
    new Paddle(PaddleType.VerticalLowerSide, (canvas.width-paddleWidth)/2, canvas.height-paddleHeight),
    new Paddle(PaddleType.VerticalUpperSide, (canvas.width-paddleWidth)/2, 0)
];

var rightPressed = false;
var leftPressed = false;

var lastRedrawTimestamp = Date.now();       // FPS

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
    else if (e.key == "ArrowUp" && player == -1) {     // Up arrow to start playing
        let playerName = document.getElementById('playerName').value;
        console.log(playerName);
        if (playerName.length == 0) {
            backgroundText = 'To play please enter a valid player name';
        } else {
            document.getElementById('player').innerText = 'wannaplay';
            socket.emit('wannaplay', playerName);
        }

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
    drawBackgroundText();

    if (player != -1) {
        let index = player - 1;
        if (paddles[index].willMissBall(ball, canvas))
        {
            document.getElementById('player').innerText = "Aaaarg";
            socket.emit('I-lost', player);
            player = -1;
            backgroundText = 'You have lost, type arrow UP to replay'
        }
        if (rightPressed) {
            paddles[index].moveRight(canvas);
        } else if (leftPressed) {
            paddles[index].moveLeft(canvas);
        }
        syncToServer();
    }
    requestAnimationFrame(redraw);
}
draw();