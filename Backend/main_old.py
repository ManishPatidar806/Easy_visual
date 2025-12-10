from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import io
import json
import uuid
from datetime import datetime

app = FastAPI(title="ML Pipeline API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory pipeline storage
pipelines: Dict[str, Dict[str, Any]] = {}


# ============== Models ==============
class PreprocessRequest(BaseModel):
    pipeline_id: str
    scaler_type: str
    columns: List[str]


class SplitRequest(BaseModel):
    pipeline_id: str
    split_ratio: float
    target_column: str


class TrainRequest(BaseModel):
    pipeline_id: str
    model_type: str


# ============== Helper Functions ==============
def get_pipeline(pipeline_id: str) -> Dict[str, Any]:
    if pipeline_id not in pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipelines[pipeline_id]


def save_pipeline(pipeline_id: str, data: Dict[str, Any]):
    if pipeline_id not in pipelines:
        pipelines[pipeline_id] = {"id": pipeline_id, "created_at": datetime.now().isoformat()}
    pipelines[pipeline_id].update(data)


# ============== API Endpoints ==============

@app.get("/")
def read_root():
    return {"message": "ML Pipeline API", "version": "1.0.0"}


@app.post("/api/ml/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload and parse CSV/XLSX dataset"""
    try:
        contents = await file.read()
        
        # Parse file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XLSX")
        
        # Generate pipeline ID
        pipeline_id = str(uuid.uuid4())
        
        # Store raw dataset
        save_pipeline(pipeline_id, {
            "raw_data": df.to_dict('records'),
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "shape": df.shape,
            "filename": file.filename,
        })
        
        # Get dataset info
        dataset_info = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "column_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
            "preview": df.head(5).to_dict('records'),
        }
        
        return {
            "success": True,
            "pipeline_id": pipeline_id,
            "dataset_info": dataset_info,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/api/ml/preprocess")
async def preprocess_data(request: PreprocessRequest):
    """Apply standardization or normalization to selected columns"""
    try:
        pipeline = get_pipeline(request.pipeline_id)
        
        # Reconstruct dataframe
        df = pd.DataFrame(pipeline["raw_data"])
        
        # Validate columns
        invalid_cols = [col for col in request.columns if col not in df.columns]
        if invalid_cols:
            raise HTTPException(status_code=400, detail=f"Invalid columns: {invalid_cols}")
        
        # Apply scaling
        df_processed = df.copy()
        
        if request.scaler_type == "standardization":
            scaler = StandardScaler()
        elif request.scaler_type == "normalization":
            scaler = MinMaxScaler()
        else:
            raise HTTPException(status_code=400, detail="Invalid scaler type")
        
        df_processed[request.columns] = scaler.fit_transform(df[request.columns])
        
        # Update pipeline
        save_pipeline(request.pipeline_id, {
            "processed_data": df_processed.to_dict('records'),
            "scaler": request.scaler_type,
            "scaled_columns": request.columns,
        })
        
        return {
            "success": True,
            "message": f"Applied {request.scaler_type} to {len(request.columns)} columns",
            "processed_rows": len(df_processed),
            "preview": df_processed.head(5).to_dict('records'),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")


@app.post("/api/ml/split")
async def split_data(request: SplitRequest):
    """Split dataset into train and test sets"""
    try:
        pipeline = get_pipeline(request.pipeline_id)
        
        # Use processed data if available, otherwise raw
        data_key = "processed_data" if "processed_data" in pipeline else "raw_data"
        df = pd.DataFrame(pipeline[data_key])
        
        # Validate target column
        if request.target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found")
        
        # Prepare features and target
        X = df.drop(columns=[request.target_column])
        y = df[request.target_column]
        
        # Handle non-numeric features
        X_numeric = X.select_dtypes(include=[np.number])
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_numeric, y, 
            train_size=request.split_ratio, 
            random_state=42
        )
        
        # Store split data
        save_pipeline(request.pipeline_id, {
            "X_train": X_train.to_dict('records'),
            "X_test": X_test.to_dict('records'),
            "y_train": y_train.tolist(),
            "y_test": y_test.tolist(),
            "feature_columns": X_numeric.columns.tolist(),
            "target_column": request.target_column,
            "split_ratio": request.split_ratio,
        })
        
        return {
            "success": True,
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features": len(X_numeric.columns),
            "target_column": request.target_column,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Split error: {str(e)}")


@app.post("/api/ml/train")
async def train_model(request: TrainRequest):
    """Train a machine learning model"""
    try:
        pipeline = get_pipeline(request.pipeline_id)
        
        # Validate split data exists
        if "X_train" not in pipeline:
            raise HTTPException(status_code=400, detail="No training data. Run split first.")
        
        # Reconstruct data
        X_train = pd.DataFrame(pipeline["X_train"])
        X_test = pd.DataFrame(pipeline["X_test"])
        y_train = np.array(pipeline["y_train"])
        y_test = np.array(pipeline["y_test"])
        
        # Select model
        if request.model_type == "logistic_regression":
            model = LogisticRegression(max_iter=1000, random_state=42)
        elif request.model_type == "decision_tree":
            model = DecisionTreeClassifier(random_state=42)
        elif request.model_type == "random_forest":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Train model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Calculate metrics
        train_accuracy = accuracy_score(y_train, y_pred_train)
        test_accuracy = accuracy_score(y_test, y_pred_test)
        
        # Get classification report
        report = classification_report(y_test, y_pred_test, output_dict=True, zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred_test)
        
        # Store results
        save_pipeline(request.pipeline_id, {
            "model_type": request.model_type,
            "train_accuracy": float(train_accuracy),
            "test_accuracy": float(test_accuracy),
            "predictions": y_pred_test.tolist(),
            "classification_report": report,
            "confusion_matrix": cm.tolist(),
            "trained_at": datetime.now().isoformat(),
        })
        
        return {
            "success": True,
            "model_type": request.model_type,
            "train_accuracy": float(train_accuracy),
            "test_accuracy": float(test_accuracy),
            "metrics": {
                "accuracy": float(test_accuracy),
                "precision": float(report.get("weighted avg", {}).get("precision", 0)),
                "recall": float(report.get("weighted avg", {}).get("recall", 0)),
                "f1_score": float(report.get("weighted avg", {}).get("f1-score", 0)),
            },
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@app.get("/api/ml/results/{pipeline_id}")
async def get_results(pipeline_id: str):
    """Get full pipeline results"""
    try:
        pipeline = get_pipeline(pipeline_id)
        
        if "test_accuracy" not in pipeline:
            raise HTTPException(status_code=400, detail="No model results. Train a model first.")
        
        return {
            "success": True,
            "pipeline_id": pipeline_id,
            "model_type": pipeline.get("model_type"),
            "train_accuracy": pipeline.get("train_accuracy"),
            "test_accuracy": pipeline.get("test_accuracy"),
            "metrics": {
                "accuracy": pipeline.get("test_accuracy"),
                "precision": pipeline.get("classification_report", {}).get("weighted avg", {}).get("precision", 0),
                "recall": pipeline.get("classification_report", {}).get("weighted avg", {}).get("recall", 0),
                "f1_score": pipeline.get("classification_report", {}).get("weighted avg", {}).get("f1-score", 0),
            },
            "confusion_matrix": pipeline.get("confusion_matrix"),
            "dataset_info": {
                "rows": pipeline.get("shape", [0])[0],
                "columns": pipeline.get("shape", [0, 0])[1],
                "features": len(pipeline.get("feature_columns", [])),
                "target": pipeline.get("target_column"),
            },
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Results error: {str(e)}")


@app.get("/api/ml/pipelines")
async def list_pipelines():
    """List all pipelines"""
    return {
        "success": True,
        "pipelines": [
            {
                "id": pid,
                "filename": p.get("filename"),
                "created_at": p.get("created_at"),
                "has_model": "model_type" in p,
            }
            for pid, p in pipelines.items()
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
