# ♟ Chess/Checker Board Generator

A beautiful, modern web application for generating customizable chess/checker boards with various color schemes, textures, and high-resolution download options.

## Features

### 🎨 Color & Gradient Customization
- **Solid Colors**: Use the color picker for quick solid color selection
- **Interactive Gradients**: Enable gradient mode with intuitive controls:
  - Start and End color pickers
  - Angle slider (0-360°) to control gradient direction
  - Hardness slider to control gradient sharpness (0% = solid, 100% = sharp transition)
- **Independent Control**: Light and dark squares can each be solid or gradient
- **Board Gradient Overlay**: Apply a gradient across the entire board (e.g., darker bottom, lighter top)
  - Perfect for adding depth and atmosphere
  - Adjustable angle, opacity, and colors
- **Quick Presets**: 6 pre-made color schemes (Classic, Green, Blue Gradient, Blue + Board, Wood, Ocean)

### 🖼️ Texture Overlays
- **Wood 1 & 2**: Authentic wood texture images
- **Grain**: Photo-based grain texture
- **Noise**: Improved procedural noise texture for subtle variation
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

## Desktop app

The app also runs as a desktop application (Electron) with a custom title bar and native window controls.

```bash
npm install
npm run desktop:dev    # Vite dev server plus Electron
npm run desktop        # build, then run the packaged web build in Electron
npm run desktop:dist   # installers into release/ (dmg, nsis, AppImage)
```

The UI follows Summa-UI (approved guidance v0.1.0, vendored in `third_party/summa-ui-guidance`, pinned by `summa-ui.lock.json`, recorded in `summa-ui.usage.json`). Design tokens and presets live in `src/styles/summa-*.css`. Native `alert`, `confirm` and `prompt` are replaced by `src/ui/Feedback.jsx` (`prompt` does not exist in Electron).

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
1. **Select Colors**:
   - Solid color: Use the color picker
   - Gradient: Check "Use Gradient" and select start/end colors
2. **Adjust Gradient** (if enabled):
   - **Angle**: Rotate the gradient direction (0-360°)
   - **Hardness**: Control transition sharpness (0% = almost solid, 100% = very sharp)
3. **Board Gradient Overlay** (Optional):
   - Enable to apply gradient across entire board
   - Great for creating depth (darker bottom, lighter top)
   - Adjust angle and opacity to taste
4. **Apply Texture** (Optional): Select a texture type and adjust opacity
5. **Choose Resolution**: Select your desired download resolution
6. **Download**: Click the "Download Chessboard" button to save your custom board

### Tips
- **Hardness at 0%**: Gradient appears almost like a solid color
- **Hardness at 50%**: Smooth, natural gradient transition
- **Hardness at 100%**: Sharp, dramatic color change
- **Board Gradient at 180°**: Creates the classic darker-bottom, lighter-top effect
- **Combine gradients**: Use both square gradients AND board gradient for stunning effects

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

The application uses the HTML5 Canvas API to dynamically render an 8x8 checkerboard pattern:

1. **Square Rendering**: Each square is drawn with either solid color or gradient
   - Gradients are created using start/end colors, angle, and hardness parameters
   - Hardness controls color stop distribution for sharp or smooth transitions
   - Each square gets its own gradient instance for proper per-square rendering

2. **Texture Application**: Textures are overlaid on each square individually
   - Photo textures (wood1.jpg, wood2.jpg, grain1.jpg) are loaded as images
   - Noise texture is procedurally generated for each square
   - Applied with multiply blend mode at specified opacity

3. **Board Gradient Overlay**: Optional gradient applied across entire board
   - Creates atmospheric effects (darker bottom, lighter top)
   - Independent angle and opacity control

4. **Download**: Canvas is converted to PNG blob at selected resolution

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- HTML5 Canvas API
- CSS Grid and Flexbox

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
