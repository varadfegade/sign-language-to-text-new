class SignLanguageDetector {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.isDetecting = false;
        this.gestureHistory = [];
        this.currentGesture = "Ready to detect...";
        this.confidence = 0;

        this.initializeElements();
        this.setupEventListeners();
        this.initializeMediaPipe();
    }

    initializeElements() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.gestureResult = document.getElementById('gestureResult');
        this.historyList = document.getElementById('historyList');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        this.captureBtn.addEventListener('click', () => this.captureGesture());
    }

    async initializeMediaPipe() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));

            console.log('MediaPipe Hands initialized successfully');
        } catch (error) {
            console.error('Error initializing MediaPipe:', error);
            this.updateGestureDisplay('Error initializing camera', 0);
        }
    }

    async startDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            this.video.srcObject = stream;
            this.isDetecting = true;

            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    if (this.isDetecting) {
                        await this.hands.send({ image: this.video });
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();

            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateGestureDisplay('Detecting...', 0);

            console.log('Detection started');
        } catch (error) {
            console.error('Error starting detection:', error);
            alert('Could not access camera. Please allow camera permissions and try again.');
        }
    }

    stopDetection() {
        this.isDetecting = false;

        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }

        if (this.camera) {
            this.camera.stop();
        }

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.clearCanvas();
        this.updateGestureDisplay('Stopped', 0);

        console.log('Detection stopped');
    }

    onResults(results) {
        if (!this.isDetecting) return;

        // Clear canvas
        this.clearCanvas();

        // Draw video frame
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Draw hand landmarks
            for (const landmarks of results.multiHandLandmarks) {
                this.drawLandmarks(landmarks);
                this.drawConnections(landmarks);
            }

            // Recognize gesture
            const gesture = this.recognizeGesture(results.multiHandLandmarks[0]);
            this.updateGestureDisplay(gesture.name, gesture.confidence);
        } else {
            this.updateGestureDisplay('No hand detected', 0);
        }
    }

    drawLandmarks(landmarks) {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;

        for (const landmark of landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    drawConnections(landmarks) {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm connections
        ];

        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;

        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            const startX = startPoint.x * this.canvas.width;
            const startY = startPoint.y * this.canvas.height;
            const endX = endPoint.x * this.canvas.width;
            const endY = endPoint.y * this.canvas.height;

            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }

    recognizeGesture(landmarks) {
        // Simple gesture recognition based on finger positions
        const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
        const fingerBases = [3, 6, 10, 14, 18]; // Finger base joints

        const fingersUp = [];

        // Check thumb (different logic due to orientation)
        if (landmarks[4].x > landmarks[3].x) {
            fingersUp.push(1);
        } else {
            fingersUp.push(0);
        }

        // Check other fingers
        for (let i = 1; i < 5; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerBases[i]].y) {
                fingersUp.push(1);
            } else {
                fingersUp.push(0);
            }
        }

        return this.classifyGesture(fingersUp, landmarks);
    }

    classifyGesture(fingersUp, landmarks) {
        const sum = fingersUp.reduce((a, b) => a + b, 0);
        const pattern = fingersUp.join('');

        // Gesture patterns based on finger positions
        const gestures = {
            '00000': { name: 'Fist', confidence: 0.9 },
            '11111': { name: 'Hello', confidence: 0.9 },
            '10000': { name: 'Yes/Good (Thumbs Up)', confidence: 0.8 },
            '01100': { name: 'Peace', confidence: 0.8 },
            '01000': { name: 'Point', confidence: 0.7 },
            '10001': { name: 'I Love You', confidence: 0.8 },
            '01010': { name: 'Rock On', confidence: 0.7 },
            '11000': { name: 'Gun', confidence: 0.6 },
            '00001': { name: 'Pinky Promise', confidence: 0.6 }
        };

        // Check for OK gesture (thumb and index finger touching)
        if (this.isOKGesture(landmarks)) {
            return { name: 'OK', confidence: 0.8 };
        }

        // Check for Stop gesture (open palm)
        if (pattern === '11111' && this.isPalmFacingForward(landmarks)) {
            return { name: 'Stop', confidence: 0.8 };
        }

        return gestures[pattern] || { name: 'Unknown Gesture', confidence: 0.3 };
    }

    isOKGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.05; // Threshold for finger touching
    }

    isPalmFacingForward(landmarks) {
        // Simple check based on hand orientation
        const wrist = landmarks[0];
        const middleFinger = landmarks[12];
        return middleFinger.z < wrist.z; // Middle finger closer to camera than wrist
    }

    updateGestureDisplay(gestureName, confidence) {
        this.currentGesture = gestureName;
        this.confidence = confidence;

        const gestureText = this.gestureResult.querySelector('.gesture-text');
        const confidenceElement = this.gestureResult.querySelector('.confidence');

        gestureText.textContent = gestureName;

        if (confidence > 0) {
            confidenceElement.textContent = `Confidence: ${(confidence * 100).toFixed(1)}%`;
        } else {
            confidenceElement.textContent = '';
        }

        // Add status indicator
        const statusClass = confidence > 0.7 ? 'status-ready' : 
                           confidence > 0.3 ? 'status-detecting' : 'status-error';

        // Update background color based on confidence
        if (confidence > 0.7) {
            this.gestureResult.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            this.gestureResult.style.color = 'white';
        } else if (confidence > 0.3) {
            this.gestureResult.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
            this.gestureResult.style.color = 'white';
        } else {
            this.gestureResult.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
            this.gestureResult.style.color = '#333';
        }
    }

    captureGesture() {
        if (this.currentGesture && this.currentGesture !== 'Ready to detect...' && this.confidence > 0.5) {
            const timestamp = new Date().toLocaleTimeString();
            const historyItem = `${this.currentGesture} (${(this.confidence * 100).toFixed(1)}%) - ${timestamp}`;

            this.gestureHistory.unshift(historyItem);
            if (this.gestureHistory.length > 10) {
                this.gestureHistory.pop();
            }

            this.updateHistoryDisplay();

            // Show capture feedback
            this.captureBtn.textContent = 'Captured!';
            this.captureBtn.disabled = true;
            setTimeout(() => {
                this.captureBtn.textContent = 'Capture Gesture';
                this.captureBtn.disabled = false;
            }, 1000);
        } else {
            alert('No reliable gesture detected. Please try again.');
        }
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        this.gestureHistory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            this.historyList.appendChild(li);
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const detector = new SignLanguageDetector();
    console.log('Sign Language Detector initialized');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, consider pausing detection
        console.log('Page hidden - consider pausing detection');
    } else {
        // Page is visible again
        console.log('Page visible - resume detection');
    }
});