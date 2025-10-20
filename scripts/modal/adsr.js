function adsrModal() {
	/* Public Functions */
	
	// Set the slider position, text display, and send the ADSR to the audio processor
	function setADSR() {
		let [a,d,s,r] = UT.parseADSRString(ADSRString);
		$attack .val(a);
		$decay.val(d);
		$sustain.val(s);
		$release.val(r);
		$attackText.html(a+'s');
		$decayText.html(d+'s');
		$sustainText.html(parseInt(s*100)+'%');
		$releaseText.html(r+'s');
		
		AM.sendADSR(ADSRString);
	}
	
	// Get the slider values and combine them into a string
	function getCurrentADSRString() {
		return $attack.val()+','+$decay.val()+','+$sustain.val()+','+$release.val();
	}
	
	function wireEvents() {
		const sliders = ['attack', 'decay', 'sustain', 'release']
		
		// Display the value of each slider with suitable unit
		sliders.forEach((s) => {
			const el = $('#'+s);
			const text = $('#'+s+'-text');
			let unit = 's';
			
			if (s=='sustain') unit = '%';
			
			el.on('input',(e) => {
				if (unit=='%') {
					text.html(parseInt(el.val() * 100) + unit);
				} else {
					text.html(el.val() + unit);
				}
			});
			
			// Send ADSR to the audio processor when value changes
			el.on('change',(e) => {
				const newADSRString = getCurrentADSRString();
				INST.setModified(newADSRString != originalADSRString);
				AM.sendADSR(newADSRString);
			});
		});
	}

	return { setADSR, getCurrentADSRString, wireEvents };
}

