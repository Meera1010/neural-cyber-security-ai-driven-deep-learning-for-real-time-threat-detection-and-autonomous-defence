
let decision_tree = function(root) {
  var predictOne = function(x) {
    var node = root;
    while(node['type'] == 'split') {
      var threshold = node['threshold'].split(' <= ');
      var featureIdx = parseInt(threshold[0]);
      var thresholdVal = parseFloat(threshold[1]);
      if(parseFloat(x[featureIdx]) <= thresholdVal) { //Left
        node = node['left'];
      } else { //Right
        node = node['right'];
      }
    }
    return node['value'][0];
  }

  var predict = function(X) {
    var pred = [];
    for(let x in X) {
      pred.push(predictOne(X[x]));
    }
    return pred;
  }

  return {
    'predict': predict,
    'predictOne': predictOne
  }
}

let random_forest = function(clf) {
  var predict = function(X) {
    var pred = [];
    for(let e in clf['estimators']) {
      let tree = decision_tree(clf['estimators'][e]);
      pred.push(tree.predict(X));
    }
    pred = pred[0].map((col, i) => pred.map(row => row[i]));
    var results = [];
    for(var p in pred) {
      let positive=0, negative=0;
      for(let i in pred[p]) {
        positive += pred[p][i][1] || 0;
        negative += pred[p][i][0] || 0;
      }
      results.push([positive >= negative, Math.max(positive, negative)]);
    }
    return results;
  }

  return {
    'predict': predict
  }
}