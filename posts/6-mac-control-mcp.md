---
id: 6
title: "How I Built an MCP Server to Let Claude Control My Mac"
date: "Jan 16, 2026"
---
# How I Built an MCP Server to Let Claude Control My Mac

*Give your AI assistant superpowers on macOS — opening apps, closing windows, and managing your desktop with simple conversation.*

---

I've been using Claude as my daily AI assistant for a while now, and it's great for answering questions, writing code, and brainstorming ideas. But I kept running into a frustrating limitation: Claude couldn't actually *do* anything on my computer.

"Open Slack for me" → Sorry, I can't do that.
"Close all these windows" → I don't have access to your system.

That changed when I discovered the **Model Context Protocol (MCP)** — an open standard that lets you extend Claude's capabilities with custom tools. Within an afternoon, I had Claude opening apps, closing windows, and managing my desktop like a proper assistant.

Here's how I built it, and how you can too.

---

## What is MCP?

MCP (Model Context Protocol) is a way to give Claude access to external tools and data sources. Think of it like building a bridge between Claude's brain and your computer's capabilities.

You create a small server that exposes "tools" — functions that Claude can call when needed. When you ask Claude to open an app, it recognizes the intent, calls your tool, and the magic happens.

The best part? It's surprisingly simple to set up.

---

## What We're Building

By the end of this guide, you'll have an MCP server that lets Claude:

- **Open any application** on your Mac
- **Close apps** individually or all at once
- **Open files** with specific applications
- **Launch URLs** in your preferred browser
- **List running and installed apps**

All through natural conversation. Just ask Claude, and it happens.

---

## Prerequisites

Before we dive in, make sure you have:

