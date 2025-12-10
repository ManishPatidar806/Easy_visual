import type { Node, Edge } from "reactflow";

export type NodeType =
  | "mlUpload"
  | "mlPreprocess"
  | "mlSplit"
  | "mlTrain"
  | "mlResults";

export interface NodeData {
  label: string;
  type: NodeType;
  config?: Record<string, any>;
  output?: any;
  isExecuting?: boolean;
  error?: string;
}

export type WorkflowNode = Node<NodeData>;

export type WorkflowEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  clearWorkflow: () => void;
}

export interface NodeExecutionContext {
  nodeId: string;
  input: any;
  config: Record<string, any>;
  previousNodes: Record<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}
