export function detectSystemBrowserTracking() {
    console.log("Checking for System and Browser Details Monitoring...");

    const trackingResults = {
        userAgent: { found: false, value: null },
        plugins: { found: false, value: null },
        screen: { found: false, value: null },
        networkRequests: { found: false, details: [] },
        cookies: { found: false, details: [] }
    };

    // Intercepting navigator.userAgent
    const originalUserAgent = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
    if (originalUserAgent) {
        const originalGetter = originalUserAgent.get;
        Object.defineProperty(navigator, 'userAgent', {
            get() {
                console.log("Accessed navigator.userAgent");
                return originalGetter.apply(this);
            }
        });
    }

    // Check for userAgent tracking
    if (navigator.userAgent) {
        trackingResults.userAgent.found = true;
        trackingResults.userAgent.value = navigator.userAgent;
        console.log("User-Agent detected:", navigator.userAgent);
    }

    // Intercepting plugin detection
    if (navigator.mimeTypes && navigator.mimeTypes.length > 0) {
        trackingResults.plugins.found = true;
        trackingResults.plugins.value = Array.from(navigator.mimeTypes).map(mimeType => mimeType.enabledPlugin.name);
        console.log("Plugins detected:", trackingResults.plugins.value);
    }

    // Check for screen details
    const originalScreenWidth = Object.getOwnPropertyDescriptor(window.screen, 'width');
    const originalScreenHeight = Object.getOwnPropertyDescriptor(window.screen, 'height');
    const originalScreenColorDepth = Object.getOwnPropertyDescriptor(window.screen, 'colorDepth');

    if (originalScreenWidth) {
        Object.defineProperty(window.screen, 'width', {
            get() {
                console.log("Accessed window.screen.width");
                return originalScreenWidth.get.apply(this);
            }
        });
    }

    if (originalScreenHeight) {
        Object.defineProperty(window.screen, 'height', {
            get() {
                console.log("Accessed window.screen.height");
                return originalScreenHeight.get.apply(this);
            }
        });
    }

    if (originalScreenColorDepth) {
        Object.defineProperty(window.screen, 'colorDepth', {
            get() {
                console.log("Accessed window.screen.colorDepth");
                return originalScreenColorDepth.get.apply(this);
            }
        });
    }

    // Check for outgoing network requests (Fetch API)
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        trackingResults.networkRequests.found = true;
        trackingResults.networkRequests.details.push(args[0]);
        console.log("Network request detected:", args[0]);
        return originalFetch.apply(this, args);
    };

    // Check for cookies usage
    const originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
    if (originalCookie) {
        const originalCookieGetter = originalCookie.get;
        Object.defineProperty(document, 'cookie', {
            get() {
                console.log("Accessed document.cookie");
                return originalCookieGetter.apply(this);
            },
            set(value) {
                console.log("Set document.cookie:", value);
                originalCookie.set.call(this, value);
            }
        });
    }

    if (document.cookie) {
        trackingResults.cookies.found = true;
        trackingResults.cookies.details.push(document.cookie);
        console.log("Cookies detected:", document.cookie);
    }

    return trackingResults;
}
