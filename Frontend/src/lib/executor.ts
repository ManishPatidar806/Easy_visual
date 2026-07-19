import { nodeDefinitions } from "./node-definitions";
import { uploadDataset, cleanData, preprocessData, splitData, trainModel, getResults, exportModelConfig } from "@/api/client";

interface NodeExecutionContext {
  nodeId: string;
  input: any;
  config: Record<string, any>;
  previousNodes: Record<string, any>;
}

interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}

function extractPipelineId(input: any, previousNodes?: Record<string, any>): string | null {
  if (input?.pipeline_id) return input.pipeline_id;
  if (input?.model_info?.pipeline_id) return input.model_info.pipeline_id;
  if (previousNodes) {
    for (const key of Object.keys(previousNodes)) {
      const nodeOut = previousNodes[key];
      if (nodeOut?.pipeline_id) return nodeOut.pipeline_id;
      if (nodeOut?.model_info?.pipeline_id) return nodeOut.model_info.pipeline_id;
    }
  }
  return null;
}

export class WorkflowExecutor {
  async executeNode(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { input, config, previousNodes } = context;
    const definition = nodeDefinitions[config.type];

    if (!definition) {
      return {
        success: false,
        error: `Unknown node type: ${config.type}`,
      };
    }

    try {
      return await this.executeMLNodeSwitch(config, input, previousNodes);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Execution failed",
      };
    }
  }

  private async executeMLNodeSwitch(config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    switch (config.type) {
      case "mlUpload":
        return await this.executeMLUpload(config, input);

      case "mlClean":
        return await this.executeMLClean(config, input, previousNodes);

      case "mlPreprocess":
        return await this.executeMLPreprocess(config, input, previousNodes);

      case "mlSplit":
        return await this.executeMLSplit(config, input, previousNodes);

      case "mlTrain":
        return await this.executeMLTrain(config, input, previousNodes);

      case "mlResults":
        return await this.executeMLResults(config, input, previousNodes);

      case "mlDownloadConfig":
        return await this.executeMLDownloadConfig(config, input, previousNodes);

      default:
        return {
          success: false,
          error: `Unknown ML node type: ${config.type}`,
        };
    }
  }

  private async executeMLUpload(config: Record<string, any>, _input: any): Promise<NodeExecutionResult> {
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

  private async executeMLClean(config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Clean Data node to an Upload node and execute the Upload node first.",
        };
      }

      const strategy = config.strategy || "drop_rows";
      const columns = config.columns || [];
      const fillValue = config.fillValue;

      const result = await cleanData(pipelineId, strategy, columns, fillValue);

      return {
        success: true,
        output: {
          ...input,
          pipeline_id: pipelineId,
          dataset_info: input?.dataset_info || result.dataset_info,
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

  private async executeMLPreprocess(config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Preprocess node to an Upload node (draw a line from Upload to Preprocess) and execute the Upload node first.",
        };
      }

      const result = await preprocessData(
        pipelineId,
        config.scalerType || "standardization",
        config.columns || []
      );

      return {
        success: true,
        output: {
          ...input,
          pipeline_id: pipelineId,
          dataset_info: input?.dataset_info || result.dataset_info,
          message: result.message,
          processed: true,
          skipped: result.skipped || false,
          processed_columns: result.processed_columns || config.columns || [],
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Preprocessing failed. Make sure you selected only numeric columns.",
      };
    }
  }

  private async executeMLSplit(config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
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
      const result = await splitData(pipelineId, splitRatio, config.targetColumn);

      return {
        success: true,
        output: {
          ...input,
          pipeline_id: pipelineId,
          dataset_info: input?.dataset_info || result.dataset_info,
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

  private async executeMLTrain(config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Train node to a Split node and execute the Split node first.",
        };
      }

      const modelType = config.modelType || "logistic_regression";
      const taskType = config.taskType || "classification";

      const result = await trainModel(pipelineId, modelType, taskType);

      const scoreLabel = taskType === "classification" ? "Accuracy" : "R² Score";
      const scoreValue = result.test_score;
      const displayValue = taskType === "classification" 
        ? `${(scoreValue * 100).toFixed(2)}%`
        : scoreValue.toFixed(3);

      return {
        success: true,
        output: {
          ...input,
          pipeline_id: pipelineId,
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

  private async executeMLResults(_config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Results node to a Train node and execute the Train node first.",
        };
      }

      const result = await getResults(pipelineId);

      return {
        success: true,
        output: {
          ...result,
          pipeline_id: pipelineId,
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

  private async executeMLDownloadConfig(_config: Record<string, any>, input: any, previousNodes?: Record<string, any>): Promise<NodeExecutionResult> {
    try {
      const pipelineId = extractPipelineId(input, previousNodes);
      if (!pipelineId) {
        return {
          success: false,
          error: "❌ Not connected! Please connect this Download Model Config node to a Train node or Results node and execute the Train node first.",
        };
      }

      const result = await exportModelConfig(pipelineId);

      return {
        success: true,
        output: {
          ...result,
          pipeline_id: pipelineId,
          message: "Production model configuration & parameters prepared successfully. Click 'Download JSON Config' on the node to save.",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "❌ Failed to export model configuration. Please make sure the model has been trained.",
      };
    }
  }
}

