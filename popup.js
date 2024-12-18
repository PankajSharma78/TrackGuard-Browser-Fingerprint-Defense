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
        if (message.type === "update_popup") {
            updatePopup(message.trackers);
        }
    });

    // Log connection status
    port.onDisconnect.addListener(() => {
        console.log("Disconnected from background script.");
    });
});

function updatePopup(trackers) {
    // Handle Behavioral Tracking
    const behavioralRow = document.getElementById("behavioralTrackingRow");
    const behavioralDetails = document.getElementById("behavioralDetails");

    if (trackers?.behavior) {
        const { mousemove, scroll, click } = trackers.behavior;

        if (mousemove?.found || scroll?.found || click?.found) {
            behavioralRow.style.display = "table-row";
            behavioralDetails.style.display = "block";

            // Populate the dropdown
            behavioralDetails.innerHTML = ""; // Clear old content
            if (mousemove?.found) behavioralDetails.innerHTML += `<div><span class="key">Mouse Move:</span> <span class="value">Detected</span></div>`;
            if (scroll?.found) behavioralDetails.innerHTML += `<div><span class="key">Scroll:</span> <span class="value">Detected</span></div>`;
            if (click?.found) behavioralDetails.innerHTML += `<div><span class="key">Click:</span> <span class="value">Detected</span></div>`;
        } else {
            behavioralRow.style.display = "none";
        }
    }

    // Handle System and Browser Details Tracking
    const systemRow = document.getElementById("systemBrowserRow");
    const systemDetails = document.getElementById("systemDetails");

    if (trackers?.systemBrowser) {
        const { userAgent, plugins, screen, networkRequests, cookies } = trackers.systemBrowser;

        if (userAgent?.found || plugins?.found || screen?.found || networkRequests?.found || cookies?.found) {
            systemRow.style.display = "table-row";
            systemDetails.style.display = "block";

            // Populate the dropdown
            systemDetails.innerHTML = ""; // Clear old content
            if (userAgent?.found) systemDetails.innerHTML += `<div><span class="key">User-Agent:</span> <span class="value">${userAgent.value}</span></div>`;
            if (plugins?.found) systemDetails.innerHTML += `<div><span class="key">Plugins:</span> <span class="value">${plugins.value.join(", ")}</span></div>`;
            if (screen?.found) systemDetails.innerHTML += `<div><span class="key">Screen Info:</span> <span class="value">${screen.value.width}x${screen.value.height}, ${screen.value.colorDepth}-bit</span></div>`;
            if (networkRequests?.found) systemDetails.innerHTML += `<div><span class="key">Network Requests:</span> <span class="value">${networkRequests.details.length} Detected</span></div>`;
            if (cookies?.found) systemDetails.innerHTML += `<div><span class="key">Cookies:</span> <span class="value">Cookies Detected</span></div>`;
        } else {
            systemRow.style.display = "none";
        }
    }
}
