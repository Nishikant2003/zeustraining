class Cell {
    constructor(row, col, value = null) {
        this.row = row;
        this.col = col;
        this.value = value;
    }

    getValue() {
        if (this.value !== null) return this.value;

        if (this.row === 0 && this.col === 0) return '';
        if (this.row === 0) return this.getColumnHeader();
        if (this.col === 0) return this.row.toString();
        return '';
    }

    setValue(value) {
        this.value = value;
    }

    getColumnHeader() {
        if (this.col === 0) return '';
        return getColumnName(this.col);
    }

    isHeader() {
        return this.row === 0 || this.col === 0;
    }

    getBackgroundColor(selection) {
        if (selection.isFirstSelection(this.row, this.col)) return '#ffffff'
        if (selection.isCellSelected(this.row, this.col)) return '#a0d8b9';
        return '#ffffff';
    }

    getTextColor() {
        return this.isHeader() ? '#333' : '#000';
    }

draw(ctx, x, y, width, height, selection) {
    // --- Highlight logic for headers ---
    let highlightHeader = false;
    let borderColor = null;

    // Highlight column header if any cell in the column is selected
  if (this.row === 0 && this.col > 0 && selection?.isColSelected(this.col)) {
    highlightHeader = true;
    borderColor = '#4CAF50';
}

if (this.col === 0 && this.row > 0 && selection?.isRowSelected(this.row)) {
    highlightHeader = true;
    borderColor = '#4CAF50';
}


    // --- Draw header background ---
    if (this.isHeader()) {
        ctx.fillStyle = highlightHeader ? '#a0d8b9' : '#f0f0f0';
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.fillStyle = this.getBackgroundColor(selection);
        ctx.fillRect(x, y, width, height);
    }

    // --- Draw header border if selected ---
    if (highlightHeader && borderColor) {
        ctx.save();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        if (this.row === 0 && this.col > 0) {
            // Bottom border for column header
            ctx.beginPath();
            ctx.moveTo(x, y + height - 1);
            ctx.lineTo(x + width, y + height - 1);
            ctx.stroke();
        }
        if (this.col === 0 && this.row > 0) {
            // Right border for row header
            ctx.beginPath();
            ctx.moveTo(x + width - 1, y);
            ctx.lineTo(x + width - 1, y + height);
            ctx.stroke();
        }
        ctx.restore();
    }

    // --- Draw text as before ---
    ctx.fillStyle = this.getTextColor();
    ctx.font = '12px Arial';

    // Right-align row numbers in row header
    if (this.col === 0 && this.row > 0) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const text = this.getValue();
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=0.1;
        ctx.strokeStyle="#000000"
        ctx.rect(x, y, width, height);
        ctx.strokeRect(Math.floor(x)+0.5, Math.floor(y)+0.5, width, height)
        ctx.clip();
        ctx.fillText(text, x + width - 6, y + height / 2);
        ctx.restore();
        return;
    }

    // Center column header text
    if (this.row === 0 && this.col > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = this.getValue();
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth=0.1;
        ctx.strokeStyle="#000000"
        ctx.strokeRect(Math.floor(x)+0.5, Math.floor(y)+0.5, width, height)
        ctx.clip();
        ctx.fillText(text, x + width / 2, y + height / 2);
        ctx.restore();
        return;
    }

    // Normal cells
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const text = this.getValue();
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y, width - 4, height);
    ctx.clip();
    ctx.fillText(text, x + 4, y + height / 2);
    ctx.restore();
}
}