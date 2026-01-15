/**
 * Drawing Engine Utility
 * Handles all drawing operations for the piece editor
 */

export class DrawingEngine {
  constructor(canvas, layerManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.layerManager = layerManager;

    // Drawing state
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.currentTool = 'brush';
    this.brushSize = 2;
    this.color = '#000000';

    // Zoom and pan
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.minZoom = 0.5;
    this.maxZoom = 32;

    // Tool-specific state
    this.shapeStartX = 0;
    this.shapeStartY = 0;
    this.tempCanvas = null;
  }

  /**
   * Set current tool
   */
  setTool(tool) {
    this.currentTool = tool;
  }

  /**
   * Set brush size
   */
  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.min(100, size));
  }

  /**
   * Set drawing color
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * Get canvas coordinates from mouse event
   */
  getCanvasCoordinates(e, canvasRect) {
    const x = Math.floor((e.clientX - canvasRect.left - this.panX) / this.zoom);
    const y = Math.floor((e.clientY - canvasRect.top - this.panY) / this.zoom);
    return { x, y };
  }

  /**
   * Start drawing
   */
  startDrawing(x, y) {
    const layer = this.layerManager.getActiveLayer();
    if (!layer || layer.locked) return;

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    switch (this.currentTool) {
      case 'brush':
      case 'eraser':
        this.drawPoint(layer.ctx, x, y);
        break;
      case 'fill':
        this.floodFill(layer.ctx, x, y);
        this.isDrawing = false;
        break;
      case 'picker':
        this.pickColor(layer.ctx, x, y);
        this.isDrawing = false;
        break;
      case 'line':
      case 'rectangle':
      case 'circle':
        this.shapeStartX = x;
        this.shapeStartY = y;
        // Create temp canvas for preview
        if (!this.tempCanvas) {
          this.tempCanvas = document.createElement('canvas');
          this.tempCanvas.width = layer.canvas.width;
          this.tempCanvas.height = layer.canvas.height;
        }
        break;
    }
  }

  /**
   * Continue drawing
   */
  continueDrawing(x, y) {
    if (!this.isDrawing) return;

    const layer = this.layerManager.getActiveLayer();
    if (!layer || layer.locked) return;

    switch (this.currentTool) {
      case 'brush':
      case 'eraser':
        this.drawLine(layer.ctx, this.lastX, this.lastY, x, y);
        this.lastX = x;
        this.lastY = y;
        break;
      case 'line':
      case 'rectangle':
      case 'circle':
        // Preview is handled in the main component
        break;
    }
  }

  /**
   * End drawing
   */
  endDrawing(x, y) {
    if (!this.isDrawing) return;

    const layer = this.layerManager.getActiveLayer();
    if (!layer || layer.locked) {
      this.isDrawing = false;
      return;
    }

    switch (this.currentTool) {
      case 'line':
        this.drawLineShape(layer.ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
      case 'rectangle':
        this.drawRectangle(layer.ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
      case 'circle':
        this.drawCircle(layer.ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
    }

    this.isDrawing = false;
  }

  /**
   * Draw a single point
   */
  drawPoint(ctx, x, y) {
    const halfSize = this.brushSize / 2;

    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = this.color;
    }

    ctx.beginPath();
    ctx.arc(x, y, halfSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draw a line between two points
   */
  drawLine(ctx, x1, y1, x2, y2) {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.ceil(distance);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      this.drawPoint(ctx, x, y);
    }
  }

  /**
   * Draw a line shape (for line tool)
   */
  drawLineShape(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.brushSize;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  /**
   * Draw a rectangle
   */
  drawRectangle(ctx, x1, y1, x2, y2) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.brushSize;

    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Draw a circle
   */
  drawCircle(ctx, x1, y1, x2, y2) {
    const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.brushSize;

    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Get preview canvas for shape tools
   */
  getShapePreview(x, y) {
    if (!this.tempCanvas || !this.isDrawing) return null;

    const ctx = this.tempCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

    switch (this.currentTool) {
      case 'line':
        this.drawLineShape(ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
      case 'rectangle':
        this.drawRectangle(ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
      case 'circle':
        this.drawCircle(ctx, this.shapeStartX, this.shapeStartY, x, y);
        break;
    }

    return this.tempCanvas;
  }

  /**
   * Flood fill algorithm
   */
  floodFill(ctx, startX, startY) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    const targetColor = this.getPixelColor(data, startX, startY, ctx.canvas.width);
    const fillColor = this.hexToRgba(this.color);

    // Don't fill if same color
    if (this.colorsMatch(targetColor, fillColor)) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) continue;

      const currentColor = this.getPixelColor(data, x, y, ctx.canvas.width);
      if (!this.colorsMatch(currentColor, targetColor)) continue;

      visited.add(key);
      this.setPixelColor(data, x, y, ctx.canvas.width, fillColor);

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Get pixel color at coordinates
   */
  getPixelColor(data, x, y, width) {
    const index = (y * width + x) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3]
    };
  }

  /**
   * Set pixel color at coordinates
   */
  setPixelColor(data, x, y, width, color) {
    const index = (y * width + x) * 4;
    data[index] = color.r;
    data[index + 1] = color.g;
    data[index + 2] = color.b;
    data[index + 3] = color.a;
  }

  /**
   * Check if two colors match
   */
  colorsMatch(c1, c2, tolerance = 0) {
    return Math.abs(c1.r - c2.r) <= tolerance &&
           Math.abs(c1.g - c2.g) <= tolerance &&
           Math.abs(c1.b - c2.b) <= tolerance &&
           Math.abs(c1.a - c2.a) <= tolerance;
  }

  /**
   * Convert hex color to RGBA
   */
  hexToRgba(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * Pick color from canvas
   */
  pickColor(ctx, x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    const r = data[0];
    const g = data[1];
    const b = data[2];

    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    this.color = hex;
    return hex;
  }

  /**
   * Set zoom level
   */
  setZoom(zoom, centerX = null, centerY = null) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));

    // Adjust pan to zoom towards center
    if (centerX !== null && centerY !== null) {
      this.panX = centerX - (centerX - this.panX) * (this.zoom / oldZoom);
      this.panY = centerY - (centerY - this.panY) * (this.zoom / oldZoom);
    }

    return this.zoom;
  }

  /**
   * Pan the canvas
   */
  pan(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;
  }

  /**
   * Reset zoom and pan
   */
  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  /**
   * Render all layers to display canvas
   */
  renderCanvas(referenceImage = null, referenceOpacity = 0.5) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw reference image if provided
    if (referenceImage) {
      this.ctx.globalAlpha = referenceOpacity;
      this.ctx.drawImage(referenceImage, 0, 0);
      this.ctx.globalAlpha = 1;
    }

    // Draw all visible layers
    const layers = this.layerManager.getAllLayers();
    for (const layer of layers) {
      if (layer.visible) {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.drawImage(layer.canvas, 0, 0);
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.restore();
  }
}
