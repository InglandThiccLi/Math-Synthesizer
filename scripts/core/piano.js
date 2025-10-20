function piano() {
	/* Private Functions */
	
	// The keyboard button click effect
	function setActiveVisual(midi, on) {
		const el = $piano.find('[data-midi="' + midi + '"]');
		if (!el.length) return;
		el.toggleClass('active', !!on);
	}



	/* Public Functions */
	
	function buildKeyboard() {
		// Clean up
		const piano = $piano.empty();
		piano.removeClass('touch');
		
		// Normal view: piano with white and black keys
		if (displaySizeLevel != 0) {
			// White keys
			WHITE_SEMIS.forEach((semi, i) => {
				const midi = baseMIDI + semi;
				const content = `
					<div class="key-label">${NOTE_NAMES[semi % 12] + parseInt(midi / 12 - 1)}</div>
					<div class="keyboard-hint">${KEY_HINTS[semi]}</div>
				`
				$('<div>').addClass('white key').attr('data-midi', midi)
				.html(content)
				.appendTo(piano);
			});
			
			// Black keys
			BLACK_SEMIS.forEach((semi, i) => {
				const midi = baseMIDI + semi;
				const whiteIndex = BLACK_WHITE_MAP[i];
				let left_expand = 4.479;
				let left_offset = 0.75;
				
				switch (displaySizeLevel) {
					case 1:
					left_expand = 4.409;
					left_offset = 0;
					break;
					case 2:
					left_expand = 4.443;
					left_offset = 0.37;
					break;
					case 3:
					left_expand = 4.46;
					left_offset = 0.51;
					break;
					default:
					break;
				}
				
				const left = (whiteIndex + 1) * left_expand - left_offset;
				const content = `
					<div class="key-label">${NOTE_NAMES[semi % 12] + parseInt(midi / 12 - 1)}</div>
					<div class="keyboard-hint">${KEY_HINTS[semi]}</div>
				`
				$('<div>').addClass('black key').attr('data-midi', midi)
				.css('left', left + '%')
				.html(content)
				.appendTo(piano);
			});
		}
		
		// Mobile view: 7 rows of rectangular buttons
		else {
			let semi = 0;
			piano.addClass('touch');
			for (let i = 0; i < 7; i++) {
				const row = $('<div>').addClass('row justify-content-center').appendTo(piano);
				for (let j = 0; j < 6; j++) {
					const midi = baseMIDI + semi;
					const key = $('<div>').addClass('key touch d-flex col-2').attr('data-midi', midi)
					.html('<div class="">' + NOTE_NAMES[semi % 12] + parseInt(midi / 12 - 1))
					.appendTo(row);
					semi++;
				}
			}
		}
	}
	
	// Resize the piano when window size changes
	function handlePianoResize() {
		const currentWidth = window.innerWidth;
		
		if (currentWidth < 576) {
			if (displaySizeLevel != 0) { displaySizeLevel = 0; buildKeyboard(); }
			
		} else if (currentWidth >= 576 && currentWidth < 768) {
			if (displaySizeLevel != 0) { displaySizeLevel = 0; buildKeyboard(); }
			
		} else if (currentWidth >= 768 && currentWidth < 992) {
			if (displaySizeLevel != 1) { displaySizeLevel = 1; buildKeyboard(); }
			
		} else if (currentWidth >= 992 && currentWidth < 1200) {
			if (displaySizeLevel != 2) { displaySizeLevel = 2; buildKeyboard(); }
			
		} else if (currentWidth >= 1200 && currentWidth < 1400) {
			if (displaySizeLevel != 3) { displaySizeLevel = 3; buildKeyboard(); }
			
		} else {
			if (displaySizeLevel != 4) { displaySizeLevel = 4; buildKeyboard(); }
		}
	}
	
	// Set instrument
	function setInstrument(name, expr, vars, adsr) {
		currentInstrument = name || '';
		expression = expr;
		originalExpr = expr;
		originalVarString = vars;
		varString = vars;
		originalADSRString = adsr;
		ADSRString = adsr;
		
		// Set expression, variables and adsr
		AM.sendExpr(expression);
		$expr.val(expression);
		VARS.setVariables();
		ADSR.setADSR();
	}

	// Mouse and touch events
	function pointerStart(pid, midi) {
		const res = AM.sendNoteOn(midi, 1);
		activePointers[pid] = { uid: res.id, midi };
		setActiveVisual(midi, true);
	}

	function pointerChange(pid, midi) {
		const p = activePointers[pid];
		if (!p) return;
		if (p.midi === midi) return;
		AM.sendNoteOff(p.uid);
		setActiveVisual(p.midi, false);
		const res = AM.sendNoteOn(midi, 1);
		activePointers[pid] = { uid: res.id, midi };
		setActiveVisual(midi, true);
	}

	function pointerEnd(pid) {
		const p = activePointers[pid];
		if (!p) return;
		AM.sendNoteOff(p.uid);
		setActiveVisual(p.midi, false);
		delete activePointers[pid];
	}

	// Keyboard events
	function keyDown(code) {
		const map = KEY_BINDINGS[code];
		if (map === undefined) return;
		const midi = baseMIDI + map;
		if (activeKeys[code]) return;
		const res = AM.sendNoteOn(midi, 1);
		activeKeys[code] = res;
		setActiveVisual(midi, true);
	}

	function keyUp(code) {
		const p = activeKeys[code]
		if (!p) return;
		AM.sendNoteOff(p.id);
		setActiveVisual(p.midi, false);
		delete activeKeys[code];
	}

	// Force stop
	function stopAllSound() {
		for (const code in activeKeys) {
			keyUp(code);
		}
		for (const pid in activePointers) {
			pointerEnd(pid);
		}
	}
	
	return {buildKeyboard, handlePianoResize, setInstrument, pointerStart, pointerChange, pointerEnd, keyDown, keyUp, stopAllSound}
}

