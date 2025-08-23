# 🐛 Debugging Guide for Next.js Project

## 🚀 Quick Start

### Debug Configurations Available:

1. **Next.js: debug server-side** - Debug API routes, server components, and server-side code
2. **Next.js: debug client-side** - Debug React components and client-side code in Chrome
3. **Next.js: debug full stack** - Debug both server and client simultaneously
4. **Next.js: debug with Turbopack** - Debug with Turbopack bundler enabled
5. **Next.js: attach to running process** - Attach debugger to an already running Next.js process

## 🎯 How to Use

### Method 1: VS Code Debug Panel
1. Open the Debug panel in VS Code (`Cmd+Shift+D` on Mac, `Ctrl+Shift+D` on Windows/Linux)
2. Select your desired debug configuration from the dropdown
3. Click the green play button or press `F5`

### Method 2: Command Palette
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Debug: Select and Start Debugging"
3. Choose your configuration

### Method 3: npm/bun Scripts
Run these commands in your terminal:

```bash
# Debug server-side with Node.js inspector
bun run dev:debug

# Debug with Turbopack + Node.js inspector  
bun run dev:debug-turbo

# Debug production build
bun run start:debug
```

## 🔧 Setting Breakpoints

### Server-Side Code (API Routes, Server Components)
1. Open your `.ts` or `.tsx` file
2. Click in the gutter next to the line number to set a breakpoint
3. Start the "Next.js: debug server-side" configuration
4. Make a request that triggers your code

### Client-Side Code (React Components)
1. Set breakpoints in your React components
2. Start the "Next.js: debug client-side" configuration
3. Chrome will open automatically with the debugger attached
4. Navigate to trigger your breakpoints

### Full Stack Debugging
1. Set breakpoints in both server and client code
2. Use the "Next.js: debug full stack (client + server)" compound configuration
3. This starts both debuggers simultaneously

## 📝 Debug Console

When debugging, you can use the VS Code Debug Console to:
- Execute JavaScript expressions in the current context
- Inspect variables and objects
- Call functions and methods
- Modify variable values on the fly

## 🛠 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
1. Stop any running Next.js processes
2. Use `lsof -ti:3000 | xargs kill -9` to kill processes on port 3000
3. Or change the port in your debug configuration

### Breakpoints Not Working
1. Ensure source maps are enabled in your Next.js config
2. Check that you're using the correct debug configuration
3. Verify the file path in your breakpoint matches the running code

### Chrome Not Opening
1. Make sure Google Chrome is installed
2. Check that the URL in the debug configuration matches your dev server
3. Try manually opening `http://localhost:3000` in Chrome

## 🎨 Advanced Features

### Conditional Breakpoints
- Right-click on a breakpoint to set conditions
- The breakpoint will only trigger when the condition is true

### Logpoints  
- Set logpoints instead of breakpoints to log values without stopping execution
- Right-click in the gutter and select "Add Logpoint"

### Call Stack
- View the full call stack when paused at a breakpoint
- Click on stack frames to navigate through the execution flow

### Variables Panel
- Inspect all variables in the current scope
- Expand objects to see their properties
- Watch specific expressions

## 📚 Useful Keyboard Shortcuts

- `F5` - Start debugging
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `F9` - Toggle breakpoint
- `Ctrl+Shift+F5` - Restart debugging session

## 🌐 Browser DevTools Integration

When using client-side debugging, you also have access to:
- React DevTools (install the browser extension)
- Network panel for API calls
- Performance profiling
- Console for logging

Happy debugging! 🎉
