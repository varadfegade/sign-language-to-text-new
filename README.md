# Sign Language Gesture Detector

A real-time web application that detects and interprets sign language gestures using MediaPipe Hands and computer vision technology.

## Features

- **Real-time Detection**: Live gesture recognition through your webcam
- **Multiple Gestures**: Supports common sign language gestures including:
  - Hello (open palm wave)
  - Thank You (palms together)
  - Yes/Good (thumbs up)
  - No/Bad (thumbs down)
  - Peace (V-sign)
  - I Love You (thumb, index, and pinky up)
  - Stop (open palm facing forward)
  - OK (thumb and index finger circle)
  - And more...

- **Visual Feedback**: 
  - Hand landmark detection and visualization
  - Real-time gesture classification
  - Confidence scoring
  - Gesture history tracking

- **User-friendly Interface**:
  - Clean, modern design
  - Responsive layout
  - Easy-to-use controls
  - Gesture guide with visual examples

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Computer Vision**: Google MediaPipe Hands
- **Camera Access**: WebRTC getUserMedia API
- **Deployment**: Static web hosting compatible

## Getting Started

### Prerequisites

- Modern web browser with webcam support
- HTTPS connection (required for camera access)

### Installation

1. Clone or download this repository
2. Ensure all files are in the same directory:
   ```
   sign-language-detector/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── package.json
   └── README.md
   ```

### Local Development

1. **Using Python HTTP Server**:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`

2. **Using Node.js HTTP Server**:
   ```bash
   npx http-server -p 8000
   ```

3. **Using Live Server** (VS Code extension):
   - Install the Live Server extension
   - Right-click `index.html` and select "Open with Live Server"

### Deployment

This app can be deployed on any static hosting platform:

#### Render Deployment

1. Push your code to a GitHub repository
2. Connect your GitHub account to Render
3. Create a new Static Site on Render
4. Configure the build settings:
   - **Build Command**: (leave empty for static sites)
   - **Publish Directory**: `.` (root directory)
5. Deploy!

#### Other Hosting Options

- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your GitHub repo
- **GitHub Pages**: Enable GitHub Pages in repository settings
- **Firebase Hosting**: Use Firebase CLI to deploy

## Usage

1. **Start the Application**:
   - Open the web app in your browser
   - Allow camera permissions when prompted

2. **Begin Detection**:
   - Click "Start Detection" to activate the camera
   - Position your hand in front of the camera
   - The app will detect and classify your gestures in real-time

3. **Capture Gestures**:
   - When you see a gesture you want to save, click "Capture Gesture"
   - View your captured gestures in the history panel

4. **Stop Detection**:
   - Click "Stop Detection" to turn off the camera

## Gesture Recognition

The app uses MediaPipe Hands to detect 21 hand landmarks and classifies gestures based on finger positions and hand orientations. The recognition algorithm analyzes:

- Finger extension/flexion states
- Relative finger positions
- Hand orientation
- Landmark distances and angles

## Browser Compatibility

- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Edge: Full support

## Troubleshooting

### Camera Issues
- Ensure you're accessing the app via HTTPS
- Check browser permissions for camera access
- Try refreshing the page and allowing permissions again

### Performance Issues
- Close other applications using the camera
- Try a different browser
- Ensure good lighting for better detection

### Gesture Detection Issues
- Position your hand clearly in front of the camera
- Ensure good lighting conditions
- Keep your hand within the camera frame
- Try different angles for better recognition

## Customization

### Adding New Gestures

To add new gesture recognition patterns, modify the `classifyGesture` method in `script.js`:

```javascript
const gestures = {
    '10101': { name: 'Custom Gesture', confidence: 0.8 },
    // Add more patterns...
};
```

### Styling

Customize the appearance by modifying `styles.css`. The app uses CSS Grid and Flexbox for responsive design.

### MediaPipe Configuration

Adjust detection sensitivity in the `initializeMediaPipe` method:

```javascript
this.hands.setOptions({
    maxNumHands: 2,  // Number of hands to detect
    modelComplexity: 1,  // 0 or 1
    minDetectionConfidence: 0.5,  // 0.0 - 1.0
    minTrackingConfidence: 0.5   // 0.0 - 1.0
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google MediaPipe team for the Hands solution
- Open source community for inspiration and resources
- Sign language community for gesture definitions

## Support

For issues, questions, or contributions, please:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This application is designed for educational and accessibility purposes. For professional sign language interpretation, please consult certified interpreters.