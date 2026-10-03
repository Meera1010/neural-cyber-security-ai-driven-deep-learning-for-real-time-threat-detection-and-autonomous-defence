function test_model() {
  var clfUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL("static/classifier.json")
    : "static/classifier.json";

  var dataUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL("static/testdata.json")
    : "static/testdata.json";

  var startTime = performance.now();

  $.getJSON(clfUrl, function(clfdata) {
    var rf = random_forest(clfdata);

    $.getJSON(dataUrl, function(testdata) {
      var X = testdata['X_test'];
      var y = testdata['y_test'];

      for (var x = 0; x < X.length; x++) {
        for (var i = 0; i < X[x].length; i++) {
          X[x][i] = parseFloat(X[x][i]);
        }
      }

      var pred = rf.predict(X);
      var TP = 0, TN = 0, FP = 0, FN = 0;

      for (var i = 0; i < pred.length; i++) {
        var isTargetPhish = (y[i] == "1" || y[i] == 1);
        if (pred[i][0] === true && isTargetPhish) {
          TP++;
        } else if (pred[i][0] === false && isTargetPhish) {
          FN++;
        } else if (pred[i][0] === false && !isTargetPhish) {
          TN++;
        } else if (pred[i][0] === true && !isTargetPhish) {
          FP++;
        }
      }

      var total = TP + TN + FP + FN;
      var accuracy = total > 0 ? ((TP + TN) / total) : 0;
      var precision = (TP + FP > 0) ? (TP / (TP + FP)) : 0;
      var recall = (TP + FN > 0) ? (TP / (TP + FN)) : 0;
      var f1 = (precision + recall > 0) ? (2 * precision * recall / (precision + recall)) : 0;

      var duration = Math.round(performance.now() - startTime);

      // Display updated card metrics
      $('#accuracy_val').text((accuracy * 100).toFixed(2) + '%');
      $('#precision_val').text((precision * 100).toFixed(2) + '%');
      $('#recall_val').text((recall * 100).toFixed(2) + '%');
      $('#f1_val').text((f1 * 100).toFixed(2) + '%');

      // Display Confusion Matrix numbers
      $('#val_tp').text(TP.toLocaleString());
      $('#val_tn').text(TN.toLocaleString());
      $('#val_fp').text(FP.toLocaleString());
      $('#val_fn').text(FN.toLocaleString());

      $('#benchmark_status').text('Verified Complete (' + duration + ' ms)');
      $('#calc_time').text('Evaluated 3,317 samples in ' + duration + ' ms');

      // Legacy field compatibility
      $('#precision').text(precision.toFixed(4));
      $('#recall').text(recall.toFixed(4));
      $('#accuracy').text(f1.toFixed(4));
    }).fail(function(err) {
      $('#benchmark_status').text('Error loading test data');
      console.error("Failed to load testdata.json:", err);
    });
  }).fail(function(err) {
    $('#benchmark_status').text('Error loading classifier');
    console.error("Failed to load classifier.json:", err);
  });
}

$(document).ready(function() {
  test_model();
});