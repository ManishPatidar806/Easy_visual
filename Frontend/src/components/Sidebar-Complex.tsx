import React, { useState } from "react";
import { nodeDefinitions, NodeDefinition } from "@/lib/node-definitions";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/lib/store";

interface SidebarProps {
  onExecute?: () => Promise<void>;
  isExecuting?: boolean;
}

export default function Sidebar({ onExecute, isExecuting }: SidebarProps) {
  const { clearWorkflow } = useWorkflowStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(320); // 80 * 4 = 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const categories = {
    ml: "ML Pipeline Nodes",
  };

  const groupedNodes = Object.values(nodeDefinitions).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeDefinition[]>);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 relative">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="mt-4 space-y-3">
          {Object.values(nodeDefinitions).map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              className={`${node.color} p-2 rounded-md cursor-move hover:opacity-80 transition-opacity`}
              title={node.label}
            >
              <node.icon className="h-4 w-4 text-white" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto relative"
      style={{ width: `${width}px` }}
    >
      <div className="p-4">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              EasyVisual
            </h2>

            <div className="flex flex-col gap-2">
              {onExecute && (
                <Button 
                  onClick={onExecute} 
                  disabled={isExecuting}
                  className="w-full"
                >
                  {isExecuting ? "Executing..." : "Execute Workflow"}
                </Button>
              )}
              <Button 
                onClick={clearWorkflow} 
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Workflow
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => setIsCollapsed(true)}
            className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

      {Object.entries(categories).map(([category, title]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h3>

          <div className="space-y-2">
            {groupedNodes[category]?.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-move hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`${node.color} p-2 rounded-md`}>
                    <node.icon className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {node.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {node.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
          <span>🚀</span>
          <span>Quick Start</span>
        </h3>
        <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
          <li>Drag nodes from below to canvas</li>
          <li>Connect them in order (drag from blue dots)</li>
          <li>Configure each node (double-click)</li>
          <li>Click the ▶ Run button on each node</li>
          <li>View results and metrics</li>
        </ol>
      </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors"
        onMouseDown={handleMouseDown}
        style={{ cursor: isResizing ? 'ew-resize' : 'col-resize' }}
      />
    </div>
  );
}
