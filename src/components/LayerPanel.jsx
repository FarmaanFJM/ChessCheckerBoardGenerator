import { useState } from 'react';
import './LayerPanel.css';

function LayerPanel({ layerManager, onLayersChange }) {
  const [layers, setLayers] = useState(layerManager.getAllLayers());
  const [activeLayerId, setActiveLayerId] = useState(layerManager.activeLayerId);

  const refreshLayers = () => {
    setLayers([...layerManager.getAllLayers()]);
    setActiveLayerId(layerManager.activeLayerId);
    if (onLayersChange) onLayersChange();
  };

  const handleAddLayer = () => {
    const width = layers[0]?.canvas.width || 256;
    const height = layers[0]?.canvas.height || 256;
    layerManager.createLayer(`Layer ${layerManager.getLayerCount() + 1}`, width, height);
    refreshLayers();
  };

  const handleDeleteLayer = (id) => {
    if (layers.length === 1) {
      alert('Cannot delete the last layer');
      return;
    }
    if (confirm('Delete this layer?')) {
      layerManager.deleteLayer(id);
      refreshLayers();
    }
  };

  const handleDuplicateLayer = (id) => {
    layerManager.duplicateLayer(id);
    refreshLayers();
  };

  const handleSelectLayer = (id) => {
    layerManager.setActiveLayer(id);
    refreshLayers();
  };

  const handleToggleVisibility = (id) => {
    layerManager.toggleVisibility(id);
    refreshLayers();
  };

  const handleToggleLock = (id) => {
    layerManager.toggleLock(id);
    refreshLayers();
  };

  const handleMoveUp = (id) => {
    layerManager.moveLayerUp(id);
    refreshLayers();
  };

  const handleMoveDown = (id) => {
    layerManager.moveLayerDown(id);
    refreshLayers();
  };

  const handleRename = (id) => {
    const layer = layerManager.getLayer(id);
    const newName = prompt('Enter new layer name:', layer.name);
    if (newName && newName.trim()) {
      layerManager.renameLayer(id, newName.trim());
      refreshLayers();
    }
  };

  const handleOpacityChange = (id, opacity) => {
    layerManager.setOpacity(id, opacity / 100);
    refreshLayers();
  };

  const handleClearLayer = (id) => {
    if (confirm('Clear this layer?')) {
      layerManager.clearLayer(id);
      refreshLayers();
    }
  };

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h3>Layers</h3>
        <button onClick={handleAddLayer} className="add-layer-btn" title="Add Layer">
          +
        </button>
      </div>

      <div className="layers-list">
        {[...layers].reverse().map((layer) => {
          const layerIndex = layers.indexOf(layer);
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              className={`layer-item ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
              onClick={() => handleSelectLayer(layer.id)}
            >
              <div className="layer-preview">
                <canvas
                  width={32}
                  height={32}
                  ref={(canvas) => {
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx.clearRect(0, 0, 32, 32);
                      ctx.drawImage(layer.canvas, 0, 0, 32, 32);
                    }
                  }}
                />
              </div>

              <div className="layer-info">
                <div className="layer-name" onDoubleClick={() => handleRename(layer.id)}>
                  {layer.name}
                </div>
                <div className="layer-opacity">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity * 100}
                    onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{Math.round(layer.opacity * 100)}%</span>
                </div>
              </div>

              <div className="layer-controls">
                <button
                  className={`icon-btn ${layer.visible ? '' : 'inactive'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? '👁️' : '🚫'}
                </button>

                <button
                  className={`icon-btn ${layer.locked ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(layer.id);
                  }}
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>

                <div className="layer-menu">
                  <button className="icon-btn" title="More options">⋮</button>
                  <div className="layer-dropdown">
                    <button onClick={(e) => { e.stopPropagation(); handleDuplicateLayer(layer.id); }}>
                      Duplicate
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleClearLayer(layer.id); }}>
                      Clear
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRename(layer.id); }}>
                      Rename
                    </button>
                    <hr />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveUp(layer.id); }}
                      disabled={layerIndex === layers.length - 1}
                    >
                      Move Up
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveDown(layer.id); }}
                      disabled={layerIndex === 0}
                    >
                      Move Down
                    </button>
                    <hr />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteLayer(layer.id); }}
                      className="danger"
                      disabled={layers.length === 1}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LayerPanel;
