export function detectBehaviorTracking() {
    console.log("Hello");
    const trackerTypes = ['mousemove', 'scroll', 'click'];
    const trackingResults = {
        mousemove: { found: false, elements: [], scripts: [], isSuspicious: false },
        scroll: { found: false, elements: [], isSuspicious: false },
        click: { found: false, elements: [], scripts: [], isSuspicious: false }
    };

    // Utility functions for tracker detection
    const TrackerUtils = {
        // Check for global event handlers like window.onmousemove
        checkGlobalHandlers: function(eventType) {
            const globalHandlerFound = window[`on${eventType}`] || document[`on${eventType}`];
            if (globalHandlerFound) {
                console.log(`Global ${eventType} tracker detected on window/document`);
                return true;
            }
            return false;
        },

        // Check if the event is being tracked in any <script> tags
        checkScriptTags: function(eventType) {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.textContent.includes(eventType) || script.src.includes(eventType)) {
                    console.log(`${eventType} tracker found in script:`, script);
                    return {
                        src: script.src || "Inline script",
                        content: script.textContent  // Capture the content of the inline script
                    };
                }
            }
            return null;
        },

        // Check for inline event handlers directly on HTML elements
        checkInlineHandlers: function(eventType) {
            const trackedElements = [];
            const allElements = document.getElementsByTagName('*');
            
            for (let element of allElements) {
                if (element.getAttribute(`on${eventType}`)) {
                    console.log(`Inline ${eventType} handler found on element:`, element);
                    trackedElements.push({
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className
                    });
                }
            }
            
            return trackedElements;
        },

        // Proxy for the addEventListener function to catch event listeners added via JavaScript
        proxyAddEventListener: function(eventType) {
            const trackedElements = [];
            let trackersFound = false;

            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === eventType) {
                    console.log(`${eventType} event listener detected on:`, this);
                    trackersFound = true;
                    
                    if (this instanceof Element) {
                        trackedElements.push({
                            tagName: this.tagName,
                            id: this.id,
                            className: this.className
                        });
                    }
                }
                
                return originalAddEventListener.call(this, type, listener, options);
            };

            return { found: trackersFound, elements: trackedElements };
        }
    };

    // Function to detect behavior trackers based on event type
    function detectEventTrackers(eventType) {
        const trackedElements = [];
        let trackersFound = false;
        let scriptResponsible = null;
        let scriptContent = null;
        let isSuspicious = false;

        // Check for global event handlers, script tags, inline handlers, and proxy event listeners
        const globalHandlerFound = TrackerUtils.checkGlobalHandlers(eventType);
        const scriptTagFound = TrackerUtils.checkScriptTags(eventType);
        const inlineElements = TrackerUtils.checkInlineHandlers(eventType);
        const proxyResult = TrackerUtils.proxyAddEventListener(eventType);

        // If a script was found that tracks the event
        if (scriptTagFound) {
            scriptResponsible = scriptTagFound.src;
            scriptContent = scriptTagFound.content;  // Capture inline script content
        }

        // Determine if event trackers were found
        trackersFound = globalHandlerFound || scriptTagFound || 
                        inlineElements.length > 0 || proxyResult.found;

        // Combine the tracked elements from inline handlers and proxy listeners
        trackedElements.push(...inlineElements, ...proxyResult.elements);

        // Log the results of the detection
        console.log("Script Responsible: ", scriptResponsible);
        if (scriptContent) {
            console.log("Inline Script Content: ", scriptContent);  // Log the content of inline script
        }

        // Look for patterns that indicate suspicious behavior
        if (trackersFound) {
            if (scriptContent && scriptContent.includes("mouse") && scriptContent.includes("mousemove")) {
                // Flag as suspicious if mouse behavior tracking is found in the script content
                isSuspicious = true;
                console.log(`Suspicious tracking detected in inline script for ${eventType}`);
            } else if (globalHandlerFound) {
                // If global handlers are found, it could be suspicious
                isSuspicious = true;
                console.log(`Global ${eventType} handler is suspicious`);
            }
        }

        // Only set found to true if isSuspicious is true
        if (isSuspicious) {
            trackersFound = true;
        }

        // Return the tracking results
        return { 
            found: isSuspicious ? true : false,  // Set found to true only if isSuspicious is true
            elements: trackedElements,
            scriptResponsible: scriptResponsible,
            scriptContent: scriptContent,
            isSuspicious: isSuspicious // Include if behavior is suspicious
        };
    }

    // Iterate through the event types and detect trackers
    trackerTypes.forEach(type => {
        trackingResults[type] = detectEventTrackers(type);
    });

    // Send tracking results to background script
    setTimeout(() => {
        chrome.runtime.sendMessage({
            type: 'tracking_check',
            trackers: {
                mousemove: {
                    detected: trackingResults.mousemove.found,
                    elements: trackingResults.mousemove.elements,
                    scriptResponsible: trackingResults.mousemove.scriptResponsible,
                    scriptContent: trackingResults.mousemove.scriptContent,
                    suspicious: trackingResults.mousemove.isSuspicious
                },
                scroll: {
                    detected: trackingResults.scroll.found,
                    elements: trackingResults.scroll.elements,
                    scriptResponsible: trackingResults.scroll.scriptResponsible,
                    scriptContent: trackingResults.scroll.scriptContent,
                    suspicious: trackingResults.scroll.isSuspicious
                },
                click: {
                    detected: trackingResults.click.found,
                    elements: trackingResults.click.elements,
                    scriptResponsible: trackingResults.click.scriptResponsible,
                    scriptContent: trackingResults.click.scriptContent,
                    suspicious: trackingResults.click.isSuspicious
                }
            }
        });

        console.log('Tracking Detection Results:', trackingResults);
    }, 1000);

    return trackingResults;
}
