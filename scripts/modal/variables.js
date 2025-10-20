function variablesModal() {
	/* Local Constants and Variables */
	const tempVarList = []; // Avoid duplicated variable names
	const deletedIDList = []; // The id of variable elements that are deleted. Reuse them instead of incresing varID
	let varID = 0; // The id of a new variable element
	
	
	
	/* Private Functions */
	
	// Convert elements in #varsContainer to variable list
	function getVariableList() {
		const varEls = $varsContainer.children();
		if (!varEls) return ''; // Return when the container is empty

		const varList = [];
		for (let i = 0; i < varEls.length; i++) {
			const el = varEls[i];
			const name = el.getAttribute('var-name');
			const value = el.getAttribute('var-value');
			varList.push(name+'='+value);
		}
		return varList;
	}
	
	// Update variable display
	function updateVariableDisplay(varList) {
		$varsDisplay.empty();
		$varsDisplay.html(`<small class="text-muted" >No variables defined.</small>`);
		if (!varList || varList.length === 0) return; // Return when list is empty

		// Each variable is displayed as a span
		if (varList[0] != '') {
			let varSpansHTML = ``;
			let i = 0;
			varList.forEach((v) => {
				const name = v.split('=')[0];
				const value = v.split('=')[1];
				varSpansHTML += `<span id="vd-${i}" var-name="${name}" var-value="${value}">${v}</span>\n`
				i++;
			});
			$varsDisplay.html(varSpansHTML);
		}
	}

	// Prevent user from clicking any buttons
	function varModalAllowFurtherAction(allowed) {
		$addVarBtn.prop('disabled', !allowed);
		$setVariableDoneBtn.prop('disabled', !allowed);
		$exprInModal.prop('disabled', !allowed);
		$('.btn-close').prop('disabled', !allowed);
		$('.btn-check').prop('disabled', !allowed);
		$waveBtnInModal.prop('disabled', !allowed);
	}

	// Check validity when user input the variable name
	function handleVarNameInput(e) {
		const name = $(e.target).val();
		const warning = $(e.target.parentNode.parentNode.getElementsByClassName('name-warning-text')[0]);
		
		warning.removeClass('d-none');
		
		// Empty name, allow further action
		if (name == '') {
			warning.html('');
			warning.addClass('d-none');
			forceFocus = false;
		}
		// Invalid name, warning and enforce correction 
		else if (!UT.isValidVariableName(name)) {
			varModalAllowFurtherAction(false);
			forceFocus = true;
			warning.html('⚠ Invalid variable name!');
		}
		// Duplicated name, warning and enforce correction 
		else if (tempVarList.includes(name)) {
			varModalAllowFurtherAction(false);
			forceFocus = true;
			warning.html('⚠ Duplicated variable name!');
		} 
		// Valid name, allow further action
		else {
			warning.html('');
			warning.addClass('d-none');
			forceFocus = false;
		}
	}

	// Delete or keep variable after user finish inputing the variable name
	function handleVarNameBlur(e) {
		// Do not proceed if the variable name is invalid or duplicated
		if (forceFocus) {$(e.target).focus(); return;}
		
		const name = $(e.target).val();
		
		// Empty name, delete variable
		if (name == '') {
			const deletedID = parseInt(e.target.parentNode.parentNode.id.split('-')[1]);
			deletedIDList.push(deletedID);
			
			const container = e.target.parentNode.parentNode;
			const oldName = container.getAttribute('var-name');
			
			// Delete old name from the temporary list
			if (oldName) {
				const index = tempVarList.findIndex(x => (x==oldName));
				if (index != -1) tempVarList.splice(index, 1);
			}
			
			// Remove element
			e.target.parentNode.parentNode.remove();
			varModalAllowFurtherAction(true);
		}
		// Non-empty and valid name, keep variable
		else {
			const container = e.target.parentNode.parentNode;
			const oldName = container.getAttribute('var-name');
			
			// Return if name is unchanged
			if (oldName == name) {
				varModalAllowFurtherAction(true);
				return;
			}
			
			// Delete old name from the temporary list
			if (oldName) {
				const index = tempVarList.findIndex(x => (x==oldName));
				if (index != -1) tempVarList.splice(index, 1);
			}
			
			// Add the name to the temporary list 
			tempVarList.push(name);
			container.setAttribute('var-name', name);
			varModalAllowFurtherAction(true);
		}
	}

	// Check validity after user input the variable value
	function handleVarValueBlur(e) {
		const val = $(e.target).val();
		const num_val = parseFloat(val);
		const warning = $(e.target.parentNode.parentNode.getElementsByClassName('value-warning-text')[0]);
		
		warning.removeClass('d-none');
		
		// Empty value, set to 0 and allow further action
		if (val == '') {
			e.target.parentNode.parentNode.setAttribute('var-value', 0);
			$(e.target).val(0);
			varModalAllowFurtherAction(true);
		}
		// Out of range, warning and enforce correction 
		else if (num_val < -999999 || num_val > 999999) {
			varModalAllowFurtherAction(false);
			warning.html('⚠ Variable value must be within range [-999999, 999999]');
			e.target.focus();
		} 
		// Valid value, set the value and allow further action
		else {
			e.target.parentNode.parentNode.setAttribute('var-value', num_val);
			$(e.target).val(num_val);
			warning.html('');
			warning.addClass('d-none');
			varModalAllowFurtherAction(true);
		}
	}
	
	// Create variable element
	function addVariableElement(id, name='', value='') {
		const varRow = `
			<div id="${id}" class="row var-item mb-1" var-name="${name}" var-value="${value}">
				<div class="input-group">
					<span class="input-group-text">Name</span>
					<input type="text" class="var-name-input form-control" pattern="^[a-zA-Z_][a-zA-Z0-9_]*$" maxlength="30" placeholder="Var. Name" aria-label="var-name" value="${name}" required>
					<span class="input-group-text">Value</span>
					<input type="number" class="var-value-input form-control" placeholder="Var. Value" aria-label="var-val" value="${value}" min="-999999" max="999999" required>
				</div>
				<div class="name-warning-text warning-text form-text text-bg-danger d-none"></div>
				<div class="value-warning-text warning-text form-text text-bg-danger d-none"></div>
			</div>
		`;
	
		// Add element to the container
		$varsContainer.append(varRow);
		
		// Wire events
		const varNameInput = $('#'+id+' .var-name-input');
		const varValueInput = $('#'+id+' .var-value-input');
		if (name == '') {
			varNameInput.focus();
			allowKeyboardPlaying = false;
		}
		varNameInput.on('input', (e) => {
			handleVarNameInput(e);
		});
		
		varNameInput.on('focus', (e) => {
			allowKeyboardPlaying = false;
		});
		varNameInput.on('blur', (e) => {
			allowKeyboardPlaying = true;
			handleVarNameBlur(e);
		});
		varValueInput.on('focus', (e) => {
			allowKeyboardPlaying = false;
		});
		varValueInput.on('blur', (e) => {
			allowKeyboardPlaying = true;
			handleVarValueBlur(e);
		});
	}

	// Update the variable and expression of the instrument
	function update() {
		// Get new variables
		const varList = getVariableList();
		varString = varList.toString();

		// Get new expression
		expression = $exprInModal.val();
		$expr.val(expression);
		INST.setModified((expression != originalExpr) || (varString != originalVarString));

		// Update display
		updateVariableDisplay(varList);
		
		// Send expression and variable to the synth
		let timeOut;
		clearTimeout(timeOut);
		timeOut = setTimeout(() => {
				WV.scheduleWaveUpdate();
				AM.sendVars(varString);
				AM.sendExpr(expression);
				$setVariableDoneBtn.prop('disabled', true);
		}, 100);
	}



	/* Public Functions */
	
	// Load the stored variables of an instrument
	// Called when an instrument is selected
	function setVariables() {
		// Clear up
		$varsContainer.empty();
		tempVarList.length = 0;
		deletedIDList.length = 0;
		varID = 0;
		forceFocus = false;
		
		// Create elements if there are variables
		if (varString != '' && varString != null) {
			varString.split(',').forEach((v) => {
				const parts = v.split('=');
				addVariableElement(varID, parts[0], parts[1]);
				varID += 1;
			});
			AM.sendVars(varString);
		}
		
		// Update display 
		if (varString)
			updateVariableDisplay(varString.split(','));
		else
			updateVariableDisplay([]);
	}

	function wireEvents() {
		$addVarBtn.on('click', (e) => {
			varModalAllowFurtherAction(false);
			// Reusing id of deleted elements
			let finalID = 0;
			if (deletedIDList.length > 0) {
				finalID = 'var-' + deletedIDList.shift();
			} else {
				finalID = 'var-' + varID;
				varID += 1;
			}
			addVariableElement(finalID);
		});
		
		// Update when user unfocus the expression input, or click the done button
		$exprInModal.on('blur', (e) => {
			update();
		});
		
		$setVariableDoneBtn.on('click', (e) => {
			update();
		});
		
		$waveBtnInModal.on('click', function() {
			WV.toggleDisplay(true);
		});
		
		$resetZoomBtnInModal.on('click', function() {
			WV.resetZoom(true);
		});
	}
	
	return {setVariables, wireEvents}
}





