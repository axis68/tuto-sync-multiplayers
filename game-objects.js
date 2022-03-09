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
}

class Paddle {    
    constructor(paddleType, x, y) {
        this.paddleType = paddleType;
        this.x = x;
        this.y = y;
        this.width = 75;
        this.height = 10;
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
}

export { Ball, PaddleType, Paddle };
console.log('Class Ball, Paddle defined');