export function detectWebGLCanvasFingerprinting() {
  const trackingResults = {
    canvas: { found: false, isSuspicious: false, details: [] },
    webgl: { found: false, isSuspicious: false, details: [] },
  };

  // Utility function to log and mark fingerprinting attempts
  function logAndDetermineSuspicious(type, message) {
    // Mark as found if fingerprinting code or behavior is detected
    trackingResults[type].found = true;
    
    // Mark as suspicious only if deeper study finds signs of fingerprinting (complex behavior, patterns, etc.)
    if (!trackingResults[type].isSuspicious) {
      // Simple heuristic: if certain suspicious patterns are detected, we flag it as suspicious
      if (message.includes("fingerprint") || message.includes("debug") || message.includes("sensitive data")) {
        trackingResults[type].isSuspicious = true;
      }
    }
    
    console.log(`${type} fingerprinting detected: ${message}`, { isSuspicious: trackingResults[type].isSuspicious, found: trackingResults[type].found });
    // Send detected status for further processing
    window.postMessage({
      type,
      suspicious: trackingResults[type].isSuspicious,
      found: trackingResults[type].found,
    }, '*');
  }

  // --- Canvas Fingerprinting Detection ---
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function () {
    trackingResults.canvas.details.push('toDataURL method called');
    logAndDetermineSuspicious("canvas", "toDataURL method called (possible fingerprinting)");
    return originalToDataURL.apply(this, arguments);
  };

  // --- WebGL Fingerprinting Detection ---
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  const originalGetExtension = WebGLRenderingContext.prototype.getExtension;

  WebGLRenderingContext.prototype.getParameter = function () {
    const isSensitive = arguments[0] === this.UNMASKED_RENDERER_WEBGL || arguments[0] === this.UNMASKED_VENDOR_WEBGL;
    if (isSensitive) {
      trackingResults.webgl.details.push(`WebGL fingerprinting attempt detected for: ${arguments[0]}`);
      logAndDetermineSuspicious("webgl", `WebGL fingerprinting attempt detected for: ${arguments[0]}`);
    }
    return originalGetParameter.apply(this, arguments);
  };

  WebGLRenderingContext.prototype.getExtension = function () {
    if (arguments[0] === "WEBGL_debug_renderer_info") {
      trackingResults.webgl.details.push(`WebGL debug extension access detected: ${arguments[0]}`);
      logAndDetermineSuspicious("webgl", `WebGL debug extension access detected: ${arguments[0]}`);
    }
    return originalGetExtension.apply(this, arguments);
  };

  // --- Detect Canvas or WebGL Context Creation ---
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'CANVAS' || node.tagName === 'CANVAS') {
            trackingResults.canvas.details.push('Canvas element created');
            logAndDetermineSuspicious("canvas", "Canvas element created (possible fingerprinting)");
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // --- Detect Script Tags for Fingerprinting ---
  (function () {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      const suspiciousPatterns = [
        'getParameter()',
        'toDataURL()',
        'measureText()',
        'fillText()',
        "getContext('2D')",
        "getContext('webgl')",
        'fingerprintjs2',
        'fingerprintjs',
        'UNMASKED_RENDERER_WEBGL',
        'UNMASKED_VENDOR_WEBGL',
      ];
      const isSuspicious = suspiciousPatterns.some((pattern) => script.textContent.includes(pattern));

      if (isSuspicious) {
        if (!trackingResults.webgl.found) {
          trackingResults.webgl.details.push("Script containing WebGL fingerprinting code detected");
          logAndDetermineSuspicious("webgl", "Script containing WebGL fingerprinting code detected");
        }
        if (!trackingResults.canvas.found) {
          trackingResults.canvas.details.push("Script containing Canvas fingerprinting code detected");
          logAndDetermineSuspicious("canvas", "Script containing Canvas fingerprinting code detected");
        }
      }
    }
  })();

  return trackingResults;
}
