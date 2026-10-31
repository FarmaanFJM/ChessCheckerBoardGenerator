import React, { useState } from 'react';
import './App.css';
import Checkerboard from './components/Checkerboard';
import PieceEditor from './components/PieceEditor';
import Preview from './components/Preview';
import { FeedbackProvider } from './ui/Feedback';
import logo from './assets/logo.svg';

const TABS = [
  { id: 'checkerboard', label: 'Checkerboard' },
  { id: 'piece-editor', label: 'Piece Editor' },
  { id: 'preview', label: 'Preview' },
];

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
    <FeedbackProvider>
      <div className="app">
        <header className="app-header">
          <img className="app-logo" src={logo} alt="" />
          <span className="app-title">Board Generator</span>
          <nav className="app-nav" role="tablist" aria-label="Workspace">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className="nav-btn"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
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
    </FeedbackProvider>
  );
}

export default App;
