/**
 * HistoryManager - Manages undo/redo functionality for the piece editor
 * Uses a snapshot-based approach to store layer states
 */
export class HistoryManager {
  constructor(maxHistorySize = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistorySize = maxHistorySize;
    this.isRestoring = false;
  }

  /**
   * Save current state to history
   * @param {Object} state - The current layer state from layerManager.exportData()
   */
  saveState(state) {
    // Don't save state if we're currently restoring (during undo/redo)
    if (this.isRestoring) {
      return;
    }

    // Deep clone the state to prevent reference issues
    const clonedState = JSON.parse(JSON.stringify(state));

    // Add to undo stack
    this.undoStack.push(clonedState);

    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  /**
   * Undo the last action
   * @returns {Object|null} The previous state, or null if nothing to undo
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }

    // Move current state to redo stack
    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);

    // Return the previous state (or null if undoStack is empty)
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
  }

  /**
   * Redo the last undone action
   * @returns {Object|null} The next state, or null if nothing to redo
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }

    // Move state from redo stack back to undo stack
    const nextState = this.redoStack.pop();
    this.undoStack.push(nextState);

    return nextState;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    // Need at least 2 states to undo (current + previous)
    return this.undoStack.length > 1;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get the number of undo states available
   * @returns {number}
   */
  getUndoCount() {
    return Math.max(0, this.undoStack.length - 1);
  }

  /**
   * Get the number of redo states available
   * @returns {number}
   */
  getRedoCount() {
    return this.redoStack.length;
  }

  /**
   * Set the restoring flag to prevent saving during undo/redo
   * @param {boolean} value
   */
  setRestoring(value) {
    this.isRestoring = value;
  }
}
