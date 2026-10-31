import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { useFeedback } from '../ui/Feedback';
import './LayerPanel.css';

function LayerPanel({ layerManager, onLayersChange }) {
  const [layers, setLayers] = useState(layerManager.getAllLayers());
  const [activeLayerId, setActiveLayerId] = useState(layerManager.activeLayerId);
  const [menuLayerId, setMenuLayerId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { confirm, prompt } = useFeedback();

  // Close the layer menu on any outside click or Escape.
  useEffect(() => {
    if (menuLayerId === null) return;
    const close = () => setMenuLayerId(null);
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', onKey); };
  }, [menuLayerId]);

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

  const handleDeleteLayer = async (id) => {
    if (layers.length === 1) return;
    const layer = layerManager.getLayer(id);
    if (await confirm({
      title: `Delete layer "${layer.name}"?`,
      body: 'Its drawing is removed from this piece.',
      confirmLabel: 'Delete layer',
      icon: 'trash',
      destructive: true,
    })) {
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

  const handleRename = async (id) => {
    const layer = layerManager.getLayer(id);
    const newName = await prompt({
      title: 'Rename layer',
      input: { label: 'Name', value: layer.name },
      confirmLabel: 'Rename',
    });
    if (newName) {
      layerManager.renameLayer(id, newName);
      refreshLayers();
    }
  };

  const handleOpacityChange = (id, opacity) => {
    layerManager.setOpacity(id, opacity / 100);
    refreshLayers();
  };

  const handleClearLayer = async (id) => {
    const layer = layerManager.getLayer(id);
    if (await confirm({
      title: `Clear layer "${layer.name}"?`,
      body: 'Everything drawn on this layer is erased.',
      confirmLabel: 'Clear layer',
      destructive: true,
    })) {
      layerManager.clearLayer(id);
      refreshLayers();
    }
  };

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h3>Layers</h3>
        <button onClick={handleAddLayer} className="sm-icon-btn sm-icon-btn--sm" title="Add layer" aria-label="Add layer">
          <Icon name="plus" />
        </button>
      </div>

      <div className="layers-list">
        {[...layers].reverse().map((layer) => {
          const layerIndex = layers.indexOf(layer);
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              className={`layer-item ${layer.locked ? 'locked' : ''}`}
              aria-selected={isActive}
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
                  className="icon-btn"
                  aria-pressed={!layer.visible}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  <Icon name={layer.visible ? 'eye' : 'eyeOff'} />
                </button>

                <button
                  className="icon-btn"
                  aria-pressed={layer.locked}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(layer.id);
                  }}
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  <Icon name={layer.locked ? 'lock' : 'unlock'} />
                </button>

                <div className="layer-menu">
                  <button
                    className="icon-btn"
                    title="More options"
                    aria-haspopup="menu"
                    aria-expanded={menuLayerId === layer.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      setMenuPos({ x: window.innerWidth - r.right, y: r.bottom + 4 });
                      setMenuLayerId(menuLayerId === layer.id ? null : layer.id);
                    }}
                  >
                    <Icon name="more" />
                  </button>
                  {menuLayerId === layer.id && (
                  <div className="layer-dropdown sm-menu" role="menu" style={{ right: menuPos.x, top: menuPos.y }}>
                    <button role="menuitem" className="sm-menu__item" onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleDuplicateLayer(layer.id); }}>
                      Duplicate
                    </button>
                    <button role="menuitem" className="sm-menu__item" onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleClearLayer(layer.id); }}>
                      Clear
                    </button>
                    <button role="menuitem" className="sm-menu__item" onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleRename(layer.id); }}>
                      Rename
                    </button>
                    <hr className="sm-menu__sep" />
                    <button
                      role="menuitem"
                      className="sm-menu__item"
                      onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleMoveUp(layer.id); }}
                      disabled={layerIndex === layers.length - 1}
                    >
                      Move Up
                    </button>
                    <button
                      role="menuitem"
                      className="sm-menu__item"
                      onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleMoveDown(layer.id); }}
                      disabled={layerIndex === 0}
                    >
                      Move Down
                    </button>
                    <hr className="sm-menu__sep" />
                    <button
                      role="menuitem"
                      className="sm-menu__item sm-menu__item--danger"
                      onClick={(e) => { e.stopPropagation(); setMenuLayerId(null); handleDeleteLayer(layer.id); }}
                      disabled={layers.length === 1}
                    >
                      <Icon name="trash" />
                      Delete layer
                    </button>
                  </div>)}
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
