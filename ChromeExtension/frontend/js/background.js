importScripts('randomforest.js');

var results = {};
var legitimatePercents = {};
var isPhish = {};

var FEATURE_KEYS = [
  "IP Address",
  "URL Length",
  "Tiny URL",
  "@ Symbol",
  "Redirecting using //",
  "(-) Prefix/Suffix in domain",
  "No. of Sub Domains",
  "HTTPS",
  "Favicon",
  "Port",
  "HTTPS in URL's domain part",
  "Request URL",
  "Anchor",
  "Script & Link",
  "SFH",
  "mailto",
  "iFrames"
];

function fetchLive(callback) {
  var localUrl = chrome.runtime.getURL('static/classifier.json');
  fetch(localUrl)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      chrome.storage.local.set({ cache: data, cacheTime: Date.now() }, function() {
        callback(data);
      });
    })
    .catch(function(err) {
      console.error("Error loading local classifier.json:", err);
    });
}

function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function(items) {
    if (items.cache && items.cacheTime) {
      return callback(items.cache);
    }
    fetchLive(callback);
  });
}

function classify(tabId, result) {
  var legitimateCount = 0;
  var suspiciousCount = 0;
  var phishingCount = 0;

  for (var i = 0; i < FEATURE_KEYS.length; i++) {
    var val = result[FEATURE_KEYS[i]];
    if (val === "1" || val === 1) phishingCount++;
    else if (val === "0" || val === 0) suspiciousCount++;
    else legitimateCount++;
  }

  var totalCount = phishingCount + suspiciousCount + legitimateCount;
  var legPercent = totalCount > 0 ? (legitimateCount / totalCount) * 100 : 100;
  legitimatePercents[tabId] = legPercent;

  var X = [FEATURE_KEYS.map(function(key) {
    return result[key] !== undefined ? parseInt(result[key]) : -1;
  })];

  fetchCLF(function(clf) {
    var rf = random_forest(clf);
    var y = rf.predict(X);
    var phishDetected = (y[0] && y[0][0]) ? true : false;

    var isThreat = phishDetected || (phishingCount >= 6 && legPercent < 50);
    var isSuspicious = !isThreat && (phishingCount >= 4 && legPercent < 70);

    isPhish[tabId] = isThreat;

    var tabData = {
      result: result,
      isPhish: isThreat,
      isSuspicious: isSuspicious,
      legitimatePercent: legPercent,
      phishingCount: phishingCount,
      suspiciousCount: suspiciousCount,
      legitimateCount: legitimateCount
    };

    var storageObj = {};
    storageObj[tabId.toString()] = tabData;
    chrome.storage.local.set(storageObj);

    // Update browser action badge
    if (chrome.action && chrome.action.setBadgeText) {
      if (isThreat) {
        chrome.action.setBadgeText({ tabId: tabId, text: "!" });
        chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#e63946" });
      } else if (isSuspicious) {
        chrome.action.setBadgeText({ tabId: tabId, text: "WARN" });
        chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#f59e0b" });
      } else {
        chrome.action.setBadgeText({ tabId: tabId, text: "OK" });
        chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#2a9d8f" });
      }
    }

    if (isThreat) {
      chrome.tabs.sendMessage(tabId, { action: "alert_user" }, function(response) {
        if (chrome.runtime.lastError) {
          // tab message listener optional error suppression
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.tab && sender.tab.id) {
    results[sender.tab.id] = request;
    classify(sender.tab.id, request);
    sendResponse({ received: "result" });
  } else if (request.action === "get_results" && request.tabId) {
    var key = request.tabId.toString();
    chrome.storage.local.get([key], function(items) {
      sendResponse(items[key] || null);
    });
    return true; // async sendResponse
  }
});
