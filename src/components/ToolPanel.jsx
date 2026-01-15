import { useState } from 'react';
import './ToolPanel.css';

function ToolPanel({ drawingEngine, onToolChange, onColorChange, onBrushSizeChange }) {
  const [currentTool, setCurrentTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const tools = [
    { id: 'brush', icon: '✏️', name: 'Brush', shortcut: 'B' },
    { id: 'eraser', icon: '🧹', name: 'Eraser', shortcut: 'E' },
    { id: 'fill', icon: '🪣', name: 'Fill Bucket', shortcut: 'G' },
    { id: 'picker', icon: '💧', name: 'Color Picker', shortcut: 'I' },
    { id: 'line', icon: '📏', name: 'Line', shortcut: 'L' },
    { id: 'rectangle', icon: '⬜', name: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: '⭕', name: 'Circle', shortcut: 'C' }
  ];

  const handleToolSelect = (toolId) => {
    setCurrentTool(toolId);
    drawingEngine.setTool(toolId);
    if (onToolChange) onToolChange(toolId);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    drawingEngine.setColor(newColor);
    if (onColorChange) onColorChange(newColor);
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    drawingEngine.setBrushSize(size);
    if (onBrushSizeChange) onBrushSizeChange(size);
  };

  const handleRgbChange = (channel, value) => {
    const rgb = hexToRgb(color);
    rgb[channel] = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorChange(newColor);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgb = hexToRgb(color);

  return (
    <div className="tool-panel">
      <div className="tool-section">
        <h4>Tool</h4>
        <div className="tool-list">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolSelect(tool.id)}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
              <span className="tool-shortcut">{tool.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <h4>Color</h4>
        <div className="color-section">
          <div
            className="color-preview"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-input"
            placeholder="#000000"
          />
        </div>

        {showColorPicker && (
          <div className="color-picker-expanded">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="color-picker-native"
            />
            <div className="rgb-inputs">
              <div className="rgb-input-group">
                <label>R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                />
              </div>
              <div className="rgb-input-group">
                <label>G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                />
              </div>
              <div className="rgb-input-group">
                <label>B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tool-section">
        <h4>Brush Size: {brushSize}px</h4>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
          className="brush-size-slider"
        />
        <div className="brush-preview" style={{
          width: Math.min(brushSize * 2, 50),
          height: Math.min(brushSize * 2, 50),
          backgroundColor: currentTool === 'eraser' ? '#fff' : color,
          border: currentTool === 'eraser' ? '2px solid #000' : 'none'
        }} />
      </div>

      <div className="tool-section">
        <h4>Quick Colors</h4>
        <div className="quick-colors">
          {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((c) => (
            <button
              key={c}
              className="quick-color-btn"
              style={{ backgroundColor: c }}
              onClick={() => handleColorChange(c)}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ToolPanel;
