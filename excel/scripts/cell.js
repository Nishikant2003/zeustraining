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
        ctx.fillStyle = this.getBackgroundColor(selection);
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.1;
        ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, width, height);

        ctx.fillStyle = this.getTextColor();
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const text = this.getValue();
        const maxWidth = width - 8;

        ctx.save();
        ctx.beginPath();

        ctx.rect(x + 2, y, width - 4, height);
        ctx.clip();

        ctx.fillText(text, x + 4, y + height / 2, maxWidth);
        ctx.restore();
    }
}