- **macOS** (I tested on Ventura and Sonoma)
- **Node.js 18+** — Check with \`node --version\`
- **Claude Desktop** — Download from [claude.ai/download](https://claude.ai/download)

Need Node.js? Install it via Homebrew:

\`\`\`bash
brew install node
\`\`\`

---

## Step 1: Set Up the Project

Let's create our project structure. Open Terminal and run:

\`\`\`bash
# Create and enter the project directory
mkdir ~/mac-control-mcp
cd ~/mac-control-mcp

# Initialize the project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
\`\`\`

The MCP SDK handles all the protocol communication — we just need to define our tools and implement them.

---

## Step 2: Configure TypeScript

Create a \`tsconfig.json\` file in your project root:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

---

## Step 3: Update package.json

Replace your \`package.json\` contents with:

\`\`\`json
{
  "name": "mac-control-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
\`\`\`

---

## Step 4: Write the Server

Now for the fun part. Create the source directory and main file:

\`\`\`bash
mkdir src
touch src/index.ts
\`\`\`

Open \`src/index.ts\` in your editor and add the following code. I've broken it into sections so you can understand what each part does.

### The Foundation

First, we set up imports and initialize the server:

\`\`\`typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new Server(
  { name: "mac-control", version: "1.0.0" },
  { capabilities: { tools: {} } }
);
\`\`\`

### Defining the Tools

Next, we tell Claude what tools are available. This is like creating a menu of capabilities:

\`\`\`typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // --- Close Tools ---
    {
      name: "close_all_apps",
      description: "Closes all open applications except Finder and essential system apps",
      inputSchema: {
        type: "object",
        properties: {
          exclude: {
            type: "array",
            items: { type: "string" },
            description: "App names to keep open (e.g., ['Terminal', 'Claude'])"
          },
          force: {
            type: "boolean",
            description: "Force quit apps (may lose unsaved work)",
            default: false
          }
        }
      }
    },
    {
      name: "close_app",
      description: "Close a specific application by name",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string", description: "Name of the app to close" },
          force: { type: "boolean", default: false }
        },
        required: ["appName"]
      }
    },

    // --- Open Tools ---
    {
      name: "open_app",
      description: "Open/launch a specific application by name",
      inputSchema: {
        type: "object",
        properties: {
          appName: { 
            type: "string", 
            description: "Name of the app to open (e.g., 'Safari', 'Visual Studio Code')" 
          },
          newInstance: {
            type: "boolean",
            description: "Open a new instance even if already running",
            default: false
          },
          hide: {
            type: "boolean",
            description: "Open the app hidden/in background",
            default: false
          }
        },
        required: ["appName"]
      }
    },
    {
      name: "open_apps",
      description: "Open multiple applications at once",
      inputSchema: {
        type: "object",
        properties: {
          appNames: {
            type: "array",
            items: { type: "string" },
            description: "List of app names to open"
          }
        },
        required: ["appNames"]
      }
    },
    {
      name: "open_app_with_file",
      description: "Open a file with a specific application",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string", description: "Name of the app" },
          filePath: { type: "string", description: "Path to the file to open" }
        },
        required: ["appName", "filePath"]
      }
    },
    {
      name: "open_url",
      description: "Open a URL in a specific browser or the default browser",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to open" },
          browser: { 
            type: "string", 
            description: "Browser to use (e.g., 'Safari', 'Google Chrome'). Leave empty for default." 
          }
        },
        required: ["url"]
      }
    },

    // --- List/Info Tools ---
    {
      name: "list_open_apps",
      description: "Lists all currently running applications",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "list_installed_apps",
      description: "Lists all applications installed on this Mac",
      inputSchema: {
        type: "object",
        properties: {
          searchTerm: {
            type: "string",
            description: "Optional: filter apps by name (case-insensitive)"
          }
        }
      }
    },
    {
      name: "is_app_running",
      description: "Check if a specific application is currently running",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string", description: "Name of the app to check" }
        },
        required: ["appName"]
      }
    }
  ]
}));
\`\`\`

### Implementing the Tools

Now we write the actual logic. This is where AppleScript and shell commands do the heavy lifting:

\`\`\`typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    // -------------------------------------------------------------------------
    // LIST / INFO TOOLS
    // -------------------------------------------------------------------------
    
    case "list_open_apps": {
      const script = \`
        tell application "System Events"
          set appList to name of every process whose background only is false
        end tell
        return appList
      \`;
      const { stdout } = await execAsync(\`osascript -e '\${script}'\`);
      const apps = stdout.trim().split(", ");
      return { content: [{ type: "text", text: JSON.stringify(apps, null, 2) }] };
    }

    case "list_installed_apps": {
      const { searchTerm } = args as { searchTerm?: string };
      
      const { stdout } = await execAsync(\`
        find /Applications ~/Applications -maxdepth 2 -name "*.app" 2>/dev/null | 
        sed 's|.*/||' | 
        sed 's|.app$||' | 
        sort -u
      \`);
      
      let apps = stdout.trim().split("\\n").filter(Boolean);
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        apps = apps.filter(app => app.toLowerCase().includes(term));
      }
      
      return { content: [{ type: "text", text: JSON.stringify(apps, null, 2) }] };
    }

    case "is_app_running": {
      const { appName } = args as { appName: string };
      const script = \`
        tell application "System Events"
          set isRunning to (name of processes) contains "\${appName}"
        end tell
        return isRunning
      \`;
      const { stdout } = await execAsync(\`osascript -e '\${script}'\`);
      const isRunning = stdout.trim() === "true";
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ appName, isRunning }, null, 2) 
        }] 
      };
    }

    // -------------------------------------------------------------------------
    // OPEN TOOLS
    // -------------------------------------------------------------------------
    
    case "open_app": {
      const { appName, newInstance = false, hide = false } = args as { 
        appName: string; 
        newInstance?: boolean;
        hide?: boolean;
      };
      
      try {
        let command = \`open -a "\${appName}"\`;
        if (newInstance) command += " -n";
        if (hide) command += " -g";
        
        await execAsync(command);
        
        if (!hide) {
          const activateScript = \`tell application "\${appName}" to activate\`;
          await execAsync(\`osascript -e '\${activateScript}'\`);
        }
        
        return { 
          content: [{ 
            type: "text", 
            text: \`Opened \${appName}\${hide ? " (in background)" : ""}\` 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: \`Failed to open \${appName}: \${error}. Use list_installed_apps to see available apps.\` 
          }] 
        };
      }
    }

    case "open_apps": {
      const { appNames } = args as { appNames: string[] };
      const results: { opened: string[]; failed: string[] } = { opened: [], failed: [] };
      
      for (const appName of appNames) {
        try {
          await execAsync(\`open -a "\${appName}"\`);
          results.opened.push(appName);
        } catch {
          results.failed.push(appName);
        }
      }
      
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    case "open_app_with_file": {
      const { appName, filePath } = args as { appName: string; filePath: string };
      
      try {
        await execAsync(\`open -a "\${appName}" "\${filePath}"\`);
        return { 
          content: [{ 
            type: "text", 
            text: \`Opened "\${filePath}" with \${appName}\` 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: \`Failed to open file: \${error}\` 
          }] 
        };
      }
    }

    case "open_url": {
      const { url, browser } = args as { url: string; browser?: string };
      
      try {
        const command = browser 
          ? \`open -a "\${browser}" "\${url}"\`
          : \`open "\${url}"\`;
        
        await execAsync(command);
        return { 
          content: [{ 
            type: "text", 
            text: \`Opened \${url}\${browser ? \` in \${browser}\` : " in default browser"}\` 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: \`Failed to open URL: \${error}\` 
          }] 
        };
      }
    }

    // -------------------------------------------------------------------------
    // CLOSE TOOLS
    // -------------------------------------------------------------------------
    
    case "close_app": {
      const { appName, force = false } = args as { appName: string; force?: boolean };
      const action = force ? "quit" : "quit saving yes";
      const script = \`
        tell application "\${appName}"
          \${action}
        end tell
      \`;
      try {
        await execAsync(\`osascript -e '\${script}'\`);
        return { content: [{ type: "text", text: \`Closed \${appName}\` }] };
      } catch (error) {
        return { content: [{ type: "text", text: \`Failed to close \${appName}: \${error}\` }] };
      }
    }

    case "close_all_apps": {
      const { exclude = [], force = false } = args as { exclude?: string[]; force?: boolean };
      
      const protected_apps = ["Finder", "System Preferences", "System Settings", ...exclude];
      
      const script = \`
        tell application "System Events"
          set appList to name of every process whose background only is false
        end tell
        return appList
      \`;
      
      const { stdout } = await execAsync(\`osascript -e '\${script}'\`);
      const apps = stdout.trim().split(", ");
      
      const closed: string[] = [];
      const skipped: string[] = [];
      const failed: string[] = [];

      for (const app of apps) {
        if (protected_apps.some(p => app.toLowerCase().includes(p.toLowerCase()))) {
          skipped.push(app);
          continue;
        }
        
        try {
          const action = force ? "quit" : "quit saving yes";
          const quitScript = \`tell application "\${app}" to \${action}\`;
          await execAsync(\`osascript -e '\${quitScript}'\`);
          closed.push(app);
        } catch {
          failed.push(app);
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ closed, skipped, failed }, null, 2)
        }]
      };
    }

    default:
      throw new Error(\`Unknown tool: \${name}\`);
  }
});
\`\`\`

### Starting the Server

Finally, we connect the server to stdio transport (how Claude Desktop communicates with MCP servers):

\`\`\`typescript
const transport = new StdioServerTransport();
server.connect(transport);
console.error("Mac Control MCP server running");
\`\`\`

---

## Step 5: Build It

Compile the TypeScript:

\`\`\`bash
npm run build
\`\`\`

You should see a \`dist\` folder appear with the compiled JavaScript.

---

## Step 6: Connect to Claude Desktop

Now we need to tell Claude Desktop about our server. Create or edit the config file:

\`\`\`bash
mkdir -p ~/Library/Application\\ Support/Claude
\`\`\`

Open \`~/Library/Application Support/Claude/claude_desktop_config.json\` and add:

\`\`\`json
{
  "mcpServers": {
    "mac-control": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/mac-control-mcp/dist/index.js"]
    }
  }
}
\`\`\`

**Important:** Replace \`YOUR_USERNAME\` with your actual username. Find it by running \`whoami\` in Terminal.

---

## Step 7: Grant Permissions

macOS takes security seriously. The first time Claude tries to control an app, you'll see permission prompts.

Go to **System Settings → Privacy & Security → Automation** and allow access when prompted. You may also need to grant **Accessibility** permissions.

---

## Step 8: Restart and Test

Quit Claude Desktop completely (Cmd+Q) and reopen it.

Now try some commands:

> "What apps do I have running?"

> "Open Safari and Slack"

> "Close everything except Terminal and Claude"

> "Open my Downloads folder in Finder"

> "Launch github.com in Chrome"

It just works. ✨

---

## How It All Fits Together

Here's what happens when you ask Claude to open an app:

1. You type "Open Spotify" in Claude Desktop
2. Claude recognizes this matches the \`open_app\` tool
3. Claude calls your MCP server with \`{ appName: "Spotify" }\`
4. Your server runs \`open -a "Spotify"\`
5. Spotify launches
6. Claude confirms the action

The entire round-trip takes about a second.

---

## Troubleshooting

### Server Not Connecting?

Check Claude's MCP logs:

\`\`\`bash
tail -f ~/Library/Logs/Claude/mcp*.log
\`\`\`

### "Command not found" Errors?

Use the full path to Node in your config:

\`\`\`json
{
  "mcpServers": {
    "mac-control": {
      "command": "/usr/local/bin/node",
      "args": ["/Users/YOUR_USERNAME/mac-control-mcp/dist/index.js"]
    }
  }
}
\`\`\`

Find your node path with \`which node\`.

### Permission Errors?

Double-check System Settings → Privacy & Security for both Automation and Accessibility permissions.

---

## What's Next?

This is just the beginning. You could extend the server with:

- **Window management** — Move, resize, minimize, arrange windows
- **Volume control** — "Set volume to 50%"
- **System info** — "How much battery do I have?"
- **File operations** — "Move my downloads to the Desktop"
- **Clipboard access** — "Copy this to my clipboard"
- **Notifications** — "Remind me in 10 minutes"

The MCP protocol is powerful, and macOS provides rich scripting capabilities through AppleScript and shell commands. The combination opens up endless possibilities.

---

## Final Thoughts

Building this MCP server took me about an hour, and it's transformed how I use Claude. Instead of just being a chat interface, Claude now feels like a genuine assistant that can take action on my behalf.

The Model Context Protocol is still young, but it represents something important: a standardized way to extend AI capabilities safely and predictably. I'm excited to see what the community builds with it.

If you build something cool with MCP, I'd love to hear about it. And if you get stuck, the [MCP documentation](https://modelcontextprotocol.io) is a great resource.

Happy hacking! 🚀

---

## Quick Reference

| Tool | What It Does |
|------|--------------|
| \`list_open_apps\` | Show running apps |
| \`list_installed_apps\` | Show all installed apps |
| \`is_app_running\` | Check if an app is running |
| \`open_app\` | Launch an application |
| \`open_apps\` | Launch multiple apps |
| \`open_app_with_file\` | Open a file with a specific app |
| \`open_url\` | Open a URL in a browser |
| \`close_app\` | Quit an application |
| \`close_all_apps\` | Quit all apps (with exclusions) |

---

*Have questions or feedback? Drop a comment below or reach out on Twitter.*
