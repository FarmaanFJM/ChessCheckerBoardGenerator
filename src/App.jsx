import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import wood1 from '../assets/wood1.jpg'
import wood2 from '../assets/wood2.jpg'
import grain1 from '../assets/grain1.jpg'

function App() {
  const [lightColor, setLightColor] = useState('rgba(232, 223, 217, 0.7)')
  const [darkColor, setDarkColor] = useState('linear-gradient(180deg, rgba(123, 133, 175, 1) 0%, rgba(62, 67, 88, 1) 100%)')
  const [lightUseGradient, setLightUseGradient] = useState(false)
  const [darkUseGradient, setDarkUseGradient] = useState(true)
  const [texture, setTexture] = useState('none')
  const [textureOpacity, setTextureOpacity] = useState(0.5)
  const [resolution, setResolution] = useState('1920x1920')
  const canvasRef = useRef(null)
  const textureImagesRef = useRef({})

  const resolutions = [
    { label: '1920x1920 (Full HD)', value: '1920x1920' },
    { label: '2560x2560 (2K)', value: '2560x2560' },
    { label: '3840x3840 (4K)', value: '3840x3840' },
    { label: '7680x7680 (8K)', value: '7680x7680' }
  ]

  const textures = [
    { label: 'None', value: 'none' },
    { label: 'Wood 1', value: 'wood1', src: wood1 },
    { label: 'Wood 2', value: 'wood2', src: wood2 },
    { label: 'Grain', value: 'grain1', src: grain1 }
  ]

  // Load texture images
  useEffect(() => {
    textures.forEach(tex => {
      if (tex.src) {
        const img = new Image()
        img.src = tex.src
        img.onload = () => {
          textureImagesRef.current[tex.value] = img
        }
      }
    })
  }, [])

  const parseGradient = (gradientString, squareSize) => {
    // Parse linear-gradient CSS string and create canvas gradient
    const match = gradientString.match(/linear-gradient\((\d+)deg,\s*(.+)\)/)
    if (!match) return null

    const angle = parseInt(match[1])
    const colorStops = match[2].split(/,\s*(?![^(]*\))/)

    return { angle, colorStops }
  }

  const applyFillStyle = (ctx, colorOrGradient, useGradient, x, y, width, height) => {
    if (useGradient && colorOrGradient.startsWith('linear-gradient')) {
      const gradInfo = parseGradient(colorOrGradient, width)
      if (gradInfo) {
        const { angle, colorStops } = gradInfo

        // Convert angle to radians and calculate gradient line
        const angleRad = (angle - 90) * Math.PI / 180
        const x0 = x + width / 2 - Math.cos(angleRad) * height / 2
        const y0 = y + height / 2 - Math.sin(angleRad) * height / 2
        const x1 = x + width / 2 + Math.cos(angleRad) * height / 2
        const y1 = y + height / 2 + Math.sin(angleRad) * height / 2

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1)

        colorStops.forEach(stop => {
          const stopMatch = stop.match(/(.+?)\s+(\d+)%/)
          if (stopMatch) {
            const color = stopMatch[1].trim()
            const position = parseInt(stopMatch[2]) / 100
            gradient.addColorStop(position, color)
          }
        })

        ctx.fillStyle = gradient
      }
    } else {
      ctx.fillStyle = colorOrGradient
    }
  }

  const drawChessboard = (canvas, size) => {
    const ctx = canvas.getContext('2d')
    const squareSize = size / 8

    // Draw the checkerboard pattern
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0
        const x = col * squareSize
        const y = row * squareSize

        if (isLight) {
          applyFillStyle(ctx, lightColor, lightUseGradient, x, y, squareSize, squareSize)
        } else {
          applyFillStyle(ctx, darkColor, darkUseGradient, x, y, squareSize, squareSize)
        }

        ctx.fillRect(x, y, squareSize, squareSize)

        // Apply texture overlay on each square if selected
        if (texture !== 'none' && textureImagesRef.current[texture]) {
          const textureImg = textureImagesRef.current[texture]
          ctx.globalAlpha = textureOpacity
          ctx.globalCompositeOperation = 'multiply'
          ctx.drawImage(textureImg, x, y, squareSize, squareSize)
          ctx.globalAlpha = 1.0
          ctx.globalCompositeOperation = 'source-over'
        }
      }
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
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const size = 600
      canvas.width = size
      canvas.height = size
      drawChessboard(canvas, size)
    }
  }, [lightColor, darkColor, lightUseGradient, darkUseGradient, texture, textureOpacity])

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
            <div className="color-input-wrapper">
              {!lightUseGradient && (
                <input
                  type="color"
                  value={lightColor.startsWith('#') ? lightColor : '#f0d9b5'}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="color-input"
                />
              )}
              <input
                type="text"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="color-text-input"
                placeholder={lightUseGradient ? "linear-gradient(...)" : "#hex or rgba(...)"}
              />
            </div>
          </div>

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
            <div className="color-input-wrapper">
              {!darkUseGradient && (
                <input
                  type="color"
                  value={darkColor.startsWith('#') ? darkColor : '#b58863'}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="color-input"
                />
              )}
              <input
                type="text"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                className="color-text-input"
                placeholder={darkUseGradient ? "linear-gradient(...)" : "#hex or rgba(...)"}
              />
            </div>
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
              <button onClick={() => {
                setLightColor('#f0d9b5');
                setDarkColor('#b58863');
                setLightUseGradient(false);
                setDarkUseGradient(false);
              }} className="preset-btn">
                Classic
              </button>
              <button onClick={() => {
                setLightColor('#eeeed2');
                setDarkColor('#769656');
                setLightUseGradient(false);
                setDarkUseGradient(false);
              }} className="preset-btn">
                Green
              </button>
              <button onClick={() => {
                setLightColor('rgba(232, 223, 217, 0.7)');
                setDarkColor('linear-gradient(180deg, rgba(123, 133, 175, 1) 0%, rgba(62, 67, 88, 1) 100%)');
                setLightUseGradient(false);
                setDarkUseGradient(true);
              }} className="preset-btn">
                Blue Gradient
              </button>
              <button onClick={() => {
                setLightColor('#e8e8e8');
                setDarkColor('linear-gradient(180deg, rgba(74, 74, 74, 1) 0%, rgba(30, 30, 30, 1) 100%)');
                setLightUseGradient(false);
                setDarkUseGradient(true);
              }} className="preset-btn">
                Gray Gradient
              </button>
              <button onClick={() => {
                setLightColor('#fff8dc');
                setDarkColor('linear-gradient(180deg, rgba(139, 69, 19, 1) 0%, rgba(205, 133, 63, 1) 100%)');
                setLightUseGradient(false);
                setDarkUseGradient(true);
              }} className="preset-btn">
                Wood Gradient
              </button>
              <button onClick={() => {
                setLightColor('#e0f7fa');
                setDarkColor('linear-gradient(180deg, rgba(0, 151, 167, 1) 0%, rgba(0, 96, 100, 1) 100%)');
                setLightUseGradient(false);
                setDarkUseGradient(true);
              }} className="preset-btn">
                Ocean Gradient
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
