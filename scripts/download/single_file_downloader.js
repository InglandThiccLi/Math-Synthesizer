function singleFileDownloader(WAV) {
    /* Public Functions */

    // Step 1: Generate audio buffer for a given frequency and duration
    function generateAudioBuffer(frequency, ignoreADSR, duration) {
        const sampleRate = SAMPLE_RATE;

        // Parse ADSR values
        // If value not exist, use default values
        // If ignoreADSR, use minimal values
        const attack = ignoreADSR ? 0.001 : parseFloat($attack.val()) || 0.01;
        const decay = ignoreADSR ? 0.001 : parseFloat($decay.val()) || 0.12;
        const sustain = ignoreADSR ? 1.0 : parseFloat($sustain.val()) || 0.9;
        const release = ignoreADSR ? 0.001 : parseFloat($release.val()) || 0.12;
        
        // Calculate total samples
        const totalDuration = duration + release;
        const totalSamples = Math.ceil(totalDuration * sampleRate);
        
        // Create AudioBuffer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, totalSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Get expression and variables
        const expr = expression;
        const vars = UT.parseVariableString(varString);
        
        // Pre-compile the function
        let func;
        try {
            const transformedExpr = UT.transformExpr(expr);
            func = new Function('t', 'f', 'freq', 'vars', 'Math', 
                `with(vars) { return ${transformedExpr}; }`);
        } catch (error) {
            // Return silent buffer if expression is invalid
            return buffer;
        }
        
        // Envelope calculation
        const attackEnd = attack;
        const decayEnd = attack + decay;
        const releaseStart = duration;
        const releaseEnd = duration + release;
        
        // Generate samples
        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate;
            let envelope = 1.0;
            
            if (!ignoreADSR) {
                if (t < attackEnd) {
                    envelope = t / attack;
                } else if (t < decayEnd) {
                    envelope = 1 - (1 - sustain) * ((t - attack) / decay);
                } else if (t < releaseStart) {
                    envelope = sustain;
                } else if (t < releaseEnd) {
                    const releaseTime = t - releaseStart;
                    envelope = sustain * (1 - releaseTime / release);
                } else {
                    envelope = 0;
                }
            }
            
            try {
                const val = func(t, 2 * Math.PI * frequency, frequency, vars, Math) || 0;
                channelData[i] = 0.08 * val * envelope;
            } catch (error) {
                channelData[i] = 0; // No sound if error
            }
        }
        
        return buffer;
    }

    // Step 2: Convert AudioBuffer to WAV Blob
    function audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length;
        
        // Interleave channels
        const interleaved = new Float32Array(length * numChannels);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                interleaved[i * numChannels + channel] = channelData[i];
            }
        }

        return WAV.encodeWAV(interleaved, numChannels, sampleRate);
    }

    // Step3: Download Blob as file
    function downloadBlob(blob, filename) {
        // Use FileSaver.js if available
        if (window.saveAs) {
            window.saveAs(blob, filename);
        } 
        // Otherwise, use standard method
        else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
    }

    // Download a single note as wav file
    function download(frequency, ignoreADSR, duration) {
        // Show progress even for single note
        $downloadProgress.removeClass('d-none');
        $downloadProgressText.text('Generating audio...');
        
        setTimeout(() => {
            const audioBuffer = generateAudioBuffer(frequency, ignoreADSR, duration);
            const wavBlob = audioBufferToWav(audioBuffer);
            const fileName = `${currentInstrument}_${frequency}Hz_${duration}s${ignoreADSR?'':'_adsr'}.wav`;
            
            downloadBlob(wavBlob, fileName);
            $downloadProgress.addClass('d-none');
        }, 100);
    }

    return { generateAudioBuffer, audioBufferToWav, downloadBlob, download };
}
    
    
