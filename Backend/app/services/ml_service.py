import io
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.utils.storage import save_pipeline, load_pipeline, generate_pipeline_id, PIPELINES
from app.core.config import settings


class MLService:
    @staticmethod
    async def upload_dataset(file_content: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            raise ValueError("Unsupported file format")
        
        pipeline_id = generate_pipeline_id()
        
        dataset_info = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        }
        
        save_pipeline(pipeline_id, {
            "dataset": df.to_dict('records'),
            "dataset_info": dataset_info,
            "columns": df.columns.tolist(),
        })
        
        return pipeline_id, dataset_info
    
    @staticmethod
    async def preprocess_data(
        pipeline_id: str,
        scaler_type: str,
        columns: List[str]
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        df = pd.DataFrame(pipeline["dataset"])
        
        if scaler_type == "standardization":
            scaler = StandardScaler()
        elif scaler_type == "normalization":
            scaler = MinMaxScaler()
        else:
            raise ValueError(f"Unknown scaler type: {scaler_type}")
        
        df[columns] = scaler.fit_transform(df[columns])
        
        save_pipeline(pipeline_id, {
            "dataset": df.to_dict('records'),
            "preprocessing": {
                "scaler_type": scaler_type,
                "processed_columns": columns,
            },
        })
        
        return {
            "message": f"Data preprocessed using {scaler_type}",
            "processed_columns": columns,
        }
    
    @staticmethod
    async def split_data(
        pipeline_id: str,
        split_ratio: float,
        target_column: str
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        df = pd.DataFrame(pipeline["dataset"])
        
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found")
        
        X = df.drop(columns=[target_column])
        y = df[target_column]
        X_numeric = X.select_dtypes(include=[np.number])
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_numeric, y,
            train_size=split_ratio,
            random_state=settings.RANDOM_STATE
        )
        
        save_pipeline(pipeline_id, {
            "X_train": X_train.to_dict('records'),
            "X_test": X_test.to_dict('records'),
            "y_train": y_train.tolist(),
            "y_test": y_test.tolist(),
            "feature_columns": X_numeric.columns.tolist(),
            "target_column": target_column,
            "split_ratio": split_ratio,
        })
        
        return {
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features": X_numeric.columns.tolist(),
            "target_column": target_column,
            "message": f"Data split: {len(X_train)} train, {len(X_test)} test samples",
        }
    
    @staticmethod
    async def train_model(
        pipeline_id: str,
        model_type: str
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        if "X_train" not in pipeline:
            raise ValueError("Data must be split before training")
        
        X_train = pd.DataFrame(pipeline["X_train"])
        X_test = pd.DataFrame(pipeline["X_test"])
        y_train = np.array(pipeline["y_train"])
        y_test = np.array(pipeline["y_test"])
        
        if model_type == "logistic_regression":
            model = LogisticRegression(random_state=settings.RANDOM_STATE, max_iter=1000)
        elif model_type == "decision_tree":
            model = DecisionTreeClassifier(random_state=settings.RANDOM_STATE)
        elif model_type == "random_forest":
            model = RandomForestClassifier(random_state=settings.RANDOM_STATE, n_estimators=100)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model.fit(X_train, y_train)
        
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        train_accuracy = accuracy_score(y_train, y_train_pred)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        
        try:
            precision = precision_score(y_test, y_test_pred, average='weighted', zero_division=0)
            recall = recall_score(y_test, y_test_pred, average='weighted', zero_division=0)
            f1 = f1_score(y_test, y_test_pred, average='weighted', zero_division=0)
        except:
            precision = recall = f1 = 0.0
        
        metrics = {
            "train_accuracy": float(train_accuracy),
            "test_accuracy": float(test_accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
        }
        
        save_pipeline(pipeline_id, {
            "model_type": model_type,
            "model": model,
            "metrics": metrics,
            "predictions": {
                "train": y_train_pred.tolist(),
                "test": y_test_pred.tolist(),
            },
        })
        
        return {
            "model_type": model_type,
            "train_accuracy": train_accuracy,
            "test_accuracy": test_accuracy,
            "metrics": metrics,
            "message": f"Model trained successfully. Test accuracy: {test_accuracy:.4f}",
        }
    
    @staticmethod
    async def get_results(pipeline_id: str) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        return {
            "pipeline_id": pipeline_id,
            "dataset_info": pipeline.get("dataset_info"),
            "preprocessing": pipeline.get("preprocessing"),
            "split_info": {
                "train_size": len(pipeline.get("X_train", [])),
                "test_size": len(pipeline.get("X_test", [])),
                "features": pipeline.get("feature_columns", []),
                "target_column": pipeline.get("target_column"),
                "split_ratio": pipeline.get("split_ratio"),
            } if "X_train" in pipeline else None,
            "model_info": {
                "model_type": pipeline.get("model_type"),
                "metrics": pipeline.get("metrics"),
            } if "model_type" in pipeline else None,
        }
