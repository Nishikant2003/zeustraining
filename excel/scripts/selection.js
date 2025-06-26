class Selection {
    constructor() {
        this.selectedCells = new Set();
        this.isDragging = false;
        this.dragStartRow = -1;
        this.dragStartCol = -1;
        this.dragEndRow = -1;
        this.dragEndCol = -1;
        this.currentSelection = null;
    }

    clearSelection() {
        this.selectedCells.clear();
        this.currentSelection = null;
    }
    isFirstSelection(row, col) {
        if (!this.currentSelection) return false;
        return row === this.currentSelection.anchorRow && col === this.currentSelection.anchorCol;
    }

    addCellToSelection(row, col) {
        this.selectedCells.add(`${row},${col}`);
    }

    isCellSelected(row, col) {
        
        return this.selectedCells.has(`${row},${col}`);
    }


selectRange(startRow, startCol, endRow, endCol) {
    this.clearSelection();

    const minRow =  Math.min(startRow, endRow);
    const maxRow =  Math.max(startRow, endRow);
    const minCol =  Math.min(startCol, endCol);
    const maxCol =  Math.max(startCol, endCol);

    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            this.addCellToSelection(row, col);
        }
    }

    this.currentSelection = {
        anchorRow: startRow,
        anchorCol: startCol,
        startRow: minRow,
        startCol: minCol,
        endRow: maxRow,
        endCol: maxCol
    };
}

    startDragSelection(row, col) {
        this.isDragging = true;
        this.dragStartRow = row;
        this.dragStartCol = col;
        this.dragEndRow = row;
        this.dragEndCol = col;
        this.selectRange(row, col, row, col);
    }

    updateDragSelection(row, col) {
        if (!this.isDragging) return;

        this.dragEndRow = row;
        this.dragEndCol = col;
        this.selectRange(this.dragStartRow, this.dragStartCol, this.dragEndRow, this.dragEndCol);
    }

    finishDragSelection() {
        this.isDragging = false;
    }

    getSelectionInfo() {
        if (!this.currentSelection) return "No selection";

        const { startRow, startCol, endRow, endCol } = this.currentSelection;
        const cellCount = (endRow - startRow + 1) * (endCol - startCol + 1);

        if (cellCount === 1) {
            return `Cell: ${getCellAddress(startRow, startCol)}`;
        } else {
            return `Range: ${getCellAddress(startRow, startCol)}:${getCellAddress(endRow, endCol)} (${cellCount} cells)`;
        }
    }

    getCurrentSelection() {
        return this.currentSelection;
    }

    getSelectedCellsArray() {
        return Array.from(this.selectedCells).map(cellStr => {
            const [row, col] = cellStr.split(',').map(Number);
            return { row, col };
        });
    }
    drawSelectionOutline() {
        const currentSelection = this.getCurrentSelection();
        if (!currentSelection) return;

        const ctx = grid.ctx;
        const { startRow, startCol, endRow, endCol } = currentSelection;

        const startX = grid.getColumnPosition(startCol) - grid.scrollX;
        const startY = grid.getRowPosition(startRow) - grid.scrollY;
        const endX = grid.getColumnPosition(endCol + 1) - grid.scrollX;
        const endY = grid.getRowPosition(endRow + 1) - grid.scrollY;

        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);

        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
 
        let handleSize = 7;
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(endX - handleSize / 2, endY - handleSize / 2, handleSize, handleSize);
        handleSize = 6;
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(endX - handleSize / 2, endY - handleSize / 2, handleSize, handleSize);
    }
    handleKeyboardNavigation(e, grid) {
    const currentSelection = this.getCurrentSelection();
    if (!currentSelection) return false;

    const { startRow, startCol, endRow, endCol, anchorRow, anchorCol } = currentSelection;
    let changed = false;

    if (e.shiftKey) {
        let activeRow, activeCol;
        if (anchorRow === startRow && anchorCol === startCol) {
            activeRow = endRow; activeCol = endCol;
        } else if (anchorRow === endRow && anchorCol === endCol) {
            activeRow = startRow; activeCol = startCol;
        } else if (anchorRow === startRow && anchorCol === endCol) {
            activeRow = endRow; activeCol = startCol;
        } else {
            activeRow = startRow; activeCol = endCol;
        }

        if (e.key === 'ArrowUp') {
            if (activeRow > 1) { activeRow--; changed = true; }
        } else if (e.key === 'ArrowDown') {
            if (activeRow < grid.rowCount - 1) { activeRow++; changed = true; }
        } else if (e.key === 'ArrowLeft') {
            if (activeCol > 1) { activeCol--; changed = true; }
        } else if (e.key === 'ArrowRight') {
            if (activeCol < grid.colCount - 1) { activeCol++; changed = true; }
        }

        if (changed) {
            this.selectRange(anchorRow, anchorCol, activeRow, activeCol);
            grid.updateInfoDisplay();
            grid.requestRender();
            e.preventDefault();
            return true;
        }
    } else {
        let newRow = startRow, newCol = startCol;
        if (e.key === 'ArrowUp' && startRow > 1) { newRow--; changed = true; }
        else if (e.key === 'ArrowDown' && endRow < grid.rowCount - 1) { newRow++; changed = true; }
        else if (e.key === 'ArrowLeft' && startCol > 1) { newCol--; changed = true; }
        else if (e.key === 'ArrowRight' && endCol < grid.colCount - 1) { newCol++; changed = true; }

        if (changed) {
            this.selectRange(newRow, newCol, newRow, newCol);
            grid.updateInfoDisplay();
            grid.requestRender();
            e.preventDefault();
            return true;
        }
    }
    return false;
}
}

