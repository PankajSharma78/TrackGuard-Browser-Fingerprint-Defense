let cachedTrackers = {}; // To store the latest tracking data

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "tracking_check") {
        console.log("Tracking Detection Results:", message.trackers);

        // Cached trackers
        cachedTrackers = { ...cachedTrackers, ...message.trackers };

        updateBadge(cachedTrackers, sender.tab.id);

        chrome.runtime.sendMessage({
            type: "update_popup",
            trackers: cachedTrackers,
        });

        sendResponse({ status: "Tracking results processed and badge updated" });
    }
});

// Extension Badge 
function updateBadge(trackers, tabId) {
    const totalTrackers = countTrackers(trackers);

    if (totalTrackers > 0) {
        chrome.action.setBadgeText({
            text: totalTrackers.toString(),
            tabId: tabId,
        });

        // Set badge color based on severity
        chrome.action.setBadgeBackgroundColor({
            color: totalTrackers > 2 ? "#FF0000" : "#FFA500", // Red for high, orange for moderate
            tabId: tabId,
        });
    } else {
        chrome.action.setBadgeText({
            text: "",
            tabId: tabId,
        });
    }
}

// Count total trackers
function countTrackers(trackers) {
    let total = 0;

    if (trackers?.behavior) {
        total +=
            (trackers.behavior.mousemove?.found ? 1 : 0) +
            (trackers.behavior.scroll?.found ? 1 : 0) +
            (trackers.behavior.click?.found ? 1 : 0);
    }

    if (trackers?.systemBrowser) {
        total +=
            (trackers.systemBrowser.userAgent?.found ? 1 : 0) +
            (trackers.systemBrowser.plugins?.found ? 1 : 0) +
            (trackers.systemBrowser.screen?.found ? 1 : 0) +
            (trackers.systemBrowser.networkRequests?.found ? 1 : 0) +
            (trackers.systemBrowser.cookies?.found ? 1 : 0);
    }

    return total;
}


chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup-connection") {
        console.log("Popup connected to background script.");

        // Send cached trackers to the popup
        port.postMessage({
            type: "update_popup",
            trackers: cachedTrackers,
        });

        // Log disconnection
        port.onDisconnect.addListener(() => {
            console.log("Popup disconnected.");
        });
    }
});
