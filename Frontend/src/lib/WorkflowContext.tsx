import React, { createContext, useContext, useState } from "react";
import { addEdge as addReactFlowEdge, Connection } from "reactflow";
type NodeType = "mlUpload" | "mlClean" | "mlPreprocess" | "mlSplit" | "mlTrain" | "mlResults" | "mlDownloadConfig";
interface NodeData {
  label: string;
  type: NodeType;
  config?: any;
  output?: any;
  isExecuting?: boolean;
  error?: string;
}
interface WorkflowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: NodeData;
  [key: string]: any;
}
interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

interface WorkflowContextType {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: any) => void;
  invalidateNodeOutputs: (id: string) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: any) => void;
  deleteEdge: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  clearWorkflow: () => void;
}
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);

  const addNode = (node: WorkflowNode) => {
    setNodes((currentNodes) => currentNodes.concat(node));
  };

  const updateNode = (id: string, newData: any) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const invalidateNodeOutputs = (startNodeId: string) => {
    const affectedNodeIds = new Set<string>([startNodeId]);
    const queue = [startNodeId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outgoing = edges.filter((e) => e.source === curr);
      for (const edge of outgoing) {
        if (!affectedNodeIds.has(edge.target)) {
          affectedNodeIds.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (affectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              output: undefined,
              error: undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const deleteNode = (id: string) => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  const addEdge = (edge: any) => {
    setEdges((currentEdges) => addReactFlowEdge(edge as Connection, currentEdges as any));
  };

  const deleteEdge = (id: string) => {
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== id));
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
  };

  const value = {
    nodes,
    edges,
    addNode,
    updateNode,
    invalidateNodeOutputs,
    deleteNode,
    addEdge,
    deleteEdge,
    setNodes,
    setEdges,
    clearWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used inside WorkflowProvider");
  }
  return context;
}

export type { WorkflowNode, WorkflowEdge, NodeData, NodeType };
