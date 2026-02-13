// ===== IMPORTS =====
// React core for building components
import React, { useState, useEffect } from "react";

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
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // Store ReactFlow instance to convert screen coords to canvas coords
  const [reactFlowInstance, setReactFlowInstance] = useState(null);


  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const existingConnection = edges.find(
        (edge) => (edge as any).target === connection.target
      );

      if (existingConnection) {
        const { edges: currentEdges } = useWorkflowStore.getState();
        setEdges(currentEdges.filter((edge) => edge.id !== existingConnection.id));
      }

      const edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: "smoothstep",
        animated: true,
      };
      addEdge(edge as any);
    },
    [addEdge, edges, setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { nodes: currentNodes } = useWorkflowStore.getState();
          setNodes(currentNodes.filter((node) => node.id !== change.id));
        } 
        else if (change.type === "position" && "position" in change) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.position) {
            const updatedNodes = nodes.map((n) =>
              n.id === change.id ? { ...n, position: change.position! } : n
            );
            setNodes(updatedNodes);
          }
        }
      });
    },
    [nodes, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { edges: currentEdges } = useWorkflowStore.getState();
          setEdges(currentEdges.filter((edge) => edge.id !== change.id));
        }
      });
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type];
      if (!definition) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node-${nodeIdCounter++}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: { ...definition.defaultConfig, type: definition.type },
        } as NodeData,
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      if (node.data.type === "mlResults" && node.data.output?.model_info?.metrics) {
        setSelectedNodeId(node.id);
      }
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedNodeId) {
        if (event.key === "Backspace") {
          event.preventDefault();
        }
        
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      const { nodes: currentNodes, edges: currentEdges } = useWorkflowStore.getState();
      
      setNodes(currentNodes.filter((node) => node.id !== nodeId));
      
      setEdges(currentEdges.filter((edge) => 
        (edge as any).source !== nodeId && (edge as any).target !== nodeId
      ));
    },
    [setNodes, setEdges]
  );

  
  const executeFromNode = async (startNodeId: string) => {
    const executor = new WorkflowExecutor();

    const executedNodes = new Set<string>();
    const nodeOutputs: Record<string, any> = {};

    const getUpstreamNodes = (nodeId: string): string[] => {
      const upstreamEdges = edges.filter((edge) => (edge as any).target === nodeId);
      const upstreamNodeIds: string[] = [];
      
      for (const edge of upstreamEdges) {
        const sourceId = (edge as any).source;
        upstreamNodeIds.push(...getUpstreamNodes(sourceId), sourceId);
      }
      
      return upstreamNodeIds;
    };

    const upstreamNodeIds = getUpstreamNodes(startNodeId);
    const allNodesToExecute = [...new Set([...upstreamNodeIds, startNodeId])];

    const executeNodeChain = async (nodeId: string, input: any = null) => {
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

          const connectedEdges = edges.filter((edge) => (edge as any).source === nodeId);
          
          for (const edge of connectedEdges) {
            await executeNodeChain((edge as any).target, result.output);
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
    };

    const rootNodes = allNodesToExecute.filter(
      (nodeId) => !edges.some((edge) => 
        (edge as any).target === nodeId && 
        allNodesToExecute.includes((edge as any).source)
      )
    );

    try {
      for (const rootNodeId of rootNodes) {
        await executeNodeChain(rootNodeId);
      }
    } catch (error) {
      console.error("Workflow execution error:", error);
    }
  };

  useEffect(() => {
    (window as any).__executeFromNode = executeFromNode;
    return () => {
      delete (window as any).__executeFromNode;
    };
  }, [executeFromNode]);

  return (
    <div className="flex h-screen">
      {}
      <Sidebar />
      
      {}
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
          {}
          <Background color="#aaa" gap={16} />
          
          {}
          <Controls />
          
          {}
          <MiniMap
            nodeColor={(node: any) => {
              const definition = nodeDefinitions[node.data.type];
              const colorMap: Record<string, string> = {
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

          {}
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
        </ReactFlow>
      </div>

      {}
      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
