# ♟ Chess/Checker Board Generator

A beautiful, modern web application for generating customizable chess/checker boards with various color schemes, textures, and high-resolution download options.

## Features

### 🎨 Color Customization
- **Light Squares Color**: Choose any color using the color picker or hex input
- **Dark Squares Color**: Fully customizable dark square colors
- **Quick Presets**: 6 pre-made color schemes (Classic, Green, Grayscale, Purple, Wood, Ocean)

### 🖼️ Texture Overlays
- **Wood Grain**: Realistic wood texture with vertical grain patterns
- **Cobblestone**: Stone-like cobbled texture
- **Noise**: Fine-grain noise texture for subtle variation
- **Adjustable Opacity**: Control texture visibility from 0% to 100%

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

1. **Select Colors**: Use the color pickers or type hex values to choose your light and dark square colors
2. **Apply Texture** (Optional): Select a texture type from the dropdown and adjust opacity
3. **Choose Resolution**: Select your desired download resolution
4. **Download**: Click the "Download Chessboard" button to save your custom board

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
2. The 8x8 grid is drawn with your chosen colors
3. If a texture is selected, procedural texture generation creates the pattern
4. The texture is overlaid with the specified opacity using blend modes
5. The canvas is converted to a PNG blob and downloaded

### Texture Generation

Each texture is procedurally generated using different algorithms:
- **Wood**: Sine wave patterns with vertical grain simulation
- **Cobblestone**: Cell-based hash function for blocky stone appearance
- **Noise**: Random pixel values for fine grain texture

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- HTML5 Canvas API
- CSS Grid and Flexbox

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
