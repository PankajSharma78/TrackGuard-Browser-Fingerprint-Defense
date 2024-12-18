(function() {
    async function loadModules() {
        try {
            const behaviorModule = await import('./behaviorTracker.js');
            const systemBrowserModule = await import('./systemBrowserTracker.js');
            const audioFontModule = await import('./audioFontTracker.js');
            const webglCanvasModule = await import('./webglCanvasTracker.js'); // Import the WebGL/Canvas tracker

            const detectBehaviorTracking = behaviorModule.detectBehaviorTracking || 
                (() => ({ 
                    mousemove: { found: false },
                    scroll: { found: false },
                    click: { found: false }
                }));

            const detectSystemBrowserTracking = systemBrowserModule.detectSystemBrowserTracking || 
                (() => ({
                    userAgent: { found: false },
                    plugins: { found: false },
                    screen: { found: false },
                    networkRequests: { found: false, details: [] },
                    cookies: { found: false, details: [] }
                }));

            const audioFontTracking = audioFontModule.detectAudioFontFingerprinting ||
            (() => ({
                audio: { found: false, details: [] },
                fonts: { found: false, details: [] },
            }));

            // Function to run behavior tracking detection
            function runBehaviorTracking() {
                console.log("Running behavior tracking detection...");

                const behaviorTrackingResults = {
                    mousemove: detectBehaviorTracking().mousemove || { found: false },
                    scroll: detectBehaviorTracking().scroll || { found: false },
                    click: detectBehaviorTracking().click || { found: false }
                };

                console.log('Behavior Tracking Detection Results:', behaviorTrackingResults);
                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: { behavior: behaviorTrackingResults }
                });
            }

            // Run the WebGL and Canvas tracking
            function runWebGLCanvasTracking() {
                console.log("Running WebGL and Canvas fingerprinting detection...");
                const webglCanvasTrackingResults = webglCanvasModule.detectWebGLCanvasFingerprinting();
                console.log('WebGL and Canvas Fingerprinting Results:', webglCanvasTrackingResults);

                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: { webglCanvas: webglCanvasTrackingResults }
                });
            }

            function runSystemBrowserTracking() {
                console.log("Running system and browser details monitoring detection...");
                const systemBrowserTrackingResults = detectSystemBrowserTracking();
                console.log('System and Browser Tracking Detection Results:', systemBrowserTrackingResults);

                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: { systemBrowser: systemBrowserTrackingResults }
                });
            }

            function runAudioFontTracking() {
                console.log("Running Audio and Font fingerprinting attempts monitoring...");
                const audioFontTrackingResults = audioFontTracking();
                console.log('Audio and Font Fingerprinting monitoring results:', audioFontTrackingResults);

                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: { audioFont: audioFontTrackingResults }
                });
            }
            function getWebsiteName() {
                return new Promise((resolve, reject) => {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs.length === 0) {
                            reject('No active tab found');
                        } else {
                            const websiteName = new URL(tabs[0].url).hostname;
                            resolve(websiteName);
                        }
                    });
                });
            }


            

            runBehaviorTracking();  // Run behavior tracking detection
            runWebGLCanvasTracking(); // Run WebGL/Canvas tracking
            runSystemBrowserTracking();  // Run systembrowser details monitoring
            runAudioFontTracking();

            // Set Interval to run the functions every 5 seconds
            setInterval(() => {
                runBehaviorTracking();  // Run behavior tracking detection
                runWebGLCanvasTracking(); // Run WebGL/Canvas tracking
                runSystemBrowserTracking();  // Run systembrowser details monitoring
                runAudioFontTracking();  // Run audioFont detection
            }, 5000);  // 5000 milliseconds = 5 seconds

            // Create a MutationObserver to detect changes in the DOM
            const observer = new MutationObserver(() => {
                runBehaviorTracking();  // Run behavior tracking detection
                runWebGLCanvasTracking(); // Run WebGL/Canvas tracking
                runSystemBrowserTracking();  // Run systembrowser details monitoring
                runAudioFontTracking();  // Run audioFont detection
            });

            observer.observe(document.body, {
                childList: true,   // Detect new child nodes added to the DOM
                subtree: true      // Detect changes in all descendants
            });

        } catch (error) {
            console.error('Error importing modules:', error);
            chrome.runtime.sendMessage({
                type: 'tracking_error',
                error: error.toString()
            });
        }
    }

    loadModules();
})();
