import io
import base64
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

from app.utils.storage import save_pipeline, load_pipeline, generate_pipeline_id, PIPELINES
from app.core.config import settings


class MLService:
    @staticmethod
    async def upload_dataset(file_content: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file_content))
            else:
                raise ValueError(
                    "❌ Unsupported file format! Please upload a CSV (.csv) or Excel (.xlsx, .xls) file. "
                    "Your file should contain data in rows and columns, like a spreadsheet."
                )
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(
                f"❌ Could not read the file. Make sure your file is not corrupted and contains valid data. "
                f"Error details: {str(e)}"
            )
        
        if df.empty:
            raise ValueError(
                "❌ The uploaded file is empty! Please make sure your file contains data (rows and columns)."
            )
        
        pipeline_id = generate_pipeline_id()
        
        dataset_info = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "sample_rows": df.head(5).to_dict('records'),
        }
        
        save_pipeline(pipeline_id, {
            "dataset": df.to_dict('records'),
            "dataset_info": dataset_info,
            "columns": df.columns.tolist(),
        })
        
        return pipeline_id, dataset_info
    
    @staticmethod
    async def clean_data(
        pipeline_id: str,
        strategy: str,
        columns: List[str] = None,
        fill_value: str = None
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(
                "❌ Data not found! Please make sure you've uploaded a dataset first. "
                "Connect this Clean Data node to an Upload node and execute the Upload node."
            )
        
        df = pd.DataFrame(pipeline["dataset"])
        
        # Get columns to clean (if not specified, use all columns)
        if columns is None or len(columns) == 0:
            columns = df.columns.tolist()
        
        # Check if columns exist
        missing_columns = [col for col in columns if col not in df.columns]
        if missing_columns:
            raise ValueError(
                f"❌ Column(s) not found: {', '.join(missing_columns)}. "
                f"Available columns are: {', '.join(df.columns.tolist())}. "
                "Please check your column selection."
            )
        
        # Count missing values before cleaning
        missing_counts = df.isnull().sum()
        missing_before = missing_counts.sum()
        
        if missing_before == 0:
            missing_dict = {col: 0 for col in df.columns}
            save_pipeline(pipeline_id, {
                "dataset": df.to_dict('records'),
                "cleaning": {
                    "strategy": strategy,
                    "columns": columns,
                    "missing_before": missing_dict,
                    "missing_after": missing_dict,
                },
            })
            return {
                "message": "✅ No missing values found. Data is clean!",
                "missing_before": missing_dict,
                "missing_after": missing_dict,
                "rows_before": len(df),
                "rows_after": len(df),
                "cleaned_columns": columns,
            }
        
        try:
            if strategy == "drop_rows":
                # Drop rows with any missing values in selected columns
                df = df.dropna(subset=columns)
            
            elif strategy == "drop_columns":
                # Drop columns that have missing values
                cols_to_drop = [col for col in columns if df[col].isnull().any()]
                df = df.drop(columns=cols_to_drop)
                columns = [col for col in columns if col not in cols_to_drop]
            
            elif strategy == "mean":
                # Fill with mean (numeric columns only)
                for col in columns:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col].fillna(df[col].mean(), inplace=True)
                    else:
                        # For non-numeric, use mode
                        df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown", inplace=True)
            
            elif strategy == "median":
                # Fill with median (numeric columns only)
                for col in columns:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col].fillna(df[col].median(), inplace=True)
                    else:
                        # For non-numeric, use mode
                        df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown", inplace=True)
            
            elif strategy == "mode":
                # Fill with most frequent value
                for col in columns:
                    mode_val = df[col].mode()[0] if not df[col].mode().empty else (0 if pd.api.types.is_numeric_dtype(df[col]) else "Unknown")
                    df[col].fillna(mode_val, inplace=True)
            
            elif strategy == "forward_fill":
                # Fill with previous value
                df[columns] = df[columns].fillna(method='ffill')
                # If still have NaN at the beginning, use backward fill
                df[columns] = df[columns].fillna(method='bfill')
            
            elif strategy == "constant":
                # Fill with constant value from user input
                for col in columns:
                    if fill_value is not None:
                        # Try to convert to appropriate type
                        if pd.api.types.is_numeric_dtype(df[col]):
                            try:
                                fill_val = float(fill_value)
                            except:
                                fill_val = 0
                        else:
                            fill_val = str(fill_value)
                    else:
                        # Default: 0 for numeric, "Missing" for text
                        fill_val = 0 if pd.api.types.is_numeric_dtype(df[col]) else "Missing"
                    df[col].fillna(fill_val, inplace=True)
            
            else:
                raise ValueError(
                    f"❌ Unknown cleaning strategy: {strategy}. "
                    "Please choose one of: drop_rows, drop_columns, mean, median, mode, forward_fill, or constant."
                )
        
        except Exception as e:
            raise ValueError(
                f"❌ Data cleaning failed! This can happen if the strategy is not suitable for your data. "
                f"Error details: {str(e)}"
            )
        
        # Count missing values after cleaning
        missing_after_dict = df.isnull().sum().to_dict()
        missing_before_dict = missing_counts.to_dict()
        rows_before = len(pipeline["dataset"])
        rows_after = len(df)
        
        save_pipeline(pipeline_id, {
            "dataset": df.to_dict('records'),
            "cleaning": {
                "strategy": strategy,
                "columns": columns,
                "missing_before": missing_before_dict,
                "missing_after": missing_after_dict,
                "rows_before": rows_before,
                "rows_after": rows_after,
            },
        })
        
        return {
            "message": f"Data cleaned using {strategy} strategy",
            "missing_before": missing_before_dict,
            "missing_after": missing_after_dict,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "cleaned_columns": columns,
        }
    
    @staticmethod
    async def preprocess_data(
        pipeline_id: str,
        scaler_type: str,
        columns: List[str] = None
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(
                "❌ Data not found! Please make sure you've uploaded a dataset first. "
                "Connect this Preprocess node to an Upload node and execute the Upload node."
            )
        
        df = pd.DataFrame(pipeline["dataset"])

        if columns is None or len(columns) == 0:
            save_pipeline(pipeline_id, {
                "dataset": df.to_dict('records'),
                "preprocessing": {
                    "scaler_type": scaler_type,
                    "processed_columns": [],
                    "skipped": True,
                },
            })

            return {
                "message": "No preprocessing columns selected. Dataset was left unchanged.",
                "processed_columns": [],
                "skipped": True,
            }
        
        # Check if columns exist
        missing_columns = [col for col in columns if col not in df.columns]
        if missing_columns:
            raise ValueError(
                f"❌ Column(s) not found: {', '.join(missing_columns)}. "
                f"Available columns are: {', '.join(df.columns.tolist())}. "
                "Please check your column selection."
            )
        
        # Check if columns are numeric
        non_numeric = []
        for col in columns:
            if not pd.api.types.is_numeric_dtype(df[col]):
                non_numeric.append(col)
        
        if non_numeric:
            raise ValueError(
                f"❌ Cannot preprocess non-numeric columns: {', '.join(non_numeric)}. "
                "Preprocessing (scaling) only works with numbers. Please select only numeric columns "
                "(columns containing numbers like age, price, count, etc.)."
            )
        
        if scaler_type == "standardization":
            scaler = StandardScaler()
        elif scaler_type == "normalization":
            scaler = MinMaxScaler()
        else:
            raise ValueError(
                f"❌ Unknown scaling method: {scaler_type}. "
                "Please choose either 'standardization' or 'normalization'."
            )
        
        try:
            df[columns] = scaler.fit_transform(df[columns])
        except Exception as e:
            raise ValueError(
                f"❌ Preprocessing failed! This usually happens if the data contains invalid values. "
                f"Error details: {str(e)}"
            )
        
        save_pipeline(pipeline_id, {
            "dataset": df.to_dict('records'),
            "preprocessing": {
                "scaler_type": scaler_type,
                "processed_columns": columns,
            },
        })
        
        return {
            "message": f"Data preprocessed using {scaler_type}",
            "processed_columns": columns,
        }
    
    @staticmethod
    async def split_data(
        pipeline_id: str,
        split_ratio: float,
        target_column: str
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(
                "❌ Data not found! Please make sure you've uploaded a dataset first. "
                "Connect this Split node to previous nodes and execute them."
            )
        
        df = pd.DataFrame(pipeline["dataset"])
        
        if target_column not in df.columns:
            raise ValueError(
                f"❌ Target column '{target_column}' not found in your dataset! "
                f"Available columns are: {', '.join(df.columns.tolist())}. "
                "The target column is what you want to predict (like 'passed_exam', 'price', 'category')."
            )
        
        X = df.drop(columns=[target_column])
        y = df[target_column]
        X_numeric = X.select_dtypes(include=[np.number])
        
        if X_numeric.empty:
            raise ValueError(
                "❌ No numeric features found! After removing the target column, there are no numeric columns left. "
                "Machine learning models need numeric input features (numbers) to learn from. "
                "Please make sure your dataset has numeric columns besides the target."
            )
        
        if len(X_numeric) < 4:
            raise ValueError(
                f"❌ Not enough data! You only have {len(X_numeric)} rows. "
                "You need at least 4 rows to split into training and testing sets. "
                "Please upload a dataset with more data."
            )

        unique_target_values = y.nunique()
        class_like_target = (
            not pd.api.types.is_numeric_dtype(y)
            or unique_target_values <= min(20, max(2, len(y) // 10))
        )
        stratify_target = y if class_like_target and unique_target_values > 1 else None
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_numeric, y,
            train_size=split_ratio,
            random_state=settings.RANDOM_STATE,
            shuffle=True,
            stratify=stratify_target,
        )
        
        save_pipeline(pipeline_id, {
            "X_train": X_train.to_dict('records'),
            "X_test": X_test.to_dict('records'),
            "y_train": y_train.tolist(),
            "y_test": y_test.tolist(),
            "feature_columns": X_numeric.columns.tolist(),
            "target_column": target_column,
            "split_ratio": split_ratio,
        })
        
        return {
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features": X_numeric.columns.tolist(),
            "target_column": target_column,
            "message": f"Data split: {len(X_train)} train, {len(X_test)} test samples",
        }
    
    @staticmethod
    async def train_model(
        pipeline_id: str,
        model_type: str,
        task_type: str = "classification"
    ) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(
                "❌ Data not found! Please make sure you've completed the previous steps: "
                "Upload → Preprocess (optional) → Split. Connect this Train node to a Split node."
            )
        
        if "X_train" not in pipeline:
            raise ValueError(
                "❌ Data not split yet! Before training a model, you need to split your data into training and testing sets. "
                "Please add a 'Train-Test Split' node before this Train node and execute it."
            )
        
        X_train = pd.DataFrame(pipeline["X_train"])
        X_test = pd.DataFrame(pipeline["X_test"])
        y_train = np.array(pipeline["y_train"])
        y_test = np.array(pipeline["y_test"])
        
        if X_train.empty or len(y_train) == 0:
            raise ValueError(
                "❌ Training data is empty! This shouldn't happen. Please try running the pipeline from the beginning."
            )
        
        # Check for NaN values in features
        if X_train.isnull().any().any():
            null_cols = X_train.columns[X_train.isnull().any()].tolist()
            raise ValueError(
                f"❌ Your data contains missing values (NaN) in columns: {', '.join(null_cols)}. \n"
                "Please add a 'Clean Data' node before training to handle missing values."
            )
        
        # Check for NaN values in target
        if np.isnan(y_train).any():
            raise ValueError(
                "❌ Your target column contains missing values (NaN). \n"
                "Please clean your data or choose a different target column without missing values."
            )
        
        # Validate data compatibility with model type
        unique_values = len(np.unique(y_train))
        y_train_series = pd.Series(y_train)
        
        # Determine if target is classification or regression
        if model_type in ["logistic_regression", "decision_tree", "random_forest"]:
            # Classification model - check if target is suitable
            if unique_values > 50:
                raise ValueError(
                    f"❌ Your target column has {unique_values} unique values, which suggests continuous data. \n"
                    "Classification models work best with categorical data (like Yes/No, or categories A/B/C). \n"
                    "💡 Try using a Regression model instead (Linear, Ridge, or Lasso Regression)."
                )
            if unique_values == 1:
                raise ValueError(
                    "❌ Your target column has only 1 unique value. Model cannot learn from this! \n"
                    "Please choose a different target column with multiple categories."
                )
        else:
            # Regression model - check if target is numeric and suitable
            if unique_values < 10:
                raise ValueError(
                    f"❌ Your target column has only {unique_values} unique values, which suggests categorical data. \n"
                    "Regression models work best with continuous numeric data (like prices, temperatures). \n"
                    "💡 Try using a Classification model instead (Logistic Regression, Decision Tree, or Random Forest)."
                )
            # Check if target is actually numeric
            try:
                float(y_train[0])
            except (ValueError, TypeError):
                raise ValueError(
                    "❌ Your target column contains non-numeric values. \n"
                    "Regression models require numeric target values. \n"
                    "💡 Either use a Classification model or select a numeric target column."
                )
        
        # Classification models
        if model_type == "logistic_regression":
            model = LogisticRegression(random_state=settings.RANDOM_STATE, max_iter=1000)
            task_type = "classification"
        elif model_type == "decision_tree":
            model = DecisionTreeClassifier(random_state=settings.RANDOM_STATE)
            task_type = "classification"
        elif model_type == "random_forest":
            model = RandomForestClassifier(random_state=settings.RANDOM_STATE, n_estimators=100)
            task_type = "classification"
        # Regression models
        elif model_type == "linear_regression":
            model = LinearRegression()
            task_type = "regression"
        elif model_type == "ridge_regression":
            model = Ridge(random_state=settings.RANDOM_STATE, alpha=1.0)
            task_type = "regression"
        elif model_type == "lasso_regression":
            model = Lasso(random_state=settings.RANDOM_STATE, alpha=1.0)
            task_type = "regression"
        elif model_type == "decision_tree_regressor":
            model = DecisionTreeRegressor(random_state=settings.RANDOM_STATE)
            task_type = "regression"
        elif model_type == "random_forest_regressor":
            model = RandomForestRegressor(random_state=settings.RANDOM_STATE, n_estimators=100)
            task_type = "regression"
        else:
            raise ValueError(
                f"❌ Unknown model type: {model_type}. "
                "Please choose from: Classification (Logistic Regression, Decision Tree, Random Forest) or "
                "Regression (Linear, Ridge, Lasso, Decision Tree Regressor, Random Forest Regressor)."
            )
        
        try:
            model.fit(X_train, y_train)
        except ValueError as e:
            error_msg = str(e)
            if "could not convert" in error_msg.lower() or "invalid value" in error_msg.lower():
                raise ValueError(
                    "❌ Your data contains invalid values that the model cannot process. \n"
                    "This usually means there are non-numeric values in your features. \n"
                    "💡 Please use the 'Preprocess' node to convert categorical columns to numbers."
                )
            elif "inf" in error_msg.lower():
                raise ValueError(
                    "❌ Your data contains infinite values (inf) which cannot be used for training. \n"
                    "💡 Please clean your data to remove or replace infinite values."
                )
            else:
                raise ValueError(
                    f"❌ Model training failed! Your data might not be compatible with this model type. \n"
                    f"Error: {str(e)}"
                )
        except Exception as e:
            raise ValueError(
                f"❌ Model training failed! This can happen if your data has issues (wrong format, incompatible types, etc.). \n"
                f"Error details: {str(e)}"
            )
        
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        # Check for NaN in predictions
        if np.isnan(y_train_pred).any() or np.isnan(y_test_pred).any():
            raise ValueError(
                "❌ Model produced invalid predictions (NaN values). \n"
                "This usually happens when the data is not suitable for the selected model. \n"
                "💡 Try: \n"
                "1. Using a different model type \n"
                "2. Cleaning your data more thoroughly \n"
                "3. Removing columns with too many missing values"
            )
        
        # Calculate metrics based on task type
        if task_type == "classification":
            train_score = accuracy_score(y_train, y_train_pred)
            test_score = accuracy_score(y_test, y_test_pred)
            
            # Check if scores are valid
            if np.isnan(train_score) or np.isnan(test_score):
                raise ValueError(
                    "❌ Model evaluation produced invalid scores (NaN). \n"
                    "This means the model couldn't learn from your data properly. \n"
                    "💡 Your data might not be suitable for classification. Try:\n"
                    "1. Checking if your target column has clear categories\n"
                    "2. Ensuring all features are numeric\n"
                    "3. Using a regression model if your target is continuous numeric data"
                )
            
            try:
                precision = precision_score(y_test, y_test_pred, average='weighted', zero_division=0)
                recall = recall_score(y_test, y_test_pred, average='weighted', zero_division=0)
                f1 = f1_score(y_test, y_test_pred, average='weighted', zero_division=0)
            except:
                precision = recall = f1 = 0.0
            
            metrics = {
                "task_type": "classification",
                "train_accuracy": float(train_score),
                "test_accuracy": float(test_score),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
            }
            message = f"Model trained successfully. Test accuracy: {test_score:.4f}"
        else:  # regression
            train_score = r2_score(y_train, y_train_pred)
            test_score = r2_score(y_test, y_test_pred)
            
            # Check if scores are valid
            if np.isnan(train_score) or np.isnan(test_score) or np.isinf(train_score) or np.isinf(test_score):
                raise ValueError(
                    "❌ Model evaluation produced invalid scores (NaN or Inf). \n"
                    "This means the model couldn't learn from your data properly. \n"
                    "💡 Your data might not be suitable for regression. Try:\n"
                    "1. Checking if your target column contains continuous numeric values\n"
                    "2. Ensuring all features are numeric\n"
                    "3. Using a classification model if your target has distinct categories"
                )
            
            mae = mean_absolute_error(y_test, y_test_pred)
            mse = mean_squared_error(y_test, y_test_pred)
            rmse = np.sqrt(mse)
            
            metrics = {
                "task_type": "regression",
                "train_r2": float(train_score),
                "test_r2": float(test_score),
                "mae": float(mae),
                "mse": float(mse),
                "rmse": float(rmse),
            }
            message = f"Model trained successfully. Test R² score: {test_score:.4f}"
        
        save_pipeline(pipeline_id, {
            "model_type": model_type,
            "task_type": task_type,
            "model": model,
            "metrics": metrics,
            "predictions": {
                "train": y_train_pred.tolist(),
                "test": y_test_pred.tolist(),
            },
            "y_train": y_train.tolist(),
            "y_test": y_test.tolist(),
        })
        
        return {
            "model_type": model_type,
            "task_type": task_type,
            "train_score": train_score,
            "test_score": test_score,
            "metrics": metrics,
            "message": message,
        }
    
    @staticmethod
    def _generate_visualizations(pipeline: Dict[str, Any]) -> Dict[str, str]:
        """Generate beginner-friendly visualizations with explanations"""
        visualizations = {}
        task_type = pipeline.get('task_type', 'classification')
        
        # Set style for clarity
        sns.set_style("whitegrid")
        plt.rcParams['figure.facecolor'] = 'white'
        plt.rcParams['font.size'] = 11
        
        try:
            metrics = pipeline.get("metrics", {})
            
            if task_type == "classification" and metrics:
                # 1) Classification performance overview
                fig, ax = plt.subplots(figsize=(10, 6))

                metric_names = [
                    'Train Accuracy\n(Seen Data)',
                    'Test Accuracy\n(New Data)',
                    'Precision\n(Correct Positives)',
                    'Recall\n(Found Positives)',
                    'F1 Score\n(Balance)',
                ]
                metric_values = [
                    metrics.get('train_accuracy', 0),
                    metrics.get('test_accuracy', 0),
                    metrics.get('precision', 0),
                    metrics.get('recall', 0),
                    metrics.get('f1_score', 0),
                ]

                colors = ['#27ae60' if v >= 0.8 else '#f39c12' if v >= 0.6 else '#e74c3c' for v in metric_values]
                bars = ax.bar(metric_names, metric_values, color=colors, alpha=0.85, edgecolor='black', linewidth=1.5)

                for bar in bars:
                    height = bar.get_height()
                    ax.text(
                        bar.get_x() + bar.get_width() / 2,
                        height + 0.02,
                        f'{height * 100:.1f}%',
                        ha='center',
                        va='bottom',
                        fontweight='bold',
                        fontsize=12,
                    )

                ax.set_ylabel('Score (Higher is Better)', fontsize=13, fontweight='bold')
                ax.set_title('📊 Classification Performance Overview', fontsize=16, fontweight='bold', pad=20)
                ax.set_ylim(0, 1.15)
                ax.axhline(y=0.8, color='green', linestyle='--', alpha=0.5, label='Good (80%+)')
                ax.axhline(y=0.6, color='orange', linestyle='--', alpha=0.5, label='Fair (60%+)')
                ax.legend(loc='upper right', fontsize=9)
                ax.grid(axis='y', alpha=0.4, linestyle='-', linewidth=0.5)

                fig.text(
                    0.5,
                    0.02,
                    '💡 If train score is much higher than test score, model may be overfitting.',
                    ha='center',
                    fontsize=10,
                    style='italic',
                    bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8),
                )

                plt.tight_layout(rect=[0, 0.05, 1, 1])
                buf = io.BytesIO()
                plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                buf.seek(0)
                visualizations['metrics_chart'] = base64.b64encode(buf.read()).decode('utf-8')
                plt.close()

                # 2) Confusion matrix only for classification
                if 'y_test' in pipeline and 'predictions' in pipeline:
                    y_test = np.array(pipeline['y_test'])
                    y_pred = np.array(pipeline['predictions']['test'])

                    cm = confusion_matrix(y_test, y_pred)

                    fig, ax = plt.subplots(figsize=(9, 7))
                    sns.heatmap(
                        cm,
                        annot=True,
                        fmt='d',
                        cmap='Blues',
                        cbar_kws={'label': 'Number of Predictions'},
                        linewidths=2,
                        linecolor='white',
                        square=True,
                        ax=ax,
                        annot_kws={'size': 14, 'weight': 'bold'},
                        cbar=True,
                        vmin=0,
                    )

                    ax.set_xlabel('Predicted Label', fontsize=13, fontweight='bold', labelpad=10)
                    ax.set_ylabel('Actual Label', fontsize=13, fontweight='bold', labelpad=10)
                    ax.set_title('🎯 Confusion Matrix', fontsize=16, fontweight='bold', pad=20)

                    total_predictions = cm.sum()
                    correct_predictions = np.trace(cm)
                    accuracy = (correct_predictions / total_predictions * 100) if total_predictions else 0

                    fig.text(
                        0.5,
                        0.02,
                        f'💡 Correct predictions are on the diagonal ({correct_predictions}/{total_predictions}, {accuracy:.1f}%).',
                        ha='center',
                        fontsize=10,
                        style='italic',
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8),
                    )

                    plt.tight_layout(rect=[0, 0.08, 1, 1])
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                    buf.seek(0)
                    visualizations['confusion_matrix'] = base64.b64encode(buf.read()).decode('utf-8')
                    plt.close()

                # 3) Train vs test comparison for classification
                fig, ax = plt.subplots(figsize=(9, 6))

                categories = ['Train Accuracy', 'Test Accuracy']
                accuracies = [metrics.get('train_accuracy', 0), metrics.get('test_accuracy', 0)]

                bars = ax.bar(categories, accuracies, color=['#27ae60', '#3498db'], alpha=0.85, edgecolor='black', linewidth=1.5, width=0.6)
                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width() / 2, height + 0.02, f'{height * 100:.1f}%', ha='center', va='bottom', fontweight='bold', fontsize=14)

                ax.set_ylabel('Accuracy', fontsize=13, fontweight='bold')
                ax.set_title('📚 Train vs Test Accuracy', fontsize=16, fontweight='bold', pad=20)
                ax.set_ylim(0, 1.15)
                ax.grid(axis='y', alpha=0.4, linestyle='-', linewidth=0.5)

                train_acc = accuracies[0] * 100
                test_acc = accuracies[1] * 100
                diff = abs(train_acc - test_acc)
                if diff < 5:
                    interpretation = '✅ Train and test are close: good generalization.'
                elif diff < 10:
                    interpretation = '👍 Slight gap between train and test.'
                else:
                    interpretation = '⚠️ Large train/test gap: possible overfitting.'

                fig.text(
                    0.5,
                    0.02,
                    f'💡 {interpretation} Gap: {diff:.1f}%',
                    ha='center',
                    fontsize=10,
                    style='italic',
                    bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8),
                )

                plt.tight_layout(rect=[0, 0.08, 1, 1])
                buf = io.BytesIO()
                plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                buf.seek(0)
                visualizations['accuracy_comparison'] = base64.b64encode(buf.read()).decode('utf-8')
                plt.close()

            elif task_type == "regression" and metrics:
                # 1) Regression overview (R2 + errors)
                fig, ax = plt.subplots(figsize=(10, 6))

                train_r2 = metrics.get('train_r2', 0)
                test_r2 = metrics.get('test_r2', 0)
                mae = float(metrics.get('mae', 0) or 0)
                rmse = float(metrics.get('rmse', 0) or 0)

                # Convert errors to bounded quality scores so all bars are comparable (0..1)
                mae_quality = 1 / (1 + mae)
                rmse_quality = 1 / (1 + rmse)

                metric_names = [
                    'Train R²\n(Higher Better)',
                    'Test R²\n(Higher Better)',
                    'MAE Quality\n(1 / (1 + MAE))',
                    'RMSE Quality\n(1 / (1 + RMSE))',
                ]
                metric_values = [max(0.0, train_r2), max(0.0, test_r2), mae_quality, rmse_quality]

                bars = ax.bar(metric_names, metric_values, color=['#27ae60', '#3498db', '#f39c12', '#9b59b6'], alpha=0.85, edgecolor='black', linewidth=1.5)

                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width() / 2, height + 0.02, f'{height:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=12)

                ax.set_ylabel('Normalized Score (Higher is Better)', fontsize=13, fontweight='bold')
                ax.set_title('📈 Regression Performance Overview', fontsize=16, fontweight='bold', pad=20)
                ax.set_ylim(0, 1.15)
                ax.grid(axis='y', alpha=0.4, linestyle='-', linewidth=0.5)

                fig.text(
                    0.5,
                    0.02,
                    f'Raw errors: MAE={mae:.4f}, RMSE={rmse:.4f}. Lower raw errors are better.',
                    ha='center',
                    fontsize=10,
                    style='italic',
                    bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8),
                )

                plt.tight_layout(rect=[0, 0.08, 1, 1])
                buf = io.BytesIO()
                plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                buf.seek(0)
                visualizations['metrics_chart'] = base64.b64encode(buf.read()).decode('utf-8')
                plt.close()

                # 2) Actual vs Predicted scatter plot for regression
                if 'y_test' in pipeline and 'predictions' in pipeline:
                    y_test = np.array(pipeline['y_test'])
                    y_pred = np.array(pipeline['predictions']['test'])

                    fig, ax = plt.subplots(figsize=(9, 7))
                    ax.scatter(y_test, y_pred, alpha=0.6, color='#3498db', edgecolors='white', linewidth=0.5)

                    min_val = float(min(np.min(y_test), np.min(y_pred)))
                    max_val = float(max(np.max(y_test), np.max(y_pred)))
                    ax.plot([min_val, max_val], [min_val, max_val], '--', color='crimson', linewidth=2)

                    ax.set_xlabel('Actual Values', fontsize=13, fontweight='bold')
                    ax.set_ylabel('Predicted Values', fontsize=13, fontweight='bold')
                    ax.set_title('🎯 Actual vs Predicted (Regression)', fontsize=16, fontweight='bold', pad=20)
                    ax.grid(alpha=0.3)

                    fig.text(
                        0.5,
                        0.02,
                        '💡 Points closer to the red diagonal line indicate better predictions.',
                        ha='center',
                        fontsize=10,
                        style='italic',
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8),
                    )

                    plt.tight_layout(rect=[0, 0.08, 1, 1])
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                    buf.seek(0)
                    visualizations['confusion_matrix'] = base64.b64encode(buf.read()).decode('utf-8')
                    plt.close()

                # 3) Train vs test R2 comparison
                fig, ax = plt.subplots(figsize=(9, 6))
                scores = [metrics.get('train_r2', 0), metrics.get('test_r2', 0)]
                bars = ax.bar(['Train R²', 'Test R²'], scores, color=['#27ae60', '#3498db'], alpha=0.85, edgecolor='black', linewidth=1.5, width=0.6)

                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width() / 2, height + 0.02, f'{height:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=14)

                ax.set_ylabel('R² Score', fontsize=13, fontweight='bold')
                ax.set_title('📚 Train vs Test R²', fontsize=16, fontweight='bold', pad=20)
                ax.set_ylim(min(-0.1, min(scores) - 0.1), 1.1)
                ax.grid(axis='y', alpha=0.4, linestyle='-', linewidth=0.5)

                diff = abs((scores[0] or 0) - (scores[1] or 0))
                if diff < 0.05:
                    interpretation = '✅ Train and test R² are close.'
                elif diff < 0.15:
                    interpretation = '👍 Small train/test R² gap.'
                else:
                    interpretation = '⚠️ Large R² gap suggests overfitting.'

                fig.text(
                    0.5,
                    0.02,
                    f'💡 {interpretation} Gap: {diff:.3f}',
                    ha='center',
                    fontsize=10,
                    style='italic',
                    bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8),
                )

                plt.tight_layout(rect=[0, 0.08, 1, 1])
                buf = io.BytesIO()
                plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                buf.seek(0)
                visualizations['accuracy_comparison'] = base64.b64encode(buf.read()).decode('utf-8')
                plt.close()
            
            # 4. Feature Importance - Which inputs matter most?
            if pipeline.get('model_type') in ['decision_tree', 'random_forest', 'decision_tree_regressor', 'random_forest_regressor']:
                model = pipeline.get('model')
                feature_columns = pipeline.get('feature_columns', [])
                
                if model and hasattr(model, 'feature_importances_') and feature_columns:
                    importances = model.feature_importances_
                    indices = np.argsort(importances)[::-1]
                    
                    fig, ax = plt.subplots(figsize=(10, max(6, len(feature_columns) * 0.5)))
                    
                    # Use gradient colors: darker = more important
                    colors = plt.cm.RdYlGn(np.linspace(0.4, 0.9, len(feature_columns)))
                    bars = ax.barh(range(len(feature_columns)), 
                                  importances[indices],
                                  color=colors, alpha=0.85, edgecolor='black', linewidth=1)
                    
                    # Add percentage labels
                    for i, bar in enumerate(bars):
                        width = bar.get_width()
                        ax.text(width + 0.01, bar.get_y() + bar.get_height()/2.,
                               f'{width*100:.1f}%',
                               ha='left', va='center', fontweight='bold', fontsize=11)
                    
                    ax.set_yticks(range(len(feature_columns)))
                    ax.set_yticklabels([feature_columns[i] for i in indices], fontsize=12)
                    ax.set_xlabel('Importance Score (Higher = More Important)', fontsize=13, fontweight='bold')
                    ax.set_title('🔍 Which Features Matter Most for Predictions?', 
                                fontsize=16, fontweight='bold', pad=20)
                    ax.grid(axis='x', alpha=0.4, linestyle='-', linewidth=0.5)
                    
                    # Add explanation
                    top_feature = feature_columns[indices[0]]
                    fig.text(0.5, 0.02,
                            f'💡 Tip: "{top_feature}" is the most important feature for making predictions!\n'
                            f'      The model relies on this feature the most when deciding the outcome.',
                            ha='center', fontsize=10, style='italic',
                            bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
                    
                    plt.tight_layout(rect=[0, 0.06, 1, 1])
                    
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png', dpi=110, bbox_inches='tight')
                    buf.seek(0)
                    visualizations['feature_importance'] = base64.b64encode(buf.read()).decode('utf-8')
                    plt.close()
        
        except Exception as e:
            print(f"Error generating visualizations: {str(e)}")
        
        return visualizations
    
    @staticmethod
    async def get_results(pipeline_id: str) -> Dict[str, Any]:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        # Generate visualizations
        visualizations = MLService._generate_visualizations(pipeline)
        
        return {
            "pipeline_id": pipeline_id,
            "dataset_info": pipeline.get("dataset_info"),
            "preprocessing": pipeline.get("preprocessing"),
            "split_info": {
                "train_size": len(pipeline.get("X_train", [])),
                "test_size": len(pipeline.get("X_test", [])),
                "features": pipeline.get("feature_columns", []),
                "target_column": pipeline.get("target_column"),
                "split_ratio": pipeline.get("split_ratio"),
            } if "X_train" in pipeline else None,
            "model_info": {
                "model_type": pipeline.get("model_type"),
                "task_type": pipeline.get("task_type"),
                "metrics": pipeline.get("metrics"),
            } if "model_type" in pipeline else None,
            "visualizations": visualizations,
        }
