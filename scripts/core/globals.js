/* Constants */
const RESERVED_KEYWORDS = new Set([
    'arguments', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 
    'debugger', 'default', 'delete', 'do', 'else', 'enum', 'eval', 'export', 'extends', 
    'false', 'final', 'finally', 'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 
    'let', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 
    'this', 'throw', 'true', 'try', 'typeof', 'using', 'var', 'void', 'while', 'with', 'yield',
    'Math', 't', 'f', 'freq', 'e', 'pi', 'E', 'LN2', 'LN10', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2' // Add existing reserved names
]);

// Add Math.js function names to reserved list
const MATH_FUNCTIONS = Object.getOwnPropertyNames(Math).filter(prop => typeof Math[prop] === 'function');
MATH_FUNCTIONS.forEach(func => RESERVED_KEYWORDS.add(func));

const KEY_BINDINGS = {
    "KeyZ": 0, // C
    "KeyS": 1, // C#
    "KeyX": 2, // D
    "KeyD": 3, // D#
    "KeyC": 4, // E
    "KeyV": 5, // F
    "KeyG": 6, // F#
    "KeyB": 7, // G
    "KeyH": 8, // G#
    "KeyN": 9, // A
    "KeyJ": 10, // A#
    "KeyM": 11, // B
    "Comma": 12,
    "KeyL": 13,
    "Period": 14,
    "Semicolon": 15,
    "Slash": 16,
    "KeyQ": 17,
    "Digit2": 18,
    "KeyW": 19,
    "Digit3": 20,
    "KeyE": 21,
    "Digit4": 22,
    "KeyR": 23,
    "KeyT": 24,
    "Digit6": 25,
    "KeyY": 26,
    "Digit7": 27,
    "KeyU": 28,
    "KeyI": 29,
    "Digit9": 30,
    "KeyO": 31,
    "Digit0": 32,
    "KeyP": 33,
    "Minus": 34,
    "BracketLeft": 35,
    "BracketRight": 36,
};

const KEY_HINTS = ['Z', 'S', 'X', 'D', 'C', 'V', 'G', 'B', 'H', 'N', 'J', 'M', ',', 'L', '.', ';', '/','Q', '2', 'W', '3', 'E', '4', 'R', 'T', '6', 'Y', '7', 'U', 'I', '9', 'O', '0', 'P', '-', '[', ']'];

const WHITE_SEMIS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 29, 31, 33, 35, 36];
const BLACK_SEMIS = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22, 25, 27, 30, 32, 34];
const BLACK_WHITE_MAP = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SAMPLE_RATE = 44100;



/* Variables */
// Instrument
const instrumentIDList = ['instrument-Sine', 'instrument-Sawtooth', 'instrument-Square', 'instrument-Triangle', 
'instrument-Harmonics', 'instrument-Exp-Decay', 'instrument-FM-Synth', 'instrument-AM-Synth','instrument-Organ']; // Avoid creating instrument with same id
let currentInstrument = 'Sine';
let expression = 'sin(f*t)';
let originalExpr = 'sin(f*t)';
let varString = '';
let originalVarString = '';
let ADSRString = '0.01,0.12,0.9,0.12';
let originalADSRString = '0.01,0.12,0.9,0.12';

// Audio
let audioCtx;
let baseMIDI = 48;
let basePitch = 440;

// Piano
let activePointers = {};
let activeKeys = {};
let pianoShown = false;

// Display
let displaySizeLevel;

// Control
let forceFocus = false;
let allowKeyboardPlaying = false;



/* Closures */
let UT;
let AM;
let WV;
let INST;
let VARS;
let ADSR;
let IMEX;
let DOWN;
let HELP;
let PIANO;
let EV;



/* Elements */
// General
const $window = $(window);
const $document = $(document);
const $inputTextAndNumber = $('input[type="text"],input[type="number"]');


// Main
const $expr = $('#expr');
const $varsDisplay = $('#varsDisplay');
const $instrumentDropdownTitle = $('#instrumentDropdownTitle');
const $instrumentBtns = $('#instrumentList > span, #builtInInsts > div > button, #instrumentDropdownList > li');

const $funcBtns = $('#funcCol>div>button');

const $octaves = $('input[name="octave"]');
const $volume = $('#volume');
const $volumeText = $('#volumeText');
const $pitch = $('#pitch');
const $pitchText = $('#pitchText');
const $waveBtns = $('#waveBtn1,#waveBtn2');

const $waveVisualizerRow = $('#waveVisualizerRow');
const $resetZoomBtn = $('#resetZoomBtn');
const $timeRange = $('#timeRange');

const $showPianoBtn = $('#showPianoBtn');
const $piano = $('#piano');


// Modal
const $currentInstrument = $('#currentInstrument');
const $builtInInsts = $('#builtInInsts');
const $instTypeSwitch = $('input[name="instTypeSwitch"]');
const $customInstBtn = $('#customInstBtn');
const $customInsts = $('#customInsts');
const $addInstBtn = $('#addInstBtn');
const $addInstDoneBtn = $('#addInstDoneBtn');
const $instrumentSine = $('#instrument-Sine');
const $instrumentList = $('#instrumentList');
const $instrumentDropdownList = $('#instrumentDropdownList');

const $exprInModal = $('#exprInModal');
const $waveBtnInModal = $('#waveBtnInModal');
const $waveVisualizerRowInModal = $('#waveVisualizerRowInModal');
const $resetZoomBtnInModal = $('#resetZoomBtnInModal');
const $timeRangeInModal = $('#timeRangeInModal');
const $varsContainer = $('#varsContainer');
const $addVarBtn = $('#addVarBtn');
const $setVariableDoneBtn = $('#setVariableDoneBtn');

const $attack = $('#attack');
const $decay = $('#decay');
const $sustain = $('#sustain');
const $release = $('#release');
const $attackText = $('#attack-text');
const $decayText = $('#decay-text');
const $sustainText = $('#sustain-text');
const $releaseText = $('#release-text');

const $importBtn = $('#importBtn');
const $exportBtn = $('#exportBtn');

const $isDownloadAll = $('#isDownloadAll');
const $isIgnoreADSR = $('#isIgnoreADSR');
const $downloadFrequency = $('#downloadFrequency');
const $downloadDuration = $('#downloadDuration');
const $downloadProgress = $('#downloadProgress');
const $downloadProgressBar = $('#downloadProgressBar');
const $downloadProgressText = $('#downloadProgressText');
const $downloadBtn = $('#downloadBtn');

const $welcomeModal = $('#welcomeModal');
const $btnCloseWelcomeModal = $('.btn-close-welcome-modal');
const $noShowCheckbox = $('#noShowCheckbox');

const $helpModal = $('#helpModal');
const $helpNavItems = $('.help-nav-item');
const $generalSection = $('#general-section');
const $helpSections = $('.help-section');