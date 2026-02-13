import { memo } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode } from "@/lib/WorkflowContext";
import { Settings, CheckCircle, AlertCircle, Loader2, Trash2, Play, Eye } from "lucide-react";

function CustomNode({ data, selected, id }: NodeProps<WorkflowNode["data"]>) {
  const definition = nodeDefinitions[data.type];
  const { deleteElements } = useReactFlow();

  if (!definition) return null;

  const Icon = definition.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    const executeFromNode = (window as any).__executeFromNode;
    if (executeFromNode) {
      executeFromNode(id);
    }
  };

  const handleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    e.currentTarget.parentElement?.dispatchEvent(event);
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
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm flex items-center justify-center transition-colors z-10"
          title="Delete node (or press Delete key)"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      <button
        onClick={handleRun}
        disabled={data.isExecuting}
        className={`absolute -top-2 -left-2 w-6 h-6 text-white rounded-full shadow-md flex items-center justify-center transition-all z-10 ${
          data.isExecuting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 hover:scale-110'
        }`}
        title="Run from this node"
      >
        {data.isExecuting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </button>

      {data.type !== "mlUpload" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
      )}

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

      <div className="p-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {definition.description}
        </div>

        {}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Settings className="h-3 w-3" />
              <span>Configured</span>
            </div>
          </div>
        )}

        {}
        {data.error && (
          <div className="mt-2 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded border border-red-200 dark:border-red-800">
            <div className="whitespace-pre-line">{data.error}</div>
          </div>
        )}

        {}

        {}
        {data.output && !data.error && data.type === "mlUpload" && data.output.dataset_info && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Dataset Loaded</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              {data.output.dataset_info.rows} rows × {data.output.dataset_info.columns} columns
            </div>
          </div>
        )}

        {}
        {data.output && !data.error && data.type === "mlPreprocess" && data.output.processed && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Preprocessed</div>
            <div className="text-[10px]">
              {data.output.processed_columns?.length || 0} columns scaled
            </div>
          </div>
        )}

        {}
        {data.output && !data.error && data.type === "mlSplit" && data.output.train_size && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Data Split</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              Train: {data.output.train_size} | Test: {data.output.test_size}
            </div>
          </div>
        )}

        {}
        {data.output && !data.error && data.type === "mlTrain" && data.output.test_accuracy && (
          <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-700 dark:text-green-300 font-medium">✓ Model Trained</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
              Accuracy: {(data.output.test_accuracy * 100).toFixed(1)}%
            </div>
          </div>
        )}

        {}
        {data.output && !data.error && data.type === "mlResults" && data.output.model_info?.metrics && (
          <div className="mt-2 space-y-2">
            <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <div className="text-green-700 dark:text-green-300 font-medium">📊 Results Ready</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                Accuracy: {(data.output.model_info.metrics.test_accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <button
              onClick={handleViewResults}
              className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-3 w-3" />
              View Charts & Details
            </button>
          </div>
        )}
      </div>

      {}
      {}
      {}
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
