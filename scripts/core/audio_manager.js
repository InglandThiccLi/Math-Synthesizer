function audioManager() {
	/* Local Variables */
	let node, uid = 0, lookAhead = 0.03;
	let pendingExpr = null, pendingVars = null, pendingAdsr = null;



	/* Private Functions */
	
	// Give the expression input boxes a red ring and red border when the expression is invalid
	function toggleInvalidInputWarning(e) {
		if (e.data && (e.data.type === 'error' || e.data.type === 'warning')) {
			$expr.addClass('error-input');
			$expr.addClass('focus-ring');
			$exprInModal.addClass('error-input');
			$exprInModal.addClass('focus-ring');
			$setVariableDoneBtn.prop('disabled', true);
		} else {
			$expr.removeClass('error-input');
			$expr.removeClass('focus-ring');
			$exprInModal.removeClass('error-input');
			$exprInModal.removeClass('focus-ring');
			$setVariableDoneBtn.prop('disabled', false);
		}
	}
	
	
	
	/* Public Functions */
	
	// Initialization
	async function init() {
		if (audioCtx) return; // Return if audioCtx is already here
		
		// Create audio context
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		// Create AudioWorkletNode
		const blob = new Blob([SynthProcessor], { type: 'application/javascript' });
		const url = URL.createObjectURL(blob);
		await audioCtx.audioWorklet.addModule(url);
		node = new AudioWorkletNode(audioCtx, 'math-synth-processor');
		node.connect(audioCtx.destination);

		// Initialize
		if(pendingExpr) node.port.postMessage({type:'expr', expr:pendingExpr});
  		if(pendingVars) node.port.postMessage({type:'vars', vars:pendingVars});
		if(pendingAdsr) node.port.postMessage({type:'adsr', adsr:pendingAdsr});
		
		// Error handling 
		node.port.onmessage = e => { 
			toggleInvalidInputWarning(e);
		};
	}
	
	// Sending different messages to the node
	function sendExpr(s) {
		const exprJS = UT.transformExpr(s);
		if (node) node.port.postMessage({ type: 'expr', expr: exprJS });
		else pendingExpr = exprJS;
	}

	function sendVars(s) {
		const vars = UT.parseVariableString(s);
		if (node) node.port.postMessage({ type: 'vars', vars: vars });
		else pendingVars = vars;
	}

	function sendADSR(s) {
		const adsr = UT.parseADSRString(s);
		if (node) node.port.postMessage({ type: 'adsr', adsr: adsr });
		else pendingAdsr = adsr;
	}

	function sendVolume(v) {
		if (node) node.port.postMessage({ type: 'volume', volume: v });
	}

	function setPitch(p) {
		basePitch = p;
	}

	function sendNoteOn(midi, vel = 1) {
		if (!audioCtx) init();
		const id = ++uid;
		const freq = UT.midiToFreq(midi);
		const time = audioCtx.currentTime + lookAhead;
		node.port.postMessage({ type: 'noteOn', id, freq, vel, time});
		return { id, midi };
	}

	function sendNoteOff(id) {
		const time = audioCtx.currentTime + lookAhead;
		node.port.postMessage({ type: 'noteOff', id, time });
	}
	
	return {init, sendExpr, sendVars, sendADSR, sendVolume, setPitch, sendNoteOn, sendNoteOff}
}
	










