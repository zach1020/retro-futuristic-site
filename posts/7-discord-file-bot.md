---
id: 7
title: "How I Built a Discord Bot That Lets Me Manage My Mac Files From My Phone"
date: "Jan 16, 2026"
---
# How I Built a Discord Bot That Lets Me Manage My Mac Files From My Phone

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
  ListToolsResultSchema,
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

Happy building!
