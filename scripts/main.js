function loadClosures() {
    UT = utilities();
	AM = audioManager();
	WV = waveVisualizer();
	INST = instrumentsModal();
	VARS = variablesModal();
    ADSR = adsrModal();
    IMEX = importExportModal();
    DOWN = downloadModal();
    HELP = helpAndWelcomeModal();
	PIANO = piano();
	EV = events();
}

function init() {
	// Initialize with default expression and variables
    AM.sendExpr(originalExpr);
    AM.sendVars(originalVarString);
    AM.sendADSR(originalADSRString);
	
	// Load settings and instruments, and display them
	const [volume, pitch, octave] = UT.loadSettings();
	
    $volume.val(volume);
    $volumeText.html(parseInt(volume*100)+'%');
	
    $pitch.val(pitch);
    $pitchText.html(pitch+'Hz');
	
    $octaves.prop('checked', false);
    $('#octave'+octave).prop('checked', true);
	
    const octaveValue = parseInt($('input[name="octave"]:checked').val());
    baseMIDI = (octaveValue + 1) * 12;
	
    INST.loadInstruments();
    INST.selectInstrument($('#'+UT.loadCurrentInstrument()), true);

    // Showing welcome modal if not hidden by user
    if (localStorage.getItem('hideWelcomeModal') != 'true') {
        $('#welcomeModal').modal('show');
    }
}

$(function () {
    // Load closures
    loadClosures();

    // Wire all events
    EV.wireEvents();

    // Initialize
    init();

    // Resize and build piano
    PIANO.handlePianoResize();
});