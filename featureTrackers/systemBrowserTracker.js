export function detectSystemBrowserTracking() {
    console.log("Checking for System and Browser Details Monitoring...");

    const trackingResults = {
        userAgent: { found: false, value: null, isSuspicious: false },
        plugins: { found: false, value: null, isSuspicious: false },
        screen: { found: false, value: null, isSuspicious: false },
        networkRequests: { found: false, details: [], isSuspicious: false },
        cookies: { found: false, details: [], isSuspicious: false },
        scripts: { found: false, details: [], isSuspicious: false }
    };

    // Check for userAgent tracking
    if (navigator.userAgent) {
        trackingResults.userAgent.value = navigator.userAgent;
        console.log("User-Agent detected:", navigator.userAgent);

        const suspiciousUserAgentPatterns = [
            /bot/i, // Detect bots
            /curl/i, // cURL
            /wget/i, // Wget
            /HeadlessChrome/i, // Headless browsing
            /PhantomJS/i // PhantomJS
        ];

        if (suspiciousUserAgentPatterns.some(pattern => pattern.test(navigator.userAgent))) {
            trackingResults.userAgent.isSuspicious = true;
        }
    }

    if (trackingResults.userAgent.isSuspicious) {
        trackingResults.userAgent.found = true;
    }

    // Check for plugin detection
    if (navigator.mimeTypes && navigator.mimeTypes.length > 0) {
        trackingResults.plugins.value = Array.from(navigator.mimeTypes).map(mimeType => mimeType.enabledPlugin.name);
        console.log("Plugins detected:", trackingResults.plugins.value);

        const suspiciousPlugins = ["Flash", "Java", "Silverlight", "Shockwave"];
        if (trackingResults.plugins.value.some(plugin => suspiciousPlugins.includes(plugin))) {
            trackingResults.plugins.isSuspicious = true;
        }
    }

    if (trackingResults.plugins.isSuspicious) {
        trackingResults.plugins.found = true;
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

    if (window.screen.width < 1024 || window.screen.height < 768 || window.screen.colorDepth !== 24) {
        trackingResults.screen.isSuspicious = true;
    }

    if (trackingResults.screen.isSuspicious) {
        trackingResults.screen.found = true;
    }

    // Check for outgoing network requests (Fetch API)
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        trackingResults.networkRequests.details.push(args[0]);
        console.log("Network request detected:", args[0]);

        const suspiciousUrls = [
            /google-analytics.com/,
            /doubleclick.net/,
            /facebook.com/,
            /twitter.com/,
            /amazonaws.com/
        ];

        if (suspiciousUrls.some(urlPattern => args[0].match(urlPattern))) {
            trackingResults.networkRequests.isSuspicious = true;
        }

        return originalFetch.apply(this, args);
    };

    if (trackingResults.networkRequests.isSuspicious) {
        trackingResults.networkRequests.found = true;
    }

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
        trackingResults.cookies.details.push(document.cookie);
        console.log("Cookies detected:", document.cookie);

        const suspiciousCookiePatterns = [
            /_ga=/, // Google Analytics
            /_fbp=/, // Facebook Pixel
            /_gid=/, // Google Analytics ID
            /ads=/, // Advertising cookies
        ];

        if (suspiciousCookiePatterns.some(pattern => document.cookie.match(pattern))) {
            trackingResults.cookies.isSuspicious = true;
        }
    }

    if (trackingResults.cookies.isSuspicious) {
        trackingResults.cookies.found = true;
    }

    // Check for scripts and log their content if suspicious activity is found
    if (trackingResults.userAgent.isSuspicious || trackingResults.plugins.isSuspicious || trackingResults.screen.isSuspicious || trackingResults.networkRequests.isSuspicious || trackingResults.cookies.isSuspicious) {
        trackingResults.scripts.details = [];

        const inlineScripts = document.querySelectorAll('script');
        inlineScripts.forEach(script => {
            if (script.innerHTML) {
                trackingResults.scripts.details.push({
                    type: "inline",
                    content: script.innerHTML
                });
                console.log("Inline script detected:", script.innerHTML);
            }
        });

        const externalScripts = document.querySelectorAll('script[src]');
        externalScripts.forEach(script => {
            trackingResults.scripts.details.push({
                type: "external",
                src: script.src
            });
            console.log("External script detected:", script.src);
        });

        trackingResults.scripts.isSuspicious = true;
    }

    if (trackingResults.scripts.isSuspicious) {
        trackingResults.scripts.found = true;
    }

    return trackingResults;
}
