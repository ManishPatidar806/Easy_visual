# 🎯 Frontend Quick Reference - Cheat Sheet

## 📌 File Purposes (One-Line Summary)

| File | What It Does |
|------|--------------|
| `main.tsx` | Starts the entire app |
| `App.tsx` | Routes between pages (Landing → Home) |
| `pages/Home.tsx` | Main workflow builder with drag-drop |
| `pages/Landing.tsx` | Welcome/tutorial page |
| `components/CustomNode.tsx` | How each ML node looks |
| `components/Sidebar.tsx` | Left panel with draggable nodes |
| `components/NodeConfigPanel.tsx` | Right panel for node settings |
| `lib/types.ts` | Defines data structures |
| `lib/store.ts` | Global state (workflow memory) |
| `lib/node-definitions.ts` | Configuration for all ML nodes |
| `lib/executor.ts` | Runs nodes and calls backend |
| `api/client.ts` | Backend API calls |

---

## 🔑 Core Concepts

### Node
A colorful box on canvas (Upload, Clean, Train, etc.)

### Edge
A connection line between nodes

### Store
Global memory - shared data across all components

### State
Data that can change (like variables that trigger UI updates)

---

## 💻 Code Snippets You'll Use

### Get/Update Store Data
```typescript
// Get data from store
const { nodes, edges, addNode, updateNode } = useWorkflowStore();

// Add a node
addNode(newNode);

// Update a node
updateNode(nodeId, { output: result });
```

### Create a Node
```typescript
const newNode = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'Upload Dataset',
    type: 'mlUpload',
    config: {}
  }
};
```

### Create an Edge
```typescript
const newEdge = {
  id: 'e-node1-node2',
  source: 'node-1',
  target: 'node-2',
  type: 'smoothstep',
  animated: true
};
```

### Local State
```typescript
const [value, setValue] = useState(initialValue);

// Update it
setValue(newValue);
```

### Effect Hook
```typescript
useEffect(() => {
  // Runs when component mounts or dependencies change
  console.log('Hello!');
  
  return () => {
    // Cleanup when component unmounts
    console.log('Goodbye!');
  };
}, [dependency]);  // Re-run if dependency changes
```

---

## 🎨 Common Tailwind Classes

```typescript
// Layout
className="flex flex-col items-center justify-between"

// Spacing
className="p-4 m-2 gap-3"          // padding, margin, gap
className="px-4 py-2"              // padding-x, padding-y

// Colors
className="bg-blue-500 text-white"
className="hover:bg-blue-600"      // On hover
className="dark:bg-gray-800"       // Dark mode

// Sizing
className="w-full h-screen"        // width, height
className="min-w-[200px]"          // minimum width

// Borders & Shadows
className="border border-gray-300 rounded-lg shadow-md"

// Text
className="text-sm font-bold text-center"
```

---

## 🔄 Data Flow

```
User Action
    ↓
Event Handler (onClick, onDrop, etc.)
    ↓
Update Store (addNode, updateNode, etc.)
    ↓
Store Updates
    ↓
Components Re-render
    ↓
UI Updates
```

---

## 🐛 Debug Checklist

Problem: Something not working?

1. ✅ Check console for errors (`F12` → Console)
2. ✅ Add `console.log()` to see data
3. ✅ Check if store has data: `console.log(nodes)`
4. ✅ Verify component is imported correctly
5. ✅ Try hard refresh: `Ctrl+Shift+R`
6. ✅ Check TypeScript errors in VS Code

---

## 🚀 Quick Tasks

### Change Node Color
`lib/node-definitions.ts` → Change `color: "bg-purple-500"`

### Add Console Log
```typescript
console.log('Debug:', variableName);
```

### Add New Button
```typescript
<button 
  onClick={() => console.log('Clicked!')}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Click Me
</button>
```

### Access Node Data in CustomNode
```typescript
function CustomNode({ data }) {
  console.log('Node data:', data);
  return <div>{data.label}</div>;
}
```

---

## 📚 Important Imports

```typescript
// React basics
import { useState, useEffect, useCallback } from 'react';

// Store
import { useWorkflowStore } from '@/lib/store';

// Types
import { WorkflowNode, NodeData } from '@/lib/types';

// ReactFlow
import ReactFlow, { Handle, Position } from 'reactflow';
```

---

## 🎯 Where to Start

**Day 1**: Read comments in these files:
1. `main.tsx`
2. `App.tsx`
3. `lib/types.ts`

**Day 2**: Understand state:
4. `lib/store.ts`
5. See how `Home.tsx` uses store

**Day 3**: Understand UI:
6. `CustomNode.tsx`
7. Modify a color and see the change

**Day 4**: Understand execution:
8. Read `executeWorkflow()` in `Home.tsx`
9. Add console.logs to trace execution

---

## 💡 Pro Tips

1. **Always use `const`**, not `var`
2. **Use TypeScript types** - they help catch errors
3. **Break code into small functions** - easier to understand
4. **Name variables clearly** - `isLoading` not `x`
5. **Comment complex logic** - future you will thank you!

---

## 🆘 Get Help

- **Console errors?** → Google the error message
- **TypeScript error?** → Hover over red squiggle in VS Code
- **UI not updating?** → Check if you're modifying state correctly
- **Still stuck?** → Ask ChatGPT with specific error message

---

**🎉 You've got this!**

Start small, experiment often, and remember: everyone learns by doing!
