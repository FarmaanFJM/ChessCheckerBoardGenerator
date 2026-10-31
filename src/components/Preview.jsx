import { useState, useRef, useEffect } from 'react';
import { loadAllPieces, deletePiece, loadImageFromURL } from '../utils/pieceStorage';
import Icon from '../ui/Icon';
import { useFeedback } from '../ui/Feedback';
import './Preview.css';

function Preview({ savedPieces, onPiecesChange, onEditPiece }) {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [boardPieces, setBoardPieces] = useState(Array(64).fill(null));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const { confirm, toast } = useFeedback();
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
    const piece = pieces.find(p => p.id === pieceId);
    if (await confirm({
      title: `Delete piece "${piece?.name ?? ''}"?`,
      body: 'This removes the saved piece. This cannot be undone.',
      confirmLabel: 'Delete piece',
      icon: 'trash',
      destructive: true,
    })) {
      await deletePiece(pieceId);
      loadPieces();
      if (onPiecesChange) onPiecesChange();

      // Remove from board
      const newBoardPieces = boardPieces.map(p => p && p.id === pieceId ? null : p);
      setBoardPieces(newBoardPieces);
    }
  };

  // Reversible, so no confirmation: clear and offer Undo.
  const handleClearBoard = () => {
    if (!boardPieces.some(Boolean)) return;
    const previous = boardPieces;
    setBoardPieces(Array(64).fill(null));
    toast('Board cleared', { action: { label: 'Undo', run: () => setBoardPieces(previous) } });
  };

  const handleSetupDefault = () => {
    // Setup standard chess starting position with saved pieces
    if (pieces.length === 0) {
      toast('No pieces yet. Create one in the Piece Editor.');
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
        <div className="preview-actions">
          <button onClick={handleSetupDefault} className="sm-btn">Set up default position</button>
          <button onClick={handleClearBoard} className="sm-btn">Clear board</button>
          <button onClick={handleDownloadBoard} className="sm-btn sm-btn--primary">
            <Icon name="download" />
            Download board
          </button>
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
            {selectedPiece ? 'Click a square to place the piece' : 'Select a piece to place it on the board'}
          </p>
        </div>

        <div className="preview-sidebar">
          <div className="pieces-panel">
            <h3>Pieces</h3>
            {pieces.length === 0 ? (
              <p className="no-pieces">No pieces yet. Create one in the Piece Editor.</p>
            ) : (
              <div className="pieces-grid" role="listbox" aria-label="Pieces">
                {pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="piece-item"
                    aria-selected={selectedPiece?.id === piece.id}
                    role="option"
                    tabIndex={0}
                    onClick={() => setSelectedPiece(piece)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelectedPiece(piece))}
                  >
                    <div className="piece-thumbnail">
                      <img src={piece.thumbnail} alt={piece.name} />
                    </div>
                    <div className="piece-name">{piece.name}</div>
                    <div className="piece-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditPiece) onEditPiece(piece);
                        }}
                        className="sm-icon-btn sm-icon-btn--sm"
                        title="Edit piece"
                        aria-label="Edit piece"
                      >
                        <Icon name="pencil" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePiece(piece.id);
                        }}
                        className="sm-icon-btn sm-icon-btn--sm"
                        title="Delete piece"
                        aria-label="Delete piece"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="board-colors-panel">
            <h3>Board colors</h3>
            <div className="color-inputs">
              <div className="color-input-group">
                <label>Light squares</label>
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
                <label>Dark squares</label>
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
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Pieces</span>
                <span className="stat-value">{pieces.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">On board</span>
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
