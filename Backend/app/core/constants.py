"""
Constants for the ML Pipeline Builder
"""

# Model Types
MODEL_TYPES = {
    "classification": [
        "logistic_regression",
        "decision_tree_classifier",
        "random_forest_classifier"
    ],
    "regression": [
        "linear_regression",
        "ridge",
        "lasso",
        "decision_tree_regressor",
        "random_forest_regressor"
    ]
}

# Scaler Types
SCALER_TYPES = ["standard", "minmax"]

# Cleaning Strategies
CLEANING_STRATEGIES = [
    "drop_rows",
    "drop_columns",
    "mean",
    "median",
    "mode",
    "forward_fill",
    "constant"
]

# File Extensions
ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]

# Validation Limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_COLUMNS = 1000
MAX_ROWS = 1000000

# Default Values
DEFAULT_TEST_SIZE = 0.2
DEFAULT_RANDOM_STATE = 42
DEFAULT_SCALER = "standard"
DEFAULT_CLEANING_STRATEGY = "mean"
