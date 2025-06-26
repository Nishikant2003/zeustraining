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


