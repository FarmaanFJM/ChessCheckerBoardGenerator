import { useState, useRef, useEffect } from 'react';
import { loadAllPieces, deletePiece, loadImageFromURL } from '../utils/pieceStorage';
import './Preview.css';

function Preview({ savedPieces, onPiecesChange }) {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [boardPieces, setBoardPieces] = useState(Array(64).fill(null));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [boardColors, setBoardColors] = useState({
    light: '#F0D9B5',
    dark: '#B58863'
  });

  useEffect(() => {
    loadPieces();
  }, [savedPieces]);

  useEffect(() => {
    renderBoard();
  }, [boardPieces, boardColors]);

  const loadPieces = async () => {
    const allPieces = await loadAllPieces();
    setPieces(allPieces);
  };

  const renderBoard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const squareSize = canvas.width / 8;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? boardColors.light : boardColors.dark;
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }

    // Draw pieces
    for (let i = 0; i < 64; i++) {
      if (boardPieces[i]) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const piece = boardPieces[i];

        try {
          const img = await loadImageFromURL(piece.imageData);
          ctx.drawImage(img, col * squareSize, row * squareSize, squareSize, squareSize);
        } catch (error) {
          console.error('Failed to load piece image:', error);
        }
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (!selectedPiece) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (canvas.width / 8));
    const row = Math.floor(y / (canvas.height / 8));
    const index = row * 8 + col;

    const newBoardPieces = [...boardPieces];
    newBoardPieces[index] = selectedPiece;
    setBoardPieces(newBoardPieces);
  };

  const handleDeletePiece = async (pieceId) => {
    if (confirm('Delete this piece?')) {
      await deletePiece(pieceId);
      loadPieces();
      if (onPiecesChange) onPiecesChange();

      // Remove from board
      const newBoardPieces = boardPieces.map(p => p && p.id === pieceId ? null : p);
      setBoardPieces(newBoardPieces);
    }
  };

  const handleClearBoard = () => {
    if (confirm('Clear all pieces from the board?')) {
      setBoardPieces(Array(64).fill(null));
    }
  };

  const handleSetupDefault = () => {
    // Setup standard chess starting position with saved pieces
    if (pieces.length === 0) {
      alert('No pieces available. Create some pieces in the Piece Editor first.');
      return;
    }

    // For now, just place the first piece in the standard starting positions
    const newBoardPieces = Array(64).fill(null);
    const defaultPiece = pieces[0];

    // Place pieces on back rows (simplified - just using first available piece)
    for (let col = 0; col < 8; col++) {
      newBoardPieces[col] = defaultPiece; // Black back row
      newBoardPieces[8 + col] = defaultPiece; // Black pawns
      newBoardPieces[48 + col] = defaultPiece; // White pawns
      newBoardPieces[56 + col] = defaultPiece; // White back row
    }

    setBoardPieces(newBoardPieces);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chess-board-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>Board Preview</h2>
        <div className="preview-actions">
          <button onClick={handleSetupDefault} className="btn">Setup Default Position</button>
          <button onClick={handleClearBoard} className="btn">🗑️ Clear Board</button>
          <button onClick={handleDownloadBoard} className="btn btn-primary">⬇️ Download Board</button>
        </div>
      </div>

      <div className="preview-content">
        <div className="preview-board">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onClick={handleCanvasClick}
            className="board-canvas"
          />
          <p className="board-hint">
            {selectedPiece ? 'Click on a square to place the selected piece' : 'Select a piece from the right panel to place it on the board'}
          </p>
        </div>

        <div className="preview-sidebar">
          <div className="pieces-panel">
            <h3>Available Pieces</h3>
            {pieces.length === 0 ? (
              <div className="no-pieces">
                <p>No pieces created yet</p>
                <p className="hint">Go to the Piece Editor tab to create pieces</p>
              </div>
            ) : (
              <div className="pieces-grid">
                {pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className={`piece-item ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPiece(piece)}
                  >
                    <div className="piece-thumbnail">
                      <img src={piece.thumbnail} alt={piece.name} />
                    </div>
                    <div className="piece-name">{piece.name}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePiece(piece.id);
                      }}
                      className="delete-piece-btn"
                      title="Delete piece"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="board-colors-panel">
            <h3>Board Colors</h3>
            <div className="color-inputs">
              <div className="color-input-group">
                <label>Light Squares</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={boardColors.light}
                    onChange={(e) => setBoardColors({ ...boardColors, light: e.target.value })}
                  />
                  <input
                    type="text"
                    value={boardColors.light}
                    onChange={(e) => setBoardColors({ ...boardColors, light: e.target.value })}
                  />
                </div>
              </div>
              <div className="color-input-group">
                <label>Dark Squares</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={boardColors.dark}
                    onChange={(e) => setBoardColors({ ...boardColors, dark: e.target.value })}
                  />
                  <input
                    type="text"
                    value={boardColors.dark}
                    onChange={(e) => setBoardColors({ ...boardColors, dark: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stats-panel">
            <h3>Stats</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Available Pieces:</span>
                <span className="stat-value">{pieces.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pieces on Board:</span>
                <span className="stat-value">{boardPieces.filter(p => p !== null).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;
