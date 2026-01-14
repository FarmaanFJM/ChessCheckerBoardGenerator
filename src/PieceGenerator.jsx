import React, { useState, useRef, useEffect } from 'react'
import './PieceGenerator.css'

const PieceGenerator = () => {
  // Piece templates with customizable parameters
  const pieceTemplates = {
    king: (stroke, fill) => `
      <!-- Cross on top -->
      <path d="M50 12 L50 20 M46 16 L54 16"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"/>
      <!-- Crown body -->
      <path d="M38 32 L42 25 L46 32 L50 25 L54 32 L58 25 L62 32 L62 38 L38 38 Z
               M40 38 L60 38 L58 68 L42 68 Z
               M34 68 L66 68 L70 78 L30 78 Z"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    queen: (stroke, fill) => `
      <!-- Crown with 5 ornaments -->
      <path d="M28 32 L32 25 L36 32 L42 25 L48 32 L50 22 L52 32 L58 25 L64 32 L68 25 L72 32 L72 38 L28 38 Z
               M30 38 L70 38 L67 68 L33 68 Z
               M28 68 L72 68 L75 78 L25 78 Z"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
      <!-- Ornament circles -->
      <circle cx="32" cy="23" r="2.5" fill="${stroke}" stroke="none"/>
      <circle cx="42" cy="23" r="2.5" fill="${stroke}" stroke="none"/>
      <circle cx="50" cy="20" r="2.5" fill="${stroke}" stroke="none"/>
      <circle cx="58" cy="23" r="2.5" fill="${stroke}" stroke="none"/>
      <circle cx="68" cy="23" r="2.5" fill="${stroke}" stroke="none"/>
    `,
    bishop: (stroke, fill) => `
      <!-- Mitre hat with slit -->
      <circle cx="50" cy="18" r="3" fill="${stroke}" stroke="none"/>
      <path d="M50 21 L50 32 M42 32 Q46 26 50 26 Q54 26 58 32
               M42 32 L58 32 L57 68 L43 68 Z
               M35 68 L65 68 L68 78 L32 78 Z
               M47 42 L53 42 M46 52 L54 52"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    knight: (stroke, fill) => `
      <!-- Horse head profile -->
      <path d="M35 68 L40 68 L40 55 Q40 45 42 40 Q44 35 46 32 L48 28 Q52 22 56 20 Q60 18 62 20 L64 24 Q64 28 62 30 L58 34 Q56 36 54 38 L52 42 Q50 46 50 52 L50 68 L68 68 L70 78 L30 78 Z
               M56 26 L58 24 M60 22 Q62 20 64 22"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
      <!-- Mane detail -->
      <path d="M46 32 Q44 34 44 36"
            stroke="${stroke}"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"/>
    `,
    rook: (stroke, fill) => `
      <!-- Castle with battlements -->
      <path d="M32 22 L32 38 L68 38 L68 22 M36 22 L36 28 L40 28 L40 22 M44 22 L44 28 L48 28 L48 22 M52 22 L52 28 L56 28 L56 22 M60 22 L60 28 L64 28 L64 22
               M34 38 L66 38 L64 68 L36 68 Z
               M30 68 L70 68 L73 78 L27 78 Z
               M38 48 L62 48 M40 58 L60 58"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    `,
    pawn: (stroke, fill) => `
      <!-- Simple pawn shape -->
      <circle cx="50" cy="24" r="6"
              fill="${fill}"
              stroke="${stroke}"
              stroke-width="2.5"/>
      <path d="M50 30 L50 45 M44 45 L56 45 L55 65 L45 65 Z
               M38 65 L62 65 L65 75 L35 75 Z"
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
