class RowResizer {
    constructor(grid) {
        this.grid = grid;
        this.isResizing = false;
        this.rowIndex = -1;
        this.startY = 0;
        this.startHeight = 0;
    }

    startResize(rowIndex, startY) {
        this.isResizing = true;
        this.rowIndex = rowIndex;
        this.startY = startY;
        this.startHeight = this.grid.getRow(rowIndex).getSize();
    }

    handleResize(currentY) {
        if (!this.isResizing) return;
        const delta = currentY - this.startY;
        const newSize = Math.max(10, this.startHeight + delta);
        this.grid.getRow(this.rowIndex).setSize(newSize);
        this.grid.buildPositionCaches();
        this.grid.setupScrollArea();
        this.grid.requestRender();
    }

    stopResize() {
        this.isResizing = false;
        this.rowIndex = -1;
    }
 drawResizeLine(ctx, rowY) {
        ctx.save();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(0, rowY);
        ctx.lineTo(this.grid.canvas.width, rowY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
}

class ColResizer {
    constructor(grid) {
        this.grid = grid;
        this.isResizing = false;
        this.colIndex = -1;
        this.startX = 0;
        this.startWidth = 0;
    }

    startResize(colIndex, startX) {
        this.isResizing = true;
        this.colIndex = colIndex;
        this.startX = startX;
        this.startWidth = this.grid.getColumn(colIndex).getSize();
    }

    handleResize(currentX) {
        if (!this.isResizing) return;
        const delta = currentX - this.startX;
        const newSize = Math.max(10, this.startWidth + delta);
        this.grid.getColumn(this.colIndex).setSize(newSize);
        this.grid.buildPositionCaches();
        this.grid.setupScrollArea();
        this.grid.requestRender();
    }

    stopResize() {
        this.isResizing = false;
        this.colIndex = -1;
    }
   drawResizeLine(ctx, colX) {
        ctx.save();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(colX, 0);
        ctx.lineTo(colX, this.grid.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
}
