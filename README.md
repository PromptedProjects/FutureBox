# FutureBoxWindows

Control your Windows PC from your phone. AI chat, remote terminal, file browser, and action approvals — all from a companion app over your local network.

## What It Does

```
┌──────────────────┐         ┌──────────────────────┐
│  FutureBox App   │◄──────►│   FutureBox Server    │
│  (Your Phone)    │  WiFi   │   (Windows PC)        │
│                  │  WS/HTTP│                        │
│  - AI Chat       │         │  - Multi-Model AI      │
│  - Terminal      │         │  - AI Tool Execution   │
│  - File Browser  │         │  - Persistent PTY      │
│  - Actions       │         │  - File System Access  │
│  - Settings      │         │  - TTS / STT           │
│                  │         │  - Permission System   │
└──────────────────┘         └──────────────────────┘
```

**Server** runs on your Windows PC (Node.js). **App** runs on any phone (React Native / Expo).

## Features

- **AI Chat + Tool Calling** — Multi-provider support (Ollama local, Claude, OpenAI, Gemini) with streaming responses, conversation history, and image input. The AI can execute real actions on your PC — open URLs, read clipboard, control volume, take screenshots, launch apps — via native function calling (not just text descriptions)
- **Remote Terminal** — Full interactive terminal on your phone via xterm.js + node-pty. Persistent PTY shells over WebSocket with colors, cursor movement, and TUI support. Run Claude Code, vim, or any CLI tool directly from your phone — no VPS or SSH needed
- **File Browser** — Navigate your PC's file system, preview text files, copy file paths to clipboard
- **Action Permissions** — Three-tier approval system (red/yellow/green) with trust rules for automation
- **Voice I/O** — Speech-to-text (Whisper) and text-to-speech (OpenAI TTS)
- **System Monitoring** — Live CPU, RAM, disk, and network stats
- **Secure Pairing** — QR code or manual token pairing with hashed session tokens
- **WebSocket** — Real-time bidirectional communication for chat streaming, shell output, and notifications

## Quick Start

### Prerequisites

- **Windows PC**: Node.js 23+ installed
- **Phone**: [Expo Go](https://expo.dev/go) app installed
- Both devices on the same WiFi network

### 1. Start the Server

```bash
cd server
cp .env.example .env    # Edit .env to add your API keys
npm install
DISABLE_TLS=true npm run dev
```

The server starts on `http://0.0.0.0:3737`. Note your PC's local IP (e.g. `ipconfig` → look for your WiFi adapter's IPv4).

### 2. Start the App

