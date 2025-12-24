import {
  Upload,
  Eraser,
  Wand2,
  Split,
  Cpu,
  BarChart3,
} from "lucide-react";

export interface NodeDefinition {
  type: string;
  label: string;
  description: string;
  category: "ml";
  icon: any;
  color: string;
  defaultConfig: Record<string, any>;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "file" | "multiselect" | "slider" | "radio";
  placeholder?: string;
  options?: { value: string; label: string; taskType?: string }[];
  required?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
}

export const nodeDefinitions: Record<string, NodeDefinition> = {
  mlUpload: {
    type: "mlUpload",
    label: "Upload Dataset",
    description: "Upload CSV/XLSX dataset for ML pipeline",
    category: "ml",
    icon: Upload,
    color: "bg-purple-500",
    defaultConfig: {
      file: null,
      datasetInfo: null,
    },
    configFields: [
      {
        name: "file",
        label: "Dataset File",
        type: "file",
        required: true,
      },
    ],
  },

  mlClean: {
    type: "mlClean",
    label: "Clean Data",
    description: "Handle missing values in dataset",
    category: "ml",
    icon: Eraser,
    color: "bg-pink-500",
    defaultConfig: {
      strategy: "drop_rows",
      columns: [],
      fillValue: "0",
    },
    configFields: [
      {
        name: "strategy",
        label: "Missing Value Strategy",
        type: "select",
        options: [
          { value: "drop_rows", label: "Drop Rows with Missing Values" },
          { value: "drop_columns", label: "Drop Columns with Missing Values" },
          { value: "mean", label: "Fill with Mean" },
          { value: "median", label: "Fill with Median" },
          { value: "mode", label: "Fill with Mode" },
          { value: "forward_fill", label: "Forward Fill" },
          { value: "constant", label: "Fill with Constant Value" },
        ],
        defaultValue: "drop_rows",
        required: true,
      },
      {
        name: "columns",
        label: "Columns to Clean (leave empty for all)",
        type: "multiselect",
        required: false,
      },
      {
        name: "fillValue",
        label: "Constant Fill Value (for constant strategy)",
        type: "text",
        placeholder: "0",
        defaultValue: "0",
        required: false,
      },
    ],
  },

  mlPreprocess: {
    type: "mlPreprocess",
    label: "Preprocess Data",
    description: "Standardize or normalize numeric columns",
    category: "ml",
    icon: Wand2,
    color: "bg-indigo-500",
    defaultConfig: {
      scalerType: "standardization",
      columns: [],
    },
    configFields: [
      {
        name: "scalerType",
        label: "Scaling Method",
        type: "select",
        options: [
          { value: "standardization", label: "Standardization (Z-score)" },
          { value: "normalization", label: "Normalization (Min-Max)" },
        ],
        defaultValue: "standardization",
        required: true,
      },
      {
        name: "columns",
        label: "Numeric Columns",
        type: "multiselect",
        required: true,
      },
    ],
  },

  mlSplit: {
    type: "mlSplit",
    label: "Train-Test Split",
    description: "Split dataset into training and testing sets",
    category: "ml",
    icon: Split,
    color: "bg-cyan-500",
    defaultConfig: {
      splitRatio: 0.8,
      targetColumn: "",
    },
    configFields: [
      {
        name: "splitRatio",
        label: "Train/Test Split",
        type: "select",
        options: [
          { value: "0.6", label: "60/40" },
          { value: "0.7", label: "70/30" },
          { value: "0.8", label: "80/20" },
        ],
        defaultValue: "0.8",
        required: true,
      },
      {
        name: "targetColumn",
        label: "Target Column",
        type: "select",
        required: true,
      },
    ],
  },

  mlTrain: {
    type: "mlTrain",
    label: "Train Model",
    description: "Train a machine learning model",
    category: "ml",
    icon: Cpu,
    color: "bg-emerald-500",
    defaultConfig: {
      taskType: "classification",
      modelType: "logistic_regression",
    },
    configFields: [
      {
        name: "taskType",
        label: "Task Type",
        type: "radio",
        options: [
          { value: "classification", label: "Classification (Predict Categories)" },
          { value: "regression", label: "Regression (Predict Numbers)" },
        ],
        defaultValue: "classification",
        required: true,
      },
      {
        name: "modelType",
        label: "Model Type",
        type: "select",
        options: [
          { value: "logistic_regression", label: "Logistic Regression", taskType: "classification" },
          { value: "decision_tree", label: "Decision Tree Classifier", taskType: "classification" },
          { value: "random_forest", label: "Random Forest Classifier", taskType: "classification" },
          { value: "linear_regression", label: "Linear Regression", taskType: "regression" },
          { value: "ridge_regression", label: "Ridge Regression", taskType: "regression" },
          { value: "lasso_regression", label: "Lasso Regression", taskType: "regression" },
          { value: "decision_tree_regressor", label: "Decision Tree Regressor", taskType: "regression" },
          { value: "random_forest_regressor", label: "Random Forest Regressor", taskType: "regression" },
        ],
        defaultValue: "logistic_regression",
        required: true,
      },
    ],
  },

  mlResults: {
    type: "mlResults",
    label: "View Results",
    description: "Display model performance metrics",
    category: "ml",
    icon: BarChart3,
    color: "bg-pink-500",
    defaultConfig: {},
    configFields: [],
  },
};
