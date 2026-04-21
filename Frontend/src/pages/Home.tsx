// ===== IMPORTS =====
import { useState, useEffect } from "react";

// ReactFlow library for the visual workflow canvas
import ReactFlow, {
  Background,   // Grid background
  Controls,     // Zoom/pan controls
  MiniMap,      // Small overview map
  Panel,        // Overlay panel
} from "reactflow";
import "reactflow/dist/style.css";

// Our custom components
import Sidebar from "@/components/Sidebar";
import CustomNode from "@/components/CustomNode";
import NodeConfigPanel from "@/components/NodeConfigPanel";

// Our state management and utilities
import { useWorkflow } from "@/lib/WorkflowContext";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowExecutor } from "@/lib/executor";
import { isFirstBackendRequestInSession } from "@/api/client";

// ===== SETUP =====

// Tell ReactFlow to use our custom node component for all nodes
const nodeTypes = {
  custom: CustomNode,
};

// Counter to give each new node a unique ID
let nodeIdCounter = 0;

// ===== MAIN COMPONENT =====

export default function Home() {
  // Get workflow state and functions from our Context
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges } = useWorkflow();
  
  // Track which node (if any) is currently selected for configuration
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Store ReactFlow instance to convert screen coords to canvas coords
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const hasExecutingNode = nodes.some((node) => node.data?.isExecuting);
  const showColdStartBanner = hasExecutingNode && isFirstBackendRequestInSession();

  // ===== EVENT HANDLERS =====

  // When user connects two nodes together  
  function onConnect(connection: any) {
    // Make sure both source and target exist
    if (!connection.source || !connection.target) return;

    // First, remove any existing connection to the target node (using functional update)
    setEdges((currentEdges) => {
      const existing = currentEdges.find((e) => e.target === connection.target);
      if (existing) {
        return currentEdges.filter((e) => e.id !== existing.id);
      }
      return currentEdges;
    });

    // Create the new edge with a unique ID and styling
    const edge = {
      ...connection,
      id: `e${connection.source}-${connection.target}`,
      type: "smoothstep",
      animated: true,
    };
    
    addEdge(edge);
  }

  // When nodes are moved or deleted
  function handleNodesChange(changes: any[]) {
    changes.forEach((change: any) => {
      if (change.type === "remove") {
        setNodes((curr) => curr.filter((n) => n.id !== change.id));
      } 
      else if (change.type === "position" && change.position) {
        setNodes((curr) => 
          curr.map((n) => n.id === change.id ? { ...n, position: change.position } : n)
        );
      }
    });
  }

  // When edges are deleted
  function handleEdgesChange(changes: any[]) {
    changes.forEach((change: any) => {
      if (change.type === "remove") {
        setEdges((curr) => curr.filter((e) => e.id !== change.id));
      }
    });
  }

  // When user drags something over the canvas
  function onDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  // When user drops a node from sidebar onto canvas
  function onDrop(event: any) {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/reactflow");
    if (!type || !reactFlowInstance) return;

    const definition = nodeDefinitions[type];
    if (!definition) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: any = {
      id: `node-${nodeIdCounter++}`,
      type: "custom",
      position,
      data: {
        label: definition.label,
        type: definition.type,
        config: { ...definition.defaultConfig, type: definition.type },
      },
    };

    addNode(newNode);
  }

  // When user double-clicks a node
  function onNodeDoubleClick(_event: any, node: any) {
    setSelectedNodeId(node.id);
  }

  // When user single-clicks a node
  function onNodeClick(_event: any, node: any) {
    if (node.data.type === "mlResults" && node.data.output?.model_info?.metrics) {
      setSelectedNodeId(node.id);
    }
  }

  // Delete a node and all edges connected to it
  function deleteNode(nodeId: string) {
    setNodes((curr) => curr.filter((n) => n.id !== nodeId));
    setEdges((curr) => curr.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: any) {
      if (!selectedNodeId) return;
      
      if (event.key === "Delete" || event.key === "Backspace") {
        const target = event.target;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        if (event.key === "Backspace") {
          event.preventDefault();
        }

        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId]);

  // Execute workflow from a node
  async function executeFromNode(startNodeId: string) {
    const executor = new WorkflowExecutor();
    const executedNodes = new Set<string>();
    const nodeOutputs: any = {};

    function getUpstreamNodes(nodeId: string): string[] {
      const upstreamEdges = edges.filter((e) => e.target === nodeId);
      const upstreamNodeIds = [];
      for (const edge of upstreamEdges) {
        upstreamNodeIds.push(...getUpstreamNodes(edge.source), edge.source);
      }
      return upstreamNodeIds;
    }

    const upstreamNodeIds = getUpstreamNodes(startNodeId);
    const allNodesToExecute = [...new Set([...upstreamNodeIds, startNodeId])];

    async function executeNodeChain(nodeId: string, input: any = null) {
      if (executedNodes.has(nodeId)) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      executedNodes.add(nodeId);
      updateNode(nodeId, { isExecuting: true, error: undefined });

      try {
        const result = await executor.executeNode({
          nodeId: node.id,
          input,
          config: node.data.config || {},
          previousNodes: nodeOutputs,
        });

        if (result.success) {
          updateNode(nodeId, {
            output: result.output,
            isExecuting: false,
          });
          
          nodeOutputs[nodeId] = result.output;

          if (node.data.type === "mlResults" && result.output?.model_info?.metrics) {
            setTimeout(() => setSelectedNodeId(nodeId), 300);
          }

          const connectedEdges = edges.filter((e) => e.source === nodeId);
          for (const edge of connectedEdges) {
            await executeNodeChain(edge.target, result.output);
          }
        } else {
          updateNode(nodeId, {
            error: result.error,
            isExecuting: false,
          });
        }
      } catch (error: any) {
        updateNode(nodeId, {
          error: error.message || "Execution failed",
          isExecuting: false,
        });
      }
    }

    const rootNodes = allNodesToExecute.filter(
      (nodeId) => !edges.some((e) => 
        e.target === nodeId && 
        allNodesToExecute.includes(e.source)
      )
    );

    try {
      for (const rootNodeId of rootNodes) {
        await executeNodeChain(rootNodeId);
      }
    } catch (error) {
      console.error("Workflow execution error:", error);
    }
  }

  // Make executeFromNode available globally
  useEffect(() => {
    (window as any).__executeFromNode = executeFromNode;
    return () => {
      delete (window as any).__executeFromNode;
    };
  }, [nodes, edges]);

  return (
    <div className="flex h-screen">
      <Sidebar onExecute={undefined} isExecuting={undefined} />
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
          deleteKeyCode={["Delete", "Backspace"]}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node: any) => {
              const definition = nodeDefinitions[node.data.type];
              const colorMap: any = {
                "bg-purple-500": "#a855f7",
                "bg-indigo-500": "#6366f1",
                "bg-cyan-500": "#06b6d4",
                "bg-emerald-500": "#10b981",
                "bg-pink-500": "#ec4899",
              };
              return colorMap[definition?.color] || "#6366f1";
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          />
          <Panel
            position="top-center"
            className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {nodes.length}
              </span>{" "}
              nodes •{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {edges.length}
              </span>{" "}
              connections
            </div>
          </Panel>

          {showColdStartBanner && (
            <Panel
              position="top-center"
              className="mt-14 max-w-xl bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-md shadow-sm border border-amber-200 dark:border-amber-800"
            >
              <div className="text-xs text-amber-900 dark:text-amber-200">
                First request may take 2-3 minutes while Render starts the backend service.
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
