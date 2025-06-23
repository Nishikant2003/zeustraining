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

    addCellToSelection(row, col) {
        this.selectedCells.add(`${row},${col}`);
    }

    isCellSelected(row, col) {
        return this.selectedCells.has(`${row},${col}`);
    }

    isRowHighlighted(row) {
        if (!this.currentSelection) return false;
        return row >= this.currentSelection.startRow && row <= this.currentSelection.endRow;
    }

    isColumnHighlighted(col) {
        if (!this.currentSelection) return false;
        return col >= this.currentSelection.startCol && col <= this.currentSelection.endCol;
    }

    selectRange(startRow, startCol, endRow, endCol) {
        this.clearSelection();

        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                this.addCellToSelection(row, col);
            }
        }

        this.currentSelection = {
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
}

class SelectionCalculator {
    constructor() {
        this.cache = new Map();
        this.cacheKey = null;
    }

    getNumericValues(grid, selection) {
        const selectedCells = selection.getSelectedCellsArray();
        const values = [];

        for (const { row, col } of selectedCells) {
            if (row === 0 || col === 0) continue;

            const cell = grid.getCell(row, col);
            const value = cell.getValue();

            if (value !== null && value !== undefined && value !== '') {
                const numValue = this.parseNumber(value);
                if (!isNaN(numValue)) {
                    values.push(numValue);
                }
            }
        }

        return values;
    }

    parseNumber(value) {
        if (typeof value === 'number') return value;

        const str = String(value).trim();

        if (str.endsWith('%')) {
            return parseFloat(str.slice(0, -1)) / 100;
        }

        const cleaned = str.replace(/[$,€£¥]/g, '');

        if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
            return -parseFloat(cleaned.slice(1, -1));
        }

        return parseFloat(cleaned);
    }

    calculate(grid, selection) {
        const values = this.getNumericValues(grid, selection);

        const stats = {
            count: values.length,
            sum: 0,
            min: null,
            max: null,
            avg: null,
            hasNumbers: values.length > 0
        };

        if (values.length === 0) {
            return stats;
        }

        stats.sum = values.reduce((acc, val) => acc + val, 0);
        stats.min = Math.min(...values);
        stats.max = Math.max(...values);
        stats.avg = stats.sum / stats.count;

        return stats;
    }

    getFormattedStats(grid, selection) {
        const stats = this.calculate(grid, selection);

        if (!stats.hasNumbers) {
            return "No numeric values selected";
        }

        const parts = [];

        if (stats.count === 1) {
            parts.push(`Value: ${this.formatNumber(stats.sum)}`);
        } else {
            parts.push(`Count: ${stats.count}`);
            parts.push(`Sum: ${this.formatNumber(stats.sum)}`);
            parts.push(`Avg: ${this.formatNumber(stats.avg)}`);
            parts.push(`Min: ${this.formatNumber(stats.min)}`);
            parts.push(`Max: ${this.formatNumber(stats.max)}`);
        }

        return parts.join(' | ');
    }

    formatNumber(num) {
        if (num === null || num === undefined) return 'N/A';

        if (Math.abs(num) < 0.01 && num !== 0) {
            return num.toExponential(2);
        }

        if (num % 1 === 0) {
            return num.toLocaleString();
        }

        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    clearCache() {
        this.cache.clear();
        this.cacheKey = null;
    }
}