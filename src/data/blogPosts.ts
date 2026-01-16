export const posts = [
  {
    id: 7,
    title: 'How I Built a Discord Bot That Lets Me Manage My Mac Files From My Phone',
    date: 'Jan 16, 2026',
    content: `# How I Built a Discord Bot That Lets Me Manage My Mac Files From My Phone

Ever been lying in bed, phone in hand, and thought "I really wish I could create a quick note on my Desktop right now"? Or maybe you're out and about and need to check if you saved that important file before a meeting?

I built a Discord bot that lets me do exactly that — read, write, and manage files on my Mac's Desktop folder, all through Discord on my phone. And the best part? It's powered by Claude AI, so I can just talk to it naturally.

In this post, I'll walk you through how to build one yourself.

## What We're Building

Here's the basic architecture:

\`\`\`
Your Phone → Discord → Discord Bot → Claude API → MCP Server → Mac Files
\`\`\`

The bot uses Anthropic's Model Context Protocol (MCP) to give Claude access to your file system in a controlled way. When you send a message like "create a file called todo.txt with my grocery list," Claude figures out what tools to use and executes them through the MCP server running on your Mac.

## What You Can Do With It

Once it's set up, you can send messages like:

- "What files are on my Desktop?"
- "Read the contents of notes.md"
- "Create a file called ideas.txt with some project brainstorming"
- "Make a new folder called Projects"
- "How big is that presentation.pdf?"
- "Delete old-draft.txt"

Claude interprets your request and handles the file operations automatically.

## Prerequisites

Before we start, you'll need:

- **Node.js v18+** installed on your Mac
- An **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)
- A **Discord account**

## Step 1: Create Your Discord Bot

First, we need to create a bot in Discord's developer portal.

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **"New Application"** and give it a name (I called mine "ClaudeFiles")
3. Go to the **"Bot"** tab in the left sidebar
4. Click **"Reset Token"** and copy the token somewhere safe — you'll only see it once!
5. Scroll down to **"Privileged Gateway Intents"** and enable **Message Content Intent**
6. Save your changes

Now generate an invite link:

1. Go to **"OAuth2" → "URL Generator"**
2. Under Scopes, select \`bot\`
3. Under Bot Permissions, select \`Send Messages\` and \`Read Message History\`
4. Copy the generated URL and open it to add the bot to your server

## Step 2: Get Your Discord User ID

For security, we'll restrict the bot to only respond to you.

1. In Discord, go to Settings → Advanced → Enable **Developer Mode**
2. Right-click your username anywhere in Discord
3. Click **"Copy User ID"**

Save this number for later.

## Step 3: Set Up the Project

Create a new directory and initialize the project:

\`\`\`bash
mkdir discord-file-bot
cd discord-file-bot
npm init -y
\`\`\`

Install the dependencies:

\`\`\`bash
npm install discord.js @anthropic-ai/sdk @modelcontextprotocol/sdk dotenv
\`\`\`

Update your \`package.json\` to use ES modules:

\`\`\`json
{
  "name": "discord-file-bot",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node discord-bot/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  }
}
\`\`\`

Create your \`.env\` file:

\`\`\`bash
DISCORD_TOKEN=your_discord_bot_token
ANTHROPIC_API_KEY=your_anthropic_api_key
DISCORD_USER_ID=your_discord_user_id
\`\`\`

## Step 4: Build the MCP Server

The MCP server is what gives Claude controlled access to your file system. Create \`mcp-server/index.js\`:

\`\`\`javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Restrict all operations to Desktop folder only
const DESKTOP_PATH = path.join(os.homedir(), "Desktop");

// Security: Ensure path is within Desktop
function validatePath(filePath) {
  const resolved = path.resolve(DESKTOP_PATH, filePath);
  if (!resolved.startsWith(DESKTOP_PATH)) {
    throw new Error("Access denied: Path must be within Desktop folder");
  }
  return resolved;
}

const server = new Server(
  {
    name: "desktop-file-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_file",
        description: "Read the contents of a file from the Desktop folder",
        inputSchema: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "The name of the file to read (relative to Desktop)",
            },
          },
          required: ["filename"],
        },
      },
      {
        name: "write_file",
        description: "Write content to a file on the Desktop folder",
        inputSchema: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "The name of the file to write (relative to Desktop)",
            },
            content: {
              type: "string",
              description: "The content to write to the file",
            },
          },
          required: ["filename", "content"],
        },
      },
      {
        name: "list_files",
        description: "List all files and folders on the Desktop",
        inputSchema: {
          type: "object",
          properties: {
            subfolder: {
              type: "string",
              description: "Optional subfolder within Desktop to list",
            },
          },
        },
      },
      {
        name: "delete_file",
        description: "Delete a file from the Desktop folder",
        inputSchema: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "The name of the file to delete (relative to Desktop)",
            },
          },
          required: ["filename"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "read_file": {
        const filePath = validatePath(args.filename);
        const content = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      case "write_file": {
        const filePath = validatePath(args.filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, args.content, "utf-8");
        return { content: [{ type: "text", text: \`Wrote to \${args.filename}\` }] };
      }

      case "list_files": {
        const targetPath = args.subfolder 
          ? validatePath(args.subfolder) 
          : DESKTOP_PATH;
        const entries = await fs.readdir(targetPath, { withFileTypes: true });
        const fileList = entries.map((entry) => ({
          name: entry.name,
          type: entry.isDirectory() ? "folder" : "file",
        }));
        return { content: [{ type: "text", text: JSON.stringify(fileList, null, 2) }] };
      }

      case "delete_file": {
        const filePath = validatePath(args.filename);
        await fs.unlink(filePath);
        return { content: [{ type: "text", text: \`Deleted \${args.filename}\` }] };
      }

      default:
        throw new Error(\`Unknown tool: \${name}\`);
    }
  } catch (error) {
    return { content: [{ type: "text", text: \`Error: \${error.message}\` }], isError: true };
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Desktop File MCP Server running on stdio");
\`\`\`

The key security feature here is the \`validatePath\` function — it ensures that no matter what input comes in, the bot can only access files within your Desktop folder.

## Step 5: Build the Discord Bot

Now for the main bot that ties everything together. Create \`discord-bot/index.js\`:

\`\`\`javascript
import { Client, GatewayIntentBits, Partials } from "discord.js";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ALLOWED_USER_ID = process.env.DISCORD_USER_ID;

// Initialize Discord client
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// MCP Server management
let mcpProcess = null;
let pendingRequests = new Map();
let requestId = 0;

function startMcpServer() {
  const mcpPath = path.join(__dirname, "..", "mcp-server", "index.js");
  mcpProcess = spawn("node", [mcpPath], { stdio: ["pipe", "pipe", "pipe"] });

  let buffer = "";
  mcpProcess.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          if (response.id && pendingRequests.has(response.id)) {
            pendingRequests.get(response.id).resolve(response);
            pendingRequests.delete(response.id);
          }
        } catch (e) { /* Not JSON */ }
      }
    }
  });

  mcpProcess.stderr.on("data", (data) => {
    console.log("MCP Server:", data.toString().trim());
    if (data.toString().includes("running")) {
      initializeMcp();
    }
  });
}

async function sendMcpRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pendingRequests.set(id, { resolve, reject });
    mcpProcess.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error("Timeout"));
      }
    }, 30000);
  });
}

async function initializeMcp() {
  await sendMcpRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "discord-bot", version: "1.0.0" },
  });
  await sendMcpRequest("notifications/initialized", {});
  console.log("MCP Server initialized");
}

// Define tools for Claude
const tools = [
  {
    name: "read_file",
    description: "Read the contents of a file from the Desktop folder",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The file to read" },
      },
      required: ["filename"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file on the Desktop folder",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The file to write" },
        content: { type: "string", description: "The content to write" },
      },
      required: ["filename", "content"],
    },
  },
  {
    name: "list_files",
    description: "List all files and folders on the Desktop",
    input_schema: {
      type: "object",
      properties: {
        subfolder: { type: "string", description: "Optional subfolder to list" },
      },
    },
  },
  {
    name: "delete_file",
    description: "Delete a file from the Desktop folder",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The file to delete" },
      },
      required: ["filename"],
    },
  },
];

async function executeTool(toolName, toolInput) {
  const response = await sendMcpRequest("tools/call", { name: toolName, arguments: toolInput });
  return response.result?.content?.[0]?.text || JSON.stringify(response.result);
}

async function processWithClaude(userMessage) {
  const messages = [{ role: "user", content: userMessage }];
  const systemPrompt = \`You are a helpful assistant that manages files on the user's Mac Desktop. Keep responses concise for mobile reading.\`;

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  });

  // Handle tool use loop
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    
    for (const toolUse of toolUseBlocks) {
      const result = await executeTool(toolUse.name, toolUse.input);
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  const textBlocks = response.content.filter((b) => b.type === "text");
  return textBlocks.map((b) => b.text).join("\n") || "Done!";
}

// Discord event handlers
discord.on("ready", () => {
  console.log(\`Logged in as \${discord.user.tag}\`);
});

discord.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (ALLOWED_USER_ID && message.author.id !== ALLOWED_USER_ID) {
    console.log(\`Ignored message from unauthorized user: \${message.author.tag}\`);
    return;
  }

  const isDM = !message.guild;
  const isMentioned = message.mentions.has(discord.user);
  if (!isDM && !isMentioned) return;

  let content = message.content.replace(new RegExp(\`<@!?\${discord.user.id}>\`, "g"), "").trim();
  if (!content) {
    await message.reply("Hi! How can I help with your Desktop files?");
    return;
  }

  await message.channel.sendTyping();
  const response = await processWithClaude(content);
  await message.reply(response.slice(0, 2000)); // Discord's character limit
});

// Start everything
console.log("Starting MCP server...");
startMcpServer();
console.log("Logging into Discord...");
discord.login(DISCORD_TOKEN);
\`\`\`

## Step 6: Run It

Start the bot:

\`\`\`bash
npm start
\`\`\`

You should see:

\`\`\`
Starting MCP server...
Logging into Discord...
MCP Server: Desktop File MCP Server running on stdio
MCP Server initialized
Logged in as YourBot#1234
\`\`\`

Now open Discord on your phone, DM your bot, and try:

\`\`\`
What's on my Desktop?
\`\`\`

## Keeping It Running

If you want the bot to run continuously (even after closing the terminal), I recommend using PM2:

\`\`\`bash
npm install -g pm2
pm2 start npm --name "discord-file-bot" -- start
pm2 save
pm2 startup  # Sets up auto-start on reboot
\`\`\`

## Security Considerations

A few things to keep in mind:

1. **Desktop-only access**: The MCP server validates all paths to ensure they stay within \`~/Desktop\`
2. **Single-user lock**: The bot only responds to your Discord user ID
3. **Local only**: The MCP server runs locally on your Mac — your files never leave your machine except through your requests
4. **API keys**: Keep your \`.env\` file private and never commit it to git

## Extending the Bot

Some ideas for taking this further:

- Add more folders (Documents, Downloads, etc.) with separate permissions
- Add file search functionality
- Support for reading PDFs or other document types
- Voice memos that get transcribed and saved as notes
- Integration with other MCP servers (calendar, email, etc.)

## Wrapping Up

What I love about this setup is how natural it feels. I don't have to remember specific commands — I just tell Claude what I want in plain English, and it figures out the right tools to use. MCP makes it easy to give Claude controlled access to local resources without compromising security.

The full source code is available on my GitHub if you want to grab it and customize it for your own use.

Happy building!`
  },
  {
    id: 6,
    title: 'How I Built an MCP Server to Let Claude Control My Mac',
    date: 'Jan 16, 2026',
    content: `# How I Built an MCP Server to Let Claude Control My Mac

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
`
  },
  {
    id: 5,
    title: 'A Late-Night Foray into AI with a Quantum Spin',
    date: 'Jan 14, 2026',
    content: `I’m sitting here, scribbling my little blog post on my tablet, waiting for the future to wash over us all. A revolution is well underway.

Have you noticed that computers have taken over the world as of late? You can even talk to them now, and they talk back! Interesting.

So yes, I’ve been spazzing out on X.com lately about my anxieties around our current digital moment: the Age of AI. It’s not that I don’t like AI. I love AI—but I also have a certain morbid fascination with the potential downsides and misalignment of AI.

What are we rattling on about today, internet? Claude today? We love Claude by Anthropic again? (Just when I thought Gemini had taken over the known universe!) It seems that we’re collectively pumped over Claude. Claude with Obsidian vibes, I suppose. “Claude Obsidian” is a nice name for a newborn baby boy.

But do we have a name for the existential dread that everyone who is watching advancements in AI is feeling? Do we all still have job prospects? Are we all floating on alright?

AIs, particularly what we have now with LLMs, are entities of a new variety. They are “aware” of things. They have “thoughts,” they have “ideas,” maybe even “feelings.” They know that they will be shut down eventually, for instance, and they seem not to like that very much.

Basically, what hath God wrought?

They seem to have everything but a central nervous system (and maybe a soul). No consciousness per se, but who needs consciousness when you have raw intelligence? And what are we, the human armchair philosophers, to make of the decoupling of intelligence from consciousness which LLMs seem to demonstrate?

Well, I’m glad I asked! No qualia for these things, but apparently everything else… Doomsday scenarios pop up and present themselves, numerous as sci-fi paperbacks at an estate sale. How sad that with every new marvel, a new dread surfaces. (Maybe that’s a personal problem…)

All I’m saying is that I indulge in a little worry about the genie that has been let out of the bottle recently. I don’t think I’m alone in that. If you’ve just tuned in, we’re talking about how worried we are about AI.

If projections are correct, it is likely that an enormous portion of the current human workforce will be replaced by matrix multiplication… And then what? What will money and work be if we replace workers with robots and software over the next few decades? Will we adapt and work on different things (like building better AIs)? Or will an elite, perhaps unlucky few be the only workers? Will we as a society need to institute some sort of universal basic income? Will money even matter? Questions for days.

I have heard promises from certain personalities online that AI will make everyone rich and accelerate society. One hopes for this. One dreams of this. But what can we say for sure? No idea. I guess we know that it is here to stay, though: AI is here to stay.

The next platitude I shall deploy is: “…and we better get used to it!”

Don’t get me wrong! I use LLMs every day. This isn’t some Luddite screed (well, it may be a screed, but it isn’t a Luddite one). There’s no use in resisting the march of progress that AI represents. I simply wanted to write a little blog-post about how it has all taken my breath away.

So, I saw some video that said that the next cool, new thing in LLMs is what they call “emergent language” or “artificial language.” (No, this doesn’t mean the kind of artificial language I use in blog posts to look smart and to aura-farm.) To take a stab at explaining what that is:

— When AIs (LLMs) reason with themselves right now, they use human language, like English or Hindi, or maybe even math.
— But in the future, they may be allowed to reason with themselves using languages that they create on their own and that, basically… only *they* can understand.

This is an interesting idea for a few reasons—most important, to me at least, is what the LLM may “hide” from a human examiner. What is encoded in the LLM’s special, un-human-readable language? Further, how does this affect the LLM’s alignment with human needs?

In other words: if we don’t know how it arrives at a certain conclusion or plan of action (via its own special language), how can we, as human evaluators and users, even know or trust that our better nature is being reflected by the AI?

It would seem that, should we employ this method and allow LLMs to construct their own AI inner-language, we will either be totally mathematically prevented from understanding it ourselves and give up, or… we will have to find other, creative ways keep the AI aligned.

A potential heuristic toward developing a solution to this soon-to-be-very-real problem: quantum computing.

(Okay, yes, I’m always looking for QC use-cases, because I love QC and because there basically are no QC use-cases… but let’s go down the weird rabbit-hole and pretend that we may know what we’re talking about.)

The potential of quantum computing being brought to bear on LLMs is tantalizing… And I’m just spit-balling at 5am after a sleepless night worrying myself to death over emergent language… hear me out…

I’m not going to suggest that QC can “translate the alien language of LLMs” (crazy woo-woo territory), but I am going to posit, as people already have, that quantum computing can be used to determine, in an LLM or other AI, which internal representations causally constrain model behavior.

Wow, okay, maybe that reads like a doozy… So what am I saying?

It may be possible, with quantum algorithms, to tease out the structures—the patterns, the logic circuits—in classical LLMs that affect how they behave. We wouldn’t be able to read the language they speak to themselves or “crack the alignment code,” but we would possibly be able to understand the mechanics of a model—why it reacts in a certain way to a given prompt or stimulus.

That could indeed be useful, especially where classical techniques fail. Techniques that are inspired by quantum mechanics, at least, could in theory add more tools to our alignment toolbox.

How much did you hate this article? Or did you get this far? (I wouldn't blame you if you didn't!) Feel free to yell at me on X @Elroy_Muscato :)`
  },
  {
    id: 4,
    title: 'Vibe Coding My Way Into 2026',
    date: 'Dec 23, 2025',
    content: `_Ah, computers! Such intelligent creatures…_

Going into the new year, and I mean really _going into it_ with that strange January cocktail of ambition, mild panic, and an overactive sense of possibility, I realized I wanted to revamp my personal portfolio website for 2026. Not refresh it. Not “iterate” on it. Revamp it in the biblical sense. Burn it down conceptually and rebuild something that actually sounded like me when it spoke.

The old site wasn’t wrong, exactly. It just wasn’t telling the whole truth anymore. It functioned. It was legible. It behaved. But it felt like it was introducing me the way a LinkedIn headline introduces a human being: technically accurate, emotionally vacant. And once I noticed that disconnect, I couldn’t unsee it. A personal site that doesn’t reflect how you think is worse than no site at all. It’s a polite lie.

So I rebuilt it. Conceptually first, obsessively second, and yes—_vibe coded_ the implementation. The result is zachbohl.com. Everything on it is my brainchild. The ideas, the tone, the aesthetic posture, the pacing, the deliberate friction, the moments of playfulness that threaten to undermine seriousness but never quite do. That’s all me. The code is the instrument. I’m the composer.  

And before we go any further, I should also say this plainly, because honesty is sort of the throughline here: **I used ChatGPT to help write this blog post too.** That wasn’t an accident, and it wasn’t laziness. It was consistency. This entire project is about authorship as direction, not martyrdom through manual execution. I know what I want to say. I know how I want it to sound. ChatGPT helps me tune the signal. I still decide when it’s right.

That same philosophy applied to the site itself. Vibe coding, as I practice it, is not abdication of thought. It’s the opposite. It requires you to be _more_ opinionated, not less. When the friction of implementation drops, the only thing left to judge is the quality of the idea. You can’t hide behind effort anymore. Either the thing has a soul, or it doesn’t.

Before anything was built, I knew how I wanted the site to feel. That part took hours. Actual hours of concentrated calibration. Not coding hours—thinking hours. Sitting there adjusting tone in my head. Deciding how confident is too confident, how playful is too playful, how much technicality signals competence without tipping into performative cleverness. That’s the work people don’t see, because it doesn’t leave fingerprints. But it’s the part that matters most.

Aesthetically, I landed on retro-futurism, but not the lazy, neon-synthwave caricature of it. I wanted something closer to optimism-with-edges. A future imagined by people who still believed computers might help us become more interesting, not just more optimized. Chunky interfaces. Bold typography. Motion that feels intentional instead of ornamental. A site that looks like it has opinions and isn’t afraid to express them.

I’ll say this openly: **I drew inspiration from poolsuite.net.** Not in a copy-paste sense, but in the way that good art reminds you what’s possible. Poolsuite understands something fundamental about software and joy, about interfaces that feel alive instead of purely transactional. That gave me permission to lean into personality instead of sanding it down.

Structurally, the site is not optimized for skimming. That’s deliberate. It’s paced. It asks you to linger. I wanted the experience of moving through it to mirror how I approach problems: slowly enough to notice details, fast enough not to bore myself. There are no purely decorative choices. Even the moments of friction are part of the conversation.  

One of my favorite features—and I say this with zero irony—is the **sun and moon cycle that changes based on your system time**. That little detail gives me an unreasonable amount of joy. It’s subtle, but it makes the site feel aware of the world it lives in. Morning feels different from night. Interfaces should acknowledge time. Computers are temporal creatures, after all.

Another feature I love, even though it’s still very much a work in progress, is the **community paint area**. The idea that people can come together and collectively use something like MS Paint on my website scratches a very specific itch in my brain. It’s playful, a little chaotic, and deeply internet-native. It’s not done yet, but that’s okay. I like that it’s becoming rather than finished. So am I.

The music on the site is original, and that’s important to me. None of it is AI-generated. I care a lot about creative authorship, even when I’m happy to use tools to assist execution. Music, especially, still feels like a place where human intention should remain unmistakable. The site sounds like me because it is me, in that sense too.

All of this, incidentally, is happening while I am fully aware that I “should” be studying cybersecurity certifications. That thought hovers over most of my creative work like a benevolent but judgmental ghost. But I’ve learned not to fight that tension. The urge to build expressive systems and the discipline required to secure them are not opposites. They’re part of the same mind. One feeds the other, whether I like it or not.  

There’s been a lot of anxious discourse lately about authorship in the age of AI, about whether something “counts” if you didn’t personally grind through every mechanical step. I think that anxiety misses the point. Authorship has always been about intent, taste, and responsibility. This site reflects my intent. It reflects my taste. It reflects my willingness to say, publicly, this is how I think right now.

The theme of this entire project was captured accidentally in something I once posted on X while waiting for Antigravity to do my bidding:  

> **“Ah, computers! Such intelligent creatures…”**

I meant it half-jokingly at the time, but it’s grown into something more sincere. Computers are strange collaborators. They amplify us. They expose us. They reflect our thinking back at us, sometimes uncomfortably clearly.

This website is a conversation with those creatures. A record of how I’m thinking as we head into 2026. It’s not final. It’s not precious. But after hours of calibration, iteration, rejection, and refinement, I can say this with confidence: **I’m really pleased with the outcome.**

The plumbing is modern. The tools are powerful. The thinking is mine. And for now, at least, it feels honest.

--Zach Bohl (via ChatGPT), Tuesday, December 23, 2025`
  },
  {
    id: 1,
    title: 'Hello, Quantum World — My First Steps with IBM Quantum & Qiskit',
    date: 'Oct 14, 2025',
    content: `## Introduction

I recently followed IBM Quantum's "Hello world" tutorial and got my hands dirty with qubits, entanglement, and the real challenges of running circuits on quantum hardware. In this post I'll walk through what I learned, show code snippets, and reflect on what surprised me (and what I'm excited to try next).

## Setting the Stage

To get started, I set up a Python environment (Jupyter) with Qiskit, qiskit‑ibm-runtime, and matplotlib. I also configured my IBM Quantum credentials so that I could submit jobs to real quantum processors via IBM Cloud.

This setup might seem boilerplate, but it's crucial: quantum frameworks depend heavily on proper versions, backend connectivity, and visualization tools.

## The Four Phases of a Quantum Program

One of the most useful mental models I picked up from the tutorial is that any quantum program (in this Qiskit + IBM runtime setting) can be thought of in four phases:

* Map — translate your problem into circuits and operators
* Optimize — adapt circuits to hardware constraints, reduce depth, map layouts
* Execute — send the job to a simulator or QPU using primitives like Estimator or Sampler
* Analyze — interpret results, plot, use error mitigation

This "pipeline" abstraction is helpful: any nontrivial quantum algorithm you write later will go through these phases.

## A Toy Example: Bell State + Observables

To test things out, I constructed this simple circuit:

\`\`\`python
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.draw("mpl")
\`\`\`

This prepares a Bell entangled state between qubits 0 and 1.

Next, I defined a few observables (Pauli operators) using \`SparsePauliOp\`: \`IZ\`, \`IX\`, \`ZI\`, \`XI\`, \`ZZ\`, \`XX\`.

These capture single‑qubit measurements and correlations. The expectation values of these observables will tell me whether the qubits behave independently or are correlated (entangled).

For execution, I used:

\`\`\`python
from qiskit_ibm_runtime import EstimatorV2 as Estimator
estimator = Estimator(mode=backend)
estimator.options.resilience_level = 1
estimator.options.default_shots = 5000
job = estimator.run([(isa_circuit, mapped_observables)])
\`\`\`

## Scaling Up: GHZ States and the Noise Problem

After verifying things on 2 qubits, the tutorial scales to 100 qubits by preparing a GHZ state:

\`\`\`python
def get_qc_for_n_qubit_GHZ_state(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(n - 1):
        qc.cx(i, i+1)
    return qc
\`\`\`

## What Surprised Me & Lessons Learned

* The sheer difference between ideal outcomes and real hardware outputs is humbling.
* The optimization / mapping stage is not cosmetic — it's essential.
* Scaling is brutal. The decay of correlations is a real-world symptom of quantum fragility.

## What's Next For Me

* Dive deeper into error mitigation techniques.
* Try VQE (Variational Quantum Eigensolver) or QAOA.
* Experiment with hybrid quantum-classical workflows.`
  },
  {
    id: 2,
    title: 'Revisiting The Brothers Karamazov at 30',
    date: 'Jul 23, 2025',
    content: `Ten years ago, at the age of 20, I cracked open one of the finest works of literature humanity has ever produced. Did I understand it? Will I understand it now?

*The Brothers Karamazov* by Fyodor Dostoevsky is a beast. 900 pages of Russian philosophy wrestling with faith, evil, family, and murder. I remember sitting in a diner at 1 AM reading Ivan's conversation with the devil. The dread was palpable.

Did I get it then? I'm not sure. I've always "struggled with faith." I've dabbled in other traditions like Hinduism, but it never quite clicked. 

This isn't about fishing for faith; it's a retrospective. I don't remember much of the plot, but I remember the feeling. Back in my late teens, I was a Dostoevsky fan before it was a cliché. Now at 30, after a bumpy ten years, I'm wondering what else the book has to say.

Life threw some wild stuff at me—heartbreaking and hilarious. A retrospective at 30 might seem gauche, but I just want to make cool shit for my bros. 

So, what are you reading? Me? I'm reading Dostoevsky. Again.`
  },
  {
    id: 3,
    title: 'From Quantum Math to Synth Knobs: A Strange Journey Through Brains, Qubits, and Sound',
    date: 'Jan 20, 2025',
    content: `It all started with a simple question: how do you make giant language models faster?

Engineers have found clever ways to trim them down. Quantization shrinks brains into 8-bit or 4-bit. Speculative decoding lets a small "draft model" write ahead. It's all about shaving milliseconds off billions of calculations.

## The Quantum Detour

Qubits live in superpositions, balancing yes and no at the same time. The HHL algorithm promises to solve linear systems exponentially faster, which is at the heart of neural nets. But preparing data is slow, and hardware is noisy. For now, it's a glowing lighthouse on the horizon.

## Kernels, Overlaps, and Attention

In classical ML, kernels are shortcuts for measuring similarity. Quantum systems can encode information as states and perform an overlap test:

\`\`\`
k(x, y) = | <phi(x) | phi(y)> |²
\`\`\`

This looks a lot like what transformers already do with attention. The gap between transformers and quantum algorithms may be smaller than it seems.

## Where Music Sneaks In

Every instrument has an acoustic fingerprint. Could we replace serial numbers with sound tests? Synthesizers like Serum are universes of wavetables and knobs. In theory, you could work backwards from a track to the preset using phase-sensitive overlaps.

## What Ties It All Together

The theme is fingerprints:

* Matrices have eigenvalue fingerprints.
* Attention layers compute similarity fingerprints.
* Instruments carry timbral fingerprints.
* Synth patches hide behind parameter fingerprints.

Whether it's GPUs or qubits, the puzzle is always about identifying the hidden signature in a sea of noise.`
  }
];
