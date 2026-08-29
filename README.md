# Neural Cyber Security: AI-Driven Real-Time Threat Detection & Autonomous Defence

A machine learning & browser security system designed for real-time phishing URL detection and autonomous threat analysis using Scikit-Learn classifiers and a modern Chrome Extension (Manifest V3).

## Project Architecture

- **Machine Learning Pipeline (`PhishingCatchers.ipynb` & `model/`)**:
  - Trains SVM, Random Forest, and XGBoost models on phishing URL feature datasets.
  - Generates model performance metrics, accuracy comparisons, and confusion matrices.
- **Backend Model Export & Preprocessing (`ChromeExtension/backend/`)**:
  - `preprocess.py`: Extracts 17 security heuristic features from ARFF datasets.
  - `dump.py`: Serializes Scikit-learn Decision Trees into lightweight JSON structure (`classifier.json`).
  - `training.py`: Trains RandomForest model and outputs `classifier.json`.
- **Chrome Extension (`ChromeExtension/frontend/`)**:
  - Manifest V3 compliant service worker architecture.
  - `features.js`: Extracts 17 client-side DOM & URL security features.
  - `randomforest.js`: Pure JavaScript Random Forest decision tree inference engine.
  - `plugin_ui.html` & `plugin_ui.js`: Extension popup UI displaying safety score and feature analysis.

## Setup & Installation

### 1. Requirements

Install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `ChromeExtension/frontend`.
4. Open any site and click the extension icon to view live threat classification.

### 3. Testing Model Accuracy

Open `ChromeExtension/frontend/test.html` in a web browser to run client-side JavaScript Random Forest inference against test splits.
