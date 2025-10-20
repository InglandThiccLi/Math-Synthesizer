function importExportModal() {
	/* Private Functions */
	
	// Show specified message in designated place
	function showMessage(message, type, place) {
		const t = (type=='warning')?'⚠ '+ message:'✅ '+message;
		const el = `<div class="${type}-text text-fade form-text">${t}</div>`;
		
		$('#'+place+'-text-container').append(el);
		
		setTimeout(() => {
			$('#'+place+'-text-container').children().first().remove();
		}, 4900);
	}
	
	// Create a hidden file input which accepts multiple json files
	function createFileInput() {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.json';
		fileInput.multiple = true;
		fileInput.style.display = 'none';
		document.body.appendChild(fileInput);
		return fileInput;
	}
	
	// Check if the file is json by its extension
	function isJSON(file) {
		return (file.name.split('.').pop().toLowerCase()) == 'json';
	}
	
	// Get the data from the json file with validation
	// Returns string (the error message) if it is invalid
	function getInstrumentDataFromJSON(e) {
		try {
			const fileContent = e.target.result;
			const inst = JSON.parse(fileContent);
			
			if (!inst || inst === '') {
				return 'Empty json file!';
			}
			
			if (!(inst.name && inst.expr) || inst.vars==null || inst.adsr==null) {
				return 'Missing necessary information!';
			}
			
			if (!UT.isValidInstrumentID(UT.nameToID(inst.name))) {
				return 'Invalid instrument name!';
			}
			
			if (UT.parseVariableString(inst.vars) == null) {
				return 'Error parsing variables! Check console for more information.';
			}
			
			if (UT.parseADSRString(inst.adsr) == null) {
				return 'Error parsing adsr! Check console for more information.';
			}
			
			return inst;
			
		} catch (e) {
			return ''+e;
		}
	}
	
	// Create a hidden link to download the json file
	function createDownloadLink() {
		const data = {name: currentInstrument, expr: expression, vars: varString, adsr: ADSRString};
		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = currentInstrument + '.json';
		return a;
	}

	function importInstruments() {
		const fileInput = createFileInput();
		
		fileInput.onchange = (event) => {
			const files = event.target.files;
			
			// For each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				
				// Check if is JSON
				if (isJSON(file)) {
					const reader = new FileReader();
					
					// Reading file
					reader.onload = function(e) {
						// Get data with validation
						const inst = getInstrumentDataFromJSON(e);
						
						// Type of inst is string means the file is invalid
						if (typeof inst === 'string') {
							showMessage(file.name+': '+inst, 'warning', 'import');
						} 
						// Valid, create the instrument if it does not exist
						else {
							const id = UT.nameToID(inst.name);
							if (!instrumentIDList.includes(id)) {
								INST.addInstrument(inst, id);
								showMessage(inst.name + ' has been imported.', 'success', 'import');
							} else {
								showMessage(inst.name + ' already exists.', 'warning', 'import');
							}
						}
					};
					
					// Error handling
					reader.onerror = function(e) {
						showMessage('Error reading file: ' + e, 'warning', 'import');
					};
					
					// Read file as text
					reader.readAsText(file);
				}
			}
			
			// Clear up
			document.body.removeChild(fileInput);
		};
		
		// Trigger import action programmatically
		fileInput.click();
	}

	function exportInstrument() {
		// Create invisible link that is triggered automatically
		const a = createDownloadLink();
		document.body.appendChild(a);
		a.click();
		
		// Clear up
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		
		showMessage(filename + '.json ' + 'has been exported.', 'success', 'export');
	}
	
	
	
	/* Public Functions */
	
	function wireEvents() {
		$importBtn.on('click', (e) => {
			importInstruments();
		});
		
		$exportBtn.on('click', (e) => {
			exportInstrument();
		});
	}
	
	return {wireEvents};
}



