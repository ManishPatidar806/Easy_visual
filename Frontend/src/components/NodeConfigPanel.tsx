import { useState, useEffect, useRef } from "react";
import { useWorkflow } from "@/lib/WorkflowContext";
import { nodeDefinitions } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X, Upload as UploadIcon, CheckCircle, ChevronRight } from "lucide-react";

interface NodeConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  onClose,
}: NodeConfigPanelProps) {
  const { nodes, edges, updateNode } = useWorkflow();
  const node = nodes.find((n) => n.id === nodeId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  const [config, setConfig] = useState<Record<string, any>>(
    node?.data.config || {}
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    config.columns || []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= 1000) {
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  useEffect(() => {
    if (node?.data.config) {
      const newConfig = { ...node.data.config };
      
      const def = nodeDefinitions[node.data.type];
      if (def?.defaultConfig) {
        Object.keys(def.defaultConfig).forEach(key => {
          if (newConfig[key] === undefined || newConfig[key] === null || newConfig[key] === '') {
            newConfig[key] = def.defaultConfig[key];
          }
        });
      }
      
      setConfig(newConfig);
      if (newConfig.columns) {
        setSelectedColumns(newConfig.columns);
      }
    }
  }, [node, nodeId]);

  if (!node) return null;

  const definition = nodeDefinitions[node.data.type];
  if (!definition) return null;

  const handleSave = () => {
    const finalConfig = {
      ...config,
      ...(selectedColumns.length > 0 && { columns: selectedColumns }),
    };
    updateNode(nodeId, { config: finalConfig });
    onClose();
  };

  const handleChange = (name: string, value: any) => {
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("file", file);
      handleChange("filename", file.name);
    }
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const getAvailableColumns = (): string[] => {
    if (node?.data.output?.dataset_info?.column_names) {
      return node.data.output.dataset_info.column_names;
    }
    
    // Get edges and nodes from Context (already available)
    const allNodes = nodes;
    
    const incomingEdge = edges.find((e: any) => e.target === nodeId);
    if (incomingEdge) {
      const sourceNode = allNodes.find((n) => n.id === (incomingEdge as any).source);
      if (sourceNode?.data.output?.dataset_info?.column_names) {
        return sourceNode.data.output.dataset_info.column_names;
      }
    }
    
    return [];
  };

  const getNumericColumns = (): string[] => {
    let columnTypes: Record<string, string> = {};
    
    if (node?.data.output?.dataset_info?.column_types) {
      columnTypes = node.data.output.dataset_info.column_types;
    } else {
      // Get nodes from Context (already available)
      const allNodes = nodes;
      
      const incomingEdge = edges.find((e: any) => e.target === nodeId);
      if (incomingEdge) {
        const sourceNode = allNodes.find((n) => n.id === (incomingEdge as any).source);
        if (sourceNode?.data.output?.dataset_info?.column_types) {
          columnTypes = sourceNode.data.output.dataset_info.column_types;
        }
      }
    }
    
    const allColumns = getAvailableColumns();
    return allColumns.filter((col) => {
      const dtype = columnTypes[col] || "";
      return dtype.includes("int") || dtype.includes("float");
    });
  };

  if (isCollapsed) {
    return (
      <div className="fixed inset-y-0 right-0 w-12 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors rotate-180"
          title="Expand panel"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 writing-mode-vertical transform rotate-180">
          Configure
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
      style={{ width: `${width}px` }}
    >
      {}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors z-10"
        onMouseDown={handleMouseDown}
        style={{ cursor: isResizing ? 'ew-resize' : 'col-resize' }}
      />

      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
            title="Collapse panel"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configure Node
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {definition.label}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {}
        {node.data.type === "mlTrain" && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="text-xs text-gray-700 dark:text-gray-300">
                <div className="font-semibold mb-1 text-blue-900 dark:text-blue-100">How to choose the right model:</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Classification:</strong> Use when predicting categories (Yes/No, Type A/B/C, etc.)</li>
                  <li><strong>Regression:</strong> Use when predicting continuous numbers (price, temperature, score, etc.)</li>
                </ul>
                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-700">
                  ⚠️ <strong>Important:</strong> If you get an error about incompatible data, make sure your target column matches the task type!
                </div>
              </div>
            </div>
          </div>
        )}

        {definition.configFields.map((field) => (
          <div key={field.name}>
            <Label className="text-gray-700 dark:text-gray-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                type="text"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "number" && (
              <Input
                type="number"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 font-mono text-sm"
                rows={6}
              />
            )}

            {field.type === "select" && (
              <Select
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-1"
              >
                {}
                {field.name === "targetColumn" && getAvailableColumns().length > 0 ? (
                  <>
                    <option value="">Select target column...</option>
                    {getAvailableColumns().map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </>
                ) : field.name === "modelType" ? (
                  
                  <>
                    <option value="">Select model...</option>
                    {field.options
                      ?.filter((option: any) => 
                        option.taskType === (config.taskType || field.defaultValue || "classification")
                      )
                      .map((option: any) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </>
                ) : (
                  field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </Select>
            )}

            {}
            {field.type === "file" && (
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {config.filename || "Choose CSV/XLSX file..."}
                </Button>
                {config.filename && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {config.filename}
                  </p>
                )}
              </div>
            )}

            {}
            {field.type === "multiselect" && (
              <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                {getAvailableColumns().length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ No columns available. Please:
                    <br />1. Connect this node to an Upload node
                    <br />2. Execute the Upload node first
                  </p>
                ) : getNumericColumns().length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ No numeric columns found in the dataset. 
                    <br />Preprocessing only works with numeric columns (int, float).
                    <br />Available columns: {getAvailableColumns().join(", ")}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {getNumericColumns().map((col) => (
                      <label
                        key={col}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col)}
                          onChange={() => toggleColumn(col)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {col}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {}
            {field.type === "radio" && (
              <div className="mt-1 space-y-2">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option.value}
                      checked={(config[field.name] || field.defaultValue) === option.value}
                      onChange={(e) => {
                        handleChange(field.name, e.target.value);
                        if (field.name === "taskType") {
                          const defaultModel = e.target.value === "classification" 
                            ? "logistic_regression" 
                            : "linear_regression";
                          handleChange("modelType", defaultModel);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {}
        {node.data.type === "mlUpload" && node.data.output?.dataset_info && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <span>📊 Dataset Information</span>
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Total Rows</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {node.data.output.dataset_info.rows.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Total Columns</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {node.data.output.dataset_info.columns}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">Column Names</div>
                <div className="flex flex-wrap gap-1">
                  {node.data.output.dataset_info.column_names.map((col: string) => (
                    <span key={col} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              {node.data.output.dataset_info.column_types && (
                <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">Data Types</div>
                  <div className="space-y-1">
                    {Object.entries(node.data.output.dataset_info.column_types).slice(0, 5).map(([col, type]: [string, any]) => (
                      <div key={col} className="flex justify-between text-xs">
                        <span className="font-mono text-blue-700 dark:text-blue-300">{col}</span>
                        <span className="text-blue-600 dark:text-blue-400">{type}</span>
                      </div>
                    ))}
                    {Object.keys(node.data.output.dataset_info.column_types).length > 5 && (
                      <div className="text-xs text-blue-500 dark:text-blue-400 italic">
                        ... and {Object.keys(node.data.output.dataset_info.column_types).length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {node.data.type === "mlClean" && node.data.output?.missing_before && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🧹 Data Cleaning Results</span>
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Rows Before</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {node.data.output.rows_before.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Rows After</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {node.data.output.rows_after.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Missing Values Before</div>
                <div className="space-y-1">
                  {Object.entries(node.data.output.missing_before)
                    .filter(([_, count]: [string, any]) => count > 0)
                    .slice(0, 5)
                    .map(([col, count]: [string, any]) => (
                      <div key={col} className="flex justify-between text-xs">
                        <span className="font-mono text-gray-700 dark:text-gray-300">{col}</span>
                        <span className="text-gray-600 dark:text-gray-400">{count} missing</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Missing Values After</div>
                <div className="space-y-1">
                  {Object.entries(node.data.output.missing_after)
                    .filter(([_, count]: [string, any]) => count > 0)
                    .slice(0, 5)
                    .map(([col, count]: [string, any]) => (
                      <div key={col} className="flex justify-between text-xs">
                        <span className="font-mono text-gray-700 dark:text-gray-300">{col}</span>
                        <span className="text-pink-600 dark:text-pink-400">{count} missing</span>
                      </div>
                    ))}
                  {Object.entries(node.data.output.missing_after).every(([_, count]: [string, any]) => count === 0) && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ All missing values handled
                    </div>
                  )}
                </div>
              </div>
              {node.data.output.message && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {node.data.output.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {node.data.type === "mlPreprocess" && node.data.output?.processed && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
              <span>✨ Preprocessing Complete</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-indigo-950/50 p-3 rounded-lg">
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                  {node.data.output.message || "Data preprocessed successfully"}
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                  <span className="font-semibold">Method:</span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded">
                    {config.scalerType === "standardization" ? "Standardization (Z-score)" : "Normalization (Min-Max)"}
                  </span>
                </div>
              </div>
              {node.data.output.processed_columns && (
                <div className="bg-white dark:bg-indigo-950/50 p-3 rounded-lg">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                    Processed Columns ({node.data.output.processed_columns.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.data.output.processed_columns.map((col: string) => (
                      <span key={col} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {node.data.type === "mlSplit" && node.data.output?.train_size && (
          <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <h4 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mb-3 flex items-center gap-2">
              <span>🔀 Data Split Complete</span>
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-cyan-950/50 p-3 rounded-lg">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">Training Set</div>
                  <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {node.data.output.train_size}
                  </div>
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    {((node.data.output.train_size / (node.data.output.train_size + node.data.output.test_size)) * 100).toFixed(0)}% of data
                  </div>
                </div>
                <div className="bg-white dark:bg-cyan-950/50 p-3 rounded-lg">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">Testing Set</div>
                  <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {node.data.output.test_size}
                  </div>
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    {((node.data.output.test_size / (node.data.output.train_size + node.data.output.test_size)) * 100).toFixed(0)}% of data
                  </div>
                </div>
              </div>
              {node.data.output.target_column && (
                <div className="bg-white dark:bg-cyan-950/50 p-3 rounded-lg">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-2">Target Column</div>
                  <span className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded text-sm font-mono font-semibold">
                    {node.data.output.target_column}
                  </span>
                </div>
              )}
              {node.data.output.features && node.data.output.features.length > 0 && (
                <div className="bg-white dark:bg-cyan-950/50 p-3 rounded-lg">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-2">
                    Feature Columns ({node.data.output.features.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.data.output.features.map((col: string) => (
                      <span key={col} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded text-xs font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {node.data.type === "mlTrain" && node.data.output && (node.data.output.test_accuracy !== undefined || node.data.output.test_score !== undefined) && (() => {
          const taskType = node.data.output.task_type || 'classification';
          const isClassification = taskType === 'classification';
          const trainScore = node.data.output.train_score || node.data.output.train_accuracy || 0;
          const testScore = node.data.output.test_score || node.data.output.test_accuracy || 0;
          
          return (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                <span>🎯 Model Training Complete</span>
              </h4>
              <div className="space-y-3">
                <div className="bg-white dark:bg-emerald-950/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Model Type:</div>
                    <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded text-sm font-semibold">
                      {node.data.output.model_type?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isClassification 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                      {isClassification ? '📊 Classification' : '📈 Regression'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-emerald-950/50 p-3 rounded-lg">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      Training {isClassification ? 'Accuracy' : 'R² Score'}
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {isClassification ? `${(trainScore * 100).toFixed(2)}%` : trainScore.toFixed(3)}
                    </div>
                    {isClassification && (
                      <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                        <div
                          className="bg-emerald-600 dark:bg-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, trainScore * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-emerald-950/50 p-3 rounded-lg">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      Testing {isClassification ? 'Accuracy' : 'R² Score'}
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {isClassification ? `${(testScore * 100).toFixed(2)}%` : testScore.toFixed(3)}
                    </div>
                    {isClassification && (
                      <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                        <div
                          className="bg-emerald-600 dark:bg-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, testScore * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {node.data.output.metrics && (
                  <div className="bg-white dark:bg-emerald-950/50 p-3 rounded-lg">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                      {isClassification ? 'Additional Metrics' : 'Error Metrics (Lower is Better)'}
                    </div>
                    {isClassification ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-700 dark:text-emerald-300">Precision</span>
                            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                              {(node.data.output.metrics.precision * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${node.data.output.metrics.precision * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-700 dark:text-emerald-300">Recall</span>
                            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                              {(node.data.output.metrics.recall * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${node.data.output.metrics.recall * 100}%` }}
                            />
                          </div>
                        </div>
                        {node.data.output.metrics.f1_score !== undefined && (
                          <div className="col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-emerald-700 dark:text-emerald-300">F1 Score</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                {(node.data.output.metrics.f1_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-1.5">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${node.data.output.metrics.f1_score * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded">
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">MAE (Mean Absolute Error)</span>
                          <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {node.data.output.metrics.mae?.toFixed(3) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded">
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">RMSE (Root Mean Squared Error)</span>
                          <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {node.data.output.metrics.rmse?.toFixed(3) || 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded border border-emerald-200 dark:border-emerald-700">
                          💡 Lower error values indicate better predictions
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {}
        {node.data.type === "mlResults" && node.data.output?.model_info?.metrics && (
          <div className="mt-4 space-y-4">
            {}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🎓 Your Model's Report Card</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Overall Score</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {(node.data.output.model_info.metrics.test_accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${node.data.output.model_info.metrics.test_accuracy * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-900 dark:text-white font-medium mb-2">
                    {node.data.output.model_info.metrics.test_accuracy >= 0.9 ? '🌟 Excellent!' :
                     node.data.output.model_info.metrics.test_accuracy >= 0.8 ? '✅ Very Good!' :
                     node.data.output.model_info.metrics.test_accuracy >= 0.7 ? '👍 Good!' :
                     node.data.output.model_info.metrics.test_accuracy >= 0.6 ? '📈 Fair' : '⚠️ Needs Work'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {node.data.output.model_info.metrics.test_accuracy >= 0.8 
                      ? 'Your model is performing great! It can make accurate predictions.'
                      : node.data.output.model_info.metrics.test_accuracy >= 0.6
                      ? 'Model is learning but could improve with more data or tuning.'
                      : 'Model needs improvement. Try different features or more data.'}
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div className="font-semibold mb-1">How to read the charts below:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Performance Chart:</strong> Shows how well your model scores on different metrics</li>
                    <li><strong>Confusion Matrix:</strong> Shows where your model got it right (diagonal) vs wrong</li>
                    <li><strong>Training vs Testing:</strong> Checks if model learned properly without memorizing</li>
                    {node.data.output.visualizations?.feature_importance && (
                      <li><strong>Feature Importance:</strong> Shows which input data matters most for predictions</li>
                    )}
                  </ul>
                  {!node.data.output.visualizations?.feature_importance && (
                    <div className="mt-2 text-[11px] text-blue-700 dark:text-blue-300 italic">
                      💭 Note: Feature Importance chart is only available for Decision Tree and Random Forest models
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            {node.data.output.visualizations && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>📊 Detailed Analysis Charts</span>
                </h4>
                
                {node.data.output.visualizations.metrics_chart && (
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-900">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      📊 Performance Metrics Overview
                    </div>
                    <img 
                      src={`data:image/png;base64,${node.data.output.visualizations.metrics_chart}`}
                      alt="Performance Metrics Chart"
                      className="w-full rounded"
                    />
                  </div>
                )}
                
                {node.data.output.visualizations.confusion_matrix && (
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-900">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      🎯 Confusion Matrix (Prediction Accuracy)
                    </div>
                    <img 
                      src={`data:image/png;base64,${node.data.output.visualizations.confusion_matrix}`}
                      alt="Confusion Matrix"
                      className="w-full rounded"
                    />
                  </div>
                )}
                
                {node.data.output.visualizations.accuracy_comparison && (
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-900">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      📚 Training vs Testing Comparison
                    </div>
                    <img 
                      src={`data:image/png;base64,${node.data.output.visualizations.accuracy_comparison}`}
                      alt="Training vs Testing Accuracy"
                      className="w-full rounded"
                    />
                  </div>
                )}
                
                {node.data.output.visualizations.feature_importance && (
                  <div className="border-2 border-orange-200 dark:border-orange-700 rounded-lg p-3 bg-white dark:bg-gray-900 shadow-md">
                    <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                      <span>🔍 Feature Importance Analysis</span>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-[10px]">
                        Tree-based models only
                      </span>
                    </div>
                    <img 
                      src={`data:image/png;base64,${node.data.output.visualizations.feature_importance}`}
                      alt="Feature Importance"
                      className="w-full rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
