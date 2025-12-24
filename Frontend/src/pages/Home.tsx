import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
} from "reactflow";
import type { 
  Connection,
  NodeTypes,
  OnConnect,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "@/components/Sidebar";
import CustomNode from "@/components/CustomNode";
import NodeConfigPanel from "@/components/NodeConfigPanel";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode, NodeData } from "@/lib/types";
import { WorkflowExecutor } from "@/lib/executor";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

let nodeIdCounter = 0;

export default function Home() {
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges } =
    useWorkflowStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: "smoothstep",
        animated: true,
      };
      addEdge(edge as any);
    },
    [addEdge]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { nodes: currentNodes } = useWorkflowStore.getState();
          setNodes(currentNodes.filter((node) => node.id !== change.id));
        } else if (change.type === "position" && "position" in change) {
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

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedNodeId) {
        // Prevent default backspace navigation
        if (event.key === "Backspace") {
          event.preventDefault();
        }
        
        // Don't delete if user is typing in an input
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
      
      // Remove the node
      setNodes(currentNodes.filter((node) => node.id !== nodeId));
      
      // Remove connected edges
      setEdges(currentEdges.filter((edge) => 
        (edge as any).source !== nodeId && (edge as any).target !== nodeId
      ));
    },
    [setNodes, setEdges]
  );

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add some nodes to the canvas first!");
      return;
    }

    setIsExecuting(true);
    const executor = new WorkflowExecutor();

    const triggerNodes = nodes.filter(
      (node) => !edges.some((edge) => (edge as any).target === node.id)
    );

    if (triggerNodes.length === 0) {
      alert("Add a trigger node to start the workflow!");
      setIsExecuting(false);
      return;
    }

    nodes.forEach((node) => {
      updateNode(node.id, {
        output: undefined,
        error: undefined,
        isExecuting: false,
      });
    });

    const executedNodes = new Set<string>();
    const nodeOutputs: Record<string, any> = {};

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

    try {
      for (const triggerNode of triggerNodes) {
        await executeNodeChain(triggerNode.id);
      }
    } catch (error) {
      console.error("Workflow execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        onExecute={executeWorkflow}
        isExecuting={isExecuting}
      />
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

      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
