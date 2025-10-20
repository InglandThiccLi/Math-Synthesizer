# Math Synthesizer
A web-based synthesizer that generates sounds from mathematical expressions. Create unique instruments by writing mathematical formulas and explore the relationship between math and sound.

Click HERE to start experimenting!

## Features
### 🎹 Mathematical Sound Generation
-   Write mathematical expressions to define sound waveforms
-   Use predefined variables (`t`, `f`, `freq`) and constants (`e`, `pi`)
-   Full access to Math.js functions without the `Math` prefix
-   Real-time audio synthesis using Web Audio API

### 🎛️ Custom Instruments
-   Built-in instrument library with examples
-   Create and save custom instruments
-   Import/export instruments as JSON files
-   Easy instrument management with rename and delete functions

### 🎚️ Advanced Controls
-   **ADSR Envelope**: Control Attack, Decay, Sustain, and Release parameters
-   **Custom Variables**: Define your own variables for complex expressions
-   **Real-time Visualizer**: Waveform display with zoom and pan controls
-   **Multi-octave Piano**: Full keyboard from C0 to C9

### 💾 Export Options
-   Download individual notes as WAV files
-   Batch export all notes (C0-C9) as ZIP files
-   Option to include or exclude ADSR envelope in exports
-   Configurable duration and frequency settings

### 🎮 Multiple Input Methods
-   Computer keyboard piano controls
-   Mouse/touch piano interface
-   Responsive design for all devices

## Quick Start

1.  **Click the "Turn On" button** to activate the synthesizer
2.  **Select an instrument** from the built-in library
3.  **Play notes** using your computer keyboard, mouse, or touch
4.  **Experiment** with different mathematical expressions

## Expression Guide

### Basic Syntax
    // JavaScript
    
    // Simple sine wave
    sin(f*t)
    
    // Complex waveform with harmonics
    0.5*sin(f*t) + 0.3*sin(2*f*t) + 0.2*sin(3*f*t)
    
    // Exponential decay
    exp(-t*freq*0.004)*sin(f*t)

### Available Variables
-   `t` - Time (seconds)
-   `f` - Frequency × 2π (for direct use in trigonometric functions)
-   `freq` - Raw frequency (Hz)

### Supported Functions
All [Math.js](https://www.w3schools.com/js/js_math_reference.asp) functions are available:
-   Trigonometric: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`,`sinh`,`cosh`,`tanh`
-   Other: `exp`,`pow`,`log`, `log10`, `sqrt`,`abs`, `floor`, `ceil`, `round`, `min`, `max`,`random`

## Instrument System

### Built-in Instruments
-   Pre-configured mathematical expressions
-   Examples to learn from and modify
-   Cannot be edited or deleted

### Custom Instruments
-   Create your own instruments from any expression
-   Save combinations of expressions, variables, and ADSR settings
-   Export/import for sharing
-   Full rename and delete capabilities

## ADSR Envelope
Control the amplitude envelope of your sounds:
-   **Attack**: How quickly the sound reaches maximum amplitude
-   **Decay**: How quickly it transitions to sustain level
-   **Sustain**: The steady amplitude while holding a note
-   **Release**: How quickly the sound fades after note release

## Import/Export

### Exporting Instruments
-   Export any instrument (built-in or custom) as JSON
-   Perfect for backup and sharing

### Importing Instruments
-   Import valid JSON instrument files
-   Automatic validation and duplicate prevention

## Download Options

### Single Note Export
-   Generate WAV files for specific frequencies and durations
-   Option to ignore ADSR

### Batch Export
-   Export all notes from C0 to C9 as a ZIP file
-   Progress indicator for long generation tasks
-   Option to ignore ADSR

## Frequently Asked Questions

### ❓ Why isn't my expression producing any sound?
-   Check for syntax errors (expression input box will be highlighted in red)
-   Ensure all variables are defined in the Variables modal
-   Verify you're using valid Math.js functions without the `Math` prefix

### ❓ Can I use my own mathematical functions?
Currently, only the functions provided by Math.js are supported. You cannot define custom functions, but you can create complex expressions using the available functions.

### ❓ Why does the sound sometimes lag or cut out?
This can happen with:
-   Very complex mathematical expressions
-   Long release times with rapid note playing
-   Limited system resources

Try simplifying your expression or reducing the ADSR release time.

### ❓ How do I share my custom instruments with others?
Use the Export feature in the Import/Export modal to download your instrument as a JSON file. Others can import this file using the Import function.

### ❓ What's the difference between `f` and `freq`?
-   `freq` is the raw frequency in Hz (440 for A4)
-   `f` is `freq × 2π`, ready for use in trigonometric functions
-   Use `sin(f*t)` instead of `sin(2*π*freq*t)`

### ❓ Can I use the synthesizer offline?
Yes! Read the Running Locally section.

### ❓ What browsers are supported?
-   Chrome/Chromium (recommended)
-   Firefox
-   Safari
-   Edge

The app requires support for Web Audio API and modern JavaScript features.

## Technical Details
-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
-   **UI Framework**: Bootstrap 5
-   **Audio Engine**: Web Audio API with AudioWorklet
-   **Math Processing**: Math.js library
-   **Export**: WAV encoding, JSZip for batch exports

## Running Locally
1.  Install [Python](https://www.python.org/).
2.  Clone or download this repository
3.  In the root folder, open a terminal and run `python -m http.server`
4.  Go to http://localhost:8000/index.html using a modern web browser
5.  Done!

## License
This project is open source and available under the MIT License.

----------
_Create, experiment, and explore the mathematical beauty of sound!_ 🎶