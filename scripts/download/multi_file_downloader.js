function multiFileDownloader(WAV, SFD) {

    /* Private Functions */

    // Get note name from MIDI number
    function getNoteName(midi) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const noteIndex = midi % 12;
        return noteNames[noteIndex] + octave;
    }
    
    // Update progress bar
    function updateProgress(completed, total) {
        const percent = Math.round((completed / total) * 100);
        $downloadProgressBar.css('width', percent + '%').attr('aria-valuenow', percent);
        $downloadProgressText.text(`Generating ${completed}/${total} notes...`);
    }

    // Method 1: Process notes in with Web Workers
    function processNotesWithWorkers(notes, folder, ignoreADSR, duration, zip) {
        const blob = new Blob([DownloadWorker], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        let completed = 0;
        const total = notes.length;
        const workers = [];
        const activeWorkers = 4; // Number of parallel workers
        
        // Get current expression and variables once
        const expr = UT.transformExpr(expression);
        const vars = UT.parseVariableString(varString);
        const adsr = UT.parseADSRString(ADSRString) || [0.01, 0.12, 0.9, 0.12];
        
        // Start a new worker for a given MIDI note
        function startWorker(midi) {
            const worker = new Worker(workerUrl);
            workers.push(worker);
            
            // When worker finishes processing
            worker.onmessage = function(e) {
                const { midi, buffer } = e.data;
                const noteName = getNoteName(midi);
                const wavBlob = WAV.float32ArrayToWav(buffer, SAMPLE_RATE);
                folder.file(`${noteName}.wav`, wavBlob);
                
                completed++;
                updateProgress(completed, total);
                
                worker.terminate();
                const index = workers.indexOf(worker);
                if (index > -1) workers.splice(index, 1);
                
                if (completed === total) {
                    finishZip();
                } else if (notes.length > 0) {
                    startWorker(notes.shift());
                }
            };
            
            // Post data to worker
            worker.postMessage({ midi, expr, vars, adsr, ignoreADSR, duration, SAMPLE_RATE});
        }
        
        // Start initial batch of workers
        for (let i = 0; i < Math.min(activeWorkers, total); i++) {
            if (notes.length > 0) {
                startWorker(notes.shift());
            }
        }
        
        // Finish ZIP and trigger download
        function finishZip() {
            $downloadProgressText.text('Creating ZIP file...');
            zip.generateAsync({type: "blob"}).then(function(content) {
                SFD.downloadBlob(content, `${currentInstrument}_all_${duration}s${ignoreADSR?'':'_adsr'}.zip`);
                $downloadProgress.addClass('d-none');
                URL.revokeObjectURL(workerUrl);
            });
        }
    }

    // Method 2: Process notes in batches using traditional setTimeout
    function processNotesInBatches(notes, folder, ignoreADSR, duration, zip) {
        const BATCH_SIZE = 3; // Smaller batch size for better responsiveness
        let index = 0;
        
        // Process a batch of notes
        function processBatch() {
            const batch = notes.slice(index, index + BATCH_SIZE);
            let batchCompleted = 0;
            
            // Process each note in the batch
            batch.forEach(midi => {
                setTimeout(() => {
                    const frequency = UT.midiToFreq(midi);
                    const noteName = getNoteName(midi);
                    const audioBuffer = SFD.generateAudioBuffer(frequency, ignoreADSR, duration);
                    const wavBlob = SFD.audioBufferToWav(audioBuffer);
                    
                    folder.file(`${noteName}.wav`, wavBlob);
                    batchCompleted++;
                    
                    // When batch is completed
                    if (batchCompleted === batch.length) {
                        index += BATCH_SIZE;
                        updateProgress(index, notes.length);
                        
                        // Process next batch or finish
                        if (index < notes.length) {
                            setTimeout(processBatch, 10);
                        } else {
                            finishZip();
                        }
                    }
                }, 0);
            });
        }
        
        // Finish ZIP and trigger download
        function finishZip() {
            $downloadProgressText.text('Creating ZIP file...');
            zip.generateAsync({type: "blob"}).then(function(content) {
                SFD.downloadBlob(content, `all_notes_${duration}s${ignoreADSR?'':'_adsr'}.zip`);
                $downloadProgress.addClass('d-none');
            });
        }
        
        processBatch();
    }



    /* Public Functions */

    // Download all the notes as zip file
    function download(ignoreADSR, duration) {
        const zip = new JSZip();
        const notesFolder = zip.folder("notes");
        const midiNotes = [];
        
        // Generate all MIDI notes from C0 (12) to C9 (120)
        for (let midi = 12; midi <= 120; midi++) {
            midiNotes.push(midi);
        }

        // Show progress
        $downloadProgress.removeClass('d-none');
        $downloadProgressBar.css('width', '0%').attr('aria-valuenow', 0);
        $downloadProgressText.text('Preparing...');

        // Use Web Workers for parallel processing if available
        if (window.Worker) {
            processNotesWithWorkers(midiNotes, notesFolder, ignoreADSR, duration, zip);
        } else {
            processNotesInBatches(midiNotes, notesFolder, ignoreADSR, duration, zip);
        }
    }

    return { download };
}