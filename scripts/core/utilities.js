function utilities() {

    /* Checkers */
    function isValidInstrumentID(id) {
        // Check if name consists only of English letters, numbers and "-", starts with a letter
        if (/^[a-zA-Z-][a-zA-Z0-9-]*$/.test(id)) {
            return true;
        }
    }
    
    function isValidVariableName(name) {
        // Check if name consists only of English letters, numbers and "_", starts with a letter
        // Plus, not a reserved keyword
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && !RESERVED_KEYWORDS.has(name)) {
            return true;
        }
        return false;
    }

    
    /* Parsers and transformers */
    function midiToFreq(m) { return basePitch * Math.pow(2, (m - 69) / 12); }

    function nameToID(name) { return 'instrument-'+name.replace(/ /g, '-'); }

    function transformExpr(s) {
        if (!s) s = '0';
        s = s.replace(/\^/g, '**');
        s = s.replace(/\b(pi|e)\b/gi, m => m.toLowerCase() === 'pi' ? 'Math.PI' : 'Math.E');
        s = s.replace(/\b(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|exp|log|log1p|log2|log10|sqrt|cbrt|abs|min|max|floor|ceil|round|fround|f16round|trunc|sign|pow|random|hypot|expm1|clz32|imul)\b/gi, 'Math.$1');
        return s;
    }
    
    function parseVariableString(s) {
        const vars = {};
        let ok = true;
        if (!s || s.trim() === '') return vars;
        
        s.split(',').map(x => x.trim()).filter(Boolean).forEach(p => {
            const m = p.split('=').map(z => z.trim());
            if (m.length === 2 && m[0] && !isNaN(parseFloat(m[1]))) {
                const varName = m[0];
                const value = parseFloat(m[1]);
                
                if (isValidVariableName(varName)) {
                    vars[varName] = value;
                } else {
                    console.warn(`Invalid variable name: ${varName}.`);
                    ok = false;
                }
            } else {
                console.warn(`Invalid variable format.`);
                ok = false;
            }
        });
        if (ok) return vars;
        else return null;
    }
        
    function parseADSRString(s) {
        let adsr = [0.01, 0.12, 0.9, 0.12];
        if (s && s != '') {
            adsr = s.split(',');
            try {
                if (adsr[0] && adsr[1] && adsr[2] && adsr[3]) {
                    const a = parseFloat(adsr[0]);
                    const d = parseFloat(adsr[1]);
                    const s = parseFloat(adsr[2]);
                    const r = parseFloat(adsr[3]);
                    
                    if (isNaN(a) || isNaN(d) || isNaN(s) || isNaN(r)) {
                        console.warn('ADSR values are not numbers. Require numbers within range 0.01 < a < 2, 0 < d < 1, 0 < s < 1, 0.01 < r < 3');
                        return null;
                    }
                    
                    if (a < 0.01 || a > 2 || d < 0 || d > 1 || s < 0 || s > 1 || r < 0.01 || r > 3) {
                        console.warn('ADSR values out of range. Allowed range: 0.01 < a < 2, 0 < d < 1, 0 < s < 1, 0.01 < r < 3');
                        return null;
                    }
                    
                    return [a,d,s,r];
                } else {
                    console.warn('ADSR string is not completed. It should contain 4 numbers separated by 3 commas.');
                    return null;
                }
            } catch (e) {
                console.warn(e);
                return null;
            }
        } else {
            return adsr;
        }
    }
	
	
	/* Save and Load */
	function saveInstruments(insts) {
		const data = JSON.stringify(insts);
		localStorage.setItem('instruments', data);
	}
	
	function saveCurrentInstrument() {
		localStorage.setItem('currentInstrument', UT.nameToID(currentInstrument));
	}
	
	function loadSettings() {
		return [
			localStorage.getItem('volume')||1, 
			localStorage.getItem('pitch')||440, 
			localStorage.getItem('octave')||3
		];
	}
	
	function loadInstruments() {
		return localStorage.getItem('instruments');
	}
	
	function loadCurrentInstrument() {
		return localStorage.getItem('currentInstrument') || nameToID('Sine');
	}
    
    return { 
		isValidInstrumentID, isValidVariableName, midiToFreq, nameToID, 
		transformExpr, parseVariableString, parseADSRString,
		saveInstruments, saveCurrentInstrument, loadSettings, loadInstruments, loadCurrentInstrument
	};
}