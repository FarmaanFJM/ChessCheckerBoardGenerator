/**
 * SVG Templates Utility
 * Provides SVG templates that can be loaded into the editor
 */

/**
 * Generate SVG string for a piece template
 */
export function generateSVGTemplate(type, color = '#007a8c', size = 256) {
  const strokeWidth = Math.max(1, size / 100); // Scale stroke width with size

  if (type === 'king') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256">
      <g fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M128 40 L128 80 M108 60 L148 60"/>
        <circle cx="128" cy="100" r="20"/>
        <path d="M110 120 L100 140 L90 180 L80 220"/>
        <path d="M146 120 L156 140 L166 180 L176 220"/>
        <path d="M128 120 L128 220"/>
        <path d="M70 220 L186 220 L186 240 L70 240 Z"/>
      </g>
    </svg>`;
  } else if (type === 'base') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256">
      <g fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 200 L186 200 L186 240 L70 240 Z"/>
      </g>
    </svg>`;
  }

  return '';
}

/**
 * Load SVG template into a canvas
 */
export function loadSVGIntoCanvas(svgString, canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve();
    };

    img.onerror = () => reject(new Error('Failed to load SVG'));

    // Convert SVG string to blob URL
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Get all available templates
 */
export function getAvailableTemplates() {
  return [
    {
      id: 'king',
      name: 'King',
      description: 'Full chess king piece with crown',
      preview: generateSVGTemplate('king', '#007a8c', 64)
    },
    {
      id: 'base',
      name: 'Base',
      description: 'Piece base/pedestal only',
      preview: generateSVGTemplate('base', '#007a8c', 64)
    }
  ];
}

/**
 * Load a template into the editor
 */
export async function loadTemplate(templateId, canvas, color = '#007a8c') {
  const svgString = generateSVGTemplate(templateId, color, canvas.width);
  await loadSVGIntoCanvas(svgString, canvas);
  return true;
}
