# EasyVisual

A visual, no-code machine learning pipeline builder. Drag and drop nodes to upload datasets, clean data, preprocess features, split data, train ML models, evaluate performance, and export model configurations.

---

## 🌟 Features

- **Visual Pipeline Canvas**: Drag and drop nodes to build ML workflows.
- **Dataset Upload**: Supports `.csv`, `.xlsx`, and `.xls` files.
- **Data Cleaning**: Handle missing values with automated cleaning strategies.
- **Data Preprocessing**: Scale numeric features using Standardization (`StandardScaler`) or Normalization (`MinMaxScaler`).
- **Train-Test Split**: Set train/test ratios and select the target column.
- **ML Model Algorithms**:
  - **Classification**: Logistic Regression, Decision Tree, Random Forest
  - **Regression**: Linear Regression, Ridge Regression, Lasso Regression
- **Results & Evaluation**: View accuracy, precision, recall, F1-score, R² score, MAE, MSE, RMSE, confusion matrix, and performance charts.
- **Model Export**: Download model configuration, serialized fitted pipeline, Python runner script, FastAPI microservice code, and pure math formula.

---

## 🎯 ML Pipeline Nodes

| Node | Description |
|------|-------------|
| **Upload Dataset** | Upload CSV or Excel files |
| **Clean Data** | Clean missing values in the dataset |
| **Preprocess Data** | Scale numeric feature columns |
| **Train-Test Split** | Split data into training and test sets |
| **Train Model** | Train classification or regression model |
| **View Results** | Display evaluation metrics and charts |
| **Export Model** | Download `model_config.json` bundle |

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Backend runs at: `http://localhost:8000` (Docs at `http://localhost:8000/docs`)

### 2. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 📄 Understanding `model_config.json`

When you click **Download JSON Model Config**, a single `model_config.json` file is saved. It contains:

- `model_type` & `task_type`: Model algorithm and task category.
- `feature_columns` & `target_column`: Required inputs and target column.
- `feature_schema`: Input data types, min/max bounds, and sample values.
- `pipeline_base64`: Serialized fitted pipeline (includes both scalers & model).
- `python_runner_code`: Ready-to-run Python prediction script.
- `fastapi_microservice_code`: Ready-to-run FastAPI REST server script.
- `pure_math_code`: Standalone math formula without external libraries.

---

## 💡 Simple Way to Use `model_config.json`

### Simple Python Prediction (3 Steps)

1. Put `model_config.json` in your Python project folder.
2. Run this script:

```python
import json
import base64
import pickle
import pandas as pd

# Step 1: Load model_config.json
with open("model_config.json", "r") as f:
    config = json.load(f)

# Step 2: Load the fitted pipeline
pipeline = pickle.loads(base64.b64decode(config["pipeline_base64"]))

# Step 3: Predict on any new data (pass values for your feature_columns)
sample_input = {col: 0.0 for col in config["feature_columns"]}
new_data = pd.DataFrame([sample_input])

predictions = pipeline.predict(new_data)
print("🚀 Prediction:", predictions[0])
```

---

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API welcome message |
| `/health` | GET | Health status check |
| `/api/ml/upload` | POST | Upload dataset file |
| `/api/ml/clean` | POST | Clean dataset |
| `/api/ml/preprocess` | POST | Apply feature scaling |
| `/api/ml/split` | POST | Split dataset into train and test sets |
| `/api/ml/train` | POST | Train machine learning model |
| `/api/ml/results/{id}` | GET | Retrieve training metrics and charts |
| `/api/ml/export/{id}` | GET | Export model configuration JSON |

---

## 📝 License

Licensed under the MIT License.
