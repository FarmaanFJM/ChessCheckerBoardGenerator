# ♟ Chess/Checker Board Generator

A beautiful, modern web application for generating customizable chess/checker boards with various color schemes, textures, and high-resolution download options.

## Features

### 🎨 Color & Gradient Customization
- **Solid Colors**: Use the color picker for quick solid color selection
- **Gradients**: Enable gradient mode to use CSS linear gradients for stunning effects
- **Independent Control**: Light and dark squares can each be solid or gradient
- **Flexible Input**: Supports hex colors (#fff), rgba colors, and linear-gradient() CSS strings
- **Quick Presets**: 6 pre-made color schemes including gradient options (Classic, Green, Blue Gradient, Gray Gradient, Wood Gradient, Ocean Gradient)

### 🖼️ Real Texture Overlays
- **Wood 1**: Authentic wood texture image
- **Wood 2**: Alternative wood grain texture
- **Grain**: Fine-grain texture for subtle variation
- **Adjustable Opacity**: Control texture visibility from 0% to 100%
- **Per-Square Application**: Textures are overlaid on each square individually for optimal quality

### 📥 High-Resolution Download
Download your custom chessboard in multiple HD resolutions:
- **1920x1920** (Full HD)
- **2560x2560** (2K)
- **3840x3840** (4K)
- **7680x7680** (8K)

### ✨ Other Features
- Real-time preview of your design
- Clean, modern UI with gradient background
- Responsive design for mobile and desktop
- PNG format for universal compatibility

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ChessCheckerBoardGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic Usage
1. **Select Colors**: Use the color pickers or type hex/rgba values to choose your light and dark square colors
2. **Apply Gradients** (Optional):
   - Check "Use Gradient" for either light or dark squares
   - Enter a CSS gradient like: `linear-gradient(180deg, rgba(123, 133, 175, 1) 0%, rgba(62, 67, 88, 1) 100%)`
3. **Apply Texture** (Optional): Select a texture type from the dropdown and adjust opacity
4. **Choose Resolution**: Select your desired download resolution
5. **Download**: Click the "Download Chessboard" button to save your custom board

### Gradient Examples
```css
/* Blue gradient - top to bottom */
linear-gradient(180deg, rgba(123, 133, 175, 1) 0%, rgba(62, 67, 88, 1) 100%)

/* Wood gradient - warm tones */
linear-gradient(180deg, rgba(139, 69, 19, 1) 0%, rgba(205, 133, 63, 1) 100%)

/* Ocean gradient - cool blues */
linear-gradient(180deg, rgba(0, 151, 167, 1) 0%, rgba(0, 96, 100, 1) 100%)
```

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Canvas API** - For rendering and downloading high-quality images
- **CSS3** - Modern styling with gradients and animations

## Project Structure

```
ChessCheckerBoardGenerator/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Project dependencies
└── vite.config.js       # Vite configuration
```

## How It Works

The application uses the HTML5 Canvas API to dynamically render an 8x8 checkerboard pattern. When you click download:

1. A new canvas element is created at your selected resolution
2. The 8x8 grid is drawn square by square with your chosen colors/gradients
3. **Gradient Rendering**: CSS linear-gradient strings are parsed and converted to canvas gradients
   - The angle is extracted and converted to canvas coordinates
   - Color stops are parsed and applied to the gradient
   - Each square gets its own gradient instance for proper rendering
4. **Texture Application**: If a texture is selected, the image is overlaid on each square
   - Real texture images (wood1.jpg, wood2.jpg, grain1.jpg) are loaded
   - Textures are drawn with the specified opacity using multiply blend mode
   - Per-square application ensures optimal quality at all resolutions
5. The canvas is converted to a PNG blob and downloaded

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- HTML5 Canvas API
- CSS Grid and Flexbox

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
