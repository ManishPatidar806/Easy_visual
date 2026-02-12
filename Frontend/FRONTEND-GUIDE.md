# 🚀 Frontend Guide - ML Workflow Builder

**For Beginners**: This guide explains the frontend code in simple terms!

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── main.tsx          ⭐ Entry point - starts the app
│   ├── App.tsx           ⭐ Main router - which page to show
│   ├── index.css         → Global styles (Tailwind)
│   │
│   ├── pages/
│   │   ├── Landing.tsx   → Welcome/intro page
│   │   └── Home.tsx      ⭐ Main workflow builder
│   │
│   ├── components/
│   │   ├── CustomNode.tsx      ⭐ How each node looks
│   │   ├── Sidebar.tsx         → Left panel with draggable nodes
│   │   ├── NodeConfigPanel.tsx → Right panel for settings
│   │   └── ui/                 → Reusable UI components
│   │
│   ├── lib/
│   │   ├── types.ts          ⭐ Data structure definitions
│   │   ├── store.ts          ⭐ Global state (memory)
│   │   ├── node-definitions.ts → All ML node configs
│   │   ├── executor.ts        → Runs the workflow
│   │   └── utils.ts           → Helper functions
│   │
│   └── api/
│       └── client.ts      → Talk to backend API
│
├── package.json           → Dependencies list
└── vite.config.ts        → Build configuration
```

**⭐ = Most important files for beginners to understand**

---

## 🎯 How the App Works (Simple Flow)

### 1️⃣ **App Starts** (`main.tsx`)
```typescript
// This connects React to your HTML
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />  // Load the main app
)
```

### 2️⃣ **Routing** (`App.tsx`)
```typescript
<Routes>
  <Route path="/" element={<Landing />} />    // Welcome page
  <Route path="/app" element={<Home />} />    // Workflow builder
</Routes>
```

### 3️⃣ **Main Workflow Page** (`pages/Home.tsx`)
This is where the magic happens:
- Drag nodes from sidebar → drop on canvas
- Connect nodes by dragging lines
- Double-click node → open settings
- Click "Execute Workflow" → run ML pipeline

### 4️⃣ **State Management** (`lib/store.ts`)
Think of this as the app's "memory":
```typescript
const useWorkflowStore = create((set) => ({
  nodes: [],    // All boxes on canvas
  edges: [],    // All connection lines
  addNode: ...  // Functions to modify data
}))
```

---

## 🧩 Key Concepts Explained

### What is a "Node"?
A **node** is a colorful box on the canvas. Each node represents one step in the ML pipeline:
- 📤 **Upload Node**: Load CSV file
- 🧹 **Clean Node**: Remove missing values
- ⚙️ **Preprocess Node**: Scale numeric columns
- ✂️ **Split Node**: Divide data into train/test
- 🤖 **Train Node**: Train ML model
- 📊 **Results Node**: Show accuracy & charts

### What is an "Edge"?
An **edge** is a connection line between nodes. It shows data flow:
```
[Upload] ──→ [Clean] ──→ [Train]
```

### What is "State"?
**State** is data that can change:
- **Global State** (store.ts): Shared by all components
- **Local State** (useState): Only for one component

Example:
```typescript
// Local state - only this component knows about it
const [isOpen, setIsOpen] = useState(false);

// Global state - all components can access it
const { nodes, addNode } = useWorkflowStore();
```

---

## 🎨 Important Files Explained

### 📄 `types.ts` - Data Structures
Defines what data looks like:

```typescript
// A node has this structure:
interface NodeData {
  label: string;        // "Upload Dataset"
  type: NodeType;       // "mlUpload"
  config?: object;      // Settings
  output?: any;         // Results
  error?: string;       // Error message
}
```

### 📄 `store.ts` - Global Memory
Stores all workflow data:

```typescript
// Access the store in any component:
const { nodes, edges, addNode, updateNode } = useWorkflowStore();

// Add a new node:
addNode({
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: { label: 'Upload', type: 'mlUpload' }
});
```

### 📄 `Home.tsx` - Main Page
The workflow builder:

```typescript
export default function Home() {
  // Get data from store
  const { nodes, edges } = useWorkflowStore();
  
  // Handle drag & drop
  const onDrop = (event) => {
    // Get node type from drag data
    // Create new node at drop position
    // Add to store
  };
  
  // Execute workflow
  const executeWorkflow = async () => {
    // Find starting nodes
    // Execute each node in order
    // Show results
  };
  
  return (
    <ReactFlow nodes={nodes} edges={edges} />
  );
}
```

### 📄 `CustomNode.tsx` - Node Design
How each node looks:

```typescript
function CustomNode({ data, selected }) {
  return (
    <div>
      {/* Header with icon */}
      <div className={definition.color}>
        <Icon />
        <span>{data.label}</span>
      </div>
      
      {/* Results */}
      {data.output && (
        <div>✓ Success!</div>
      )}
      
      {/* Connection handles */}
      <Handle type="target" />   // Input (left)
      <Handle type="source" />   // Output (right)
    </div>
  );
}
```

---

## 🔄 How Workflow Execution Works

When user clicks "Execute Workflow":

```typescript
1. Find starting nodes (nodes with no input connections)
   ↓
2. Execute first node (e.g., Upload)
   ↓
3. Get the output data
   ↓
4. Find connected nodes
   ↓
5. Execute each connected node with previous output
   ↓
