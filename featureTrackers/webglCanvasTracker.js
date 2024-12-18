export function detectWebGLCanvasFingerprinting() {
  const trackingResults = {
    canvas: { found: false, details: [] },
    webgl: { found: false, details: [] },
  };

  // --- Canvas Fingerprinting Detection ---
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function() {
    trackingResults.canvas.found = true;
    trackingResults.canvas.details.push('toDataURL method called');
    console.log("Canvas fingerprinting attempt detected: toDataURL called");
    return originalToDataURL.apply(this, arguments);
  };

  // --- WebGL Fingerprinting Detection ---
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  const originalGetExtension = WebGLRenderingContext.prototype.getExtension;

  WebGLRenderingContext.prototype.getParameter = function() {
    if (arguments[0] === this.UNMASKED_RENDERER_WEBGL || arguments[0] === this.UNMASKED_VENDOR_WEBGL) {
      trackingResults.webgl.found = true;
      trackingResults.webgl.details.push(`WebGL fingerprinting attempt detected for: ${arguments[0]}`);
      console.log("WebGL fingerprinting attempt detected:", arguments[0]);
    }
    return originalGetParameter.apply(this, arguments);
  };

  WebGLRenderingContext.prototype.getExtension = function() {
    if (arguments[0] === "WEBGL_debug_renderer_info") {
      trackingResults.webgl.found = true;
      trackingResults.webgl.details.push(`WebGL debug extension access detected: ${arguments[0]}`);
      console.log("WebGL fingerprinting attempt detected:", arguments[0]);
    }
    return originalGetExtension.apply(this, arguments);
  };

  // --- Detect Canvas or WebGL Context Creation ---
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'CANVAS' || node.tagName === 'CANVAS') {
            trackingResults.canvas.found = true;
            trackingResults.canvas.details.push('Canvas element created');
          } else if (node instanceof WebGLRenderingContext) {
            trackingResults.webgl.found = true;
            trackingResults.webgl.details.push('WebGL context created');
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
      if (script.textContent.includes('getParameter()') || script.textContent.includes('toDataURL()') ||  script.textContent.includes('measureText()')  || script.textContent.includes('fillText()') || script.textContent.includes("getContext('2D')") || script.textContent.includes("getContext('webgl')" ) || script.textContent.includes("fingerprintjs2" ) || script.textContent.includes("fingerprintjs" ) ){
        if (!trackingResults.webgl.found) {
          trackingResults.webgl.found = true;
          trackingResults.webgl.details.push("Script containing WebGL fingerprinting code detected");
          console.log("WebGL fingerprinting script detected in script tag:", script.textContent);
        }
        if (!trackingResults.canvas.found) {
          trackingResults.canvas.found = true;
          trackingResults.canvas.details.push("Script containing Canvas fingerprinting code detected");
          console.log("Canvas fingerprinting script detected in script tag:", script.textContent);
        }
      }
    }
  })();

  return trackingResults;
}
