# MST + React 19 Issue Reproduction & Documentation

This project demonstrates and documents the MobX State Tree (MST) + React 19 compatibility issue where deferred observer patterns trigger false positive warnings.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

**Open the browser console to see the warnings!**

## 📋 What's Included

### Documentation

1. **[REACT_19_EXPLANATION.md](./REACT_19_EXPLANATION.md)** - Deep dive into how React 19 causes the issue
   - Explains React 19's prop inspection changes
   - Details the interaction with MST's property interceptors
   - Compares with plain MobX
   - Timeline of the issue

2. **[REACT_DEBUG_OPTIONS.md](./REACT_DEBUG_OPTIONS.md)** - React configuration options to reduce warnings
   - 8 different approaches with pros/cons
   - StrictMode, DevTools, console filtering
   - Vite configuration options
   - Comparison table

3. **[DIAGNOSIS_AND_FIX.md](./DIAGNOSIS_AND_FIX.md)** - Technical analysis and fix implementation
   - Root cause analysis
   - The fix strategy
   - Testing results

### Live Demonstrations

1. **Main App** (`src/App.jsx`)
   - Side-by-side comparison of inline vs deferred observer
   - Button to trigger updates and see reactivity working
   - Demonstrates the warnings in console

2. **Minimal Reproduction** (`src/MinimalRepro.jsx`)
   - Stripped-down example showing exactly what triggers the issue
   - Interactive debug mode
   - Clear visual indicators and explanations
   - Code comparison side-by-side

### Code

- `src/store.js` - Simple MST store setup
- `src/App.jsx` - Main application with both patterns
- `src/MinimalRepro.jsx` - Minimal reproduction case
- `src/main.jsx` - App entry point with StrictMode

## 🔍 How to See the Issue

### Method 1: Use the App

1. Run `npm run dev`
2. Open http://localhost:5173
3. Open browser console (F12 or Cmd+Option+I)
4. Click "Show Minimal Reproduction"
5. Look for warnings about "object that is no longer part of a state tree"

### Method 2: Toggle Debug Mode

1. In the Minimal Reproduction view
2. Click "Show Debug Mode"
3. Warnings will increase (component logs trigger more inspection)
4. Notice warnings ONLY for the RED card (deferred observer)
5. GREEN card (inline observer) has no warnings

### Method 3: Check StrictMode Impact

1. Edit `src/main.jsx`
2. Remove `<React.StrictMode>` wrapper
3. Refresh page
4. Warnings should reduce by ~50%

## 🎯 The Problem

### Problematic Pattern (Triggers Warnings)

```javascript
const PersonCard = ({ person }) => {
  return <div>{person.name}</div>;
};

// Observer applied AFTER component definition
const PersonCardObserved = observer(PersonCard);
```

### Working Pattern (No Warnings)

```javascript
// Observer applied INLINE
const PersonCard = observer(({ person }) => {
  return <div>{person.name}</div>;
});
```

## 🛠️ Solutions

### Temporary Workarounds

1. **Always use inline observer** (recommended for new code)
2. **Disable StrictMode** (loses valuable dev checks)
3. **Filter console warnings** (cosmetic only)
4. **Use MST ignore mode** (⚠️ dangerous - hides real errors)

### Permanent Fix

The proper fix is in the MST codebase (already implemented in `~/mobx-state-tree` on branch `fix/react-19-observer-pattern-warnings`):

```typescript
// Modified ObjectNode.unbox() to only assert alive when:
// 1. Running an action (writes), OR
// 2. The node is actually dead
if (this._isRunningAction || !this.isAlive) {
    this.assertAlive({
        subpath: childNode.subpath || childNode.subpathUponDeath
    })
}
```

This allows passive property reads on alive nodes without warnings while maintaining safety.

## 🧪 Testing the Fix

### Option 1: Link Local MST Build

```bash
# Build the fixed MST
cd ~/mobx-state-tree
npm install
npm run build

# Link to this project
cd ~/mst-issue
npm link ~/mobx-state-tree

# Restart dev server
npm run dev
```

### Option 2: Wait for Release

Once the fix is merged and released:

```bash
npm update mobx-state-tree
```

## 📊 Console Output Comparison

### Without Fix (Current)

```
[mobx-state-tree] You are trying to read or write to an object that is
no longer part of a state tree. (Object type: 'Person', Path upon death: '',
Subpath: 'name', Action: ''). Either detach nodes first, or don't use
objects after removing / replacing them in the tree.

[mobx-state-tree] You are trying to read or write to an object that is
no longer part of a state tree. (Object type: 'Person', Path upon death: '',
Subpath: 'age', Action: ''). Either detach nodes first, or don't use
objects after removing / replacing them in the tree.
```

### With Fix (Expected)

```
(no warnings - clean console!)
```

## 🎓 Learning Resources

### Understanding the Issue

1. Read [REACT_19_EXPLANATION.md](./REACT_19_EXPLANATION.md) for the full technical breakdown
2. Explore the Minimal Reproduction in the browser
3. Compare the two patterns side-by-side

### Debugging in Your Own Project

1. Check [REACT_DEBUG_OPTIONS.md](./REACT_DEBUG_OPTIONS.md) for configuration options
2. Try different React modes (StrictMode, production build)
3. Use the inline observer pattern as a quick fix

### Related Links

- [GitHub Issue #2277](https://github.com/mobxjs/mobx-state-tree/issues/2277)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [MobX State Tree Docs](https://mobx-state-tree.js.org/)
- [MobX React Lite](https://github.com/mobxjs/mobx-react-lite)

## 🔧 Project Structure

```
~/mst-issue/
├── src/
│   ├── App.jsx              # Main app with both patterns
│   ├── MinimalRepro.jsx     # Minimal reproduction demo
│   ├── store.js             # MST store setup
│   └── main.jsx             # Entry point
├── REACT_19_EXPLANATION.md  # Deep dive into the issue
├── REACT_DEBUG_OPTIONS.md   # Configuration options
├── DIAGNOSIS_AND_FIX.md     # Technical fix details
├── README.md                # This file
├── package.json
└── vite.config.js
```

## 💡 Key Insights

1. **The warnings are false positives** - the nodes are NOT dead
2. **React 19 inspects props more aggressively** than React 18
3. **MST's lifecycle validation** is stricter than plain MobX
4. **The timing matters** - when observer is applied affects when tracking starts
5. **Production builds are unaffected** - this is a development-only issue

## ⚠️ Important Notes

- The component **works correctly** despite the warnings
- This is **not a React 19 bug** - it's a compatibility issue
- The warnings **only appear in development mode**
- **Production builds are completely unaffected**
- The fix **maintains all MST safety features**

## 🤝 Contributing

If you find other patterns that trigger the issue or have suggestions for the documentation, please contribute!

## 📝 License

MIT
