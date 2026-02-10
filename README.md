# FutureBox

**Your AI lives in a box. You talk to it from your phone.**

FutureBox turns any old laptop or Android phone into a private, local AI server. The companion app **FutureBuddy** lets you chat, run a terminal, view the desktop, and manage everything from your phone.

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   FutureBuddy   │◄──────►│      FutureBox        │
│   (Phone App)   │  WiFi   │   (Old Laptop/Phone)  │
│                 │  WSS    │                        │
│  - Chat         │         │  - AI Model Router     │
│  - Terminal     │         │  - Language Model      │
│  - Desktop      │         │  - Vision Model        │
│  - Approvals    │         │  - Speech (STT/TTS)    │
│  - Settings     │         │  - Reasoning Model     │
└─────────────────┘         │  - VNC Server          │
                            │  - SSH Server          │
                            │  - Permission System   │
                            └──────────────────────┘
```

## Multi-Model AI Router

FutureBox doesn't lock you into one AI. Each capability routes to the model you choose:

| Capability | Local (Free) | Cloud (Your API Key) |
|---|---|---|
| Language | Phi-3 Mini / Mistral 7B | Claude, GPT-4, Gemini |
| Reasoning | Mistral 7B / Llama 3 | Claude Opus, o1 |
| Vision | LLaVA / Moondream | Claude Opus, GPT-4V |
| Speech-to-Text | Whisper | Deepgram, Google STT |
| Text-to-Speech | Piper TTS | ElevenLabs, Google TTS |

All-local by default. Add API keys to upgrade any capability.

## Project Structure

```
FutureBox/
├── app/          # FutureBuddy - React Native companion app
├── server/       # FutureBox API server (Node.js)
├── os/           # Ubuntu installer scripts & configs
├── scripts/      # Utility scripts (ADB debloat, etc.)
├── docs/         # Documentation & master checklist
└── branding/     # Logo, colors, assets
```

## Key Decisions

- **App**: React Native (bare) — "FutureBuddy"
- **OS**: Ubuntu Server 24.04 LTS
- **Remote Desktop**: TigerVNC
- **License**: Apache 2.0
- **AI**: Multi-model capability router
- **Revenue**: Free forever — hardware sales later

## Getting Started

Coming soon. See [docs/CHECKLIST.md](docs/CHECKLIST.md) for the full build plan.

## License

Apache 2.0 — see [LICENSE](LICENSE)
