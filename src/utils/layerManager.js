/**
 * Layer Manager Utility
 * Handles all layer operations for the piece editor
 */

export class LayerManager {
  constructor() {
    this.layers = [];
    this.nextId = 1;
    this.activeLayerId = null;
  }

  /**
   * Create a new layer
   */
  createLayer(name, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const layer = {
      id: this.nextId++,
      name: name || `Layer ${this.layers.length + 1}`,
      canvas: canvas,
      ctx: canvas.getContext('2d', { willReadFrequently: true }),
      visible: true,
      opacity: 1,
      locked: false
    };

    this.layers.push(layer);
    if (!this.activeLayerId) {
      this.activeLayerId = layer.id;
    }

    return layer;
  }

  /**
   * Get layer by ID
   */
  getLayer(id) {
    return this.layers.find(layer => layer.id === id);
  }

  /**
   * Get active layer
   */
  getActiveLayer() {
    return this.getLayer(this.activeLayerId);
  }

  /**
   * Set active layer
   */
  setActiveLayer(id) {
    if (this.getLayer(id)) {
      this.activeLayerId = id;
      return true;
    }
    return false;
  }

  /**
   * Delete layer
   */
  deleteLayer(id) {
    const index = this.layers.findIndex(layer => layer.id === id);
    if (index === -1 || this.layers.length === 1) {
      return false; // Can't delete last layer
    }

    this.layers.splice(index, 1);

    // Update active layer if needed
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[Math.min(index, this.layers.length - 1)].id;
    }

    return true;
  }

  /**
   * Duplicate layer
   */
  duplicateLayer(id) {
    const sourceLayer = this.getLayer(id);
    if (!sourceLayer) return null;

    const newLayer = this.createLayer(
      `${sourceLayer.name} copy`,
      sourceLayer.canvas.width,
      sourceLayer.canvas.height
    );

    newLayer.ctx.drawImage(sourceLayer.canvas, 0, 0);
    newLayer.opacity = sourceLayer.opacity;
    newLayer.visible = sourceLayer.visible;

    return newLayer;
  }

  /**
   * Move layer up in stack
   */
  moveLayerUp(id) {
    const index = this.layers.findIndex(layer => layer.id === id);
    if (index < this.layers.length - 1) {
      [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
      return true;
    }
    return false;
  }

  /**
   * Move layer down in stack
   */
  moveLayerDown(id) {
    const index = this.layers.findIndex(layer => layer.id === id);
    if (index > 0) {
      [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
      return true;
    }
    return false;
  }

  /**
   * Toggle layer visibility
   */
  toggleVisibility(id) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.visible = !layer.visible;
      return layer.visible;
    }
    return null;
  }

  /**
   * Set layer opacity
   */
  setOpacity(id, opacity) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
      return true;
    }
    return false;
  }

  /**
   * Rename layer
   */
  renameLayer(id, name) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.name = name;
      return true;
    }
    return false;
  }

  /**
   * Toggle layer lock
   */
  toggleLock(id) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.locked = !layer.locked;
      return layer.locked;
    }
    return null;
  }

  /**
   * Clear layer content
   */
  clearLayer(id) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      return true;
    }
    return false;
  }

  /**
   * Merge all visible layers into a single canvas
   */
  mergeVisibleLayers(width, height) {
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = width;
    mergedCanvas.height = height;
    const ctx = mergedCanvas.getContext('2d');

    // Draw layers from bottom to top
    for (const layer of this.layers) {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      }
    }

    ctx.globalAlpha = 1;
    return mergedCanvas;
  }

  /**
   * Get all layers
   */
  getAllLayers() {
    return [...this.layers];
  }

  /**
   * Get layers count
   */
  getLayerCount() {
    return this.layers.length;
  }

  /**
   * Export layers data (for saving)
   */
  exportData() {
    return {
      layers: this.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        locked: layer.locked,
        imageData: layer.canvas.toDataURL('image/png')
      })),
      activeLayerId: this.activeLayerId,
      nextId: this.nextId
    };
  }

  /**
   * Import layers data (for loading)
   */
  async importData(data, width, height) {
    this.layers = [];
    this.nextId = data.nextId || 1;
    this.activeLayerId = data.activeLayerId;

    for (const layerData of data.layers) {
      const layer = {
        id: layerData.id,
        name: layerData.name,
        canvas: document.createElement('canvas'),
        visible: layerData.visible,
        opacity: layerData.opacity,
        locked: layerData.locked
      };

      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.ctx = layer.canvas.getContext('2d', { willReadFrequently: true });

      // Load image data
      if (layerData.imageData) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            layer.ctx.drawImage(img, 0, 0);
            resolve();
          };
          img.src = layerData.imageData;
        });
      }

      this.layers.push(layer);
    }
  }
}
