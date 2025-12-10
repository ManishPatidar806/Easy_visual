"""Pipeline storage utilities"""
import json
import os
import uuid
from typing import Any, Dict, Optional
from pathlib import Path

# In-memory storage for pipelines
PIPELINES: Dict[str, Dict[str, Any]] = {}


def generate_pipeline_id() -> str:
    """Generate a unique pipeline ID"""
    return str(uuid.uuid4())


def save_pipeline(pipeline_id: str, data: Dict[str, Any]) -> None:
    """Save or update pipeline data"""
    if pipeline_id not in PIPELINES:
        PIPELINES[pipeline_id] = {}
    
    PIPELINES[pipeline_id].update(data)


def load_pipeline(pipeline_id: str) -> Optional[Dict[str, Any]]:
    """Load pipeline data by ID"""
    return PIPELINES.get(pipeline_id)


def delete_pipeline(pipeline_id: str) -> bool:
    """Delete a pipeline"""
    if pipeline_id in PIPELINES:
        del PIPELINES[pipeline_id]
        return True
    return False


def list_pipelines() -> Dict[str, Dict[str, Any]]:
    """List all pipelines"""
    return PIPELINES
