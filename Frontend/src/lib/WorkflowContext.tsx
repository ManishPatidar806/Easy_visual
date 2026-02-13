// This file creates a "Context" - a way to share data between components in React
// Think of it like a global storage that any component can access
// This is simpler and more standard than Zustand

import React, { createContext, useContext, useState } from "react";
import { addEdge as addReactFlowEdge, Connection } from "reactflow";

// ===== TYPES =====
// These define what shape our data should have

// What type of node it can be
type NodeType = "mlUpload" | "mlClean" | "mlPreprocess" | "mlSplit" | "mlTrain" | "mlResults";

// Data that each node contains
interface NodeData {
  label: string;              // Node name shown
  type: NodeType;             // What kind of node
  config?: any;               // Settings for this node
  output?: any;               // Results after running
  isExecuting?: boolean;      // Is it running right now?
  error?: string;             // Any error message
}

// A node in our workflow (combines ReactFlow's Node with our NodeData)
interface WorkflowNode {
  id: string;                 // Unique identifier
  type: string;               // For ReactFlow (usually "custom")
  position: { x: number; y: number };  // Where it appears on canvas
  data: NodeData;             // The actual node data
}

// A connection between two nodes
interface WorkflowEdge {
  id: string;                 // Unique identifier
  source: string;             // ID of the node it comes from
  target: string;             // ID of the node it goes to
  [key: string]: any;         // Allow other properties ReactFlow needs
}

// ===== CONTEXT =====
// This is what we'll share across components

interface WorkflowContextType {
  // Current state
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  
  // Functions to modify state
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: any) => void;
  deleteEdge: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  clearWorkflow: () => void;
}

// Create the context (empty at first, we'll fill it below)
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// ===== PROVIDER COMPONENT =====
// This wraps our app and provides the workflow state to all children

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  // State: list of nodes and edges
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);

  // Function: Add a new node to the list
  const addNode = (node: WorkflowNode) => {
    setNodes((currentNodes) => [...currentNodes, node]);  // Use functional update to get latest state
  };

  // Function: Update data for a specific node
  const updateNode = (id: string, newData: any) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        // If this is the node we want to update
        if (node.id === id) {
          return {
            ...node,                          // Keep everything the same
            data: { ...node.data, ...newData } // But merge in new data
          };
        }
        // Otherwise, return node unchanged
        return node;
      })
    );
  };

  // Function: Remove a node (and its connections)
  const deleteNode = (id: string) => {
    // Remove the node itself
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
    
    // Remove any edges connected to this node
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  // Function: Add a connection between two nodes
  const addEdge = (edge: any) => {
    // ReactFlow helper function to add edge properly
    setEdges((currentEdges) => addReactFlowEdge(edge as Connection, currentEdges as any));
  };

  // Function: Remove a connection
  const deleteEdge = (id: string) => {
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== id));
  };

  // Function: Clear everything
  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
  };

  // The value we'll share with all components
  const value = {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    setNodes,
    setEdges,
    clearWorkflow,
  };

  // Provide this value to all children components
  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// ===== HOOK =====
// Custom hook to easily access workflow state from any component

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  
  // Make sure we're inside a WorkflowProvider
  if (!context) {
    throw new Error("useWorkflow must be used inside WorkflowProvider");
  }
  
  return context;
}

// Export types so other files can use them
export type { WorkflowNode, WorkflowEdge, NodeData, NodeType };
