import { memo } from "react";
 import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode } from "@/lib/types";
import { Settings, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";

function CustomNode({ data, selected, id }: NodeProps<WorkflowNode["data"]>) {
  const definition = nodeDefinitions[data.type];
  const { deleteElements } = useReactFlow();

  if (!definition) return null;

  const Icon = definition.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-md shadow-sm border transition-all
        ${selected ? "border-blue-500 shadow-md" : "border-gray-300 dark:border-gray-600"}
        ${data.isExecuting ? "border-blue-500" : ""}
        ${data.error ? "border-red-500" : ""}
        min-w-[200px]
      `}
    >
      {/* Delete Button - Only show when selected */}
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm flex items-center justify-center transition-colors z-10"
          title="Delete node (Delete key)"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {/* Input Handle - Hide for Upload node (first step) */}
      {data.type !== "mlUpload" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
      )}

      {/* Node Header */}
      <div
        className={`${definition.color} px-3 py-2 rounded-t-md flex items-center gap-2`}
      >
        <Icon className="h-4 w-4 text-white" />
        <span className="font-semibold text-white text-sm flex-1">
          {definition.label}
        </span>

        {data.isExecuting && (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        )}
        {data.output && !data.isExecuting && !data.error && (
          <CheckCircle className="h-4 w-4 text-white" />
        )}
        {data.error && <AlertCircle className="h-4 w-4 text-white" />}
      </div>

      {/* Node Body */}
      <div className="p-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {definition.description}
        </div>

        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Settings className="h-3 w-3" />
              <span>Configured</span>
            </div>
          </div>
        )}

        {data.error && (
          <div className="mt-2 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded">
            {data.error}
          </div>
        )}

        {/* Upload node output */}
        {data.output && !data.error && data.type === "mlUpload" && data.output.dataset_info && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Dataset Loaded</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              {data.output.dataset_info.rows} rows × {data.output.dataset_info.columns} columns
            </div>
          </div>
        )}

        {/* Preprocess node output */}
        {data.output && !data.error && data.type === "mlPreprocess" && data.output.processed && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Preprocessed</div>
            <div className="text-[10px]">
              {data.output.processed_columns?.length || 0} columns scaled
            </div>
          </div>
        )}

        {/* Split node output */}
        {data.output && !data.error && data.type === "mlSplit" && data.output.train_size && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Data Split</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              Train: {data.output.train_size} | Test: {data.output.test_size}
            </div>
          </div>
        )}

        {/* Train node output */}
        {data.output && !data.error && data.type === "mlTrain" && data.output.test_accuracy && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Model Trained</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              Accuracy: {(data.output.test_accuracy * 100).toFixed(1)}%
            </div>
          </div>
        )}

        {/* Results node output */}
        {data.output && !data.error && data.type === "mlResults" && data.output.model_info?.metrics && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">📊 Results Ready</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              Accuracy: {(data.output.model_info.metrics.test_accuracy * 100).toFixed(1)}%
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">Click to view charts</div>
          </div>
        )}
      </div>

      {/* Output Handle - Hide for Results node (last step) */}
      {data.type !== "mlResults" && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
