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

export { Ball };
console.log('Class Ball defined');