6. Repeat steps 3-5 until all nodes done
   ↓
7. Show final results
```

Code:
```typescript
const executeWorkflow = async () => {
  // Step 1: Find trigger nodes
  const triggerNodes = nodes.filter(
    node => !edges.some(edge => edge.target === node.id)
  );
  
  // Step 2-7: Execute recursively
  for (const triggerNode of triggerNodes) {
    await executeNodeChain(triggerNode.id);
  }
};

const executeNodeChain = async (nodeId, input) => {
  // Execute this node
  const result = await executor.executeNode({ nodeId, input });
  
  // Execute children
  const connectedEdges = edges.filter(e => e.source === nodeId);
  for (const edge of connectedEdges) {
    await executeNodeChain(edge.target, result.output);
  }
};
```

---

## 🎓 Learning Path for Beginners

### **Step 1: Understand the Basics**
1. Read `main.tsx` → How app starts
2. Read `App.tsx` → How routing works
3. Read `types.ts` → What data structures we use

### **Step 2: Understand State Management**
1. Read `store.ts` → How we store workflow data
2. See how `Home.tsx` uses the store
3. Try adding a `console.log(nodes)` to see data

### **Step 3: Understand UI Components**
1. Read `CustomNode.tsx` → How nodes are rendered
2. See how `Home.tsx` uses ReactFlow
3. Try changing a node color in `node-definitions.ts`

### **Step 4: Understand Workflow Logic**
1. Read `executor.ts` → How nodes are executed
2. Read the `executeWorkflow` function in `Home.tsx`
3. Add console.logs to trace execution

---

## 🛠️ Common Tasks

### How to Add a New Node Type

1. **Add to types** (`types.ts`):
```typescript
export type NodeType = 
  | "mlUpload"
  | "myNewNode";  // Add this
```

2. **Add definition** (`node-definitions.ts`):
```typescript
myNewNode: {
  type: "myNewNode",
  label: "My New Node",
  icon: Star,
  color: "bg-yellow-500",
  // ... config fields
}
```

3. **Add executor** (`executor.ts`):
```typescript
case "myNewNode":
  return await this.executeMyNewNode(config, input);
```

### How to Change Node Colors

Edit `node-definitions.ts`:
```typescript
mlUpload: {
  color: "bg-purple-500",  // Change this!
  // Tailwind colors: bg-red-500, bg-blue-500, etc.
}
```

### How to Debug

Add console.logs in key places:
```typescript
// In Home.tsx
const onConnect = (connection) => {
  console.log('Connected:', connection);  // See connections
  addEdge(connection);
};

// In store.ts
addNode: (node) => {
  console.log('Adding node:', node);  // See new nodes
  set((state) => ({ nodes: [...state.nodes, node] }));
};
```

---

## 📚 Key React Concepts Used

### **useState**
Local state for one component:
```typescript
const [count, setCount] = useState(0);
setCount(count + 1);  // Update state
```

### **useCallback**
Memoize functions to prevent re-creation:
```typescript
const handleClick = useCallback(() => {
  console.log('Clicked!');
}, []);  // Empty array = never recreate
```

### **useEffect**
Run code when component mounts or updates:
```typescript
useEffect(() => {
  console.log('Component mounted!');
  return () => console.log('Component unmounted!');
}, []);  // Empty array = run once on mount
```

---

## 🎨 Styling with Tailwind

We use Tailwind CSS classes for styling:

```typescript
<div className="flex items-center gap-2 p-4 bg-blue-500 text-white rounded-lg">
  {/* 
    flex: Flexbox layout
    items-center: Vertical center
    gap-2: Space between items
    p-4: Padding
    bg-blue-500: Blue background
    text-white: White text
    rounded-lg: Rounded corners
  */}
</div>
```

Common patterns:
- `flex flex-col` = Vertical stack
- `w-full h-screen` = Full width/height
- `hover:bg-gray-100` = Change on hover
- `dark:bg-gray-800` = Dark mode color

---

## 🐛 Common Issues & Solutions

### **Issue: Nodes not showing**
- Check if `nodeTypes` is defined
- Check if `nodeDefinitions` has the node type
- Add `console.log(nodes)` to see if nodes exist

### **Issue: Connections not working**
- Check if handles exist (`<Handle />`)
- Check if `onConnect` is called
- Check if edges are in store

### **Issue: State not updating**
- Make sure you're using `set()` in store
- Check if component is using the store
- Try force refresh: `Ctrl+Shift+R`

---

## 📖 Helpful Resources

- **React Docs**: https://react.dev
- **TypeScript Basics**: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
- **ReactFlow Docs**: https://reactflow.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand (State)**: https://github.com/pmndrs/zustand

---

## 💡 Tips for Learning

1. **Start small**: Understand one file at a time
2. **Use console.log**: Print data to see what's happening
3. **Change things**: Modify colors, text, see what breaks
4. **Read errors**: Error messages tell you what's wrong
5. **Ask questions**: Google error messages, ask ChatGPT

---

## ✅ What We Improved

### Before:
- No comments
- Complex nested code
- Hard to understand flow
- Beginner-unfriendly

### After:
- ✓ Detailed comments everywhere
- ✓ Clear section headers
- ✓ Explained "why" not just "what"
- ✓ Step-by-step explanations
- ✓ Beginner-friendly terminology

---

**Happy Coding! 🎉**

Remember: Every expert was once a beginner. Take your time, experiment, and don't be afraid to break things!
