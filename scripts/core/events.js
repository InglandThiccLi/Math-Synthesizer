function events() {
	/* Private Functions */
	
    function wireWindowEvents() {
        $window.on('resize', (e) => { 
            PIANO.handlePianoResize();
            WV.scheduleWaveResize();
        });
        $window.on('blur', (e) => { PIANO.stopAllSound(); });
    }
    
    function wirePianoEvents() {
        function turnOn() {
            $expr.prop('disabled', false);
            $instrumentDropdownTitle.prop('disabled', false);
            $funcBtns.prop('disabled', false);
            $octaves.prop('disabled', false);
            $volume.prop('disabled', false);
            $pitch.prop('disabled', false);
            $waveBtns.prop('disabled', false);
            
            $showPianoBtn.toggle();
            $piano.toggle();
            allowKeyboardPlaying = true;
            pianoShown = true;
        }
        
        $document.on('pointerdown', function (e) {
            const el = e.target.closest('.key');
            if (!el) return;
            e.preventDefault();
            const midi = Number(el.dataset.midi);
            PIANO.pointerStart(e.pointerId, midi);
        });
        
        $document.on('pointermove', function (e) {
            const p = activePointers[e.pointerId];
            if (!p) return;
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const key = el && el.closest('.key');
            if (!key) return;
            const midi = Number(key.dataset.midi);
            if (midi !== p.midi) PIANO.pointerChange(e.pointerId, midi);
        });
        
        $document.on('pointerup', function (e) {
            if (activePointers[e.pointerId]) PIANO.pointerEnd(e.pointerId);
        });
        
        $document.on('pointercancel', function (e) {
            if (activePointers[e.pointerId]) PIANO.pointerEnd(e.pointerId);
        });
        
        $document.on('keydown', function (e) {
            if (e.repeat || !allowKeyboardPlaying || !pianoShown) return;
            PIANO.keyDown(e.code);
        });
        
        $document.on('keyup', function (e) {
            PIANO.keyUp(e.code);
        });
        
        $showPianoBtn.on('click', async function () {
            if (!audioCtx) await AM.init();
            turnOn();
        });
    }
    
    function wireInputEvents() {
		let timeOut;
		
        $volume.on('input', (e) => {
            $volumeText.html(parseInt($volume.val() * 100) + '%');
        });
        
        $pitch.on('input', (e) => {
            $pitchText.html($pitch.val() + 'Hz');
        });
        
        $volume.on('change', (e) => {
            localStorage.setItem('volume', $volume.val());
            AM.sendVolume($volume.val());
        });
        
        $pitch.on('change', (e) => {
            localStorage.setItem('pitch', $pitch.val());
            AM.setPitch($pitch.val());
        });
        
        $octaves.on('change', (e) => {
            const octave = parseInt($('input[name="octave"]:checked').val());
            localStorage.setItem('octave', octave);
            baseMIDI = (octave + 1) * 12;
            PIANO.buildKeyboard();
        });
		
        $expr.on('input', function() {
            expression = $(this).val();
            clearTimeout(timeOut);
            timeOut = setTimeout(() => {
                AM.sendExpr(expression);
                WV.scheduleWaveUpdate();
            }, 100);
        });
        
        $expr.on('change', function () {
            INST.setModified(($(this).val() != originalExpr));
        });
        
        $exprInModal.on('change', function () {
            clearTimeout(timeOut);
            timeOut = setTimeout(() => {
                AM.sendExpr($(this).val());
                WV.scheduleWaveUpdate();
            }, 100);
        });
        
        $inputTextAndNumber.on('focus', function () {
            allowKeyboardPlaying = false;
        });
        
        $inputTextAndNumber.on('blur', function () {
            allowKeyboardPlaying = true;
        });
        
        $waveBtns.on('click', function() {
            WV.toggleDisplay(false);
        });
        
        $resetZoomBtn.on('click', function() {
            WV.resetZoom(false);
        });
    }
    
    function wireModalEvents() {
        const btnList = ['inst', 'vars', 'adsr', 'imex', 'down'];
        btnList.forEach((name) => {
            $('#' + name + 'Btn,' + '#' + name + 'ModalSwitch').on('click', (e) => {
                $('#' + name + 'ModalSwitch').prop("checked", true);
                $('.main-modal-content').addClass('d-none');
                $('#' + name + 'Modal').removeClass('d-none');
                if (name === 'vars') {
                    $exprInModal.val($expr.val());
                    WV.scheduleWaveUpdate();
                };
            });
        });
        
        INST.wireEvents();
        VARS.wireEvents();
        ADSR.wireEvents();
        IMEX.wireEvents();
        DOWN.wireEvents();
        HELP.wireEvents();
    }
    
	
	
	/* Public Functions */
	
    function wireEvents() {
        wireWindowEvents();
        wirePianoEvents();
        wireInputEvents();
        wireModalEvents();
    }
    
    return {wireEvents};
}