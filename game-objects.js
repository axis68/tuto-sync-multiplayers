const Border = {
    NoBorder: 0,
    Bottom: 1,
    Top: 2,
    Left: 3,
    Right: 4
};

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 4;
        this.dy = -4;
        this.radius = 10;
    }

    drawBall(canvasContext) {
        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        canvasContext.fillStyle = "#FF9500";
        canvasContext.fill();
        canvasContext.closePath();
    }

    // Return: type Border
    isReachingBorder(screenWidth, screenHeight)
    {
        if(this.y + this.dy < this.radius) {
            return Border.Top;
        } else if (this.y + this.dy > screenHeight - this.radius) {
            return Border.Bottom;
        } else if (this.x + this.dx > screenWidth - this.radius) {
            return Border.Right;
        } else if (this.x + this.dx < this.radius) {
            return Border.Left;
        } else {
            return Border.NoBorder;
        }
    }

    moveNextPosition(width, height)
    {
        if(this.x + this.dx > width - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
        }
        if(this.y + this.dy < this.radius || this.y + this.dy > height - this.radius) {
            this.dy = -this.dy;
        }
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
    }

    getJSONPosition()
    {
        return { "x": this.x, "y": this.y, "dx": this.dx, "dy": this.dy }
    }

    setJSONPosition(position)
    {
        this.x = position.x;
        this.y = position.y;
        this.dx = position.dx;
        this.dy = position.dy;
    }
};

const PaddleType = {
    VerticalUpperSide: 1,
    VerticalLowerSide: 2
};

class Paddle {    
    constructor(paddleType, x, y) {
        this.paddleType = paddleType;
        this.x = x;
        this.y = y;
        this.width = 75;
        this.height = 10;
        this.score = 0;
        this.playerName = '';
    }

    setPosition(position) {
        this.x = position;
    }

    drawPaddle(canvasContext) {
        canvasContext.beginPath();
        canvasContext.rect(this.x, this.y, this.width, this.height);
        canvasContext.fillStyle = "#0095DD";
        canvasContext.fill();
        canvasContext.closePath();
    }

    drawScore(canvasContext) {
        canvasContext.font = "16px Arial";
        canvasContext.fillStyle = "#0095DD";
        let y = this.y;
        if (this.paddleType == PaddleType.VerticalUpperSide) {
            y += 16;
        }
        canvasContext.fillText(this.score, 20, y);
    }

    moveRight(canvas) {
        if (this.x < canvas.width - this.width) {
            this.x += 14;
        }
    }

    moveLeft(canvas) {
        if (this.x > 0) {
            this.x -= 14;
        }
    }

    isBallOutsidePaddle(ball) {
        return ball.x < this.x || ball.x > this.x + this.width;
    }
    isBallTooHigh(ball) {
        return ball.y + ball.dy <= this.height;
    }
    isBallTooLow(ball, canvas) {
        return ball.y + ball.dy >= canvas.height - ball.radius;
    }

    // Check against next ball position
    willMissBall(ball, canvas) {   
        switch (this.paddleType) {
            case PaddleType.VerticalUpperSide:
                return this.isBallTooHigh(ball) && this.isBallOutsidePaddle(ball);
            default:
            case PaddleType.VerticalLowerSide:
                return this.isBallTooLow(ball, canvas) && this.isBallOutsidePaddle(ball);
        }
    }

    resetForNewGame() {
        this.setPlayerName('');
        this.setScore(0);
    }

    setPlayerName(playerName) {
        this.playerName = playerName;
    }

    setScore(score) {
        this.score = score;
    }

    isActive() {
        return (this.playerName.length > 0);
    }
}

class PlayerScore {
    constructor(playerName) {
        this.playerName = playerName;
        this.score = 0;
    } 
}

export { Border, Ball, PaddleType, Paddle , PlayerScore};
console.log('Class Ball, Paddle, PlayerScore defined');