```bash
cd app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

### 3. Pair

1. On the server, the pairing token is logged on startup, or use the test script:
   ```bash
   # Edit scripts/test-app.sh — set HOST to your PC's IP
   bash scripts/test-app.sh
   ```
2. In the app, tap **Manual** and enter your PC's IP:port and the pairing token
3. Done — you're connected

## Project Structure

```
FutureBoxWindows/
├── server/              # Fastify + TypeScript API server
│   ├── src/
│   │   ├── routes/      # HTTP endpoints (chat, files, config, etc.)
│   │   ├── services/    # Business logic (AI, files, actions, etc.)
│   │   ├── providers/   # AI model providers (Ollama, Claude, OpenAI, Gemini)
│   │   ├── ws/          # WebSocket handlers (chat streaming, shell, notifications)
│   │   ├── storage/     # SQLite database + migrations
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/       # Logger, TLS, helpers
│   └── .env.example     # Configuration template
├── app/                 # React Native + Expo SDK 54
│   └── src/
│       ├── screens/     # Chat, Terminal, Files, Actions, Settings
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── services/    # API client, WebSocket manager, storage
│       ├── stores/      # Zustand state management
│       ├── types/       # TypeScript types
│       └── theme/       # Colors and tokens
├── scripts/             # Test and utility scripts
└── docs/                # Documentation
```

## Configuration

All server config is in `server/.env` (copy from `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3737` | Server port |
| `HOST` | `0.0.0.0` | Bind address |
| `DISABLE_TLS` | (unset) | Set `true` for plain HTTP (recommended for local dev) |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Local Ollama instance |
| `ANTHROPIC_API_KEY` | (empty) | Enables Claude models |
| `OPENAI_API_KEY` | (empty) | Enables GPT-4o + TTS + STT |
| `GOOGLE_AI_API_KEY` | (empty) | Enables Gemini models |

## AI Providers

FutureBox routes each AI capability to the best available provider:

| Capability | Local (Ollama) | Cloud |
|---|---|---|
| Language | Any local model | Claude Sonnet, GPT-4o, Gemini Flash |
| Reasoning | — | Claude Opus |
| Speech-to-Text | — | OpenAI Whisper |
| Text-to-Speech | — | OpenAI TTS |

All-local by default if Ollama is running. Add API keys to enable cloud providers.

## API Endpoints

All endpoints except `/status` and `/pair/*` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/status` | Server health + system stats |
| `POST` | `/pair/create` | Generate pairing token |
| `POST` | `/pair` | Exchange token for session |
| `GET` | `/me` | Verify auth |
| `GET` | `/models` | List available AI models |
| `GET` | `/models/slots` | Current capability assignments |
| `POST` | `/chat` | Send chat message |
| `GET` | `/conversations` | List conversations |
| `GET` | `/conversations/:id/messages` | Get messages |
| `GET` | `/files/list?path=...` | List directory contents |
| `GET` | `/files/read?path=...` | Read text file (max 500KB) |
| `GET` | `/pending` | Pending actions |
| `POST` | `/approve/:id` | Approve action |
| `POST` | `/deny/:id` | Deny action |
| `GET` | `/trust-rules` | List trust rules |
| `POST` | `/trust-rules` | Create trust rule |
| `GET` | `/config` | Get all config |
| `PUT` | `/config` | Set config value |
| `POST` | `/transcribe` | Speech-to-text |
| `POST` | `/tts` | Text-to-speech |

## AI Tool Calling

When you chat with the AI, it doesn't just describe what it would do — it actually does it. The AI calls tools on your PC through OpenAI/Claude native function calling.

**Available tools:**
| Skill | Actions | Tier |
|---|---|---|
| `clipboard` | read, write | Green |
| `browser` | open URL, navigate, screenshot, eval | Green/Yellow |
| `audio` | get/set volume, mute/unmute | Green |
| `screen` | capture screenshot | Green |
| `notifications` | send desktop notification | Green |
| `process` | list, launch, kill | Green/Yellow/Red |
| `power` | lock, sleep, shutdown, restart | Yellow/Red |
| `system` | run shell command | Red |

**Tier-based approval:**
- **Green** — auto-executes immediately (safe, read-only or low-risk)
- **Yellow** — sends approval request to your phone, waits for you to approve/deny
- **Red** — always requires manual approval (destructive or high-risk)

Trust rules can auto-approve specific yellow-tier actions you use frequently.

## Remote Terminal Architecture

The terminal uses a real PTY (pseudo-terminal) on your PC, not one-off shell commands:

```
Phone (xterm.js in WebView)  ←— WebSocket —→  Server (node-pty)  ←→  PowerShell/Bash
```

- **Persistent sessions** — each tab maintains its own shell process that stays alive across commands
- **Full terminal emulation** — ANSI colors, cursor positioning, scrollback, resize events
- **TUI support** — interactive programs like Claude Code, vim, htop work correctly
- **Multi-tab** — open multiple independent shell sessions

## Security Notes

- Session tokens are SHA-256 hashed before storage — raw tokens are never persisted
- Pairing tokens expire after 15 minutes
- File access is restricted to drive roots and user directories
- The action permission system gates dangerous operations with three tiers:
  - **Red** — always requires manual approval (destructive ops)
  - **Yellow** — requires approval unless a trust rule auto-approves
  - **Green** — auto-approved by default
- For local development, use `DISABLE_TLS=true`. For production, the server auto-generates self-signed TLS certs or you can provide your own

## Tech Stack

**Server**: Node.js 23, Fastify 5, TypeScript, SQLite, Zod, Pino, node-pty
**App**: React Native 0.81, Expo SDK 54, Zustand, TypeScript, xterm.js, react-native-webview
**AI**: Ollama, Anthropic Claude, OpenAI, Google Gemini

## License

Apache 2.0
