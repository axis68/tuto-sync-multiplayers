class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 4;
        this.dy = -4;
        this.radius = 10;
    }

    setPosition(position) {
        this.x = position.x;
        this.y = position.y;
        this.dx = position.dx;
        this.dy = position.dy;
    }

    drawBall(canvasContext) {
        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        canvasContext.fillStyle = "#FF9500";
        canvasContext.fill();
        canvasContext.closePath();
    }

  };

export { Ball };
console.log('Class Ball defined');