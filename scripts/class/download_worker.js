const DownloadWorker = `
    self.onmessage = function(e) {
        const { midi, expr, vars, adsr, ignoreADSR, duration, SAMPLE_RATE} = e.data;
        const frequency = 440 * Math.pow(2, (midi - 69) / 12);
        const buffer = generateAudioBufferWorker(frequency, expr, vars, adsr, ignoreADSR, duration, SAMPLE_RATE);
        self.postMessage({ midi, buffer });
    };

    function generateAudioBufferWorker(frequency, expr, vars, adsr, ignoreADSR, duration, SAMPLE_RATE) {
        const sampleRate = SAMPLE_RATE; // Lower sample rate for faster generation
        const attack = ignoreADSR ? 0.001 : adsr[0];
        const decay = ignoreADSR ? 0.001 : adsr[1];
        const sustain = ignoreADSR ? 1.0 : adsr[2];
        const release = ignoreADSR ? 0.001 : adsr[3];
        
        const totalDuration = duration + release;
        const totalSamples = Math.ceil(totalDuration * sampleRate);
        const samples = new Float32Array(totalSamples);
        
        try {
            const func = new Function('t', 'f', 'freq', 'vars', 'Math', 
                'with(vars) { return ' + expr + '; }');
            
            for (let i = 0; i < totalSamples; i++) {
                const t = i / sampleRate;
                let envelope = 1.0;
                
                if (!ignoreADSR) {
                    if (t < duration) {
                        if (t < attack) envelope = t / attack;
                        else if (t < attack + decay) envelope = 1 - (1 - sustain) * ((t - attack) / decay);
                        else envelope = sustain;
                    } else {
                        const releaseTime = t - duration;
                        if (releaseTime < release) envelope = sustain * (1 - releaseTime / release);
                        else envelope = 0;
                    }
                }
                
                const val = func(t, 2 * Math.PI * frequency, frequency, vars, Math) || 0;
                samples[i] = 0.08 * val * envelope;
            }
        } catch (error) {
            // Silence on error
        }
        
        return samples;
    }
`;