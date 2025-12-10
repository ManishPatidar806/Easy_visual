"""API router initialization"""
from fastapi import APIRouter
from app.api.endpoints import ml_pipeline

api_router = APIRouter()

# Include ML pipeline endpoints
api_router.include_router(
    ml_pipeline.router,
    prefix="/ml",
    tags=["ML Pipeline"]
)
