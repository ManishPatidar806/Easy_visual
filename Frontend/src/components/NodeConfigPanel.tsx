import { useState, useEffect, useRef } from "react";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X, Upload as UploadIcon, CheckCircle } from "lucide-react";

interface NodeConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  onClose,
}: NodeConfigPanelProps) {
  const { nodes, updateNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<Record<string, any>>(
    node?.data.config || {}
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    config.columns || []
  );

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
    if (!node?.data.output?.dataset_info?.column_names) {
      const edges = useWorkflowStore.getState().edges;
      const incomingEdge = edges.find((e: any) => e.target === nodeId);
      if (incomingEdge) {
        const sourceNode = nodes.find((n) => n.id === (incomingEdge as any).source);
        if (sourceNode?.data.output?.dataset_info?.column_names) {
          return sourceNode.data.output.dataset_info.column_names;
        }
      }
      return [];
    }
    return node.data.output.dataset_info.column_names;
  };

  const getNumericColumns = (): string[] => {
    const allColumns = getAvailableColumns();
    return allColumns;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configure Node
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {definition.label}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
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
                {/* Dynamically populate target column options for mlSplit */}
                {field.name === "targetColumn" && getAvailableColumns().length > 0 ? (
                  <>
                    <option value="">Select target column...</option>
                    {getAvailableColumns().map((col) => (
                      <option key={col} value={col}>
                        {col}
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

            {/* File upload for ML Upload node */}
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

            {/* Multi-select for preprocessing columns */}
            {field.type === "multiselect" && (
              <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                {getNumericColumns().length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect to Upload node first to see columns
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

            {/* Radio buttons for model selection */}
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
                      onChange={(e) => handleChange(field.name, e.target.value)}
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

        {/* Display dataset info for Upload node */}
        {node.data.type === "mlUpload" && node.data.output?.dataset_info && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Dataset Info
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>📊 Rows: {node.data.output.dataset_info.rows}</p>
              <p>📋 Columns: {node.data.output.dataset_info.columns}</p>
              <p className="font-mono text-xs">
                {node.data.output.dataset_info.column_names.slice(0, 5).join(", ")}
                {node.data.output.dataset_info.column_names.length > 5 && "..."}
              </p>
            </div>
          </div>
        )}

        {/* Display metrics for Train node */}
        {node.data.type === "mlTrain" && node.data.output?.test_accuracy && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              Training Results
            </h4>
            <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <p>🎯 Model: {node.data.output.model_type?.replace("_", " ")}</p>
              <p>✅ Accuracy: {(node.data.output.test_accuracy * 100).toFixed(2)}%</p>
              {node.data.output.metrics && (
                <>
                  <p>📈 Precision: {(node.data.output.metrics.precision * 100).toFixed(2)}%</p>
                  <p>📊 Recall: {(node.data.output.metrics.recall * 100).toFixed(2)}%</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Display results for Results node */}
        {node.data.type === "mlResults" && node.data.output?.metrics && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Model Performance
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-700 dark:text-purple-300">Accuracy</span>
                <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                  {(node.data.output.metrics.accuracy * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div
                  className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full"
                  style={{ width: `${node.data.output.metrics.accuracy * 100}%` }}
                />
              </div>
            </div>
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

        {node.data.output && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Output
            </h4>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(node.data.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
