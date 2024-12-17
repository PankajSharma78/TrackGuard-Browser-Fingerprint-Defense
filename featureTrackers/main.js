(function() {
    async function loadModules() {
        try {
            const behaviorModule = await import('./behaviorTracker.js');
            const systemBrowserModule = await import('./systemBrowserTracker.js');

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

            // Function to run behavior tracking detection
            function runBehaviorTracking() {
                console.log("Running behavior tracking detection...");

                // Normalize tracking results for behavior
                const behaviorTrackingResults = {
                    mousemove: detectBehaviorTracking().mousemove || { found: false },
                    scroll: detectBehaviorTracking().scroll || { found: false },
                    click: detectBehaviorTracking().click || { found: false }
                };

                // Log detailed behavior tracking results
                console.log('Behavior Tracking Detection Results:', behaviorTrackingResults);

                // Send behavior tracking results to background script
                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: {
                        behavior: behaviorTrackingResults
                    }
                });
            }

            // Browser details monitoring detection
            function runSystemBrowserTracking() {
                console.log("Running system and browser details monitoring detection...");

                // Get results for systembrowser monitoring
                const systemBrowserTrackingResults = detectSystemBrowserTracking();

                // Log detailed systembrowser tracking results
                console.log('System and Browser Tracking Detection Results:', systemBrowserTrackingResults);

                // Send systembrowser tracking results to background script
                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: {
                        systemBrowser: systemBrowserTrackingResults
                    }
                });
            }

            runBehaviorTracking();  // Run behavior tracking detection
            runSystemBrowserTracking();  // Run systembrowser details monitoring


        } catch (error) {
            console.error('Error importing modules:', error);
            
            // Error reporting
            chrome.runtime.sendMessage({
                type: 'tracking_error',
                error: error.toString()
            });
        }
    }
    loadModules();
})();
