import { useState, useRef, useEffect } from 'react';
import LayerPanel from './LayerPanel';
import ToolPanel from './ToolPanel';
import { LayerManager } from '../utils/layerManager';
import { DrawingEngine } from '../utils/drawingEngine';
import { savePiece, generatePieceId, downloadPiece, createThumbnail, loadImageFromFile } from '../utils/pieceStorage';
import { getAvailableTemplates, loadTemplate } from '../utils/svgTemplates';
import './PieceEditor.css';

function PieceEditor({ savedPieces, onPiecesSave }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [layerManager] = useState(() => {
    const lm = new LayerManager();
    lm.createLayer('Background', 256, 256);
    return lm;
  });
  const [drawingEngine, setDrawingEngine] = useState(null);
  const [currentPieceName, setCurrentPieceName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceOpacity, setReferenceOpacity] = useState(0.5);
  const [showTemplates, setShowTemplates] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new DrawingEngine(canvasRef.current, layerManager);

      // Initialize view to center the canvas
      const layerWidth = 256;
      const layerHeight = 256;
      const scale = Math.min(
        canvasRef.current.width / layerWidth,
        canvasRef.current.height / layerHeight
      );
      engine.panX = (canvasRef.current.width - layerWidth * scale) / 2;
      engine.panY = (canvasRef.current.height - layerHeight * scale) / 2;

      setDrawingEngine(engine);

      // Initial render
      renderCanvas(engine);

      // Keyboard shortcuts
      const handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
          case 'b': engine.setTool('brush'); break;
          case 'e': engine.setTool('eraser'); break;
          case 'g': engine.setTool('fill'); break;
          case 'i': engine.setTool('picker'); break;
          case 'l': engine.setTool('line'); break;
          case 'r': engine.setTool('rectangle'); break;
          case 'c': engine.setTool('circle'); break;
          case '+': case '=': handleZoomIn(); break;
          case '-': handleZoomOut(); break;
          case '0': handleResetView(); break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [canvasRef.current]);

  const renderCanvas = (engine = drawingEngine) => {
    if (!engine) return;
    engine.renderCanvas(referenceImage, referenceOpacity);
    forceUpdate({});
  };

  const handleMouseDown = (e) => {
    if (!drawingEngine) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = drawingEngine.getCanvasCoordinates(e, rect, 256, 256);
    drawingEngine.startDrawing(x, y);
    renderCanvas();
  };

  const handleMouseMove = (e) => {
    if (!drawingEngine) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = drawingEngine.getCanvasCoordinates(e, rect, 256, 256);
    drawingEngine.continueDrawing(x, y);

    // Show shape preview for shape tools
    if (drawingEngine.isDrawing && ['line', 'rectangle', 'circle'].includes(drawingEngine.currentTool)) {
      renderCanvas();
      const preview = drawingEngine.getShapePreview(x, y);
      if (preview) {
        const ctx = canvasRef.current.getContext('2d');
        const layers = layerManager.getAllLayers();
        if (layers.length > 0) {
          const layerWidth = layers[0].canvas.width;
          const layerHeight = layers[0].canvas.height;
          const scale = Math.min(
            canvasRef.current.width / layerWidth,
            canvasRef.current.height / layerHeight
          );
          ctx.save();
          ctx.translate(drawingEngine.panX, drawingEngine.panY);
          ctx.scale(drawingEngine.zoom * scale, drawingEngine.zoom * scale);
          ctx.drawImage(preview, 0, 0);
          ctx.restore();
        }
      }
    } else {
      renderCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (!drawingEngine) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = drawingEngine.getCanvasCoordinates(e, rect, 256, 256);
    drawingEngine.endDrawing(x, y);
    renderCanvas();
  };

  const handleWheel = (e) => {
    if (!drawingEngine) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = drawingEngine.setZoom(drawingEngine.zoom * delta, centerX, centerY);
    setZoom(newZoom);
    renderCanvas();
  };

  const handleZoomIn = () => {
    if (!drawingEngine) return;
    const newZoom = drawingEngine.setZoom(drawingEngine.zoom * 1.2);
    setZoom(newZoom);
    renderCanvas();
  };

  const handleZoomOut = () => {
    if (!drawingEngine) return;
    const newZoom = drawingEngine.setZoom(drawingEngine.zoom / 1.2);
    setZoom(newZoom);
    renderCanvas();
  };

  const handleResetView = () => {
    if (!drawingEngine) return;
    drawingEngine.resetView();
    setZoom(1);
    renderCanvas();
  };

  const handleSavePiece = async () => {
    if (!drawingEngine) return;

    const name = currentPieceName.trim() || `Piece ${Date.now()}`;
    const mergedCanvas = layerManager.mergeVisibleLayers(256, 256);
    const thumbnail = createThumbnail(mergedCanvas);

    const piece = {
      id: generatePieceId(),
      name,
      imageData: mergedCanvas.toDataURL('image/png'),
      thumbnail,
      layers: layerManager.exportData(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await savePiece(piece);
    if (onPiecesSave) onPiecesSave();

    alert(`Piece "${name}" saved successfully!`);
    setCurrentPieceName('');
  };

  const handleDownloadPiece = async () => {
    if (!drawingEngine) return;

    const name = currentPieceName.trim() || `piece-${Date.now()}`;
    const mergedCanvas = layerManager.mergeVisibleLayers(256, 256);
    await downloadPiece(mergedCanvas, `${name}.png`);
  };

  const handleNewPiece = () => {
    if (confirm('Create a new piece? This will clear the current work.')) {
      layerManager.layers = [];
      layerManager.createLayer('Background', 256, 256);
      setCurrentPieceName('');
      setReferenceImage(null);
      renderCanvas();
    }
  };

  const handleLoadReference = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const img = await loadImageFromFile(file);
        setReferenceImage(img);
        renderCanvas();
      } catch (error) {
        alert('Failed to load reference image: ' + error.message);
      }
    }
  };

  const handleClearReference = () => {
    setReferenceImage(null);
    renderCanvas();
  };

  const handleLoadTemplate = async (templateId) => {
    const layer = layerManager.getActiveLayer();
    if (layer) {
      await loadTemplate(templateId, layer.canvas, drawingEngine.color);
      renderCanvas();
      setShowTemplates(false);
    }
  };

  return (
    <div className="piece-editor">
      <div className="editor-header">
        <input
          type="text"
          value={currentPieceName}
          onChange={(e) => setCurrentPieceName(e.target.value)}
          placeholder="Piece name..."
          className="piece-name-input"
        />
        <div className="editor-actions">
          <button onClick={handleNewPiece} className="btn">New Piece</button>
          <button onClick={handleSavePiece} className="btn btn-primary">💾 Save Piece</button>
          <button onClick={handleDownloadPiece} className="btn">⬇️ Download</button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-left">
          <ToolPanel
            drawingEngine={drawingEngine}
            onToolChange={renderCanvas}
            onColorChange={renderCanvas}
            onBrushSizeChange={renderCanvas}
          />
        </div>

        <div className="editor-center">
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button onClick={handleZoomOut} title="Zoom Out (-)">🔍-</button>
              <span className="zoom-display">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} title="Zoom In (+)">🔍+</button>
              <button onClick={handleResetView} title="Reset View (0)">↺</button>
            </div>
            <div className="toolbar-group">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'active' : ''}
                title="Toggle Grid"
              >
                #
              </button>
              <button onClick={() => setShowTemplates(!showTemplates)} title="Load Template">
                📐
              </button>
            </div>
          </div>

          <div
            className="canvas-container"
            onWheel={(e) => e.preventDefault()}
            style={{
              backgroundImage: showGrid ? 'repeating-linear-gradient(0deg, #555 0px, #555 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #555 0px, #555 1px, transparent 1px, transparent 20px)' : 'none',
              backgroundColor: '#3a3a3a'
            }}
          >
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="editor-canvas"
            />
          </div>

          {showTemplates && (
            <div className="templates-modal">
              <div className="templates-content">
                <h3>Load Template</h3>
                <div className="templates-grid">
                  {getAvailableTemplates().map((template) => (
                    <div
                      key={template.id}
                      className="template-item"
                      onClick={() => handleLoadTemplate(template.id)}
                    >
                      <div
                        className="template-preview"
                        dangerouslySetInnerHTML={{ __html: template.preview }}
                      />
                      <div className="template-name">{template.name}</div>
                      <div className="template-description">{template.description}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowTemplates(false)} className="btn">Close</button>
              </div>
            </div>
          )}
        </div>

        <div className="editor-right">
          <LayerPanel
            layerManager={layerManager}
            onLayersChange={renderCanvas}
          />

          <div className="reference-panel">
            <h3>Reference Image</h3>
            {referenceImage ? (
              <>
                <div className="reference-preview">
                  <img src={referenceImage.src} alt="Reference" />
                </div>
                <div className="reference-controls">
                  <label>
                    Opacity: {Math.round(referenceOpacity * 100)}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={referenceOpacity * 100}
                      onChange={(e) => {
                        setReferenceOpacity(e.target.value / 100);
                        renderCanvas();
                      }}
                    />
                  </label>
                  <button onClick={handleClearReference} className="btn btn-small">Remove</button>
                </div>
              </>
            ) : (
              <div className="reference-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLoadReference}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="btn"
                >
                  Upload Reference Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PieceEditor;
