class CellSelection {
      constructor() {
        this.selectedCell = null;
      }

      setSelection(row, col) {
        this.selectedCell = { row, col };
      }

      getSelection() {
        return this.selectedCell;
      }

      clearSelection() {
        this.selectedCell = null;
      }

      isSelected(row, col) {
        return this.selectedCell && 
               this.selectedCell.row === row && 
               this.selectedCell.col === col;
      }
    }
