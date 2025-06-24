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
        if (this.isHeader()) {
            if ((this.row === 0 && selection.isColumnHighlighted(this.col)) ||
                (this.col === 0 && selection.isRowHighlighted(this.row))) {
                return '#a0d8b9';
            }
            return '#f0f0f0';
        }
        if (selection.isCellSelected(this.row, this.col)) return '#a0d8b9';
        return '#ffffff';
    }

    getTextColor() {
        return this.isHeader() ? '#333' : '#000';
    }

draw(ctx, x, y, width, height, selection) {
    // Solid background for headers
    if (this.isHeader()) {
        ctx.fillStyle = '#f0f0f0'; // Solid color for header background
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.fillStyle = this.getBackgroundColor(selection);
        ctx.fillRect(x, y, width, height);
    }

    ctx.fillStyle = this.getTextColor();
    ctx.font = '12px Arial';

    // Right-align row numbers in row header
    if (this.col === 0 && this.row > 0) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const text = this.getValue();
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        ctx.fillText(text, x + width - 6, y + height / 2); // 6px padding from right
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