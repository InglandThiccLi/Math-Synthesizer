const SynthProcessor = `
class SynthProcessor extends AudioWorkletProcessor {
	constructor(){
		super();
		this.sampleRate = sampleRate;
		this.sampleCounter = 0;
		this.voices = [];
		this.vars = {};
		this.adsr = [];
		this.volume = 1;
		this.exprFunc = (t, f, freq, vars, Math) => 0;

		this.port.onmessage = e => {
			const d = e.data;
			if(d.type==='expr'){ 
				try{ 
					this.exprFunc = new Function('t', 'f', 'freq', 'vars', 'Math', 
					'with(vars) { return ' + d.expr + '; }');
					this.port.postMessage({type:'normal',message:'ok'});
				}catch(err){ 
					this.port.postMessage({type:'error',message:err.message});
				}
			}
			else if(d.type==='vars'){ 
				this.vars = Object.assign({}, d.vars);
			}
			else if(d.type==='adsr'){
				this.adsr = d.adsr;
			}
			else if (d.type==='volume') {
				this.volume = d.volume;
			}
			else if(d.type==='noteOn'){ 
				const start = Math.max(0,Math.floor(d.time*this.sampleRate)); 
				this.voices.push({
					id:d.id,
					freq:d.freq,
					startSample:start,
					vel:d.vel||1,
					releaseSample:null,
					env:{
						attack:this.adsr[0],
						decay:this.adsr[1],
						sustain:this.adsr[2],
						release:this.adsr[3]
					},
					releaseAmp:null
				});
			}
			else if(d.type==='noteOff'){ 
				const v=this.voices.find(v=>v.id===d.id); 
				if(v&&v.releaseSample===null) {
					v.releaseSample=Math.floor(d.time*this.sampleRate);
				}
			}
		};
	}

	process(inputs, outputs){
		const out = outputs[0];
		const chCount = out.length;
		const frames = out[0].length;

		for(let i=0; i<frames; i++){
			const g = this.sampleCounter + i;
			let mix = 0;

			for(let j=this.voices.length-1; j>=0; j--){
				const v = this.voices[j];
				const t = (g - v.startSample)/this.sampleRate;
				if(t < 0) continue;

				const env = v.env;
				let amp;
				
				if(v.releaseSample===null){
					if(t < env.attack) amp = t/env.attack;
					else if(t < env.attack + env.decay) amp = 1 - (1-env.sustain)*((t-env.attack)/env.decay);
					else amp = env.sustain;
				} else {
					const relT = (g - v.releaseSample)/this.sampleRate;
					if(v.releaseAmp===null){
						const tOnRel = (v.releaseSample - v.startSample)/this.sampleRate;
						if(tOnRel < env.attack) v.releaseAmp = tOnRel/env.attack;
						else if(tOnRel < env.attack+env.decay) v.releaseAmp = 1 - (1-env.sustain)*((tOnRel-env.attack)/env.decay);
						else v.releaseAmp = env.sustain;
					}
					amp = v.releaseAmp * Math.max(0,1 - relT / env.release);
					if(relT >= env.release){ 
						this.voices.splice(j,1); 
						continue; 
					}
				}

				let val = 0;
				try{
					val = this.exprFunc(t, 2*Math.PI*v.freq, v.freq, this.vars, Math) || 0; 
				}catch(e){ 
					val = 0;
				}

				mix += 0.08 * val * amp * v.vel * this.volume;
			}

			mix = Math.tanh(mix);

			for(let ch=0; ch<chCount; ch++){
				out[ch][i] = mix;
			}
		}
		this.sampleCounter += frames;
		return true;
	}
}

registerProcessor('math-synth-processor', SynthProcessor);
`