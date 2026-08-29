
# coding: utf-8

import os
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score
import dump

X_train_path = '../dataset/X_train.npy'
y_train_path = '../dataset/y_train.npy'
X_test_path = '../dataset/X_test.npy'
y_test_path = '../dataset/y_test.npy'

if not os.path.exists(X_train_path) and os.path.exists('../../../model/X.npy'):
    X = np.load('../../../model/X.npy')
    Y = np.load('../../../model/Y.npy')
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.3, random_state=0)
else:
    X_train = np.load(X_train_path)
    y_train = np.load(y_train_path)
    X_test = np.load(X_test_path)
    y_test = np.load(y_test_path)

print('X_train: {0}, y_train: {1}'.format(X_train.shape, y_train.shape))

clf = RandomForestClassifier(n_estimators=10, random_state=42)
print('Cross Validation Score: {0}'.format(np.mean(cross_val_score(clf, X_train, y_train, cv=10))))

clf.fit(X_train, y_train)

pred = clf.predict(X_test)
print('Accuracy: {}'.format(accuracy_score(y_test, pred)))

os.makedirs('../../static', exist_ok=True)
os.makedirs('../../frontend/static', exist_ok=True)
clf_json = dump.forest_to_json(clf)
with open('../../static/classifier.json', 'w') as f:
    json.dump(clf_json, f)
with open('../../frontend/static/classifier.json', 'w') as f:
    json.dump(clf_json, f)
print('Saved classifier to static/classifier.json and frontend/static/classifier.json')
