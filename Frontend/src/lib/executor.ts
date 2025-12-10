import { NodeExecutionContext, NodeExecutionResult } from "./types";
import { nodeDefinitions } from "./node-definitions";
import { uploadDataset, preprocessData, splitData, trainModel, getResults } from "@/api/client";

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
          error: "No file selected. Please upload a dataset.",
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
        error: error.message || "Upload failed",
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
          error: "No pipeline ID. Connect this node to an Upload node.",
        };
      }

      if (!config.columns || config.columns.length === 0) {
        return {
          success: false,
          error: "No columns selected for preprocessing.",
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
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Preprocessing failed",
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
          error: "No pipeline ID. Connect to previous ML node.",
        };
      }

      if (!config.targetColumn) {
        return {
          success: false,
          error: "No target column selected.",
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
        error: error.message || "Split failed",
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
          error: "No pipeline ID. Connect to Split node.",
        };
      }

      const modelType = config.modelType || "logistic_regression";

      const result = await trainModel(
        input.pipeline_id,
        modelType
      );

      return {
        success: true,
        output: {
          pipeline_id: input.pipeline_id,
          model_type: result.model_type,
          train_accuracy: result.train_accuracy,
          test_accuracy: result.test_accuracy,
          metrics: result.metrics,
          message: `Model trained! Accuracy: ${(result.test_accuracy * 100).toFixed(2)}%`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Training failed",
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
          error: "No pipeline ID. Connect to Train node.",
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
        error: error.message || "Failed to get results",
      };
    }
  }
}
