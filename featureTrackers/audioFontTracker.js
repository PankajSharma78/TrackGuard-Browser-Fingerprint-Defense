export function detectAudioFontFingerprinting() {
    const trackingResults = {
        audio: { found: false, isSuspicious: false, details: [] },
        fonts: { found: false, isSuspicious: false, details: [] },
    };

    // Utility function to check for suspicious details
    function isSuspicious(details) {
        return details.some(detail => detail.toLowerCase().includes("fingerprinting"));
    }

    // Utility function to log and send messages if suspicious
    function logAndSendIfSuspicious(type, message) {
        const isSuspiciousFlag = isSuspicious(trackingResults[type].details);
        trackingResults[type].isSuspicious = isSuspiciousFlag;

        if (isSuspiciousFlag) {
            console.log(`${type} fingerprinting attempt detected: ${message}`);
            trackingResults[type].found = true;
        } else {
            console.log(`${type} activity detected, but not flagged as suspicious: ${message}`);
        }

        // Send suspicious flag and found status
        window.postMessage({
            type,
            isSuspicious: isSuspiciousFlag,
            found: trackingResults[type].found
        }, '*');
    }

    // --- Audio Fingerprinting Detection ---
    (function () {
        const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
        const originalAudioContextConstructor = AudioContext;

        // Intercept AudioContext.createAnalyser
        AudioContext.prototype.createAnalyser = function () {
            trackingResults.audio.found = true;
            trackingResults.audio.details.push("AudioContext used for fingerprinting (createAnalyser called)");
            logAndSendIfSuspicious("audio", "AudioContext.createAnalyser");
            return originalCreateAnalyser.apply(this, arguments);
        };

        // Intercept the AudioContext constructor
        const modifiedAudioContext = function() {
            trackingResults.audio.found = true;
            trackingResults.audio.details.push("AudioContext constructor used for fingerprinting");
            logAndSendIfSuspicious("audio", "AudioContext constructor");
            return new originalAudioContextConstructor(...arguments);
        };

        window.AudioContext = modifiedAudioContext;
    })();

    // --- Font Fingerprinting Detection ---
    (function () {
        const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;

        // Intercept CanvasRenderingContext2D.measureText
        CanvasRenderingContext2D.prototype.measureText = function () {
            trackingResults.fonts.found = true;
            trackingResults.fonts.details.push("Canvas font measurement used for fingerprinting");
            logAndSendIfSuspicious("fonts", "CanvasRenderingContext2D.measureText");
            return originalMeasureText.apply(this, arguments);
        };

        // Intercept window.getComputedStyle to detect inline font measurement
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (el) {
            if (el && el instanceof HTMLElement && el.style && el.style.fontFamily) {
                trackingResults.fonts.found = true;
                trackingResults.fonts.details.push("Inline font measurement detected");
                logAndSendIfSuspicious("fonts", "getComputedStyle inline font measurement");
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
                    console.log("Script containing audio fingerprinting code detected",script.textContent);
                    logAndSendIfSuspicious("audio", "Script tag with AudioWorkletNode");
                }
                if (!trackingResults.fonts.found) {
                    trackingResults.fonts.found = true;
                    trackingResults.fonts.details.push("Script containing font fingerprinting detected");
                    console.log("Script containing fonts fingerprinting code detected",script.textContent);
                    logAndSendIfSuspicious("fonts", "Script tag with measureText");
                }
            }
        }
    })();

    return trackingResults;
}
