import json
import os
import uuid
from typing import Any, Dict, Optional
from pathlib import Path

PIPELINES: Dict[str, Dict[str, Any]] = {}


def generate_pipeline_id() -> str:
    return str(uuid.uuid4())


def save_pipeline(pipeline_id: str, data: Dict[str, Any]) -> None:
    if pipeline_id not in PIPELINES:
        PIPELINES[pipeline_id] = {}
    
    PIPELINES[pipeline_id].update(data)


def load_pipeline(pipeline_id: str) -> Optional[Dict[str, Any]]:
    return PIPELINES.get(pipeline_id)


def delete_pipeline(pipeline_id: str) -> bool:
    if pipeline_id in PIPELINES:
        del PIPELINES[pipeline_id]
        return True
    return False


def list_pipelines() -> Dict[str, Dict[str, Any]]:
    return PIPELINES
