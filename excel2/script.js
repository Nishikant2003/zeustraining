const CANVAS_LNE_STROKE_STYLE = "#000000";

class GridCanvas {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cellWidth = options.cellWidth || 100;
    this.cellHeight = options.cellHeight || 30;
    this.rows = options.rows || 100;
    this.cols = options.cols || 50;

    this.headerOffsetX = this.cellWidth;  //  Space for row headers
    this.headerOffsetY = this.cellHeight; // Space for column headers

    this.setupCanvas();
    this.drawGrid();
  }
    updateDevicePixelRatio() {
    const newDPR = window.devicePixelRatio || 1;
    if (newDPR !== this.dpr) {
        this.dpr = newDPR;
        this.setupCanvas();
        this.drawGrid();
    }
    }
  setupCanvas() {
    const w = this.cols * this.cellWidth + this.headerOffsetX;  //  total width
    const h = this.rows * this.cellHeight + this.headerOffsetY; //  total height
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.scale(this.dpr, this.dpr);
  }

  drawColumnHeaders(ctx) {
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f3f3f3";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.1;

    for (let c = 0; c < this.cols; c++) {
      const x = this.headerOffsetX + c * this.cellWidth;
      ctx.fillStyle = "#f3f3f3";
      ctx.fillRect(x, 0, this.cellWidth, this.cellHeight);
      ctx.strokeRect(x + 0.5, 0.5, this.cellWidth, this.cellHeight);
      let label="";
      let col=c;
    while(col>=0){
        label = String.fromCharCode(65 + (col % 26)) + label;
            col=Math.floor(col/26)-1;
    }
      ctx.fillStyle = "#000";
      ctx.fillText(label, x + this.cellWidth / 2, this.cellHeight / 2);
    }
  }

  drawRowHeaders(ctx) {
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f3f3f3";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.1;

    for (let r = 0; r < this.rows; r++) {
      const y = this.headerOffsetY + r * this.cellHeight;
      ctx.fillStyle = "#f3f3f3";
      ctx.fillRect(0, y, this.cellWidth, this.cellHeight);
      ctx.strokeRect(0.5, y + 0.5, this.cellWidth, this.cellHeight);
      ctx.fillStyle = "#000";
      ctx.fillText(r + 1, this.cellWidth-2, y + this.cellHeight / 2);
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = CANVAS_LNE_STROKE_STYLE;
    ctx.lineWidth = 0.1;

    // Draw vertical grid lines (after row header)
    for (let c = 0; c <= this.cols; c++) {
      const x = this.headerOffsetX + c * this.cellWidth + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, this.headerOffsetY);
      ctx.lineTo(x, this.headerOffsetY + this.rows * this.cellHeight);
      ctx.stroke();
    }

    // Draw horizontal grid lines (after column header)
    for (let r = 0; r <= this.rows; r++) {
      const y = this.headerOffsetY + r * this.cellHeight + 0.5;
      ctx.beginPath();
      ctx.moveTo(this.headerOffsetX, y);
      ctx.lineTo(this.headerOffsetX + this.cols * this.cellWidth, y);
      ctx.stroke();
    }

    this.drawColumnHeaders(ctx);
    this.drawRowHeaders(ctx);
  }
}

// Initialization
const canvas = document.getElementById("gridCanvas");
const grid = new GridCanvas(canvas, {
  cellWidth: 100,
  cellHeight: 30,
  rows: 50,
  cols: 27
});

window.addEventListener("resize", () => {
  grid.updateDevicePixelRatio();
});

