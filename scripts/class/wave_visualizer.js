class WaveVisualizer {
    constructor(canvasId, exprSrc, trSrc) {
        this.canvas = document.getElementById(canvasId);
        this.expressionSource = exprSrc;
        this.timeRangeSource = trSrc;
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Initialize view parameters
        this.view = {
            tMin: 0,
            tMax: 1,
            tRange: 1
        };
        
        this.isDragging = false;
        this.dragStart = { x: 0, tMin: 0, tMax: 0 };
        this.pinchStartDistance = 0;
        this.pinchStartRange = 1;
        
        // Set initial size
        this.setCanvasSize();
        this.setupEventListeners();
    }
    
    setCanvasSize() {
        // Get the parent container dimensions
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas dimensions based on container
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = 200 * this.pixelRatio; // Fixed height of 200px
        this.canvas.style.width = '100%';
        this.canvas.style.height = '200px';
        
        this.width = rect.width;
        this.height = 200;
        
        // Reset the scale transformation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    handleContainerShow() {
        // Force a reflow to ensure container has proper dimensions
        const container = this.canvas.parentElement;
        container.offsetHeight; // Trigger reflow
        
        // Reset canvas size
        this.setCanvasSize();
        this.draw();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleResize() {
        this.setCanvasSize();
        this.draw();
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const mouseX = e.offsetX;
        const t = this.view.tMin + (mouseX / this.width) * this.view.tRange;
        
        if (e.deltaY < 0) {
            // Zoom in
            this.zoomAtPoint(t, 1 - zoomIntensity);
        } else {
            // Zoom out
            this.zoomAtPoint(t, 1 + zoomIntensity);
        }
    }
    
    handleMouseDown(e) {
        this.isDragging = true;
        this.dragStart.x = e.offsetX;
        this.dragStart.tMin = this.view.tMin;
        this.dragStart.tMax = this.view.tMax;
        this.canvas.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.offsetX - this.dragStart.x;
        const deltaT = (deltaX / this.width) * this.view.tRange;
        
        let newTMin = this.dragStart.tMin - deltaT;
        let newTMax = this.dragStart.tMax - deltaT;
        
        // Ensure time doesn't go below 0
        if (newTMin < 0) {
            newTMax -= newTMin; // Subtract the negative amount to shift right
            newTMin = 0;
        }
        
        this.view.tMin = newTMin;
        this.view.tMax = newTMax;
        this.view.tRange = newTMax - newTMin;
        
        this.draw();
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            // Start dragging
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.dragStart.x = touch.clientX - rect.left;
            this.dragStart.tMin = this.view.tMin;
            this.dragStart.tMax = this.view.tMax;
            this.isDragging = true;
        } else if (e.touches.length === 2) {
            // Start pinch zoom
            this.startPinchZoom(e);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            // Panning
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const deltaX = (touch.clientX - rect.left) - this.dragStart.x;
            const deltaT = (deltaX / this.width) * this.view.tRange;
            
            let newTMin = this.dragStart.tMin - deltaT;
            let newTMax = this.dragStart.tMax - deltaT;
            
            // Ensure time doesn't go below 0
            if (newTMin < 0) {
                newTMax -= newTMin; // Subtract the negative amount to shift right
                newTMin = 0;
            }
            
            this.view.tMin = newTMin;
            this.view.tMax = newTMax;
            this.view.tRange = newTMax - newTMin;
            
            this.draw();
        } else if (e.touches.length === 2) {
            // Pinch zoom
            this.handlePinchZoom(e);
        }
    }
    
    handleTouchEnd() {
        this.isDragging = false;
        this.pinchStartDistance = 0;
    }
    
    startPinchZoom(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.pinchStartDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        this.pinchStartRange = this.view.tRange;
    }
    
    handlePinchZoom(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (this.pinchStartDistance > 0) {
            const zoomFactor = this.pinchStartDistance / currentDistance;
            const rect = this.canvas.getBoundingClientRect();
            const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
            const t = this.view.tMin + (centerX / this.width) * this.view.tRange;
            
            this.zoomAtPoint(t, zoomFactor);
        }
        
        this.pinchStartDistance = currentDistance;
    }
    
    zoomAtPoint(t, factor) {
        const newRange = this.view.tRange * factor;
        
        // Limit zoom range (prevent too much zoom in/out)
        if (newRange < 0.001 || newRange > 100) return;
        
        const tCenter = t;
        const halfRange = newRange / 2;
        
        let newTMin = tCenter - halfRange;
        let newTMax = tCenter + halfRange;
        
        // Ensure time doesn't go below 0
        if (newTMin < 0) {
            newTMax -= newTMin; // Shift the entire range to the right
            newTMin = 0;
        }
        
        this.view.tMin = newTMin;
        this.view.tMax = newTMax;
        this.view.tRange = newRange;
        
        this.draw();
    }
    
    resetZoom() {
        this.view.tMin = 0;
        this.view.tMax = 1;
        this.view.tRange = 1;
        this.draw();
    }
    
    evaluateExpression(expr, t) {
        try {
            // Use the same transformation as the audio engine
            const transformedExpr = UT.transformExpr(expr);
            const vars = UT.parseVariableString(varString);
            
            // Create evaluation function similar to AudioWorklet
            const func = new Function('t', 'f', 'freq', 'vars', 'Math', 
                `with(vars) { return ${transformedExpr}; }`);
            
            // Use default frequency for visualization (A4)
            const freq = 440;
            const f = 2 * Math.PI * freq;
            
            return func(t, f, freq, vars, Math) || 0;
        } catch (error) {
            return 0;
        }
    }
    
    draw() {
        const { ctx, width, height } = this;
        const expr = this.expressionSource.val();
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid and axes
        this.drawGrid();
        
        if (!expr) return;

        // Sample the expression
        const samples = [];
        const sampleCount = width;
        let maxAmplitude = 0.001; // Avoid division by zero
        
        for (let i = 0; i < sampleCount; i++) {
            const t = this.view.tMin + (i / (sampleCount - 1)) * this.view.tRange;
            const value = this.evaluateExpression(expr, t);
            samples.push(value);
            maxAmplitude = Math.max(maxAmplitude, Math.abs(value));
        }
        
        // Normalize to [-1, 1] if needed
        const normalizeFactor = maxAmplitude > 1 ? 1 / maxAmplitude : 1;
        
        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        for (let i = 0; i < sampleCount; i++) {
            const x = (i / (sampleCount - 1)) * width;
            const y = height / 2 - (samples[i] * normalizeFactor * height) / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Update info display
        this.updateInfoDisplay();
    }
    
    drawGrid() {
        const { ctx, width, height } = this;
        
        // Draw background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines (time)
        const timeSteps = this.calculateGridSteps(this.view.tRange);
        for (let t = Math.ceil(this.view.tMin / timeSteps) * timeSteps; t <= this.view.tMax; t += timeSteps) {
            const x = ((t - this.view.tMin) / this.view.tRange) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            // Time labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(t.toFixed(2) + 's', x, height - 5);
        }
        
        // Horizontal grid lines (amplitude)
        const amplitudeSteps = 0.5;
        for (let a = -1; a <= 1; a += amplitudeSteps) {
            const y = height / 2 - (a * height) / 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            
            // Amplitude labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(a.toFixed(1), 5, y + 3);
        }
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        
        // X-axis (time)
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y-axis (amplitude)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
    }
    
    calculateGridSteps(range) {
        // Calculate appropriate grid step size based on range
        const power = Math.floor(Math.log10(range));
        const baseStep = Math.pow(10, power);
        
        if (range / baseStep > 5) return baseStep;
        if (range / baseStep > 2) return baseStep / 2;
        return baseStep / 5;
    }
    
    updateInfoDisplay() {
        this.timeRangeSource.text(`Time range: ${this.view.tMin.toFixed(2)} to ${this.view.tMax.toFixed(2)} s`);
    }
}