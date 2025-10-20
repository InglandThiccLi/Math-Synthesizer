function waveVisualizer() {
	/* Local Variables */
	let waveVisualizerObj;
	let waveVisualizerObjInModal;
	let waveVisible = false;
	let waveVisibleInModal = false;
	let waveUpdateTimeout;
	let waveUpdateInModalTimeout;
	let resizeTimeout;



	/* Public Functions */

    // Schedule wave visualizer update after a short delay
	function scheduleWaveUpdate() {
		clearTimeout(waveUpdateTimeout);
		waveUpdateTimeout = setTimeout(function() {
			if (waveVisible && waveVisualizerObj) {
				waveVisualizerObj.draw();
			}
		}, 220);
		clearTimeout(waveUpdateInModalTimeout);
		waveUpdateInModalTimeout = setTimeout(function() {
			if (waveVisibleInModal && waveVisualizerObjInModal) {
				waveVisualizerObjInModal.draw();
			}
		}, 220);
	}

    // Schedule wave visualizer resize after a short delay
	function scheduleWaveResize() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			if (waveVisible && waveVisualizerObj) {
				waveVisualizerObj.handleContainerShow();
			}
			if (waveVisibleInModal && waveVisualizerObjInModal) {
				waveVisualizerObjInModal.handleContainerShow();
			}
		}, 220);
	}

    // Toggle wave visualizer display
	function toggleDisplay(isInModal) {
        // Determine whether to toggle main or modal wave visualizer
		if (isInModal) {
			if (!waveVisibleInModal) {
				// Show wave visualizer first
				$waveVisualizerRowInModal.slideDown(400, function() {
					// Animation complete - now initialize or update visualizer
					if (!waveVisualizerObjInModal) {
						waveVisualizerObjInModal = new WaveVisualizer('waveCanvasInModal', $exprInModal, $timeRangeInModal);
						waveVisualizerObjInModal.draw();
					} else {
						// Force resize and redraw when showing again
						waveVisualizerObjInModal.handleContainerShow();
					}
				});
				
				waveVisibleInModal = true;
			} else {
				// Hide wave visualizer
				$waveVisualizerRowInModal.slideUp();
				waveVisibleInModal = false;
			}
		} else {
			if (!waveVisible) {
				// Show wave visualizer first
				$waveVisualizerRow.slideDown(400, function() {
					// Animation complete - now initialize or update visualizer
					if (!waveVisualizerObj) {
						waveVisualizerObj = new WaveVisualizer('waveCanvas', $expr, $timeRange);
						waveVisualizerObj.draw();
					} else {
						// Force resize and redraw when showing again
						waveVisualizerObj.handleContainerShow();
					}
				});
				
				waveVisible = true;
			} else {
				// Hide wave visualizer
				$waveVisualizerRow.slideUp();
				waveVisible = false;
			}
		}
	}

    // Reset zoom level of wave visualizer
	function resetZoom(isInModal) {
		if (isInModal && waveVisualizerObjInModal) {
			waveVisualizerObjInModal.resetZoom();
		} else if (!isInModal && waveVisualizerObj) {
			waveVisualizerObj.resetZoom();
		}
	}
	
	return {scheduleWaveUpdate, scheduleWaveResize, toggleDisplay, resetZoom}
}