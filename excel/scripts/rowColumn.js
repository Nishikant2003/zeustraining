class Row {
    constructor(index, colCount) {
        this.index = index;
        this.cellCount = colCount;
        this.cells = new Map();
        this.size = 25; // Default row height
    }

    getCell(colIndex) {
        if (!this.cells.has(colIndex)) {
            this.cells.set(colIndex, new Cell(this.index, colIndex));
        }
        return this.cells.get(colIndex);
    }

    setCellValue(colIndex, value) {
        this.getCell(colIndex).setValue(value);
    }

    setSize(newSize) {
        this.size = Math.max(10, newSize);
    }

    getSize() {
        return this.size;
    }
}

class Column {
    constructor(index, rowCount) {
        this.index = index;
        this.cellCount = rowCount;
        this.cells = new Map();
        this.size = 100; // Default column width
    }

    getCell(rowIndex) {
        if (!this.cells.has(rowIndex)) {
            this.cells.set(rowIndex, new Cell(rowIndex, this.index));
        }
        return this.cells.get(rowIndex);
    }

    setCellValue(rowIndex, value) {
        this.getCell(rowIndex).setValue(value);
    }

    setSize(newSize) {
        this.size = Math.max(10, newSize);
    }

    getSize() {
        return this.size;
    }
}
