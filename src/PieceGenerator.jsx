import { useState, useRef, useEffect } from 'react'
import './PieceGenerator.css'

const PieceGenerator = () => {
  // Piece templates with customizable parameters
  const pieceTemplates = {
    king: (stroke, fill) => `
      <path d="M50 15 L50 25 M45 20 L55 20 M50 25 L50 35 M40 35 L60 35 M45 35 L45 40 M55 35 L55 40 M40 40 L60 40 L55 70 L45 70 Z M30 70 L70 70 L75 80 L25 80 Z"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    queen: (stroke, fill) => `
      <path d="M30 25 L35 35 M50 15 L50 35 M70 25 L65 35 M35 35 L40 45 M65 35 L60 45 M40 45 L60 45 L55 70 L45 70 Z M30 70 L70 70 L75 80 L25 80 Z M30 25 Q30 20 35 20 Q35 25 40 25 M50 15 Q50 10 55 10 Q55 15 60 15 M70 25 Q70 20 65 20 Q65 25 60 25"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    bishop: (stroke, fill) => `
      <path d="M50 15 Q48 18 50 22 Q52 18 50 15 M50 22 L50 35 M42 35 Q46 30 50 30 Q54 30 58 35 M42 35 L58 35 L56 70 L44 70 Z M32 70 L68 70 L72 80 L28 80 Z M47 45 L53 45 M47 55 L53 55"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    knight: (stroke, fill) => `
      <path d="M35 25 Q30 20 35 15 Q40 15 45 20 L50 28 Q52 32 50 38 L48 50 Q46 58 48 65 L48 70 M32 70 L68 70 L72 80 L28 80 Z M40 22 L42 18 M48 30 Q52 28 54 32"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    rook: (stroke, fill) => `
      <path d="M35 20 L35 35 M40 20 L40 28 M45 20 L45 35 M50 20 L50 28 M55 20 L55 35 M60 20 L60 28 M65 20 L65 35 M35 35 L65 35 L62 70 L38 70 Z M32 70 L68 70 L72 80 L28 80 Z M35 20 L65 20 M38 45 L62 45 M40 55 L60 55"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    pawn: (stroke, fill) => `
      <path d="M50 20 Q45 20 45 25 Q45 30 50 30 Q55 30 55 25 Q55 20 50 20 M50 30 L50 45 M45 45 L55 45 L54 65 L46 65 Z M35 65 L65 65 L68 75 L32 75 Z"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `
  }

  const [pieceType, setPieceType] = useState('king')
  const [strokeColor, setStrokeColor] = useState('rgba(0, 122, 140, 0.9)')
  const [strokeWidth, setStrokeWidth] = useState(2.5)
  const [fillColor, setFillColor] = useState('none')
  const [scale, setScale] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(100)

  const canvasRef = useRef(null)
  const svgPreviewRef = useRef(null)

  // Update preview whenever settings change
  useEffect(() => {
    updatePreview()
  }, [pieceType, strokeColor, strokeWidth, fillColor, scale, rotation, opacity])

  const updatePreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = 400
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw checkerboard background
    const squareSize = size / 8
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0
        ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863'
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize)
      }
    }

    // Create SVG with current settings
    const svgString = generateSVGString(strokeColor, fillColor, strokeWidth, scale, rotation, opacity)

    // Convert SVG to image and draw on canvas
    const img = new Image()
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // Center the piece on canvas
      const scaleFactor = (scale / 100) * (size / 140)
      const imgWidth = 140 * scaleFactor
      const imgHeight = 140 * scaleFactor
      const x = (size - imgWidth) / 2
      const y = (size - imgHeight) / 2

      ctx.save()
      ctx.globalAlpha = opacity / 100
      ctx.translate(size / 2, size / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-size / 2, -size / 2)
      ctx.drawImage(img, x, y, imgWidth, imgHeight)
      ctx.restore()

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const generateSVGString = (stroke, fill, width, scaleVal = 100, rot = 0, opac = 100) => {
    const pathData = pieceTemplates[pieceType](stroke, fill)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="140" height="140">
      <g transform="rotate(${rot} 50 50) scale(${scaleVal / 100})" transform-origin="50 50" opacity="${opac / 100}">
        ${pathData}
      </g>
    </svg>`
  }

  const downloadSVG = () => {
    const svgString = generateSVGString(strokeColor, fillColor, strokeWidth, scale, rotation, opacity)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chess-${pieceType}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadPNG = (resolution = 1024) => {
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext('2d')

    // Transparent background
    ctx.clearRect(0, 0, resolution, resolution)

    const svgString = generateSVGString(strokeColor, fillColor, strokeWidth, scale, rotation, opacity)
    const img = new Image()
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const scaleFactor = (scale / 100) * (resolution / 140)
      const imgWidth = 140 * scaleFactor
      const imgHeight = 140 * scaleFactor
      const x = (resolution - imgWidth) / 2
      const y = (resolution - imgHeight) / 2

      ctx.save()
      ctx.globalAlpha = opacity / 100
      ctx.translate(resolution / 2, resolution / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-resolution / 2, -resolution / 2)
      ctx.drawImage(img, x, y, imgWidth, imgHeight)
      ctx.restore()

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `chess-${pieceType}-${resolution}px.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const hexToRgba = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `rgba(${r}, ${g}, ${b}, 0.9)`
    }
    return hex
  }

  const presets = [
    { name: 'Teal', stroke: 'rgba(0, 122, 140, 0.9)', fill: 'none' },
    { name: 'Royal Blue', stroke: 'rgba(41, 98, 255, 0.9)', fill: 'none' },
    { name: 'Gold', stroke: 'rgba(255, 215, 0, 0.9)', fill: 'rgba(255, 215, 0, 0.2)' },
    { name: 'Classic Black', stroke: 'rgba(0, 0, 0, 0.9)', fill: 'rgba(50, 50, 50, 0.3)' },
    { name: 'Pure White', stroke: 'rgba(255, 255, 255, 0.9)', fill: 'none' },
    { name: 'Forest Green', stroke: 'rgba(34, 139, 34, 0.9)', fill: 'rgba(34, 139, 34, 0.15)' }
  ]

  const applyPreset = (preset) => {
    setStrokeColor(preset.stroke)
    setFillColor(preset.fill)
  }

  return (
    <div className="piece-generator">
      <div className="piece-preview-section">
        <h2>♟ Chess Piece Preview</h2>
        <div className="canvas-container">
          <canvas ref={canvasRef} className="piece-canvas"></canvas>
        </div>
      </div>

      <div className="piece-controls-section">
        <h2>⚙ Piece Controls</h2>

        <div className="control-group">
          <h3>Piece Type</h3>
          <div className="piece-type-grid">
            {Object.keys(pieceTemplates).map((type) => (
              <button
                key={type}
                className={`piece-type-btn ${pieceType === type ? 'active' : ''}`}
                onClick={() => setPieceType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <h3>Color Presets</h3>
          <div className="presets-grid">
            {presets.map((preset) => (
              <button
                key={preset.name}
                className="preset-btn"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <h3>Stroke Color</h3>
          <div className="color-control">
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              placeholder="rgba(0, 122, 140, 0.9)"
              className="color-input-text"
            />
            <input
              type="color"
              value={strokeColor.startsWith('rgba') ? '#007a8c' : strokeColor}
              onChange={(e) => setStrokeColor(hexToRgba(e.target.value))}
              className="color-picker"
            />
          </div>
        </div>

        <div className="control-group">
          <h3>Stroke Width: {strokeWidth}px</h3>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.5"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <h3>Fill Color</h3>
          <div className="color-control">
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              placeholder="none or rgba(0, 0, 0, 0.2)"
              className="color-input-text"
            />
            <button
              className="clear-fill-btn"
              onClick={() => setFillColor('none')}
            >
              Clear Fill
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>Scale: {scale}%</h3>
          <input
            type="range"
            min="50"
            max="200"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <h3>Rotation: {rotation}°</h3>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <h3>Opacity: {opacity}%</h3>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <h3>Download</h3>
          <button className="download-btn svg-btn" onClick={downloadSVG}>
            📥 Download SVG
          </button>
          <div className="png-downloads">
            <button className="download-btn png-btn" onClick={() => downloadPNG(512)}>
              📥 PNG (512px)
            </button>
            <button className="download-btn png-btn" onClick={() => downloadPNG(1024)}>
              📥 PNG (1024px)
            </button>
            <button className="download-btn png-btn" onClick={() => downloadPNG(2048)}>
              📥 PNG (2048px)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PieceGenerator
