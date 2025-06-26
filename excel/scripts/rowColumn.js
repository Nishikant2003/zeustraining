class RowColumn {
    constructor(index, type, cellCount) {
        this.index = index;
        this.type = type;
        this.cellCount = cellCount;
        this.cells = new Map();
        this.size = type === 'row' ? 25 : 100;

    }

    getCell(cellIndex) {
        if (!this.cells.has(cellIndex)) {
            const [row, col] = this.type === 'row'
                ? [this.index, cellIndex]
                : [cellIndex, this.index];
            this.cells.set(cellIndex, new Cell(row, col));
        }
        return this.cells.get(cellIndex);
    }

    setCellValue(cellIndex, value) {
        const cell = this.getCell(cellIndex);
        cell.setValue(value);
    }

    setSize(newSize) {
        this.size = Math.max(10, newSize);
    }

    getSize() {
        return this.size;
    }
}