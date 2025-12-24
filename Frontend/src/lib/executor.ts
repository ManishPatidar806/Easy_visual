import { NodeExecutionContext, NodeExecutionResult } from "./types";
import { nodeDefinitions } from "./node-definitions";
import { uploadDataset, cleanData, preprocessData, splitData, trainModel, getResults } from "@/api/client";

export class WorkflowExecutor {
  async executeNode(
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const { input, config } = context;
    const definition = nodeDefinitions[config.type];

    if (!definition) {
      return {
        success: false,
        error: `Unknown node type: ${config.type}`,
      };
    }

    try {
      return await this.executeMLNodeSwitch(config, input);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Execution failed",
      };
    }
  }

  private async executeMLNodeSwitch(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    switch (config.type) {
      case "mlUpload":
        return await this.executeMLUpload(config, input);

      case "mlClean":
        return await this.executeMLClean(config, input);

      case "mlPreprocess":
        return await this.executeMLPreprocess(config, input);

      case "mlSplit":
        return await this.executeMLSplit(config, input);

      case "mlTrain":
        return await this.executeMLTrain(config, input);

      case "mlResults":
        return await this.executeMLResults(config, input);

      default:
        return {
          success: false,
          error: `Unknown ML node type: ${config.type}`,
        };
    }
  }

  private async executeMLUpload(
    config: Record<string, any>,
    _input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!config.file) {
        return {
          success: false,
          error: "❌ No file selected! Please click on the Upload node, then click 'Choose CSV/XLSX file...' to select your dataset.",
        };
      }

      const result = await uploadDataset(config.file);

      return {
        success: true,
        output: {
          pipeline_id: result.pipeline_id,
          dataset_info: result.dataset_info,
          message: `Dataset uploaded: ${result.dataset_info.rows} rows, ${result.dataset_info.columns} columns`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Upload failed. Please make sure you selected a valid CSV or Excel file.",
      };
    }
  }

  private async executeMLClean(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!input || !input.pipeline_id) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Clean Data node to an Upload node and execute the Upload node first.",
        };
      }

      const strategy = config.strategy || "drop_rows";
      const columns = config.columns || [];
      const fillValue = config.fillValue;

      const result = await cleanData(
        input.pipeline_id,
        strategy,
        columns,
        fillValue
      );

      return {
        success: true,
        output: {
          pipeline_id: input.pipeline_id,
          dataset_info: input.dataset_info,
          missing_before: result.missing_before,
          missing_after: result.missing_after,
          rows_before: result.rows_before,
          rows_after: result.rows_after,
          cleaned_columns: result.cleaned_columns,
          strategy: strategy,
          message: result.message,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Data cleaning failed. Please check your data and strategy selection.",
      };
    }
  }

  private async executeMLPreprocess(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!input || !input.pipeline_id) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Preprocess node to an Upload node (draw a line from Upload to Preprocess) and execute the Upload node first.",
        };
      }

      if (!config.columns || config.columns.length === 0) {
        return {
          success: false,
          error: "❌ No columns selected! Click on this node, then select which numeric columns you want to preprocess. You need to choose at least one column.",
        };
      }

      const result = await preprocessData(
        input.pipeline_id,
        config.scalerType || "standardization",
        config.columns
      );

      return {
        success: true,
        output: {
          pipeline_id: input.pipeline_id,
          dataset_info: input.dataset_info,
          message: result.message,
          processed: true,
          processed_columns: result.processed_columns || config.columns,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Preprocessing failed. Make sure you selected only numeric columns.",
      };
    }
  }

  private async executeMLSplit(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!input || !input.pipeline_id) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Split node to the previous node (Upload or Preprocess) and execute it first.",
        };
      }

      if (!config.targetColumn) {
        return {
          success: false,
          error: "❌ No target column selected! Click on this node, then choose the target column (what you want to predict, like 'passed_exam').",
        };
      }

      const splitRatio = parseFloat(config.splitRatio || "0.8");
      const result = await splitData(
        input.pipeline_id,
        splitRatio,
        config.targetColumn
      );

      return {
        success: true,
        output: {
          pipeline_id: input.pipeline_id,
          dataset_info: input.dataset_info,
          train_size: result.train_size,
          test_size: result.test_size,
          features: result.features,
          target_column: result.target_column,
          message: `Split complete: ${result.train_size} train, ${result.test_size} test`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Data split failed. Make sure your dataset has enough rows and numeric columns.",
      };
    }
  }

  private async executeMLTrain(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!input || !input.pipeline_id) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Train node to a Split node and execute the Split node first.",
        };
      }

      const modelType = config.modelType || "logistic_regression";
      const taskType = config.taskType || "classification";

      const result = await trainModel(
        input.pipeline_id,
        modelType,
        taskType
      );

      const scoreLabel = taskType === "classification" ? "Accuracy" : "R² Score";
      const scoreValue = taskType === "classification" ? result.test_score : result.test_score;
      const displayValue = taskType === "classification" 
        ? `${(scoreValue * 100).toFixed(2)}%`
        : scoreValue.toFixed(3);

      return {
        success: true,
        output: {
          pipeline_id: input.pipeline_id,
          model_type: result.model_type,
          task_type: result.task_type,
          train_score: result.train_score,
          test_score: result.test_score,
          metrics: result.metrics,
          message: `Model trained! ${scoreLabel}: ${displayValue}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Model training failed. Please check your data and try again.",
      };
    }
  }

  private async executeMLResults(
    _config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      if (!input || !input.pipeline_id) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Results node to a Train node and execute the Train node first.",
        };
      }

      const result = await getResults(input.pipeline_id);

      return {
        success: true,
        output: {
          ...result,
          message: "Results retrieved successfully",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Failed to get results. Please make sure the model has been trained.",
      };
    }
  }
}
