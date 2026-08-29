importScripts('randomforest.js');

var results = {};
var legitimatePercents = {};
var isPhish = {};

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
  for (var key in result) {
    if (result[key] == "1") phishingCount++;
    else if (result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }

  var totalCount = phishingCount + suspiciousCount + legitimateCount;
  var legPercent = totalCount > 0 ? (legitimateCount / totalCount) * 100 : 100;
  legitimatePercents[tabId] = legPercent;

  if (Object.keys(result).length > 0) {
    var X = [[]];
    for (var key in result) {
      X[0].push(parseInt(result[key]));
    }

    fetchCLF(function(clf) {
      var rf = random_forest(clf);
      var y = rf.predict(X);
      var phishDetected = y[0] && y[0][0] ? true : false;
      isPhish[tabId] = phishDetected;

      var tabData = {
        result: result,
        isPhish: phishDetected,
        legitimatePercent: legPercent
      };

      var storageObj = {};
      storageObj[tabId.toString()] = tabData;
      chrome.storage.local.set(storageObj);

      if (phishDetected) {
        chrome.tabs.sendMessage(tabId, { action: "alert_user" }, function(response) {
          if (chrome.runtime.lastError) {
            // tab message listener optional error suppression
          }
        });
      }
    });
  }
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