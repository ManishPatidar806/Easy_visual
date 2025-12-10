from fastapi import APIRouter
from app.api.endpoints import ml_pipeline

api_router = APIRouter()

api_router.include_router(
    ml_pipeline.router,
    prefix="/ml",
    tags=["ML Pipeline"]
)
