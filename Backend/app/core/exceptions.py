"""Custom exceptions for the EasyVisual"""


class MLPipelineException(Exception):
    """Base exception for ML Pipeline errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
