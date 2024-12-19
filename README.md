# **TrackGuard: Browser Fingerprint Detection and Defence**

**Your Privacy Shield in the Digital World**  
TrackGuard is an advanced browser extension designed to identify, mitigate, and report browser fingerprinting and tracking attempts in real time. Perfect for cybersecurity professionals and privacy-conscious users, TrackGuard empowers you to take control of your digital privacy with actionable insights and proactive defense mechanisms.  

---

## **Screenshots**

![Demo Screenshot]()

## **🌟 Features**

### 🔍 **Comprehensive Detection Capabilities**
- **System and Browser Details Monitoring**  
  Tracks script access to sensitive properties like `navigator.userAgent`, `navigator.plugins`, and `window.screen`.  
- **Behavioral Tracking Detection**  
  Identifies suspicious monitoring of user interactions such as mouse movements, clicks, and scrolling.  
- **Canvas & WebGL Fingerprinting Detection**  
  Detects unauthorized calls to `toDataURL`, `getImageData`, and WebGL functions.  
- **Audio and Font Fingerprinting**  
  Monitors attempts to fingerprint through `AudioContext` and font enumeration.  
- **Media Device Enumeration Protection**  
  Tracks access to `navigator.mediaDevices.enumerateDevices()` to prevent unauthorized hardware detection.

### 🔒 **Robust Privacy Protection**
- **Storage Access Detection**  
  Monitors `IndexedDB`, `FileSystem`, and other storage APIs to detect tracking attempts.  
- **Battery Status & Sensor Data Protection**  
  Prevents access to `BatteryManager` properties and sensor APIs like `DeviceOrientationEvent`.  
- **WebRTC Data Protection**  
  Intercepts `RTCPeerConnection` to block IP leakage via WebRTC.  
- **Network Information Access Monitoring**  
  Secures data from `navigator.connection` to prevent network tracking.  

### 🛡️ **Proactive Mitigation**
- **Known Trackers Blocking**  
  Maintains an updated list to block requests to known trackers and third-party domains.  
- **JavaScript & WebAPI Analysis**  
  Detects device-specific tracking attempts through key API calls.  

### 📊 **Reporting and Notifications**
- **Detailed Logs**  
  Generates comprehensive reports with frequency, risk levels, and access details.  
- **Real-Time Alerts**  
  Sends browser notifications and pop-ups for suspicious activities.  
- **Customizable Settings**  
  Enable/disable monitoring features, set alert thresholds, and view historical tracking reports.

---

## **🔧 Tech Stack**

- **Frontend**:  
  - HTML5, CSS3, JavaScript (ES6+)  
  - WebExtension APIs  
- **Backend**:  
  - Node.js (for managing updated tracker lists and data processing)  
  - SQLite (for historical tracking logs)  
- **Utilities & Libraries**:  
  - Browser-specific APIs for enhanced functionality (e.g., `chrome.webRequest`, `chrome.storage`)  
  - Blocklist Management with EasyPrivacy or similar lists  


---

## **🚀 Installation**

1. Clone this repository:  
   ```bash
   git clone https://github.com/PankajSharma78/TrackGuard-Browser-Fingerprint-Defense.git
   ```
2. Load the extension:  
   - Open your browser and navigate to `chrome://extensions` (or the equivalent in your browser).  
   - Enable "Developer Mode" and click **Load Unpacked**.  
   - Select the `TrackGuard` directory.  

---

**TrackGuard** – Enhancing Digital Privacy, One Click at a Time. 🌐  
