document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");

    // Function to set the theme
    function setTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Toggle theme when the button is clicked
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    });

    // Connect to the background script
    const port = chrome.runtime.connect({ name: "popup-connection" });

    port.onMessage.addListener((message) => {
        console.log("message: ", message);
        if (message.type === "update_popup") {
            updatePopup(message.trackers, message.websiteName); // Include website name
        }
    });

    // Reset popup when switching tabs
    chrome.tabs.onActivated.addListener(() => {
        resetPopup();
    });

    // Log connection status
    port.onDisconnect.addListener(() => {
        console.log("Disconnected from background script.");
    });
});

function updatePopup(trackers, websiteName) {
    console.log(websiteName);
    const safeMessageElement = document.getElementById("safeMessage");
    const monitoringTable = document.querySelector(".table-container");
    const safetyStatus = document.querySelector(".status.success")
    // Handle Behavioral Tracking
    const behavioralRow = document.getElementById("behavioralTrackingRow");
    const behavioralDetails = document.getElementById("behavioralDetails");
    const websiteElement = document.getElementById("websiteName");

    if (websiteElement) {
        websiteElement.textContent = `${websiteName}`;
    }

    let hasTrackers = false;

    if (trackers?.behavior) {
        const { mousemove, scroll, click, isSuspicious } = trackers.behavior;

        if (mousemove?.found || scroll?.found || click?.found) {
            hasTrackers = true;
            behavioralRow.style.display = "table-row";
            behavioralDetails.style.display = "block";

            // Set row colors based on isSuspicious flag
            if (isSuspicious) {
                
                behavioralDetails.style.backgroundColor = "red";
                behavioralDetails.style.color = "white";
                
            } else {
              
                behavioralDetails.style.backgroundColor = "#00A693";
                behavioralDetails.style.color = "white";
            }

            // Populate details
            behavioralDetails.innerHTML = "";
            if (mousemove?.found) behavioralDetails.innerHTML += `<div><span class="key">Mouse Move:</span> <span class="value">Detected</span></div>`;
            if (scroll?.found) behavioralDetails.innerHTML += `<div><span class="key">Scroll:</span> <span class="value">Detected</span></div>`;
            if (click?.found) behavioralDetails.innerHTML += `<div><span class="key">Click:</span> <span class="value">Detected</span></div>`;
        } else {
            behavioralRow.style.display = "none";
        }
    } else {
        behavioralRow.style.display = "none";
    }

    // Handle System and Browser Details Tracking
    const systemRow = document.getElementById("systemBrowserRow");
    const systemDetails = document.getElementById("systemDetails");

    if (trackers?.systemBrowser) {
        const { userAgent, plugins, screen, networkRequests, cookies, isSuspicious } = trackers.systemBrowser;

        if (userAgent?.found || plugins?.found || screen?.found || networkRequests?.found || cookies?.found) {
            hasTrackers = true;
            systemRow.style.display = "table-row";
            systemDetails.style.display = "block";

            // Set row colors based on isSuspicious flag
            if (isSuspicious) {
              
                systemDetails.style.backgroundColor = "red";
                systemDetails.style.color = "white";
            } else {
                
                systemDetails.style.backgroundColor = "#00A693";
                systemDetails.style.color = "white";
            }

            // Populate details
            systemDetails.innerHTML = "";
            if (userAgent?.found) systemDetails.innerHTML += `<div><span class="key">User-Agent:</span> <span class="value">${userAgent.value}</span></div>`;
            if (plugins?.found) systemDetails.innerHTML += `<div><span class="key">Plugins:</span> <span class="value">${plugins.value.join(", ")}</span></div>`;
            if (screen?.found) systemDetails.innerHTML += `<div><span class="key">Screen Info:</span> <span class="value">Dimension access Detected</span></div>`;
            if (networkRequests?.found) systemDetails.innerHTML += `<div><span class="key">Network Requests:</span> <span class="value">${networkRequests.details.length} Detected</span></div>`;
            if (cookies?.found) systemDetails.innerHTML += `<div><span class="key">Cookies:</span> <span class="value">Cookies Detected</span></div>`;
        } else {
            systemRow.style.display = "none";
        }
    } else {
        systemRow.style.display = "none";
    }

    // Handle Audio Fingerprinting
    const audioRow = document.getElementById("audioFingerprintingRow");
    const audioDetails = document.getElementById("audioDetails");

    if (trackers?.audioFont?.audio?.found) {
        hasTrackers = true;
        audioRow.style.display = "table-row";
        audioDetails.style.display = "block";

        // Set row colors based on isSuspicious flag
        if (trackers.audioFont.audio.isSuspicious) {
            safetyStatus.style.display = "inline-block"
            audioDetails.style.backgroundColor = "red";
            audioDetails.style.color = "white";
        } else {
            safetyStatus.style.visibility = "hidden"
            audioDetails.style.backgroundColor = "#00A693";
            audioDetails.style.color = "white";
        }

        // Populate details
        audioDetails.innerHTML = trackers.audioFont.audio.details.map(detail => `<div>${detail}</div>`).join("");
    } else {
        audioRow.style.display = "none";
    }

    // Handle Font Fingerprinting
    const fontRow = document.getElementById("fontFingerprintingRow");
    const fontDetails = document.getElementById("fontDetails");

    if (trackers?.audioFont?.fonts?.found) {
        hasTrackers = true;
        fontRow.style.display = "table-row";
        fontDetails.style.display = "block";

        // Set row colors based on isSuspicious flag
        if (trackers.audioFont.fonts.isSuspicious) {
            safetyStatus.style.display = "inline-block"
            fontDetails.style.backgroundColor = "red";
            fontDetails.style.color = "white";
        } else {
            safetyStatus.style.visibility = "hidden"
            fontDetails.style.backgroundColor = "#00A693";
            fontDetails.style.color = "white";
        }

        // Populate details
        fontDetails.innerHTML = trackers.audioFont.fonts.details.map(detail => `<div>${detail}</div>`).join("");
    } else {
        fontRow.style.display = "none";
    }

    // Handle WebGL/Canvas Fingerprinting
    const webglCanvasRow = document.getElementById("webglCanvasRow");
    const webglCanvasDetails = document.getElementById("webglCanvasDetails");

    if (trackers?.webglCanvas) {
        const { canvas, webgl, isSuspicious } = trackers.webglCanvas;

        if (canvas?.found || webgl?.found) {
            hasTrackers = true;
            webglCanvasRow.style.display = "table-row";
            webglCanvasDetails.style.display = "block";

            // Set row colors based on isSuspicious flag
            if (canvas.isSuspicious || webgl.isSuspicious) {
                safetyStatus.style.display = "inline-block"
                webglCanvasDetails.style.backgroundColor = "red";
                webglCanvasDetails.style.color = "white";
            } else {
                safetyStatus.style.visibility = "hidden"
                webglCanvasDetails.style.backgroundColor = "#00A693";
                webglCanvasDetails.style.color = "white";
            }

            // Populate details
            webglCanvasDetails.innerHTML = "";
            if (canvas?.found) webglCanvasDetails.innerHTML += `<div><span class="key">Canvas:</span> <span class="value">Detected</span></div>`;
            if (webgl?.found) webglCanvasDetails.innerHTML += `<div><span class="key">WebGL:</span> <span class="value">Detected</span></div>`;
        } else {
            webglCanvasRow.style.display = "none";
        }
    } else {
        webglCanvasRow.style.display = "none";
    }

    // Update safe message visibility
    if (hasTrackers) {
        safeMessageElement.style.display = "none";
        monitoringTable.style.display = "block";
    } else {
        safeMessageElement.style.display = "block";
        monitoringTable.style.display = "none";
    }
}

function resetPopup() {
    const behavioralRow = document.getElementById("behavioralTrackingRow");
    const systemRow = document.getElementById("systemBrowserRow");
    const safeMessageElement = document.getElementById("safeMessage");
    const monitoringTable = document.querySelector(".table-container");

    // Reset rows
    behavioralRow.style.display = "none";
    systemRow.style.display = "none";

    // Hide table and show safe message
    safeMessageElement.style.display = "block";
    monitoringTable.style.display = "none";
}
