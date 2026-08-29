var colors = {
  "-1": "#58bc8a",
  "0": "#ffeb3c",
  "1": "#ff8b66"
};

var featureList = document.getElementById("features");

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
  if (!tabs || !tabs[0]) return;
  var tabId = tabs[0].id;
  var key = tabId.toString();

  chrome.storage.local.get([key], function(items) {
    var data = items[key];

    if (!data) {
      // Fallback request to background worker
      chrome.runtime.sendMessage({ action: "get_results", tabId: tabId }, function(res) {
        if (res) renderUI(res.result, res.isPhish, res.legitimatePercent);
      });
      return;
    }

    renderUI(data.result, data.isPhish, data.legitimatePercent);
  });
});

function renderUI(result, isPhish, legitimatePercent) {
  featureList.innerHTML = "";

  for (var key in result) {
    var newFeature = document.createElement("li");
    newFeature.textContent = key;
    newFeature.style.backgroundColor = colors[result[key]] || "#cccccc";
    featureList.appendChild(newFeature);
  }

  var score = parseInt(legitimatePercent || 100);
  $("#site_score").text(score + "%");

  if (isPhish) {
    $("#res-circle").css("background", "#ff8b66");
    $("#site_msg").text("Warning: Phishing Alert!");
    $("#site_msg1").text("Suspicious patterns detected on this website.");
    $("#site_score").text(Math.max(0, score - 20) + "%");
  } else {
    $("#res-circle").css("background", "#58bc8a");
    $("#site_msg").text("Safe to use");
    $("#site_msg1").text("No obvious phishing indicators found.");
  }
}


