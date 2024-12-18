export function detectAudioFontFingerprinting() {
    const trackingResults = {
        audio: { found: false, details: [] },
        fonts: { found: false, details: [] },
    };

    // --- Audio Fingerprinting Detection ---
    (function () {
        const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
        const originalAudioContextConstructor = AudioContext;

        AudioContext.prototype.createAnalyser = function () {
            trackingResults.audio.found = true;
            trackingResults.audio.details.push("AudioContext used for fingerprinting (createAnalyser called)");
            console.log("AudioContext fingerprinting attempt detected (createAnalyser)");

            return originalCreateAnalyser.apply(this, arguments);
        };

        // Override the AudioContext constructor itself to detect when it is created
        const modifiedAudioContext = function() {
            trackingResults.audio.found = true;
            trackingResults.audio.details.push("AudioContext constructor used for fingerprinting");
            console.log("AudioContext fingerprinting attempt detected (constructor)");

            return new originalAudioContextConstructor(...arguments);
        };

        // Replace the AudioContext constructor with the modified one
        window.AudioContext = modifiedAudioContext;
    })();

    // --- Font Fingerprinting Detection ---
    (function () {
        const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;

        CanvasRenderingContext2D.prototype.measureText = function () {
            trackingResults.fonts.found = true;
            trackingResults.fonts.details.push("Canvas font measurement used for fingerprinting");
            console.log("Font fingerprinting attempt detected (measureText called)");

            return originalMeasureText.apply(this, arguments);
        };

        // Check for inline font measurement by adding a div and measuring it with canvas
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (el) {
            if (el && el instanceof HTMLElement && el.style && el.style.fontFamily) {
                trackingResults.fonts.found = true;
                trackingResults.fonts.details.push("Inline font measurement detected");
                console.log("Font fingerprinting attempt detected (getComputedStyle inline font)");
            }
            return originalGetComputedStyle.apply(this, arguments);
        };
    })();

    // --- Detect Script Tags for Fingerprinting ---
    (function () {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.textContent.includes('AudioWorkletNode') || script.textContent.includes('measureText')) {
                if (!trackingResults.audio.found) {
                    trackingResults.audio.found = true;
                    trackingResults.audio.details.push("Script containing audio fingerprinting code detected");
                    console.log("Fingerprinting script detected in script tag: ",script.textContent);
                }
                if (!trackingResults.fonts.found) {
                    trackingResults.fonts.found = true;
                    trackingResults.fonts.details.push("Script containing font fingerprinting detected");
                    console.log("Font fingerprinting script detected in script tag: ",script.textContent);
                }
            }
        }
    })();

    return trackingResults;
}
