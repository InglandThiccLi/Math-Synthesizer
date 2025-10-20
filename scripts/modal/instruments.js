function instrumentsModal() {
	/* Local Constants and Variables */
	const customInstruments = {} // Storing custom instruments
	let isModified = false; // Indicate if the current instrument is modified
	
	
	
	/* Private Functions */
	
	// Disabled all instrument save buttons except the one for modified current instrument
	function setSaveBtnDisable(id) {
		$('.saveBtn').prop('disabled', true);
		
		if (id && isModified) {
			$('#'+id).find('.saveBtn').prop('disabled', false);
		}
	}
	
	// Prevent user from clicking any buttons
	function instModalAllowFurtherAction(allowed, id) {
		$addInstBtn.prop('disabled', !allowed);
		$addInstDoneBtn.prop('disabled', !allowed);
		$('.btn-close').prop('disabled', !allowed);
		$('.btn-check').prop('disabled', !allowed);
		$('div.instrument').prop('disabled', !allowed);
		$('button').prop('disabled', !allowed);
		
		setSaveBtnDisable(id)
	}
	
	// Highlight the current instrument in #instrumentList and #instrumentDropdownList
	function updateActivatedInstrumentDisplay() {
		$('#instrumentList > span, #instrumentDropdownList > li').removeClass('active');
		$(`#instrumentList > span[instrument="${currentInstrument}"], #instrumentDropdownList > li[instrument="${currentInstrument}"]`).addClass('active');
		$instrumentDropdownTitle.html(currentInstrument);

		$('.instrument').removeClass('active');
		$('.instrument').attr('aria-current', 'false');
		$(`button[instrument="${currentInstrument}"]`).addClass('active');
		$(`button[instrument="${currentInstrument}"]`).attr('aria-current', 'true');
		$(`div[instrument="${currentInstrument}"]`).addClass('active');
		$(`div[instrument="${currentInstrument}"]`).attr('aria-current', 'true');
	}
	
	// Update and save the current instrument (for modified instrument)
	function updateInstrument(target) {
		const id = UT.nameToID(currentInstrument);
		const ADSRString = ADSR.getCurrentADSRString();
		expression = $expr.val();
		
		// Set the attributes of the instrument elements
		$('#'+id+'-inList').attr('expr', expression);
		$('#'+id+'-inList').attr('vars', varString);
		$('#'+id+'-inList').attr('adsr', ADSRString);
		
		$('#'+id+'-inDropdown').attr('expr', expression);
		$('#'+id+'-inDropdown').attr('vars', varString);
		$('#'+id+'-inDropdown').attr('adsr', ADSRString);
		
		target.attr('expr', expression);
		target.attr('vars', varString);
		target.attr('adsr', ADSRString);
		
		// Save in local storage
		customInstruments[id] = {name: currentInstrument, expr: expression, vars: varString, adsr: ADSRString};
		UT.saveInstruments(customInstruments);
		
		// Pass the new attributes to the piano
		PIANO.setInstrument(currentInstrument, target.attr('expr'), target.attr('vars'), target.attr('adsr'));
		setModified(false);
	}
	
	// Delete the instrument
	function deleteInstrument(container, target) {
		// Ask for confirmation
		if (confirm('Are you sure to delete '+currentInstrument+' ?')) {
			// Remove the element
			container.remove();
			
			// Remove from id list
			const id = UT.nameToID(currentInstrument)
			const index = instrumentIDList.indexOf(id);
			if (index != -1) instrumentIDList.splice(index, 1);
			
			// Remove the element in instrument list and dropdown
			$('#'+id+'-inList').remove();
			$('#'+id+'-inDropdown').remove();
			
			// Remove the item in customInstruments
			Reflect.deleteProperty(customInstruments, id);
			
			// Save in local storage
			UT.saveInstruments(customInstruments);
			
			// Select the Sine instrument after the instrument element is deleted
			$instrumentSine.click();
			instModalAllowFurtherAction(true);
		} else {
			target.val(currentInstrument);
			target.focus();
		}
	}
	
	// Check validity when user input the instrument name
	function handleInstNameInput(e) {
		const name = $(e.target).val();
		const id = UT.nameToID(name);
		const container = e.target.parentNode.parentNode;
		const warning = $(container.getElementsByClassName('name-warning-text')[0]);
		const notValidID = !UT.isValidInstrumentID(id);
		
		// Invalid or duplicated name, warning and enforce correction 
		if (instrumentIDList.includes(id) || notValidID) {
			forceFocus = true;
			instModalAllowFurtherAction(false, id);
			warning.removeClass('d-none');
		} 
		// Valid name, allow further action
		else {
			forceFocus = false;
			instModalAllowFurtherAction(true, id);
			warning.addClass('d-none');
		}
		
		// Show different message base on the error
		if (instrumentIDList.includes(id)) {
			warning.html('⚠ Duplicated instrument name!');
		} else if (notValidID) {
			warning.html('⚠ Invalid instrument name!');
		}
	}

	// Delete or keep instrument after user finish inputing the instrument name
	function handleInstNameBlur(e) {
		// Do not proceed if the instrument name is invalid or duplicated
		if (forceFocus) {
			$(e.target).focus();
			return;
		}
		
		const name = $(e.target).val();
		const id = UT.nameToID(name);
		const container = e.target.parentNode.parentNode;
		const ADSRString = ADSR.getCurrentADSRString();
		
		// If name not duplicate
		if (!instrumentIDList.includes(id)) {
			// Remove the current instrument first and rebuild later (for renaming)
			const currentInstrumentID = UT.nameToID(currentInstrument);
			const index = instrumentIDList.indexOf(currentInstrumentID);

			if (index != -1) instrumentIDList.splice(index, 1);
			$('#'+currentInstrumentID+'-inList').remove();
			$('#'+currentInstrumentID+'-inDropdown').remove();
			
			Reflect.deleteProperty(customInstruments, currentInstrumentID);
			
			// Empty, delete the element
			if (name == '') {
				deleteInstrument(container, $(e.target));
			} 
			// Non-empty and valid name, update instrument and rebuild short cuts
			else {
				// Update the attributes
				$(container).attr('id', id);
				$(container).attr('instrument', name);
				
				// Add the new id to id list
				instrumentIDList.push(id);
				
				// Create the short cuts
				createInstrumentShortCuts(id, name, expression, varString, ADSRString);
				
				// Save in local storage
				customInstruments[id] = {name: name, expr: expression, vars: varString, adsr: ADSRString};
				UT.saveInstruments(customInstruments);
				UT.saveCurrentInstrument();
				
				instModalAllowFurtherAction(true, id);
				
				// Select the instrument
				$(container).click();
			}
		}
	}
	
	// Create the instrument short cuts in #instrumentList and #instrumentDropdownList
	function createInstrumentShortCuts(id, name, expr, vars, adsr) {
		// Create element
		const instInList = `<span id="${id}-inList" instrument="${name}" expr="${expr}" vars="${vars}" adsr="${adsr}">${name}</span>`;
		const instInDropdown = `<li id="${id}-inDropdown" class="dropdown-item" instrument="${name}" expr="${expr}" vars="${vars}" adsr="${adsr}">${name}</li>`;
		
		// Add to the container
		$instrumentList.append(instInList);
		$instrumentDropdownList.append(instInDropdown);
		
		// Wire click events
		$('#'+id+'-inList').on('click',(e)=>{selectInstrument($('#'+id+'-inList'));});
		$('#'+id+'-inDropdown').on('click',(e)=>{selectInstrument($('#'+id+'-inDropdown'));});
	}

	// Create instrument element
	function createInstrumentElement(name, init=false, expr=null, vars=null, adsr=null, pending = true) {
		let newName = name;
		let newID = UT.nameToID(newName);
		
		// Give the element a brand new name and id if it is not build from initialization
		// Format: SelectedInstrumentName-Index
		if (!init) {
			let i = 1;
			newName = name.split('-')[0];
			newID = UT.nameToID(newName);
			
			while (instrumentIDList.includes(newID)) {
				newName = name.split('-')[0]+'-'+i;
				newID = UT.nameToID(newName);
				i += 1;
			}
		}
		
		const instRow = `
			<div id="${newID}" class="instrument list-group-item list-group-item-action" aria-current="false"
				instrument="${newName}" expr="${expr?expr:expression}" vars="${vars?vars:varString}" adsr="${adsr?adsr:ADSR.getCurrentADSRString()}">
				<div class="input-group">
					<input type="text" class="var-name-input form-control" maxlength="30" placeholder="Instrument Name" aria-label="inst-name" value="${newName}" required></input>
					<button class="saveBtn btn btn-success" type="button"><i class="bi bi-floppy"></i></button>
					<button class="delBtn btn btn-danger" type="button"><i class="bi bi-trash"></i></button>
				</div>
			<div class="name-warning-text warning-text-square form-text text-bg-danger d-none"></div>
			</div>
		`;
		
		// Add element to the container
		$($customInsts.children()[0]).append(instRow);

		
		// Block user action if it is not initialization
		if (!init) {
			instModalAllowFurtherAction(false);
		}
		
		const newInst = $('#'+newID);
		const instNameInput = $($(newInst.children()[0]).children()[0]);
		const delBtn = newInst.find('.delBtn');
		const saveBtn = newInst.find('.saveBtn');
		
		// Wire events
		newInst.on('click', (e) => {
			if (!forceFocus) selectInstrument(newInst, false, pending);
		});
		
		instNameInput.on('focus', (e) => {
			newInst.click();
			allowKeyboardPlaying = false;
		});
		
		instNameInput.on('input', (e) => {
			handleInstNameInput(e);
		});
		
		instNameInput.on('blur', (e) => {
			allowKeyboardPlaying = true;
			handleInstNameBlur(e);
		});
		
		delBtn.on('click', (e) => {
			newInst.click();
			deleteInstrument(newInst, instNameInput);
		});
		
		saveBtn.on('click', (e) => {
			updateInstrument(newInst);
		});
		
		// Auto focus on the name input if it is not initialization
		if (!init) {
			instNameInput.focus();
		}
	}
	
	
	
	/* Public Functions */
	
	// Set the isModified flag to true or false
	// Enable current instrument's save button if modified
	function setModified(modified) {
		const id = UT.nameToID(currentInstrument);
		isModified = modified;
		if (isModified) {
			$currentInstrument.html("Current Instrument: " + currentInstrument + " (modified)");
			$('#'+id).find('.saveBtn').prop('disabled', false);
		} else {
			$currentInstrument.html("Current Instrument: " + currentInstrument);
			$('#'+id).find('.saveBtn').prop('disabled', true);
		}
	}
	
	// Load instruments from local storage JSON string
	function loadInstruments() {
		const string = UT.loadInstruments();
		if (string) {
			const instruments = JSON.parse(string);
			for (const id in instruments) {
				let i = instruments[id];
				createInstrumentElement(i.name, true, i.expr, i.vars, i.adsr, false);
				createInstrumentShortCuts(id, i.name, i.expr, i.vars, i.adsr);
				setSaveBtnDisable(id);
				customInstruments[id] = {name: i.name, expr: i.expr, vars: i.vars, adsr: i.adsr};
				instrumentIDList.push(id);
			}
		}
	}
	
	// Add imported instrument
	function addInstrument(inst, id) {
		if (inst && id) {
			createInstrumentElement(inst.name, true, inst.expr, inst.vars, inst.adsr);
			createInstrumentShortCuts(id, inst.name, inst.expr, inst.vars, inst.adsr);
			setSaveBtnDisable(id);
			customInstruments[id] = inst;
			UT.saveInstruments(customInstruments);
		}
	}
	
	// Select a instrument if piano is shown or initialization is completed
	function selectInstrument(t, init=false, pending=false) {
		if (pianoShown || init) {
			const inst = t.attr('instrument');
			
			// Only proceed if a different instrument is selected
			if (inst != currentInstrument) {
				// A newly selected instrument is not modified
				setModified(false);
				
				// Pass the new attributes to the piano
				PIANO.setInstrument(inst, t.attr('expr'), t.attr('vars'), t.attr('adsr'));
				
				// Highlight selected instrument
				updateActivatedInstrumentDisplay();
				
				// Save current instrument (not for pending instrument that the name is not confirmed)
				if (!pending) UT.saveCurrentInstrument();

				setModified(false);
				
				// Update wave display
				WV.scheduleWaveUpdate();
			}
		}
	}

	function wireEvents() {
		$instrumentBtns.on('click', (e) => {
			selectInstrument($(e.target));
		});
		
		$instTypeSwitch.on('change', (e) => {
			if ($customInstBtn.prop('checked')) {
				$builtInInsts.addClass('d-none');
				$customInsts.removeClass('d-none');
			} else {
				$builtInInsts.removeClass('d-none');
				$customInsts.addClass('d-none');
			}
		});
		
		$addInstBtn.on('click', (e) => {
			$customInstBtn.click();
			createInstrumentElement(currentInstrument);
		});
	}
	
	return {setModified, loadInstruments, addInstrument, selectInstrument, wireEvents}
}