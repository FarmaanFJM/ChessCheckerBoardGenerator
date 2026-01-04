import React, { useState, useRef } from 'react'
import './App.css'

function App() {
  const [lightColor, setLightColor] = useState('#f0d9b5')
  const [darkColor, setDarkColor] = useState('#b58863')
  const [texture, setTexture] = useState('none')
  const [textureOpacity, setTextureOpacity] = useState(0.3)
  const [resolution, setResolution] = useState('1920x1920')
  const canvasRef = useRef(null)

  const resolutions = [
    { label: '1920x1920 (Full HD)', value: '1920x1920' },
    { label: '2560x2560 (2K)', value: '2560x2560' },
    { label: '3840x3840 (4K)', value: '3840x3840' },
    { label: '7680x7680 (8K)', value: '7680x7680' }
  ]

  const textures = [
    { label: 'None', value: 'none' },
    { label: 'Wood Grain', value: 'wood' },
    { label: 'Cobblestone', value: 'cobble' },
    { label: 'Noise', value: 'noise' }
  ]

  const generateTexture = (ctx, width, height, type) => {
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width
      const y = Math.floor((i / 4) / width)
      let value = 128

      if (type === 'wood') {
        // Wood grain pattern - vertical wavy lines
        const frequency = 0.05
        const amplitude = 20
        const woodPattern = Math.sin(x * frequency + Math.sin(y * 0.01) * amplitude) * 30
        value = 128 + woodPattern + (Math.random() - 0.5) * 15
      } else if (type === 'cobble') {
        // Cobblestone pattern - larger noise blocks
        const scale = 10
        const cellX = Math.floor(x / scale)
        const cellY = Math.floor(y / scale)
        const hash = (cellX * 374761393 + cellY * 668265263) % 256
        value = hash + (Math.random() - 0.5) * 30
      } else if (type === 'noise') {
        // Fine grain noise
        value = 128 + (Math.random() - 0.5) * 60
      }

      data[i] = value     // R
      data[i + 1] = value // G
      data[i + 2] = value // B
      data[i + 3] = 255   // A
    }

    return imageData
  }

  const drawChessboard = (canvas, size) => {
    const ctx = canvas.getContext('2d')
    const squareSize = size / 8

    // Draw the checkerboard pattern
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0
        ctx.fillStyle = isLight ? lightColor : darkColor
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize)
      }
    }

    // Apply texture overlay if selected
    if (texture !== 'none') {
      const textureCanvas = document.createElement('canvas')
      textureCanvas.width = size
      textureCanvas.height = size
      const textureCtx = textureCanvas.getContext('2d')

      const textureData = generateTexture(textureCtx, size, size, texture)
      textureCtx.putImageData(textureData, 0, 0)

      ctx.globalAlpha = textureOpacity
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(textureCanvas, 0, 0)
      ctx.globalAlpha = 1.0
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const downloadBoard = () => {
    const [width, height] = resolution.split('x').map(Number)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    drawChessboard(canvas, width)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chessboard-${resolution}.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  // Preview canvas effect
  React.useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const size = 600
      canvas.width = size
      canvas.height = size
      drawChessboard(canvas, size)
    }
  }, [lightColor, darkColor, texture, textureOpacity])

  return (
    <div className="app">
      <h1>♟ Chess/Checker Board Generator</h1>

      <div className="container">
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
              <span className="label-text">Light Squares Color</span>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="color-text-input"
                />
              </div>
            </label>
          </div>

          <div className="control-group">
            <label>
              <span className="label-text">Dark Squares Color</span>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="color-text-input"
                />
              </div>
            </label>
          </div>

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
            ⬇ Download Chessboard
          </button>

          <div className="presets">
            <h3>Quick Presets</h3>
            <div className="preset-buttons">
              <button onClick={() => { setLightColor('#f0d9b5'); setDarkColor('#b58863'); }} className="preset-btn">
                Classic
              </button>
              <button onClick={() => { setLightColor('#eeeed2'); setDarkColor('#769656'); }} className="preset-btn">
                Green
              </button>
              <button onClick={() => { setLightColor('#e8e8e8'); setDarkColor('#4a4a4a'); }} className="preset-btn">
                Grayscale
              </button>
              <button onClick={() => { setLightColor('#ffd1dc'); setDarkColor('#8b4789'); }} className="preset-btn">
                Purple
              </button>
              <button onClick={() => { setLightColor('#fff8dc'); setDarkColor('#cd853f'); }} className="preset-btn">
                Wood
              </button>
              <button onClick={() => { setLightColor('#e0f7fa'); setDarkColor('#0097a7'); }} className="preset-btn">
                Ocean
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
