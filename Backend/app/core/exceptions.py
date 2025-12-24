"""Custom exceptions for the ML Pipeline Builder"""


class MLPipelineException(Exception):
    """Base exception for ML Pipeline errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DatasetException(MLPipelineException):
    """Exception for dataset-related errors"""
    pass


class PreprocessingException(MLPipelineException):
    """Exception for preprocessing errors"""
    pass


class ModelTrainingException(MLPipelineException):
    """Exception for model training errors"""
    pass


class PipelineNotFoundException(MLPipelineException):
    """Exception when pipeline is not found"""
    def __init__(self, pipeline_id: str):
        super().__init__(
            f"Pipeline {pipeline_id} not found",
            status_code=404
        )


class ValidationException(MLPipelineException):
    """Exception for validation errors"""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)
