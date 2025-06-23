// Command Pattern Implementation
class Command {
    constructor(description = "Unknown Command") {
        this.description = description;
        this.timestamp = Date.now();
    }

    execute() {
        throw new Error("Execute method must be implemented");
    }

    undo() {
        throw new Error("Undo method must be implemented");
    }

    canMerge(otherCommand) {
        return false;
    }

    merge(otherCommand) {
        // Override in subclasses that support merging
    }
}

class EditCellCommand extends Command {
    constructor(grid, row, col, newValue, oldValue) {
        super(`Edit ${getCellAddress(row, col)}: "${oldValue}" → "${newValue}"`);
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValueDirect(this.row, this.col, this.newValue);
        this.grid.requestRender();
    }

    undo() {
        this.grid.setCellValueDirect(this.row, this.col, this.oldValue);
        this.grid.requestRender();
    }

    canMerge(otherCommand) {
        return otherCommand instanceof EditCellCommand &&
            otherCommand.row === this.row &&
            otherCommand.col === this.col &&
            (Date.now() - this.timestamp) < 2000;
    }

    merge(otherCommand) {
        this.newValue = otherCommand.newValue;
        this.timestamp = otherCommand.timestamp;
        this.description = `Edit ${getCellAddress(this.row, this.col)}: "${this.oldValue}" → "${this.newValue}"`;
    }
}

class CommandManager {
    constructor(maxHistorySize = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = maxHistorySize;
        this.isExecuting = false;
    }

    executeCommand(command) {
        if (this.isExecuting) return;

        this.isExecuting = true;

        try {
            const lastCommand = this.undoStack[this.undoStack.length - 1];
            if (lastCommand && lastCommand.canMerge && lastCommand.canMerge(command)) {
                lastCommand.merge(command);
                command.execute();
            } else {
                command.execute();
                this.undoStack.push(command);

                if (this.undoStack.length > this.maxHistorySize) {
                    this.undoStack.shift();
                }
            }

            this.redoStack = [];

        } finally {
            this.isExecuting = false;
        }
    }

    undo() {
        if (this.undoStack.length === 0) return false;

        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);

        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;

        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);

        return true;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }
}