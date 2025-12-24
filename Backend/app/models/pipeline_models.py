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


class CleanRequest(BaseModel):
    pipeline_id: str
    strategy: str = Field(..., description="Cleaning strategy: drop_rows, drop_columns, mean, median, mode, forward_fill, constant")
    columns: Optional[List[str]] = Field(default=None, description="Columns to clean (empty = all columns)")
    fill_value: Optional[str] = Field(default=None, description="Constant value to fill (for constant strategy)")


class CleanResponse(BaseModel):
    message: str
    missing_before: Dict[str, int]
    missing_after: Dict[str, int]
    rows_before: int
    rows_after: int
    cleaned_columns: List[str]


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
    model_type: str = Field(..., description="Model type: classification or regression models")
    task_type: str = Field(default="classification", description="Task type: classification or regression")


class TrainResponse(BaseModel):
    model_type: str
    task_type: str
    train_score: float
    test_score: float
    metrics: Dict[str, Any]
    message: str


class PipelineResults(BaseModel):
    pipeline_id: str
    dataset_info: Optional[DatasetInfo] = None
    preprocessing: Optional[Dict[str, Any]] = None
    split_info: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    training_results: Optional[Dict[str, Any]] = None
    visualizations: Optional[Dict[str, str]] = None
