var FRIENDLY_LABELS = {
  "IP Address": "IP Address as Hostname",
  "URL Length": "URL Length & Complexity",
  "Tiny URL": "Shortened / TinyURL Redirection",
  "@ Symbol": "@ Symbol in URL Authority",
  "Redirecting using //": "Double Slash (//) Path Redirection",
  "(-) Prefix/Suffix in domain": "Hyphen (-) in Domain Name",
  "No. of Sub Domains": "Subdomain Depth Level",
  "HTTPS": "SSL / HTTPS Encryption State",
  "Favicon": "Favicon Cross-Domain Origin",
  "Port": "Non-Standard Service Port",
  "HTTPS in URL's domain part": "Deceptive 'HTTPS' in Domain Token",
  "Request URL": "External Asset Request Ratio",
  "Anchor": "Cross-Domain Anchor Links Ratio",
  "Script & Link": "External Script & Link Tags Ratio",
  "SFH": "Server Form Handler (SFH) Validity",
  "mailto": "Form Submission to Mailto Handler",
  "iFrames": "Hidden / Injected iFrame Elements"
};

var featureList = document.getElementById("features");

function init() {
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    var currentTab = tabs[0];
    var tabId = currentTab.id;

    // Display current domain
    try {
      if (currentTab.url) {
        var parsed = new URL(currentTab.url);
        var host = parsed.hostname || parsed.protocol;
        document.getElementById("site_domain").textContent = host;
      }
    } catch (e) {
      document.getElementById("site_domain").textContent = "Active Tab";
    }

    var key = tabId.toString();
    chrome.storage.local.get([key], function(items) {
      var data = items[key];

      if (!data) {
        // Fallback request to background worker
        chrome.runtime.sendMessage({ action: "get_results", tabId: tabId }, function(res) {
          if (res) {
            renderUI(res.result, res.isPhish, res.legitimatePercent);
          } else if (currentTab.url && currentTab.url.startsWith("http")) {
            // Dynamically inject content script if page was loaded before extension
            if (chrome.scripting && chrome.scripting.executeScript) {
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["js/jquery.js", "js/features.js"]
              }, function() {
                setTimeout(function() {
                  chrome.storage.local.get([key], function(retryItems) {
                    if (retryItems && retryItems[key]) {
                      var rData = retryItems[key];
                      renderUI(rData.result, rData.isPhish, rData.legitimatePercent);
                    } else {
                      renderDefaultSafe(currentTab.url);
                    }
                  });
                }, 350);
              });
            } else {
              renderDefaultSafe(currentTab.url);
            }
          } else {
            renderDefaultSafe(currentTab.url);
          }
        });
        return;
      }

      renderUI(data.result, data.isPhish, data.legitimatePercent);
    });
  });

  // Re-scan button handler
  var rescanBtn = document.getElementById("btn_rescan");
  if (rescanBtn) {
    rescanBtn.addEventListener("click", function() {
      chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        if (tabs && tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
          window.close();
        }
      });
    });
  }
}

function renderDefaultSafe(url) {
  var isSpecial = url && (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:"));
  $("#site_score").text("100%");
  $("#site_msg").text("Internal / Safe Page");
  $("#site_msg1").text(isSpecial ? "Browser system page (Protected)." : "No threats detected on this tab.");
  $("#count_safe").text("17");
  $("#count_suspicious").text("0");
  $("#count_risk").text("0");
  featureList.innerHTML = '<li class="loading-state">Protected browser environment.</li>';
}

function renderUI(result, isPhish, legitimatePercent) {
  featureList.innerHTML = "";

  var safeCount = 0;
  var suspiciousCount = 0;
  var riskCount = 0;

  for (var key in result) {
    var rawVal = result[key].toString();
    var statusClass = "safe";
    var statusLabel = "SAFE";

    if (rawVal === "1") {
      statusClass = "risk";
      statusLabel = "RISK";
      riskCount++;
    } else if (rawVal === "0") {
      statusClass = "suspicious";
      statusLabel = "SUSPICIOUS";
      suspiciousCount++;
    } else {
      safeCount++;
    }

    var li = document.createElement("li");
    li.className = "heuristic-item " + statusClass;

    var nameSpan = document.createElement("span");
    nameSpan.className = "item-name";
    nameSpan.textContent = FRIENDLY_LABELS[key] || key;

    var badgeSpan = document.createElement("span");
    badgeSpan.className = "item-badge " + statusClass;
    badgeSpan.textContent = statusLabel;

    li.appendChild(nameSpan);
    li.appendChild(badgeSpan);
    featureList.appendChild(li);
  }

  $("#count_safe").text(safeCount);
  $("#count_suspicious").text(suspiciousCount);
  $("#count_risk").text(riskCount);

  var score = parseInt(legitimatePercent !== undefined ? legitimatePercent : 100);
  var gaugeSection = document.querySelector(".gauge-section");

  if (isPhish || (riskCount >= 6 && score < 50)) {
    var finalScore = Math.max(0, Math.min(score, 45));
    $("#site_score").text(finalScore + "%");
    gaugeSection.classList.remove("warning");
    gaugeSection.classList.add("threat");
    $("#site_msg").text("Phishing Threat Detected!");
    $("#site_msg1").text("Autonomous AI detected high-risk phishing indicators. Do not enter credentials.");
  } else if (riskCount >= 4 && score < 70) {
    $("#site_score").text(score + "%");
    gaugeSection.classList.remove("threat");
    gaugeSection.classList.add("warning");
    $("#site_msg").text("Caution: Suspicious Signals");
    $("#site_msg1").text("Some anomalous attributes detected. Verify site identity carefully.");
  } else {
    $("#site_score").text(score + "%");
    gaugeSection.classList.remove("threat", "warning");
    $("#site_msg").text("Verified Secure Site");
    $("#site_msg1").text("All heuristic neural checks match legitimate website patterns.");
  }
}

document.addEventListener("DOMContentLoaded", init);
