 class MultiCanvasGrid {
      constructor(options) {
        // Get canvas elements
        this.cornerCanvas = document.getElementById('cornerCanvas');
        this.columnHeaderCanvas = document.getElementById('columnHeaderCanvas');
        this.rowHeaderCanvas = document.getElementById('rowHeaderCanvas');
        this.mainCanvas = document.getElementById('mainCanvas');
        this.hScrollbarCanvas = document.getElementById('hScrollbar');
        this.vScrollbarCanvas = document.getElementById('vScrollbar');

        // Get contexts
        this.cornerCtx = this.cornerCanvas.getContext('2d');
        this.columnHeaderCtx = this.columnHeaderCanvas.getContext('2d');
        this.rowHeaderCtx = this.rowHeaderCanvas.getContext('2d');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.hScrollbarCtx = this.hScrollbarCanvas.getContext('2d');
        this.vScrollbarCtx = this.vScrollbarCanvas.getContext('2d');

        this.selection = new CellSelection();

        // Grid config
        this.cellWidth = options.cellWidth || 100;
        this.cellHeight = options.cellHeight || 30;
        this.cols = options.cols || 500;
        this.rows = options.rows || 100000;

        this.headerHeight = 30;
        this.headerWidth = 60;
        this.scrollbarSize = 16;

        // Scroll state
        this.scrollX = 0;
        this.scrollY = 0;
        this.maxScrollX = 0;
        this.maxScrollY = 0;

        // Interaction state
        this.isDragging = false;
        this.isScrollingH = false;
        this.isScrollingV = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartScrollX = 0;
        this.dragStartScrollY = 0;

        this.init();
      }

      init() {
        this.resizeCanvases();
        this.calculateScrollLimits();
        this.addListeners();
        this.renderAll();
      }

      resizeCanvases() {
        const container = document.querySelector('.grid-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const dpr = window.devicePixelRatio || 1;

        // Calculate dimensions
        this.contentWidth = containerWidth - this.headerWidth - this.scrollbarSize;
        this.contentHeight = containerHeight - this.headerHeight - this.scrollbarSize;

        // Resize corner canvas
        this.cornerCanvas.width = this.headerWidth * dpr;
        this.cornerCanvas.height = this.headerHeight * dpr;
        this.cornerCanvas.style.width = this.headerWidth + 'px';
        this.cornerCanvas.style.height = this.headerHeight + 'px';
        this.cornerCtx.scale(dpr, dpr);

        // Resize column header canvas
        this.columnHeaderCanvas.width = this.contentWidth * dpr;
        this.columnHeaderCanvas.height = this.headerHeight * dpr;
        this.columnHeaderCanvas.style.width = this.contentWidth + 'px';
        this.columnHeaderCanvas.style.height = this.headerHeight + 'px';
        this.columnHeaderCtx.scale(dpr, dpr);

        // Resize row header canvas
        this.rowHeaderCanvas.width = this.headerWidth * dpr;
        this.rowHeaderCanvas.height = this.contentHeight * dpr;
        this.rowHeaderCanvas.style.width = this.headerWidth + 'px';
        this.rowHeaderCanvas.style.height = this.contentHeight + 'px';
        this.rowHeaderCtx.scale(dpr, dpr);

        // Resize main canvas
        this.mainCanvas.width = this.contentWidth * dpr;
        this.mainCanvas.height = this.contentHeight * dpr;
        this.mainCanvas.style.width = this.contentWidth + 'px';
        this.mainCanvas.style.height = this.contentHeight + 'px';
        this.mainCtx.scale(dpr, dpr);

        // Resize scrollbar canvases
        this.hScrollbarCanvas.width = this.contentWidth * dpr;
        this.hScrollbarCanvas.height = this.scrollbarSize * dpr;
        this.hScrollbarCanvas.style.width = this.contentWidth + 'px';
        this.hScrollbarCanvas.style.height = this.scrollbarSize + 'px';
        this.hScrollbarCtx.scale(dpr, dpr);

        this.vScrollbarCanvas.width = this.scrollbarSize * dpr;
        this.vScrollbarCanvas.height = this.contentHeight * dpr;
        this.vScrollbarCanvas.style.width = this.scrollbarSize + 'px';
        this.vScrollbarCanvas.style.height = this.contentHeight + 'px';
        this.vScrollbarCtx.scale(dpr, dpr);
      }

      calculateScrollLimits() {
        const totalWidth = this.cols * this.cellWidth;
        const totalHeight = this.rows * this.cellHeight;
        
        this.maxScrollX = Math.max(0, totalWidth - this.contentWidth);
        this.maxScrollY = Math.max(0, totalHeight - this.contentHeight);
      }

      clampScroll() {
        this.scrollX = Math.max(0, Math.min(this.maxScrollX, this.scrollX));
        this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));
      }

      getScrollbarBounds() {
        // Horizontal scrollbar
        const hScrollbar = {
          thumbX: 0,
          thumbWidth: 0
        };

        if (this.maxScrollX > 0) {
          hScrollbar.thumbWidth = Math.max(20, (this.contentWidth / (this.maxScrollX + this.contentWidth)) * this.contentWidth);
          hScrollbar.thumbX = (this.scrollX / this.maxScrollX) * (this.contentWidth - hScrollbar.thumbWidth);
        }

        // Vertical scrollbar
        const vScrollbar = {
          thumbY: 0,
          thumbHeight: 0
        };

        if (this.maxScrollY > 0) {
          vScrollbar.thumbHeight = Math.max(20, (this.contentHeight / (this.maxScrollY + this.contentHeight)) * this.contentHeight);
          vScrollbar.thumbY = (this.scrollY / this.maxScrollY) * (this.contentHeight - vScrollbar.thumbHeight);
        }

        return { horizontal: hScrollbar, vertical: vScrollbar };
      }

      getCellFromPoint(x, y) {
        const col = Math.floor((x + this.scrollX) / this.cellWidth);
        const row = Math.floor((y + this.scrollY) / this.cellHeight);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
          return { row, col };
        }
        return null;
      }

      addListeners() {
        // Mouse wheel scrolling on main canvas
        this.mainCanvas.addEventListener("wheel", (e) => {
          e.preventDefault();
          
          this.scrollX += e.deltaX;
          this.scrollY += e.deltaY;
          this.clampScroll();
          this.renderAll();
        }, { passive: false });

        // Main canvas interactions
        this.mainCanvas.addEventListener("mousedown", (e) => {
          const rect = this.mainCanvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const cell = this.getCellFromPoint(x, y);
          if (cell) {
            this.selection.setSelection(cell.row, cell.col);
            this.renderAll();
            console.log(`Selected: ${this.getColumnLabel(cell.col)}${cell.row + 1}`);
          } else {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
            this.dragStartScrollX = this.scrollX;
            this.dragStartScrollY = this.scrollY;
            this.mainCanvas.style.cursor = "grabbing";
          }
        });

        this.mainCanvas.addEventListener("mousemove", (e) => {
          if (this.isDragging) {
            const rect = this.mainCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const deltaX = this.dragStartX - x;
            const deltaY = this.dragStartY - y;
            this.scrollX = this.dragStartScrollX + deltaX;
            this.scrollY = this.dragStartScrollY + deltaY;
            this.clampScroll();
            this.renderAll();
          }
        });

        this.mainCanvas.addEventListener("mouseup", () => {
          this.isDragging = false;
          this.mainCanvas.style.cursor = "cell";
        });

        // Horizontal scrollbar interactions
        this.hScrollbarCanvas.addEventListener("mousedown", (e) => {
          const rect = this.hScrollbarCanvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const scrollbars = this.getScrollbarBounds();
          
          if (x >= scrollbars.horizontal.thumbX && x <= scrollbars.horizontal.thumbX + scrollbars.horizontal.thumbWidth) {
            this.isScrollingH = true;
            this.dragStartX = x - scrollbars.horizontal.thumbX;
          }
        });

        // Vertical scrollbar interactions
        this.vScrollbarCanvas.addEventListener("mousedown", (e) => {
          const rect = this.vScrollbarCanvas.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const scrollbars = this.getScrollbarBounds();
          
          if (y >= scrollbars.vertical.thumbY && y <= scrollbars.vertical.thumbY + scrollbars.vertical.thumbHeight) {
            this.isScrollingV = true;
            this.dragStartY = y - scrollbars.vertical.thumbY;
          }
        });

        // Global mouse move for scrollbar dragging
        document.addEventListener("mousemove", (e) => {
          if (this.isScrollingH) {
            const rect = this.hScrollbarCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const scrollbars = this.getScrollbarBounds();
            const thumbX = x - this.dragStartX;
            const maxThumbX = this.contentWidth - scrollbars.horizontal.thumbWidth;
            const clampedThumbX = Math.max(0, Math.min(maxThumbX, thumbX));
            this.scrollX = (clampedThumbX / maxThumbX) * this.maxScrollX;
            this.renderAll();
          } else if (this.isScrollingV) {
            const rect = this.vScrollbarCanvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const scrollbars = this.getScrollbarBounds();
            const thumbY = y - this.dragStartY;
            const maxThumbY = this.contentHeight - scrollbars.vertical.thumbHeight;
            const clampedThumbY = Math.max(0, Math.min(maxThumbY, thumbY));
            this.scrollY = (clampedThumbY / maxThumbY) * this.maxScrollY;
            this.renderAll();
          }
        });

        // Global mouse up
        document.addEventListener("mouseup", () => {
          this.isScrollingH = false;
          this.isScrollingV = false;
        });

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
          const selected = this.selection.getSelection();
          if (!selected) return;

          let newRow = selected.row;
          let newCol = selected.col;

          switch(e.key) {
            case "ArrowUp":
              newRow = Math.max(0, selected.row - 1);
              e.preventDefault();
              break;
            case "ArrowDown":
              newRow = Math.min(this.rows - 1, selected.row + 1);
              e.preventDefault();
              break;
            case "ArrowLeft":
              newCol = Math.max(0, selected.col - 1);
              e.preventDefault();
              break;
            case "ArrowRight":
              newCol = Math.min(this.cols - 1, selected.col + 1);
              e.preventDefault();
              break;
            case "Escape":
              this.selection.clearSelection();
              this.renderAll();
              e.preventDefault();
              return;
          }

          if (newRow !== selected.row || newCol !== selected.col) {
            this.selection.setSelection(newRow, newCol);
            this.scrollToCell(newRow, newCol);
            this.renderAll();
          }
        });

        // Resize
        window.addEventListener("resize", () => {
          this.resizeCanvases();
          this.calculateScrollLimits();
          this.clampScroll();
          this.renderAll();
        });

        // Focus for keyboard events
        this.mainCanvas.tabIndex = 0;
        this.mainCanvas.focus();
      }

      scrollToCell(row, col) {
        const cellLeft = col * this.cellWidth;
        const cellTop = row * this.cellHeight;
        const cellRight = cellLeft + this.cellWidth;
        const cellBottom = cellTop + this.cellHeight;

        const viewLeft = this.scrollX;
        const viewTop = this.scrollY;
        const viewRight = this.scrollX + this.contentWidth;
        const viewBottom = this.scrollY + this.contentHeight;

        // Horizontal scrolling
        if (cellLeft < viewLeft) {
          this.scrollX = cellLeft;
        } else if (cellRight > viewRight) {
          this.scrollX = cellRight - this.contentWidth;
        }

        // Vertical scrolling
        if (cellTop < viewTop) {
          this.scrollY = cellTop;
        } else if (cellBottom > viewBottom) {
          this.scrollY = cellBottom - this.contentHeight;
        }

        this.clampScroll();
      }

      getColumnLabel(col) {
        let label = "";
        let num = col;
        while (num >= 0) {
          label = String.fromCharCode(65 + (num % 26)) + label;
          num = Math.floor(num / 26) - 1;
        }
        return label;
      }

      renderCorner() {
        const ctx = this.cornerCtx;
        ctx.clearRect(0, 0, this.headerWidth, this.headerHeight);
        ctx.fillStyle = "#f6f8fa";
        ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
      }

      renderColumnHeaders() {
        const ctx = this.columnHeaderCtx;
        ctx.clearRect(0, 0, this.contentWidth, this.headerHeight);

        const startCol = Math.floor(this.scrollX / this.cellWidth);
        const endCol = Math.ceil((this.scrollX + this.contentWidth) / this.cellWidth);
        const colStart = Math.max(0, startCol);
        const colEnd = Math.min(this.cols, endCol + 1);

        ctx.fillStyle = "#f6f8fa";
        ctx.fillRect(0, 0, this.contentWidth, this.headerHeight);

        ctx.strokeStyle = "#d0d7de";
        ctx.fillStyle = "#656d76";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let col = colStart; col < colEnd; col++) {
          const x = (col * this.cellWidth) - this.scrollX;
          ctx.strokeRect(x, 0, this.cellWidth, this.headerHeight);
          ctx.fillText(this.getColumnLabel(col), x + this.cellWidth / 2, this.headerHeight / 2);
        }
      }

      renderRowHeaders() {
        const ctx = this.rowHeaderCtx;
        ctx.clearRect(0, 0, this.headerWidth, this.contentHeight);

        const startRow = Math.floor(this.scrollY / this.cellHeight);
        const endRow = Math.ceil((this.scrollY + this.contentHeight) / this.cellHeight);
        const rowStart = Math.max(0, startRow);
        const rowEnd = Math.min(this.rows, endRow + 1);

        ctx.fillStyle = "#f6f8fa";
        ctx.fillRect(0, 0, this.headerWidth, this.contentHeight);

        ctx.strokeStyle = "#d0d7de";
        ctx.fillStyle = "#656d76";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let row = rowStart; row < rowEnd; row++) {
          const y = (row * this.cellHeight) - this.scrollY;
          ctx.strokeRect(0, y, this.headerWidth, this.cellHeight);
          ctx.fillText((row + 1).toString(), this.headerWidth / 2, y + this.cellHeight / 2);
        }
      }

      renderMainGrid() {
        const ctx = this.mainCtx;
        ctx.clearRect(0, 0, this.contentWidth, this.contentHeight);

        const startCol = Math.floor(this.scrollX / this.cellWidth);
        const endCol = Math.ceil((this.scrollX + this.contentWidth) / this.cellWidth);
        const startRow = Math.floor(this.scrollY / this.cellHeight);
        const endRow = Math.ceil((this.scrollY + this.contentHeight) / this.cellHeight);

        const colStart = Math.max(0, startCol);
        const colEnd = Math.min(this.cols, endCol + 1);
        const rowStart = Math.max(0, startRow);
        const rowEnd = Math.min(this.rows, endRow + 1);

        ctx.strokeStyle = "#e1e4e8";
        ctx.lineWidth = 1;

        // Draw cells
        for (let row = rowStart; row < rowEnd; row++) {
          for (let col = colStart; col < colEnd; col++) {
            const x = (col * this.cellWidth) - this.scrollX;
            const y = (row * this.cellHeight) - this.scrollY;

            // Fill selected cell
            if (this.selection.isSelected(row, col)) {
              ctx.fillStyle = "#e3f2fd";
              ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            }

            ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
          }
        }

        // Draw selection border
        const selected = this.selection.getSelection();
        if (selected) {
          const selX = (selected.col * this.cellWidth) - this.scrollX;
          const selY = (selected.row * this.cellHeight) - this.scrollY;
          
          if (selX + this.cellWidth > 0 && selX < this.contentWidth &&
              selY + this.cellHeight > 0 && selY < this.contentHeight) {
            ctx.strokeStyle = "#1976d2";
            ctx.lineWidth = 2;
            ctx.strokeRect(selX, selY, this.cellWidth, this.cellHeight);
            ctx.lineWidth = 1;
          }
        }
      }

      renderScrollbars() {
        const scrollbars = this.getScrollbarBounds();

        // Horizontal scrollbar
        const hCtx = this.hScrollbarCtx;
        hCtx.clearRect(0, 0, this.contentWidth, this.scrollbarSize);
        
        if (this.maxScrollX > 0) {
          hCtx.fillStyle = "#f1f3f4";
          hCtx.fillRect(0, 0, this.contentWidth, this.scrollbarSize);
          
          hCtx.fillStyle = "#dadce0";
          hCtx.fillRect(scrollbars.horizontal.thumbX, 0, 
                       scrollbars.horizontal.thumbWidth, this.scrollbarSize);
        }

        // Vertical scrollbar
        const vCtx = this.vScrollbarCtx;
        vCtx.clearRect(0, 0, this.scrollbarSize, this.contentHeight);
        
        if (this.maxScrollY > 0) {
          vCtx.fillStyle = "#f1f3f4";
          vCtx.fillRect(0, 0, this.scrollbarSize, this.contentHeight);
          
          vCtx.fillStyle = "#dadce0";
          vCtx.fillRect(0, scrollbars.vertical.thumbY, 
                       this.scrollbarSize, scrollbars.vertical.thumbHeight);
        }
      }

      renderAll() {
        this.renderCorner();
        this.renderColumnHeaders();
        this.renderRowHeaders();
        this.renderMainGrid();
        this.renderScrollbars();
      }
    }

    // Initialize
    new MultiCanvasGrid({
      cellWidth: 100,
      cellHeight: 30,
      rows: 100000,
      cols: 500
    });