from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class DatasetInfo(BaseModel):
    rows: int
    columns: int
    column_names: List[str]
    column_types: Dict[str, str]


class UploadResponse(BaseModel):
    pipeline_id: str
    dataset_info: DatasetInfo
    message: str


class PreprocessRequest(BaseModel):
    pipeline_id: str
    scaler_type: str = Field(..., description="standardization or normalization")
    columns: List[str] = Field(..., description="Columns to preprocess")


class PreprocessResponse(BaseModel):
    message: str
    processed_columns: List[str]


class SplitRequest(BaseModel):
    pipeline_id: str
    split_ratio: float = Field(..., ge=0.1, le=0.9, description="Train split ratio")
    target_column: str


class SplitResponse(BaseModel):
    train_size: int
    test_size: int
    features: List[str]
    target_column: str
    message: str


class TrainRequest(BaseModel):
    pipeline_id: str
    model_type: str = Field(..., description="Model type: logistic_regression, decision_tree, random_forest")


class TrainResponse(BaseModel):
    model_type: str
    train_accuracy: float
    test_accuracy: float
    metrics: Dict[str, Any]
    message: str


class PipelineResults(BaseModel):
    pipeline_id: str
    dataset_info: Optional[DatasetInfo] = None
    preprocessing: Optional[Dict[str, Any]] = None
    split_info: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    training_results: Optional[Dict[str, Any]] = None
