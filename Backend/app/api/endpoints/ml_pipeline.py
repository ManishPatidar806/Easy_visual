"""ML Pipeline API endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any

from app.models.pipeline_models import (
    UploadResponse,
    PreprocessRequest,
    PreprocessResponse,
    SplitRequest,
    SplitResponse,
    TrainRequest,
    TrainResponse,
    PipelineResults,
    DatasetInfo,
)
from app.services.ml_service import MLService

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a dataset (CSV or Excel) to start a new ML pipeline
    
    - **file**: Dataset file (CSV or XLSX)
    
    Returns pipeline ID and dataset information
    """
    try:
        # Read file content
        content = await file.read()
        
        # Process upload
        pipeline_id, dataset_info = await MLService.upload_dataset(
            content, 
            file.filename or "dataset.csv"
        )
        
        return UploadResponse(
            pipeline_id=pipeline_id,
            dataset_info=DatasetInfo(**dataset_info),
            message=f"Dataset uploaded successfully: {dataset_info['rows']} rows, {dataset_info['columns']} columns"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/preprocess", response_model=PreprocessResponse)
async def preprocess_data(request: PreprocessRequest):
    """
    Preprocess data with scaling
    
    - **pipeline_id**: Pipeline identifier
    - **scaler_type**: standardization or normalization
    - **columns**: List of numeric columns to preprocess
    """
    try:
        result = await MLService.preprocess_data(
            request.pipeline_id,
            request.scaler_type,
            request.columns
        )
        return PreprocessResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/split", response_model=SplitResponse)
async def split_data(request: SplitRequest):
    """
    Split dataset into training and testing sets
    
    - **pipeline_id**: Pipeline identifier
    - **split_ratio**: Train/test split ratio (0.1 to 0.9)
    - **target_column**: Name of the target column
    """
    try:
        result = await MLService.split_data(
            request.pipeline_id,
            request.split_ratio,
            request.target_column
        )
        return SplitResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Train a machine learning model
    
    - **pipeline_id**: Pipeline identifier
    - **model_type**: logistic_regression, decision_tree, or random_forest
    """
    try:
        print(f"responseModel is : {request.pipeline_id} , {request.model_type}")
        result = await MLService.train_model(
            request.pipeline_id,
            request.model_type
        )
        return TrainResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/results/{pipeline_id}", response_model=PipelineResults)
async def get_results(pipeline_id: str):
    """
    Get complete pipeline results
    
    - **pipeline_id**: Pipeline identifier
    """
    try:
        result = await MLService.get_results(pipeline_id)
        return PipelineResults(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
