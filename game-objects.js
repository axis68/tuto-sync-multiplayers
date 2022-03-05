class Ball {
    constructor(x, y, canvasContext) {
        this.x = x;
        this.y = y;
        this.dx = 4;
        this.dy = -4;
        this.radius = 10;
        this.canvasContext = canvasContext;     
    }

    setPosition(position) {
        this.x = position.x;
        this.y = position.y;
        this.dx = position.dx;
        this.dy = position.dy;
    }

    drawBall() {
        var ctx = this.canvasContext;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#FF9500";
        ctx.fill();
        ctx.closePath();
    }

  };

export { Ball };
console.log('Class Ball defined');