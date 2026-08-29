
# coding: utf-8

import os
import json
import numpy as np

try:
    import arff
except ImportError:
    import liac_arff as arff

from sklearn.model_selection import train_test_split, KFold

dataset_path = 'dataset.arff'
if os.path.exists(dataset_path):
    with open(dataset_path, 'r') as f:
        dataset = arff.load(f)
    data = np.array(dataset['data'])

    print('The dataset has {0} datapoints with {1} features'.format(data.shape[0], data.shape[1]-1))
    print('Features: {0}'.format([feature[0] for feature in dataset['attributes']]))

    data = data[:, [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 22, 30]]
    X, y = data[:, :-1], data[:, -1]
    y = y.reshape(y.shape[0])

    print('Before splitting')
    print('X: {0}, y: {1}'.format(X.shape, y.shape))
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
    print('After splitting')
    print('X_train: {0}, y_train: {1}, X_test: {2}, y_test: {3}'.format(
        X_train.shape, y_train.shape, X_test.shape, y_test.shape))

    np.save('X_train.npy', X_train)
    np.save('X_test.npy', X_test)
    np.save('y_train.npy', y_train)
    np.save('y_test.npy', y_test)
    print('Saved!')

    os.makedirs('../../static', exist_ok=True)
    os.makedirs('../../frontend/static', exist_ok=True)
    test_data = dict()
    test_data['X_test'] = X_test.tolist()
    test_data['y_test'] = y_test.tolist()

    with open('../../static/testdata.json', 'w') as tdfile:
        json.dump(test_data, tdfile)
    with open('../../frontend/static/testdata.json', 'w') as tdfile:
        json.dump(test_data, tdfile)
    print('Test Data written to testdata.json')
