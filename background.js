let cachedTrackers = {}; // To store the latest tracking data
let cachedName = ""; // Store the website name

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "tracking_check") {
        console.log("Tracking Detection Results:", message.trackers);
        cachedTrackers = { ...cachedTrackers, ...message.trackers };

        updateBadge(cachedTrackers, sender.tab.id);

        chrome.runtime.sendMessage({
            type: "update_popup",
            trackers: cachedTrackers,
            websiteName: cachedName // Send the website name along with the trackers
        });

        sendResponse({ status: "Tracking results processed and badge updated" });
    }

    // Update the website name here to make sure it is available before sending it
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.log('No active tab found');
        } else {
            const websiteName = new URL(tabs[0].url).hostname;
            console.log("WebsiteName: ", websiteName);
            
            // Set the cached website name
            cachedName = websiteName;
            
            // Send the updated website name to the popup after it's been set
            chrome.runtime.sendMessage({
                type: "update_popup",
                websiteName: cachedName // Send updated website name to the popup
            });

            sendResponse({ status: "Website name successfully updated" });
        }
    });
});



function updateBadge(trackers, tabId) {
    const totalTrackers = countTrackers(trackers);
     
    if (totalTrackers > 0) {
        chrome.action.setBadgeText({
            text: totalTrackers.toString(),
            tabId: tabId,
        });

        chrome.action.setBadgeBackgroundColor({
            color: totalTrackers > 5 ? "#FFA500" : "#008000",
            tabId: tabId,
        });
    } else {
        
        chrome.action.setBadgeText({
            text: "",
            tabId: tabId,
        });


    }
}

function updateStatus(trackers, tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;

        // Check if the tab URL is "chrome://newtab/"
        if (tab.url === "chrome://newtab/") {
            console.log("New tab detected. Reloading extension due to zero trackers.");
            if (countTrackers(trackers) === 0) {
                chrome.runtime.reload();
            }
        }
    });
}


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

    if (trackers?.audioFont) {
        total +=
            (trackers.audioFont.audio?.found ? 1 : 0) +
            (trackers.audioFont.fonts?.found ? 1 : 0);
    }

    if (trackers?.webglCanvas) {
        total +=
            (trackers.webglCanvas.canvas?.found ? 1 : 0) +
            (trackers.webglCanvas.webgl?.found ? 1 : 0);
    }

    return total;
}



chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup-connection") {
        console.log("Popup connected to background script.");

        // Send cached trackers and website name to the popup
        port.postMessage({
            type: "update_popup",
            trackers: cachedTrackers,
            websiteName: cachedName
        });

        port.onDisconnect.addListener(() => {
            console.log("Popup disconnected.");
        });
    }
});
