
# coding: utf-8

from sklearn.tree import _tree


def tree_to_json(tree):
    tree_ = tree.tree_
    max_feat = max(getattr(tree_, 'n_features', 100), max(tree_.feature) + 1)
    feature_names = list(range(max_feat))
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]


    def recurse(node):
        tree_json = dict()
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            tree_json['type'] = 'split'
            threshold = tree_.threshold[node]
            tree_json['threshold'] = "{} <= {}".format(feature_name[node], threshold)
            tree_json['left'] = recurse(tree_.children_left[node])
            tree_json['right'] = recurse(tree_.children_right[node])
        else:
            tree_json['type'] = 'leaf'
            tree_json['value'] = tree_.value[node].tolist()
        return tree_json

    return recurse(0)


def forest_to_json(forest):
    forest_json = dict()
    n_feat = forest.n_features_in_ if hasattr(forest, 'n_features_in_') else getattr(forest, 'n_features_', 17)
    forest_json['n_features'] = n_feat
    forest_json['n_classes'] = forest.n_classes_
    forest_json['classes'] = forest.classes_.tolist()
    forest_json['n_outputs'] = forest.n_outputs_
    forest_json['n_estimators'] = forest.n_estimators
    forest_json['estimators'] = [tree_to_json(estimator) for estimator in forest.estimators_]
    return forest_json