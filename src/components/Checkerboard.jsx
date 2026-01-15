import { useState, useRef, useEffect } from 'react';
import wood1 from '../../assets/wood1.jpg';
import wood2 from '../../assets/wood2.jpg';
import grain1 from '../../assets/grain1.jpg';
import './Checkerboard.css';

function Checkerboard() {
  // Mode: 'checkerboard' or 'solid'
  const [mode, setMode] = useState('checkerboard');
  const [solidColor, setSolidColor] = useState('#e8dfd9');

  // Light square settings
  const [lightUseGradient, setLightUseGradient] = useState(false);
  const [lightSolidColor, setLightSolidColor] = useState('#e8dfd9');
  const [lightGradientStart, setLightGradientStart] = useState('#f0d9b5');
  const [lightGradientEnd, setLightGradientEnd] = useState('#d4c4b0');
  const [lightGradientAngle, setLightGradientAngle] = useState(180);
  const [lightGradientHardness, setLightGradientHardness] = useState(0.5);

  // Dark square settings
  const [darkUseGradient, setDarkUseGradient] = useState(false);
  const [darkSolidColor, setDarkSolidColor] = useState('#b58863');
  const [darkGradientStart, setDarkGradientStart] = useState('#7b85af');
  const [darkGradientEnd, setDarkGradientEnd] = useState('#3e4358');
  const [darkGradientAngle, setDarkGradientAngle] = useState(180);
  const [darkGradientHardness, setDarkGradientHardness] = useState(0.5);

  // Board gradient overlay
  const [useBoardGradient, setUseBoardGradient] = useState(false);
  const [boardGradientStart, setBoardGradientStart] = useState('rgba(255, 255, 255, 0.2)');
  const [boardGradientEnd, setBoardGradientEnd] = useState('rgba(0, 0, 0, 0.3)');
  const [boardGradientAngle, setBoardGradientAngle] = useState(180);
  const [boardGradientOpacity, setBoardGradientOpacity] = useState(0.3);

  // Texture settings
  const [texture, setTexture] = useState('none');
  const [textureOpacity, setTextureOpacity] = useState(0.5);

  const [resolution, setResolution] = useState('1920x1920');
  const canvasRef = useRef(null);
  const textureImagesRef = useRef({});

  const resolutions = [
    { label: '1920x1920 (Full HD)', value: '1920x1920' },
    { label: '2560x2560 (2K)', value: '2560x2560' },
    { label: '3840x3840 (4K)', value: '3840x3840' },
    { label: '7680x7680 (8K)', value: '7680x7680' }
  ];

  const textures = [
    { label: 'None', value: 'none' },
    { label: 'Wood 1', value: 'wood1', src: wood1 },
    { label: 'Wood 2', value: 'wood2', src: wood2 },
    { label: 'Grain', value: 'grain1', src: grain1 },
    { label: 'Noise', value: 'noise', procedural: true }
  ];

  // Load texture images
  useEffect(() => {
    textures.forEach(tex => {
      if (tex.src) {
        const img = new Image();
        img.src = tex.src;
        img.onload = () => {
          textureImagesRef.current[tex.value] = img;
        };
      }
    });
  }, []);

  // Color conversion utilities
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const parseColorInput = (input) => {
    const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return rgbToHex(r, g, b);
    }
    return input;
  };

  const getColorName = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'color';

    const { r, g, b } = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (saturation < 0.15) {
      if (brightness < 30) return 'black';
      if (brightness < 80) return 'dark-gray';
      if (brightness < 160) return 'gray';
      if (brightness < 220) return 'light-gray';
      return 'white';
    }

    let hue;
    if (r === max) {
      hue = ((g - b) / (max - min)) * 60;
    } else if (g === max) {
      hue = (2 + (b - r) / (max - min)) * 60;
    } else {
      hue = (4 + (r - g) / (max - min)) * 60;
    }
    if (hue < 0) hue += 360;

    const prefix = brightness < 100 ? 'dark-' : brightness < 180 ? '' : 'light-';

    let baseName;
    if (hue < 15 || hue >= 345) baseName = 'red';
    else if (hue < 45) baseName = 'orange';
    else if (hue < 70) baseName = 'yellow';
    else if (hue < 150) baseName = 'green';
    else if (hue < 200) baseName = 'cyan';
    else if (hue < 260) baseName = 'blue';
    else if (hue < 290) baseName = 'purple';
    else if (hue < 330) baseName = 'pink';
    else baseName = 'red';

    if (baseName === 'orange' && brightness > 200 && saturation > 0.3) return 'beige';
    if (baseName === 'orange' && brightness < 120) return 'brown';
    if (baseName === 'blue' && brightness < 80 && saturation > 0.5) return 'navy';
    if (baseName === 'purple' && brightness < 80) return 'maroon';

    return prefix + baseName;
  };

  const generateCode = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join('');
  };

  const generateNoiseTexture = (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = 128 + (Math.random() - 0.5) * 80;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const createGradient = (ctx, x, y, width, height, startColor, endColor, angle, hardness) => {
    const angleRad = (angle - 90) * Math.PI / 180;
    const x0 = x + width / 2 - Math.cos(angleRad) * height / 2;
    const y0 = y + height / 2 - Math.sin(angleRad) * height / 2;
    const x1 = x + width / 2 + Math.cos(angleRad) * height / 2;
    const y1 = y + height / 2 + Math.sin(angleRad) * height / 2;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    const midPoint = 0.5;
    const spread = Math.max(0.01, 1 - hardness);

    if (hardness < 0.05) {
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, startColor);
    } else {
      const startStop = Math.max(0, midPoint - spread / 2);
      const endStop = Math.min(1, midPoint + spread / 2);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(startStop, startColor);
      gradient.addColorStop(endStop, endColor);
      gradient.addColorStop(1, endColor);
    }

    return gradient;
  };

  const drawSolidColor = (canvas, size) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = solidColor;
    ctx.fillRect(0, 0, size, size);
  };

  const drawChessboard = (canvas, size) => {
    const ctx = canvas.getContext('2d');
    const squareSize = size / 8;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const x = col * squareSize;
        const y = row * squareSize;

        if (isLight) {
          if (lightUseGradient) {
            ctx.fillStyle = createGradient(
              ctx, x, y, squareSize, squareSize,
              lightGradientStart, lightGradientEnd,
              lightGradientAngle, lightGradientHardness
            );
          } else {
            ctx.fillStyle = lightSolidColor;
          }
        } else {
          if (darkUseGradient) {
            ctx.fillStyle = createGradient(
              ctx, x, y, squareSize, squareSize,
              darkGradientStart, darkGradientEnd,
              darkGradientAngle, darkGradientHardness
            );
          } else {
            ctx.fillStyle = darkSolidColor;
          }
        }

        ctx.fillRect(x, y, squareSize, squareSize);

        if (texture !== 'none') {
          if (texture === 'noise') {
            const noiseCanvas = generateNoiseTexture(Math.ceil(squareSize));
            ctx.globalAlpha = textureOpacity;
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(noiseCanvas, x, y, squareSize, squareSize);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
          } else if (textureImagesRef.current[texture]) {
            const textureImg = textureImagesRef.current[texture];
            ctx.globalAlpha = textureOpacity;
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(textureImg, x, y, squareSize, squareSize);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
          }
        }
      }
    }

    if (useBoardGradient) {
      const boardGradient = createGradient(
        ctx, 0, 0, size, size,
        boardGradientStart, boardGradientEnd,
        boardGradientAngle, 0.5
      );
      ctx.fillStyle = boardGradient;
      ctx.globalAlpha = boardGradientOpacity;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1.0;
    }
  };

  const downloadBoard = () => {
    const [width, height] = resolution.split('x').map(Number);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    if (mode === 'solid') {
      drawSolidColor(canvas, width);
    } else {
      drawChessboard(canvas, width);
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const code = generateCode();
      let filename;

      if (mode === 'solid') {
        const colorName = getColorName(solidColor);
        filename = `solid-color-${colorName}-${code}.png`;
      } else {
        const lightColor = lightUseGradient ? getColorName(lightGradientStart) : getColorName(lightSolidColor);
        const darkColor = darkUseGradient ? getColorName(darkGradientStart) : getColorName(darkSolidColor);
        filename = `chessboard-${lightColor}-${darkColor}-${code}.png`;
      }

      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const size = 600;
      canvas.width = size;
      canvas.height = size;

      if (mode === 'solid') {
        drawSolidColor(canvas, size);
      } else {
        drawChessboard(canvas, size);
      }
    }
  }, [
    mode, solidColor,
    lightUseGradient, lightSolidColor, lightGradientStart, lightGradientEnd, lightGradientAngle, lightGradientHardness,
    darkUseGradient, darkSolidColor, darkGradientStart, darkGradientEnd, darkGradientAngle, darkGradientHardness,
    useBoardGradient, boardGradientStart, boardGradientEnd, boardGradientAngle, boardGradientOpacity,
    texture, textureOpacity
  ]);

  return (
    <div className="checkerboard-container">
      <div className="checkerboard-content">
        <div className="preview-section">
          <h2>Preview</h2>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} className="preview-canvas"></canvas>
          </div>
        </div>

        <div className="controls-section">
          <h2>Customize</h2>

          <div className="control-group">
            <label>
              <span className="label-text">Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="select-input"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="solid">Solid Color</option>
              </select>
            </label>
          </div>

          {mode === 'solid' && (
            <div className="control-group">
              <span className="label-text">Solid Color</span>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={solidColor}
                  onChange={(e) => setSolidColor(parseColorInput(e.target.value))}
                  className="color-text-input"
                  placeholder="#ffffff or rgb(255,255,255)"
                />
              </div>
              <div className="rgb-input-group">
                {[['r', 'R'], ['g', 'G'], ['b', 'B']].map(([key, label]) => (
                  <input
                    key={key}
                    type="number"
                    min="0"
                    max="255"
                    value={hexToRgb(solidColor)?.[key] || 0}
                    onChange={(e) => {
                      const rgb = hexToRgb(solidColor) || { r: 0, g: 0, b: 0 };
                      rgb[key] = parseInt(e.target.value) || 0;
                      setSolidColor(rgbToHex(rgb.r, rgb.g, rgb.b));
                    }}
                    className="rgb-input"
                    placeholder={label}
                  />
                ))}
              </div>
            </div>
          )}

          {mode === 'checkerboard' && (
            <>
              {/* Light Squares */}
              <div className="control-group">
                <div className="label-with-toggle">
                  <span className="label-text">Light Squares</span>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={lightUseGradient}
                      onChange={(e) => setLightUseGradient(e.target.checked)}
                    />
                    Use Gradient
                  </label>
                </div>

                {!lightUseGradient ? (
                  <>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={lightSolidColor}
                        onChange={(e) => setLightSolidColor(e.target.value)}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={lightSolidColor}
                        onChange={(e) => setLightSolidColor(parseColorInput(e.target.value))}
                        className="color-text-input"
                      />
                    </div>
                    <div className="rgb-input-group">
                      {[['r', 'R'], ['g', 'G'], ['b', 'B']].map(([key, label]) => (
                        <input
                          key={key}
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(lightSolidColor)?.[key] || 0}
                          onChange={(e) => {
                            const rgb = hexToRgb(lightSolidColor) || { r: 0, g: 0, b: 0 };
                            rgb[key] = parseInt(e.target.value) || 0;
                            setLightSolidColor(rgbToHex(rgb.r, rgb.g, rgb.b));
                          }}
                          className="rgb-input"
                          placeholder={label}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="gradient-controls">
                    <div className="gradient-colors">
                      <div className="gradient-color-item">
                        <label className="small-label">Start</label>
                        <input
                          type="color"
                          value={lightGradientStart}
                          onChange={(e) => setLightGradientStart(e.target.value)}
                          className="color-input-small"
                        />
                      </div>
                      <div className="gradient-color-item">
                        <label className="small-label">End</label>
                        <input
                          type="color"
                          value={lightGradientEnd}
                          onChange={(e) => setLightGradientEnd(e.target.value)}
                          className="color-input-small"
                        />
                      </div>
                    </div>
                    <label className="slider-label">
                      <div className="slider-header">
                        <span>Angle</span>
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={lightGradientAngle}
                          onChange={(e) => setLightGradientAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
                          className="angle-text-input"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={lightGradientAngle}
                        onChange={(e) => setLightGradientAngle(parseInt(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                    <label className="slider-label">
                      <span>Hardness: {Math.round(lightGradientHardness * 100)}%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={lightGradientHardness}
                        onChange={(e) => setLightGradientHardness(parseFloat(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Dark Squares */}
              <div className="control-group">
                <div className="label-with-toggle">
                  <span className="label-text">Dark Squares</span>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={darkUseGradient}
                      onChange={(e) => setDarkUseGradient(e.target.checked)}
                    />
                    Use Gradient
                  </label>
                </div>

                {!darkUseGradient ? (
                  <>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={darkSolidColor}
                        onChange={(e) => setDarkSolidColor(e.target.value)}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={darkSolidColor}
                        onChange={(e) => setDarkSolidColor(parseColorInput(e.target.value))}
                        className="color-text-input"
                      />
                    </div>
                    <div className="rgb-input-group">
                      {[['r', 'R'], ['g', 'G'], ['b', 'B']].map(([key, label]) => (
                        <input
                          key={key}
                          type="number"
                          min="0"
                          max="255"
                          value={hexToRgb(darkSolidColor)?.[key] || 0}
                          onChange={(e) => {
                            const rgb = hexToRgb(darkSolidColor) || { r: 0, g: 0, b: 0 };
                            rgb[key] = parseInt(e.target.value) || 0;
                            setDarkSolidColor(rgbToHex(rgb.r, rgb.g, rgb.b));
                          }}
                          className="rgb-input"
                          placeholder={label}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="gradient-controls">
                    <div className="gradient-colors">
                      <div className="gradient-color-item">
                        <label className="small-label">Start</label>
                        <input
                          type="color"
                          value={darkGradientStart}
                          onChange={(e) => setDarkGradientStart(e.target.value)}
                          className="color-input-small"
                        />
                      </div>
                      <div className="gradient-color-item">
                        <label className="small-label">End</label>
                        <input
                          type="color"
                          value={darkGradientEnd}
                          onChange={(e) => setDarkGradientEnd(e.target.value)}
                          className="color-input-small"
                        />
                      </div>
                    </div>
                    <label className="slider-label">
                      <div className="slider-header">
                        <span>Angle</span>
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={darkGradientAngle}
                          onChange={(e) => setDarkGradientAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
                          className="angle-text-input"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={darkGradientAngle}
                        onChange={(e) => setDarkGradientAngle(parseInt(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                    <label className="slider-label">
                      <span>Hardness: {Math.round(darkGradientHardness * 100)}%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={darkGradientHardness}
                        onChange={(e) => setDarkGradientHardness(parseFloat(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Board Gradient Overlay */}
              <div className="control-group board-gradient-section">
                <div className="label-with-toggle">
                  <span className="label-text">Board Gradient Overlay</span>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useBoardGradient}
                      onChange={(e) => setUseBoardGradient(e.target.checked)}
                    />
                    Enable
                  </label>
                </div>

                {useBoardGradient && (
                  <div className="gradient-controls">
                    <div className="gradient-colors">
                      <div className="gradient-color-item">
                        <label className="small-label">Start</label>
                        <input
                          type="color"
                          value={boardGradientStart.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff'}
                          onChange={(e) => setBoardGradientStart(`rgba(${parseInt(e.target.value.slice(1,3), 16)}, ${parseInt(e.target.value.slice(3,5), 16)}, ${parseInt(e.target.value.slice(5,7), 16)}, 0.2)`)}
                          className="color-input-small"
                        />
                      </div>
                      <div className="gradient-color-item">
                        <label className="small-label">End</label>
                        <input
                          type="color"
                          value={boardGradientEnd.match(/#[0-9a-f]{6}/i)?.[0] || '#000000'}
                          onChange={(e) => setBoardGradientEnd(`rgba(${parseInt(e.target.value.slice(1,3), 16)}, ${parseInt(e.target.value.slice(3,5), 16)}, ${parseInt(e.target.value.slice(5,7), 16)}, 0.3)`)}
                          className="color-input-small"
                        />
                      </div>
                    </div>
                    <label className="slider-label">
                      <div className="slider-header">
                        <span>Angle</span>
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={boardGradientAngle}
                          onChange={(e) => setBoardGradientAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
                          className="angle-text-input"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={boardGradientAngle}
                        onChange={(e) => setBoardGradientAngle(parseInt(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                    <label className="slider-label">
                      <span>Opacity: {Math.round(boardGradientOpacity * 100)}%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={boardGradientOpacity}
                        onChange={(e) => setBoardGradientOpacity(parseFloat(e.target.value))}
                        className="slider-input"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Texture */}
              <div className="control-group">
                <label>
                  <span className="label-text">Texture</span>
                  <select
                    value={texture}
                    onChange={(e) => setTexture(e.target.value)}
                    className="select-input"
                  >
                    {textures.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {texture !== 'none' && (
                <div className="control-group">
                  <label>
                    <span className="label-text">Texture Opacity: {Math.round(textureOpacity * 100)}%</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={textureOpacity}
                      onChange={(e) => setTextureOpacity(parseFloat(e.target.value))}
                      className="slider-input"
                    />
                  </label>
                </div>
              )}
            </>
          )}

          {/* Resolution */}
          <div className="control-group">
            <label>
              <span className="label-text">Download Resolution</span>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="select-input"
              >
                {resolutions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
          </div>

          <button onClick={downloadBoard} className="download-button">
            ⬇ Download {mode === 'solid' ? 'Solid Color' : 'Chessboard'}
          </button>

          {/* Presets */}
          {mode === 'checkerboard' && (
            <div className="presets">
              <h3>Quick Presets</h3>
              <div className="preset-buttons">
                <button onClick={() => {
                  setLightUseGradient(false);
                  setLightSolidColor('#f0d9b5');
                  setDarkUseGradient(false);
                  setDarkSolidColor('#b58863');
                  setUseBoardGradient(false);
                }} className="preset-btn">Classic</button>
                <button onClick={() => {
                  setLightUseGradient(false);
                  setLightSolidColor('#eeeed2');
                  setDarkUseGradient(false);
                  setDarkSolidColor('#769656');
                  setUseBoardGradient(false);
                }} className="preset-btn">Green</button>
                <button onClick={() => {
                  setLightUseGradient(false);
                  setLightSolidColor('#e8dfd9');
                  setDarkUseGradient(true);
                  setDarkGradientStart('#7b85af');
                  setDarkGradientEnd('#3e4358');
                  setDarkGradientAngle(180);
                  setDarkGradientHardness(0.5);
                  setUseBoardGradient(false);
                }} className="preset-btn">Blue Gradient</button>
                <button onClick={() => {
                  setLightUseGradient(false);
                  setLightSolidColor('#e8dfd9');
                  setDarkUseGradient(true);
                  setDarkGradientStart('#7b85af');
                  setDarkGradientEnd('#3e4358');
                  setDarkGradientAngle(180);
                  setDarkGradientHardness(0.5);
                  setUseBoardGradient(true);
                  setBoardGradientStart('rgba(255, 255, 255, 0.2)');
                  setBoardGradientEnd('rgba(0, 0, 0, 0.3)');
                  setBoardGradientAngle(180);
                  setBoardGradientOpacity(0.3);
                }} className="preset-btn">Blue + Board</button>
                <button onClick={() => {
                  setLightUseGradient(true);
                  setLightGradientStart('#fff8dc');
                  setLightGradientEnd('#f0e5cc');
                  setLightGradientAngle(135);
                  setLightGradientHardness(0.3);
                  setDarkUseGradient(true);
                  setDarkGradientStart('#8b4513');
                  setDarkGradientEnd('#cd853f');
                  setDarkGradientAngle(135);
                  setDarkGradientHardness(0.4);
                  setUseBoardGradient(false);
                }} className="preset-btn">Wood</button>
                <button onClick={() => {
                  setLightUseGradient(false);
                  setLightSolidColor('#e0f7fa');
                  setDarkUseGradient(true);
                  setDarkGradientStart('#0097a7');
                  setDarkGradientEnd('#006064');
                  setDarkGradientAngle(180);
                  setDarkGradientHardness(0.5);
                  setUseBoardGradient(false);
                }} className="preset-btn">Ocean</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkerboard;
