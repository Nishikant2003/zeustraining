class CanvasGrid {
    constructor(canvasId, rowCount, colCount) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');
        this.scrollContent = document.getElementById('scrollContent');
        this.info = document.getElementById('info');
        this.dpr = window.devicePixelRatio || 1;
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.scrollX = 0;
        this.scrollY = 0;

        // Data storage
        this.data = [];
        this.dataColumns = [];

        // Initialize systems
        this.selection = new Selection();
        this.dragSelectingRows = false;
        this.dragSelectingCols = false;

        // Initialize data structures
        this.rows = new Map();
        this.columns = new Map();

        this.rowResizer = new RowResizer(this);
        this.colResizer = new ColResizer(this);

        // Virtual rendering properties
        this.visibleRows = 0;
        this.visibleCols = 0;
        this.startRow = 0;
        this.endRow = 0;
        this.startCol = 0;
        this.endCol = 0;


        // Performance optimization
        this.renderRequested = false;
        this.scrollTimeout = null;
        this.lastScrollTime = 0;
        this.scrollThrottle = 16;

        // Cached position arrays
        this.rowPositions = [];
        this.colPositions = [];

        // State for editing a cell
        this.isEditing = false;
        this.editingCell = null;
        this.editor = null;
        this.editorBlurHandler = null;
        this.editorKeyHandler = null;

        // Initialize
        this.initializeStructures();
        console.log(this.rows, this.cols)
        this.setupCanvas();
        this.buildPositionCaches();
        this.setupScrollArea();
        this.bindEvents();
        this.updateScrollPosition();
        this.calculateVisibleRange();
        this.render();
    }
    updateDevicePixelRatio() {
        const newDPR = window.devicePixelRatio || 1;
        if (newDPR !== this.dpr) {
            this.dpr = newDPR;
            this.setupCanvas();
        }
    }
    initializeStructures() {
        for (let i = 0; i < this.colCount; i++) {
            this.columns.set(i, new Column(i, this.rowCount));
        }
        for (let i = 0; i < this.rowCount; i++) {
            this.rows.set(i, new Row(i, this.colCount));
        }
    }

    buildPositionCaches() {
        this.rowPositions = [0];
        for (let i = 0; i < this.rowCount; i++) {
            const rowHeight = this.getRow(i).getSize();
            this.rowPositions.push(this.rowPositions[i] + rowHeight);
        }

        this.colPositions = [0];
        for (let i = 0; i < this.colCount; i++) {
            const colWidth = this.getColumn(i).getSize();
            this.colPositions.push(this.colPositions[i] + colWidth);
        }
    }
    getRow(index) {
        if (!this.rows.has(index)) {
            this.rows.set(index, new Row(index, this.colCount));
        }
        return this.rows.get(index);
    }

    getColumn(index) {
        if (!this.columns.has(index)) {
            this.columns.set(index, new Column(index, this.rowCount));
        }
        return this.columns.get(index);
    }

    getCell(row, col) {
        return this.getRow(row).getCell(col);
    }

    setCellValueDirect(row, col, value) {
        this.getRow(row).setCellValue(col, value);
    }

    setCellValue(row, col, value) {
        this.getRow(row).setCellValue(col, value);
        this.requestRender();
    }

    // Load data from JSON
    async loadData(url = 'data.json') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.populateGridWithData(data);
            this.info.textContent = `Loaded ${data.length} records `;

        } catch (error) {
            console.error('Error loading data:', error);
            this.info.textContent = `Ready - ${this.rowCount - 2} rows available for data`;
        }
    }

    populateGridWithData(data) {
        this.data = data;
        this.dataColumns = Object.keys(data[0] || {});
        this.dataColumns.forEach((colName, index) => {
            this.setCellValueDirect(1, index + 1, colName.charAt(0).toUpperCase() + colName.slice(1));
        });

        data.forEach((record, rowIndex) => {
            const actualRow = rowIndex + 2; // Start from row 2, not row 1

            this.dataColumns.forEach((colName, colIndex) => {
                const actualCol = colIndex + 1; // Start from column 1, not column 0
                const value = record[colName];
                this.setCellValueDirect(actualRow, actualCol, String(value));
            });
        });

        this.requestRender();
    }
    setupCanvas() {
        this.dpr = window.devicePixelRatio || 1;

        this.canvas.width = this.container.clientWidth * this.dpr;
        this.canvas.height = this.container.clientHeight * this.dpr;

        this.canvas.style.width = this.container.clientWidth + 'px';
        this.canvas.style.height = this.container.clientHeight + 'px';

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); //previously scaled value is removed here
        this.ctx.scale(this.dpr, this.dpr);

        this.visibleRows = Math.ceil(this.canvas.height / (25 * this.dpr));
        this.visibleCols = Math.ceil(this.canvas.width / (100 * this.dpr));
    }

    updateScrollPosition() {
        this.scrollX = this.container.scrollLeft;
        this.scrollY = this.container.scrollTop;

        // Update editor position if editing
        if (this.isEditing && this.editingCell) {
            this.positionEditor(this.editingCell.row, this.editingCell.col);
        }
    }

    calculateVisibleRange() {
        this.startRow = this.binarySearchPosition(this.rowPositions, this.scrollY);
        this.startRow = Math.max(0, this.startRow);

        this.endRow = this.binarySearchPosition(this.rowPositions, this.scrollY + this.canvas.height);
        this.endRow = Math.min(this.rowCount, this.endRow);

        this.startCol = this.binarySearchPosition(this.colPositions, this.scrollX);
        this.startCol = Math.max(0, this.startCol);

        this.endCol = this.binarySearchPosition(this.colPositions, this.scrollX + this.canvas.width);
        this.endCol = Math.min(this.colCount, this.endCol);

    }

    binarySearchPosition(positions, target) {
        let left = 0;
        let right = positions.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (positions[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return Math.max(0, right);
    }

    setupScrollArea() {
        const totalWidth = this.colPositions[this.colPositions.length - 1];
        const totalHeight = this.rowPositions[this.rowPositions.length - 1];

        this.scrollContent.style.width = totalWidth + 'px';
        this.scrollContent.style.height = totalHeight + 'px';
    }

    getColumnPosition(colIndex) {
        return this.colPositions[colIndex] || 0;
    }

    getRowPosition(rowIndex) {
        return this.rowPositions[rowIndex] || 0;
    }

    getColumnAtPosition(x) {
        return this.binarySearchPosition(this.colPositions, x);
    }

    getRowAtPosition(y) {
        return this.binarySearchPosition(this.rowPositions, y);
    }

    getCellAtPosition(x, y) {
        let col, row;

        if (x < this.getColumn(0).getSize()) {
            col = 0;
            if (y < this.getRow(0).getSize()) {
                row = 0;
            } else {
                row = this.getRowAtPosition(y + this.scrollY);
            }
        } else if (y < this.getRow(0).getSize()) {
            row = 0;
            col = this.getColumnAtPosition(x + this.scrollX);
        } else {
            col = this.getColumnAtPosition(x + this.scrollX);
            row = this.getRowAtPosition(y + this.scrollY);
        }

        return { row, col };
    }

    requestRender() {
        if (!this.renderRequested) {
            this.renderRequested = true;
            requestAnimationFrame(() => {
                this.render();
                this.renderRequested = false;
            });
        }
    }

    handleScroll() {
        const now = performance.now();
        if (now - this.lastScrollTime < this.scrollThrottle) {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            this.scrollTimeout = setTimeout(() => {
                this.updateScrollPosition();
                this.calculateVisibleRange();
                this.requestRender();
            }, this.scrollThrottle);
            return;
        }

        this.lastScrollTime = now;
        this.updateScrollPosition();
        this.calculateVisibleRange();
        this.requestRender();
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.buildPositionCaches();
            this.setupScrollArea();
            this.calculateVisibleRange();
            this.requestRender();
        });

        this.container.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });
        // Pointer move: show resize cursor or handle resizing

        
        this.canvas.addEventListener('pointermove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // If resizing, handle resize
            if (this.rowResizer.isResizing) {
                this.rowResizer.handleResize(y);

                return;
            }
            if (this.colResizer.isResizing) {
                this.colResizer.handleResize(x);

                return;
            }

            // Show resize cursor if near row or col border
            let cursor = '';
            // Check for row resize (near bottom of row header)
            for (let row = 1; row < this.rowCount; row++) {
                const rowY = this.getRowPosition(row) - this.scrollY;
                if (Math.abs(y - rowY) < 4 && x < this.getColumn(0).getSize()) {
                    cursor = 'row-resize';
                    break;
                }
            }
            // Check for col resize (near right of col header)
            for (let col = 1; col < this.colCount; col++) {
                const colX = this.getColumnPosition(col) - this.scrollX;
                if (Math.abs(x - colX) < 4 && y < this.getRow(0).getSize()) {
                    cursor = 'col-resize';
                    break;
                }
            }
            this.canvas.style.cursor = cursor;
        });


        // Pointer move handler
        this.canvas.addEventListener('pointermove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Handle row resizing
            if (this.rowResizer.isResizing) {
                this.rowResizer.handleResize(y);
                return;
            }

            // Handle column resizing
            if (this.colResizer.isResizing) {
                this.colResizer.handleResize(x);
                return;
            }

            // Change cursor if hovering near resizable row or column edge
            let resizingCursorSet = false;
            for (let row = 1; row < this.rowCount; row++) {
                const rowY = this.getRowPosition(row) - this.scrollY;
                if (Math.abs(y - rowY) < 4 && x < this.getColumn(0).getSize()) {
                    this.canvas.style.cursor = 'ns-resize';
                    resizingCursorSet = true;
                    break;
                }
            }
            if (!resizingCursorSet) {
                for (let col = 1; col < this.colCount; col++) {
                    const colX = this.getColumnPosition(col) - this.scrollX;
                    if (Math.abs(x - colX) < 4 && y < this.getRow(0).getSize()) {
                        this.canvas.style.cursor = 'ew-resize';
                        resizingCursorSet = true;
                        break;
                    }
                }
            }
            if (!resizingCursorSet) {
                this.canvas.style.cursor = 'cell';
            }

            // Handle drag-select rows
            if (this.dragSelectingRows) {
                const cellPos = this.getCellAtPosition(x, y);
                if (cellPos.row > 0) {
                    this.selection.selectRange(this.selection.dragStartRow, 1, cellPos.row, this.endCol);
                    this.updateInfoDisplay();
                    this.requestRender();
                }
            }

            // Handle drag-select columns
            if (this.dragSelectingCols) {
                const cellPos = this.getCellAtPosition(x, y);
                if (cellPos.col > 0) {
                    this.selection.selectRange(1, this.selection.dragStartCol, this.endRow, cellPos.col);
                    this.updateInfoDisplay();
                    this.requestRender();
                }
            }

            // Handle cell drag selection
            if (this.selection.isDragging) {
                const cellPos = this.getCellAtPosition(x, y);
                if (cellPos.row > 0 && cellPos.col > 0) {
                    this.selection.updateDragSelection(cellPos.row, cellPos.col);
                    this.updateInfoDisplay();
                    this.requestRender();
                }
            }
        });

        // Pointer down handler
        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.isEditing) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Row resize hit detection
            for (let row = 1; row < this.rowCount; row++) {
                const rowY = this.getRowPosition(row) - this.scrollY;
                if (Math.abs(y - rowY) < 4 && x < this.getColumn(0).getSize()) {
                    this.rowResizer.startResize(row - 1, y);
                    return;
                }
            }

            // Column resize hit detection
            for (let col = 1; col < this.colCount; col++) {
                const colX = this.getColumnPosition(col) - this.scrollX;
                if (Math.abs(x - colX) < 4 && y < this.getRow(0).getSize()) {
                    this.colResizer.startResize(col - 1, x);
                    return;
                }
            }

            const cellPos = this.getCellAtPosition(x, y);

            if (cellPos.row >= 0 && cellPos.row < this.rowCount &&
                cellPos.col >= 0 && cellPos.col < this.colCount) {

                // Row header clicked
                if (cellPos.col === 0 && cellPos.row > 0) {
                    this.selection.startDragSelection(cellPos.row, 1);
                    this.dragSelectingRows = true;

                    this.selection.selectRange(this.selection.dragStartRow, 1, cellPos.row, this.endCol);
                    this.updateInfoDisplay();
                    this.requestRender();
                }
                // Column header clicked
                else if (cellPos.row === 0 && cellPos.col > 0) {
                    this.selection.startDragSelection(1, cellPos.col);
                    this.dragSelectingCols = true;
                    this.selection.selectRange(1, this.selection.dragStartCol, this.endRow, cellPos.col);
                    this.updateInfoDisplay();
                    this.requestRender();
                }
                // Top-left corner (select all)
                else if (cellPos.row === 0 && cellPos.col === 0) {
                    this.selection.selectRange(1, 1, this.rowCount - 1, this.colCount - 1);

                    this.updateInfoDisplay();
                    this.requestRender();
                }
                // Regular cell
                else if (cellPos.row > 0 && cellPos.col > 0) {
                    this.selection.startDragSelection(cellPos.row, cellPos.col);
                    this.updateInfoDisplay();
                    this.requestRender();
                    this.startEditing(cellPos.row, cellPos.col);
                }
            }
        });

        // Pointer up handler
        document.addEventListener('pointerup', () => {
            if (this.rowResizer.isResizing) {
                this.rowResizer.stopResize();
            }
            if (this.colResizer.isResizing) {
                this.colResizer.stopResize();
            }
            if (this.dragSelectingRows) {
                this.dragSelectingRows = false;
                this.selection.finishDragSelection();
            }
            if (this.dragSelectingCols) {
                this.dragSelectingCols = false;
                this.selection.finishDragSelection();
            }
            if (this.selection.isDragging) {
                this.selection.finishDragSelection();
            }
        });

        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const cellPos = this.getCellAtPosition(x, y);
            if (cellPos.row > 0 && cellPos.col > 0) {
                this.startEditing(cellPos.row, cellPos.col);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.isEditing) {
                if (this.selection.handleKeyboardNavigation(e, this)) {
                    return;
                }
            }
        });

    }

    startEditing(row, col) {
        if (this.isEditing) {
            this.stopEditing(true);
        }

        this.isEditing = true;
        this.editingCell = { row, col };

        this.editor = document.createElement('input');
        this.editor.type = 'text';
        this.editor.className = 'cell-editor';
        this.editor.value = this.getCell(row, col).getValue();

        this.positionEditor(row, col);

        document.body.appendChild(this.editor);
        this.editor.focus();
        this.editor.select();

        this.editorKeyHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.stopEditing(true);
            }
        };

        this.editorBlurHandler = () => {
            setTimeout(() => {
                if (this.isEditing) {
                    this.stopEditing(true);
                }
            }, 10);
        };

        this.editor.addEventListener('keydown', this.editorKeyHandler);
        this.editor.addEventListener('blur', this.editorBlurHandler);
    }

    stopEditing(save = true) {
        if (!this.isEditing || !this.editor) return;

        if (this.editorKeyHandler) {
            this.editor.removeEventListener('keydown', this.editorKeyHandler);
            this.editorKeyHandler = null;
        }
        if (this.editorBlurHandler) {
            this.editor.removeEventListener('blur', this.editorBlurHandler);
            this.editorBlurHandler = null;
        }

        if (save && this.editingCell) {
            const newValue = this.editor.value;
            this.setCellValue(this.editingCell.row, this.editingCell.col, newValue);
        }

        if (this.editor && this.editor.parentNode) {
            this.editor.parentNode.removeChild(this.editor);
        }

        this.isEditing = false;
        this.editingCell = null;
        this.editor = null;

        this.requestRender();
    }

    positionEditor(row, col) {
        if (!this.editor) return;

        const rect = this.canvas.getBoundingClientRect();

        // Calculate cell position relative to the canvas
        let cellX = this.getColumnPosition(col) - this.scrollX;
        let cellY = this.getRowPosition(row) - this.scrollY;

        // Handle frozen headers - if cell is in frozen area, don't subtract scroll
        if (col === 0) {
            cellX = this.getColumnPosition(col);
        }
        if (row === 0) {
            cellY = this.getRowPosition(row);
        }

        // Convert to screen coordinates
        const screenX = rect.left + cellX;
        const screenY = rect.top + cellY;

        const width = this.getColumn(col).getSize();
        const height = this.getRow(row).getSize();

        const isVisible = cellX >= 0 && cellY >= 0 &&
            cellX < this.canvas.width && cellY < this.canvas.height;

        if (isVisible) {
            this.editor.style.left = screenX + 'px';
            this.editor.style.top = screenY + 'px';
            this.editor.style.width = (width - 2) + 'px';
            this.editor.style.height = (height - 2) + 'px';
            this.editor.style.display = 'block';
        } else {
            this.editor.style.display = 'none';
        }
    }


    render() {
        const { ctx, canvas, scrollX, scrollY } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const visibleDataRows = [];
        const visibleDataCols = [];

        for (let i = Math.max(1, this.startRow); i <= this.endRow && i < this.rowCount; i++) {
            visibleDataRows.push(i);
        }

        for (let i = Math.max(1, this.startCol); i <= this.endCol && i < this.colCount; i++) {
            visibleDataCols.push(i);
        }

        // Render visible data cells
        for (const rowIndex of visibleDataRows) {
            for (const colIndex of visibleDataCols) {
                const cell = this.getCell(rowIndex, colIndex);
                const x = this.getColumnPosition(colIndex) - scrollX;
                const y = this.getRowPosition(rowIndex) - scrollY;
                const width = this.getColumn(colIndex).getSize();
                const height = this.getRow(rowIndex).getSize();

                if (x + width >= 0 && y + height >= 0 &&
                    x < canvas.width && y < canvas.height) {
                    cell.draw(ctx, x, y, width, height, this.selection);
                }
            }
        }
        this.drawGridLines();
        this.selection.drawSelectionOutline();

        // Render visible row headers
        for (const rowIndex of visibleDataRows) {
            const cell = this.getCell(rowIndex, 0);
            const x = 0;
            const y = this.getRowPosition(rowIndex) - scrollY;
            const width = this.getColumn(0).getSize();
            const height = this.getRow(rowIndex).getSize();

            if (y + height >= 0 && y < canvas.height) {
                cell.draw(ctx, x, y, width, height, this.selection);
            }
        }

        // Render visible column headers
        for (const colIndex of visibleDataCols) {
            const cell = this.getCell(0, colIndex);
            const x = this.getColumnPosition(colIndex) - scrollX;
            const y = 0;
            const width = this.getColumn(colIndex).getSize();
            const height = this.getRow(0).getSize();

            if (x + width >= 0 && x < canvas.width) {
                cell.draw(ctx, x, y, width, height, this.selection);
            }
        }

        // Render corner cell
        const cornerCell = this.getCell(0, 0);
        const cornerWidth = this.getColumn(0).getSize();
        const cornerHeight = this.getRow(0).getSize();
        cornerCell.draw(ctx, 0, 0, cornerWidth, cornerHeight, this.selection);
        ctx.save();
        ctx.fillStyle = "#cccccc"; 
        ctx.beginPath();
        ctx.moveTo(cornerWidth - 14, cornerHeight-2); // left point of base
        ctx.lineTo(cornerWidth-2, cornerHeight-2);      // right point of base
        ctx.lineTo(cornerWidth-2, cornerHeight - 14); // top point
        ctx.closePath();
        ctx.fill();
        ctx.restore();

    }
    drawGridLines() {
        const { ctx, canvas, scrollX, scrollY } = this;

        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.1;

        // vertical lines
        for (let col = this.startCol; col <= this.endCol + 1 && col <= this.colCount; col++) {
            if (col === 0) continue;
            const x = this.getColumnPosition(col) - scrollX;
            if (x >= 0 && x <= canvas.width) {
                ctx.beginPath();
                ctx.moveTo(Math.floor(x) + 0.5, 0);
                ctx.lineTo(Math.floor(x) + 0.5, canvas.height);
                ctx.stroke();
            }
        }

        // horizontal lines
        for (let row = this.startRow; row <= this.endRow + 1 && row <= this.rowCount; row++) {
            const y = this.getRowPosition(row) - scrollY;
            if (y >= 0 && y <= canvas.height) {
                ctx.beginPath();
                ctx.moveTo(0, Math.floor(y) + 0.5);
                ctx.lineTo(canvas.width, Math.floor(y) + 0.5);
                ctx.stroke();
            }
        }

        ctx.restore();
        if (this.rowResizer.isResizing) {
            // Draw at the border being dragged (rowIndex + 1)
            const rowY = this.getRowPosition(this.rowResizer.rowIndex + 1) - this.scrollY;
            this.rowResizer.drawResizeLine(this.ctx, rowY);
        }
        if (this.colResizer.isResizing) {
            // Draw at the border being dragged (colIndex + 1)
            const colX = this.getColumnPosition(this.colResizer.colIndex + 1) - this.scrollX;
            this.colResizer.drawResizeLine(this.ctx, colX);
        }
    }


    updateInfoDisplay() {
        const selectionInfo = this.selection.getSelectionInfo();
        this.info.textContent = selectionInfo;
    }

}

const grid = new CanvasGrid('grid', 100001, 1001);

grid.loadData().catch(() => {
    console.log("NO DATA")
});