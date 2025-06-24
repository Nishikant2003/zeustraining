function getColumnName(col) {
    if (col === 0) return "";
    col = col - 1;
    let result = '';
    while (col >= 0) {
        result = String.fromCharCode(65 + (col % 26)) + result;
        col = Math.floor(col / 26) - 1;
    }
    return result;
}

function getCellAddress(row, col) {
    if (row === 0 && col === 0) return "A0";
    if (row === 0) return getColumnName(col) + "0";
    if (col === 0) return "0";
    return getColumnName(col) + row;
}

document.getElementById('undoBtn').onclick = () => grid.commandManager.undo();
document.getElementById('redoBtn').onclick = () => grid.commandManager.redo();
document.getElementById('copyBtn').onclick = () => {
    const sel = grid.selection.getCurrentSelection && grid.selection.getCurrentSelection();
    if (!sel) return;
    let text = '';
    for (let r = sel.startRow; r <= sel.endRow; r++) {
        let row = [];
        for (let c = sel.startCol; c <= sel.endCol; c++) {
            row.push(grid.getCell(r, c).getValue() ?? '');
        }
        text += row.join('\t') + '\n';
    }
    navigator.clipboard.writeText(text.trim());
};
document.getElementById('pasteBtn').onclick = async () => {
    const sel = grid.selection.getCurrentSelection && grid.selection.getCurrentSelection();
    if (!sel) return;
    const text = await navigator.clipboard.readText();
    const rows = text.split(/\r?\n/);
    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split('\t');
        for (let j = 0; j < cols.length; j++) {
            const r = sel.startRow + i;
            const c = sel.startCol + j;
            if (r < grid.rowCount && c < grid.colCount) {
                grid.setCellValue(r, c, cols[j]);
            }
        }
    }
    grid.requestRender();
};