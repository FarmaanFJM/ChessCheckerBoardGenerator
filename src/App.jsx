import React, { useState } from 'react';
import './App.css';
import Checkerboard from './components/Checkerboard';
import PieceEditor from './components/PieceEditor';
import Preview from './components/Preview';

function App() {
  const [activeTab, setActiveTab] = useState('checkerboard');
  const [piecesSaveCounter, setPiecesSaveCounter] = useState(0);
  const [pieceToEdit, setPieceToEdit] = useState(null);

  const handlePiecesSave = () => {
    setPiecesSaveCounter(prev => prev + 1);
  };

  const handleEditPiece = (piece) => {
    setPieceToEdit(piece);
    setActiveTab('piece-editor');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>♟ Chess/Checker Board Generator</h1>
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'checkerboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkerboard')}
          >
            Checkerboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'piece-editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('piece-editor')}
          >
            Piece Editor
          </button>
          <button
            className={`nav-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'checkerboard' && <Checkerboard />}
        {activeTab === 'piece-editor' && (
          <PieceEditor
            savedPieces={piecesSaveCounter}
            onPiecesSave={handlePiecesSave}
            pieceToEdit={pieceToEdit}
            onClearEdit={() => setPieceToEdit(null)}
          />
        )}
        {activeTab === 'preview' && (
          <Preview
            savedPieces={piecesSaveCounter}
            onPiecesChange={handlePiecesSave}
            onEditPiece={handleEditPiece}
          />
        )}
      </main>
    </div>
  );
}

export default App;
