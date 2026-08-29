function test_model() {
  var clfUrl = "static/classifier.json";
  var dataUrl = "static/testdata.json";
  
  $.getJSON(clfUrl, function(clfdata) {
    var rf = random_forest(clfdata);
    $.getJSON(dataUrl, function(testdata) {
      var X = testdata['X_test'];
      var y = testdata['y_test'];
      for(var x = 0; x < X.length; x++) {
        for(var i = 0; i < X[x].length; i++) {
          X[x][i] = parseFloat(X[x][i]);
        } 
      }
      var pred = rf.predict(X);
      var TP = 0, TN = 0, FP = 0, FN = 0;
      for(var i = 0; i < pred.length; i++) {
        var isTargetPhish = (y[i] == "1" || y[i] == 1);
        if(pred[i][0] == true && isTargetPhish) {
          TP++;
        } else if(pred[i][0] == false && isTargetPhish) {
          FN++;
        } else if(pred[i][0] == false && !isTargetPhish) {
          TN++;
        } else if(pred[i][0] == true && !isTargetPhish) {
          FP++;
        }
      }
      var precision = (TP + FP > 0) ? (TP / (TP + FP)) : 0;
      var recall = (TP + FN > 0) ? (TP / (TP + FN)) : 0;
      var f1 = (precision + recall > 0) ? (2 * precision * recall / (precision + recall)) : 0;
      $('#precision').text(precision.toFixed(4));
      $('#recall').text(recall.toFixed(4));
      $('#accuracy').text(f1.toFixed(4));
    });
  });
}

$(document).ready(function() {
  test_model();
});
