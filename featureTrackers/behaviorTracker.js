export function detectBehaviorTracking() {
    console.log("Hello");
    const trackerTypes = ['mousemove', 'scroll', 'click'];
    const trackingResults = {
        mousemove: { found: false, elements: [] },
        scroll: { found: false, elements: [] },
        click: { found: false, elements: [] }
    };


    // Utility functions for tracker detection
    const TrackerUtils = {
        checkGlobalHandlers: function(eventType) {
            const globalHandlerFound = window[`on${eventType}`] || document[`on${eventType}`];
            if (globalHandlerFound) {
                console.log(`Global ${eventType} tracker detected on window/document`);
                return true;
            }
            return false;
        },

        checkScriptTags: function(eventType) {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.textContent.includes(eventType)) {
                    console.log(`${eventType} tracker found in script:`, script);
                    return true;
                }
            }
            return false;
        },

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

    function detectEventTrackers(eventType) {
        const trackedElements = [];
        let trackersFound = false;

        const globalHandlerFound = TrackerUtils.checkGlobalHandlers(eventType);
        const scriptTagFound = TrackerUtils.checkScriptTags(eventType);
        const inlineElements = TrackerUtils.checkInlineHandlers(eventType);
        const proxyResult = TrackerUtils.proxyAddEventListener(eventType);

        trackersFound = globalHandlerFound || scriptTagFound || 
                        inlineElements.length > 0 || proxyResult.found;
        
        trackedElements.push(...inlineElements, ...proxyResult.elements);

        return { 
            found: trackersFound, 
            elements: trackedElements 
        };
    }

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
                    elements: trackingResults.mousemove.elements
                },
                scroll: {
                    detected: trackingResults.scroll.found,
                    elements: trackingResults.scroll.elements
                },
                click: {
                    detected: trackingResults.click.found,
                    elements: trackingResults.click.elements
                }
            }
        });

        console.log('Tracking Detection Results:', trackingResults);
    }, 1000);

    return trackingResults;
}