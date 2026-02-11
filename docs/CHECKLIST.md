# FutureBuddy — Master Build Checklist

## How to use this document
Feed this entire document into Claude Code. Work through it section by section. Each task is small enough to complete in one session. Check off tasks as you go. Tasks marked [BLOCKER] must be done before moving to the next section.

---

## PHASE 0: ENVIRONMENT SETUP

### Development Machine
- [ ] Install Node.js 22+ on dev machine
- [ ] Install Flutter or React Native CLI (decide which framework for companion app)
- [ ] Install Android Studio + Android SDK
- [ ] Install Xcode (if building iOS version of companion app)
- [ ] Install Docker (for testing OS image builds)
- [ ] Install Balena Etcher or Ventoy (for creating bootable USB)
- [ ] Install Claude Code CLI
- [ ] Set up Git repository (private) for FutureBuddy project
- [ ] Create project folder structure: /app, /os, /docs, /scripts, /branding
- [ ] Set up .gitignore for all platforms

### Test Hardware
- [ ] Factory reset ROG Phone 6 with throwaway Google account
- [ ] Enable developer mode and USB debugging on ROG 6
- [ ] Install Termux + Termux:API + Termux:Boot + Termux:GUI from F-Droid on ROG 6
- [ ] Identify an old laptop for OS testing (note specs: RAM, CPU, storage, WiFi chip)
- [ ] Verify old laptop can boot from USB
- [ ] Install ADB/Fastboot on dev machine
- [ ] Verify ADB connection to ROG 6
- [ ] Set up a test WiFi network (or use home network and note IP ranges)

### Accounts & Services
- [ ] Create a throwaway Google account for test devices
- [ ] Create a Telegram bot via BotFather (for chat interface testing)
- [ ] Get a free Gemini API key from Google AI Studio (for initial LLM testing)
- [ ] Get an Anthropic API key (optional, for Claude-powered FutureBuddy)
- [ ] Create GitHub organization for FutureBuddy
- [ ] Register domain: futurebuddy.ai (or alternative)
- [ ] Set up basic landing page (even a single page with email capture)

---

## PHASE 1: OS INSTALLER SCRIPT (Laptop)

### Research & Planning
- [ ] Decide base OS: Ubuntu Server 24.04 LTS or Debian 12 (recommend Ubuntu for broader hardware support)
- [ ] List all packages needed: ollama, openssh-server, x11vnc/tigervnc, nodejs, npm, git, curl, wget, tmux, htop, neofetch, ufw, avahi-daemon
- [ ] Research OpenClaw installation on Linux (document exact steps)
- [ ] Research Ollama installation on Linux (document exact steps)
- [ ] Research which local models to bundle (recommend: Phi-3 Mini as default, Mistral 7B as upgrade)
- [ ] Decide on VNC server: x11vnc (mirrors existing display) vs TigerVNC (virtual display) vs NoMachine
- [ ] Research mDNS/Avahi for automatic device discovery on local network
- [ ] Research Wake-on-LAN for remote power management

### Core Installer Script
- [ ] [BLOCKER] Write master install script: `install-futurebuddy.sh`
- [ ] Script: Detect hardware (CPU, RAM, GPU, storage) and log specs
- [ ] Script: Update system packages (apt update && apt upgrade -y)
- [ ] Script: Install core dependencies (build-essential, python3, pip, etc.)
- [ ] Script: Install and configure SSH server (enable on boot, set port, generate keys)
- [ ] Script: Install and configure VNC server (headless mode, set resolution, set password)
- [ ] Script: Install Node.js 22 via NodeSource
- [ ] Script: Install Ollama
- [ ] Script: Pull default AI model via Ollama (Phi-3 Mini or Mistral 7B based on available RAM)
- [ ] Script: Install OpenClaw via npm
- [ ] Script: Configure OpenClaw for headless operation
- [ ] Script: Install and configure UFW firewall (allow SSH, VNC, OpenClaw ports only)
- [ ] Script: Install and configure Avahi/mDNS (so device is discoverable as futurebuddy.local)
- [ ] Script: Configure auto-login to a dedicated futurebuddy user
- [ ] Script: Create systemd services for: SSH, VNC, Ollama, OpenClaw (all auto-start on boot)
- [ ] Script: Set hostname to "futurebuddy"
- [ ] Script: Disable screen sleep/suspend/hibernate
- [ ] Script: Disable lid-close suspend (laptop stays on when closed)
- [ ] Script: Configure automatic security updates (unattended-upgrades)
- [ ] Script: Generate QR code for companion app pairing (contains IP, port, pairing token)
- [ ] Script: Display QR code in terminal after install completes
- [ ] Script: Print summary of installed services, IP address, and access info
- [ ] Test script on old laptop — clean Ubuntu install → run script → verify all services
- [ ] Test script idempotency (running it twice doesn't break anything)
- [ ] Write error handling for each step (if a step fails, log it and continue)

### FutureBuddy API Server
- [ ] [BLOCKER] Design the FutureBuddy API specification (JSON over WebSocket)
- [ ] Define API endpoints: /chat, /status, /approve, /deny, /history, /config
- [ ] Define notification payload format (type, tier, title, body, actions)
- [ ] Define pairing handshake protocol (QR code → token exchange → encrypted channel)
- [ ] Build lightweight API server in Node.js (runs on the FutureBuddy device)
- [ ] API: /pair — accepts pairing token, returns session key
- [ ] API: /chat — sends message to AI, streams response back
- [ ] API: /status — returns device stats (CPU, RAM, uptime, AI model loaded, active tasks)
- [ ] API: /history — returns chat history (paginated)
- [ ] API: /approve — approves a pending action
- [ ] API: /deny — denies a pending action
- [ ] API: /pending — returns list of actions awaiting approval
- [ ] API: /config — get/set FutureBuddy configuration
- [ ] API: /models — list available AI models, switch active model
- [ ] API: /skills — list installed OpenClaw skills
- [ ] API: WebSocket connection for real-time chat streaming and push notifications
- [ ] Add TLS encryption to API server (self-signed cert for local network, option for Let's Encrypt)
- [ ] Add authentication middleware (session token required for all endpoints)
- [ ] Test API server independently with curl/Postman
- [ ] Add rate limiting to prevent abuse
- [ ] Write systemd service file for API server

### Permission & Warning System (Backend)
- [ ] Design permission tier system (Red/Yellow/Green) as a config file
- [ ] Build action interceptor that hooks into OpenClaw's task execution
- [ ] Interceptor: Detect outgoing email → classify as Yellow, send approval request
- [ ] Interceptor: Detect account creation → classify as Yellow, send approval request
- [ ] Interceptor: Detect personal data sharing (name, phone, address) → classify as Red, send approval request
- [ ] Interceptor: Detect location sharing → classify as Red, send approval request
- [ ] Interceptor: Detect financial transactions → classify as Red, send approval request
- [ ] Build approval queue (pending actions stored with timeout)
- [ ] Build trust rules engine (JSON config: service + action → auto-approve/auto-deny/ask)
- [ ] Trust rules: Load from config file on startup
- [ ] Trust rules: API endpoint to add/edit/delete rules
- [ ] Trust rules: Check rules before sending approval request (skip notification if rule exists)
- [ ] Build timeout handler (auto-deny after configurable period, default 24 hours)
- [ ] Test permission system end-to-end: trigger action → notification sent → approve → action executes

### Disposable Email System (Backend)
- [ ] Research options: SimpleLogin API, AnonAddy API, self-hosted mail server, or catch-all domain
- [ ] Decide approach (recommend: catch-all domain with alias generation — simplest)
- [ ] Build alias generator (random-string@futurebuddy-mail.com format)
- [ ] Build alias manager: create, list, pause, delete aliases
- [ ] API endpoint: /aliases — CRUD for email aliases
- [ ] Route incoming mail to AI inbox (OpenClaw reads and processes)
- [ ] Map aliases to services (alias X was created for service Y)
- [ ] Test: Create alias → sign up for a service → receive email → AI summarizes it

---

## PHASE 2: COMPANION APP

### Project Setup
- [ ] [BLOCKER] Initialize app project (React Native or Flutter)
- [ ] Set up project structure: /screens, /components, /services, /utils, /assets
- [ ] Configure app for both Android and iOS builds
- [ ] Set up app signing (Android keystore, iOS provisioning profile)
- [ ] Choose and install UI component library (recommend: React Native Paper or Flutter Material)
- [ ] Set up app icon and splash screen (placeholder — replace with real branding later)
- [ ] Configure app permissions: biometrics, network, notifications, camera (for QR scan)

### Authentication
- [ ] [BLOCKER] Implement biometric authentication screen
- [ ] Fingerprint auth (Android BiometricPrompt / iOS LocalAuthentication)
- [ ] Face ID support (iOS)
- [ ] Fallback to device PIN/pattern
- [ ] Auto-lock after configurable timeout (default: 2 minutes idle)
- [ ] Lock on app background (immediate)
- [ ] Secure storage for session token (Android Keystore / iOS Keychain)
- [ ] "Lock now" button accessible from any screen

### Pairing / Connection
- [ ] Build QR code scanner screen
- [ ] Parse QR code data (IP, port, pairing token)
- [ ] Implement pairing handshake with FutureBuddy API
- [ ] Store connection details in secure storage
- [ ] Auto-reconnect on app launch
- [ ] Connection status indicator (green/yellow/red) in app header
- [ ] Manual connection option (enter IP and port manually)
- [ ] Support for multiple FutureBuddy devices (list, switch, remove)
- [ ] mDNS discovery (auto-find FutureBuddy on local network)
- [ ] Tailscale/WireGuard integration for remote access (stretch goal)

### Chat Mode
- [ ] [BLOCKER] Build chat screen UI
- [ ] Message list with user bubbles (right) and AI bubbles (left)
- [ ] Text input field with send button
- [ ] Voice input button (speech-to-text)
- [ ] Typing indicator (three dots) when AI is processing
- [ ] WebSocket connection to FutureBuddy API /chat endpoint
- [ ] Stream AI responses token-by-token (not wait for full response)
- [ ] Rich message rendering: bold, italic, code blocks, links
- [ ] Image display in chat (AI can send images)
- [ ] File attachment button (send files to FutureBuddy for processing)
- [ ] Message timestamps
- [ ] Chat history loading (scroll up to load older messages)
- [ ] Pull-to-refresh
- [ ] Message search
- [ ] Copy message text (long press)
- [ ] Quick actions bar above keyboard (collapsible)
- [ ] Quick action: "Status" — get device status
- [ ] Quick action: "Search" — trigger web search
- [ ] Quick action: "Email" — check email summary
- [ ] Empty state: first-time user sees welcome message and setup prompts

### Terminal Mode
- [ ] [BLOCKER] Build terminal screen
- [ ] Integrate terminal emulator library (xterm.js for React Native, or native SSH library)
- [ ] SSH connection to FutureBuddy (auto-connect using stored credentials)
- [ ] Full terminal rendering (colors, cursor, scrollback)
- [ ] Soft keyboard with extended keys row: Tab, Ctrl, Alt, Esc, arrows, |, /, ~
- [ ] Font size adjustment (pinch to zoom or settings)
- [ ] Copy/paste support
- [ ] Multiple terminal sessions (tabs)
- [ ] Command history (up/down arrows)
- [ ] Search within scrollback buffer
- [ ] Auto-reconnect on connection drop
- [ ] Terminal theme options (dark, light, solarized)

### Desktop Mode
- [ ] [BLOCKER] Build desktop screen
- [ ] Integrate VNC client library (or RDP client library)
- [ ] Auto-connect to FutureBuddy VNC server
- [ ] Touch-to-mouse mapping (tap = click, long press = right click)
- [ ] Pinch-to-zoom
- [ ] Two-finger scroll
- [ ] Floating toolbar: keyboard toggle, mouse mode, orientation lock, screenshot, disconnect
- [ ] Keyboard input (show/hide soft keyboard)
- [ ] Landscape mode support
- [ ] Resolution scaling options (fit to screen, native, custom)
- [ ] Clipboard sharing (with Yellow warning for sensitive content)
- [ ] Performance options (color depth, compression level, frame rate)

### Notification System (App Side)
- [ ] [BLOCKER] Implement push notification handling
- [ ] Receive notifications via WebSocket from FutureBuddy API
- [ ] Display system notifications when app is in background
- [ ] Notification card UI (title, body, warning tier color, action buttons)
- [ ] Action Required notifications: Approve / Deny / Review buttons
- [ ] FYI notifications: tap to view details in chat
- [ ] Alert notifications: tap to view and take action
- [ ] Notification badge on app icon
- [ ] Notification history screen (chronological list of all notifications)
- [ ] Filter notifications by tier (Red/Yellow/Green)
- [ ] Notification sounds (customizable per tier)
- [ ] Quiet hours setting (queue notifications, no buzz)
- [ ] "Always allow" checkbox on Yellow-tier notifications (creates trust rule)
- [ ] Notification grouping (batch low-priority FYIs)

### Settings Screen
- [ ] Device connection settings (paired devices, add/remove)
- [ ] Security settings (biometric config, auto-lock timeout, remote wipe)
- [ ] AI settings (active model, cloud API keys, system prompt customization)
- [ ] Trust rules manager (list, add, edit, delete rules)
- [ ] Rule templates (pre-built common rules)
- [ ] Email alias manager (list, create, pause, delete aliases)
- [ ] Identity exposure log (chronological log of approved/denied actions)
- [ ] Notification preferences (per-tier settings, sounds, quiet hours)
- [ ] App theme (dark/light/system)
- [ ] About screen (versions, device info, storage, uptime)
- [ ] Help / Getting Started guide
- [ ] Feedback / Bug report link
- [ ] Export data (download chat history, trust rules, alias list)

### App Polish
- [ ] Loading states for all screens
- [ ] Error states and retry logic for all network calls
- [ ] Offline state handling (show last known status, queue messages)
- [ ] Smooth animations and transitions between tabs
- [ ] Haptic feedback on approve/deny actions
- [ ] Accessibility: screen reader support, dynamic text sizes
- [ ] Localization structure (English first, prep for other languages)
- [ ] App store screenshots (6.5" and 5.5" iPhone, Android phone)
- [ ] App store description and keywords
- [ ] Privacy policy (no data collected — the app is a thin client)
- [ ] Terms of service

---

## PHASE 3: BOOTABLE OS IMAGE (Laptop)

### Base Image Creation
- [ ] [BLOCKER] Research and choose image builder: Ubuntu Live Build, Cubic, or Linux Live Kit
- [ ] Create minimal Ubuntu Server base image (no desktop environment needed)
- [ ] Pre-configure: auto-login, disable suspend/sleep/hibernate, disable lid-close action
- [ ] Pre-install all FutureBuddy packages from Phase 1 script
- [ ] Pre-install FutureBuddy API server
- [ ] Pre-configure systemd services (SSH, VNC, Ollama, OpenClaw, API server)
- [ ] Pre-configure firewall rules
- [ ] Pre-configure mDNS/Avahi (hostname: futurebuddy.local)
- [ ] Include first-boot setup wizard script
- [ ] First-boot wizard: detect hardware, select appropriate AI model based on RAM
- [ ] First-boot wizard: connect to WiFi (if no ethernet)
- [ ] First-boot wizard: generate pairing QR code and display on screen
- [ ] First-boot wizard: download selected AI model (requires internet)
- [ ] First-boot wizard: run self-test (verify all services are running)
- [ ] First-boot wizard: display "FutureBuddy is ready" with QR code and IP address
- [ ] After first boot: device is headless, all interaction via companion app

### Hardware Compatibility
- [ ] Test on Intel laptop (common ThinkPad or Dell)
- [ ] Test on AMD laptop
- [ ] Test on old MacBook (Intel, via USB boot)
- [ ] Test WiFi driver compatibility (identify common chipsets that need extra drivers)
- [ ] Bundle common WiFi firmware packages (iwlwifi, broadcom, realtek, atheros)
- [ ] Test Bluetooth compatibility
- [ ] Test with varying RAM: 4GB, 8GB, 16GB (model selection should adapt)
- [ ] Test with HDD vs SSD (performance benchmarks)
- [ ] Test with UEFI and Legacy BIOS boot
- [ ] Test Secure Boot compatibility (or document how to disable)
- [ ] Create hardware compatibility list for website

### ISO Distribution
- [ ] Build final ISO image
- [ ] Test ISO size (target: under 4GB for USB stick compatibility)
- [ ] Create SHA256 checksum for ISO verification
- [ ] Build simple USB flasher tool (or document use of Balena Etcher/Rufus)
- [ ] Set up download hosting (GitHub Releases, or CDN)
- [ ] Create download page on website with instructions
- [ ] Write "Create a FutureBuddy in 5 minutes" quick-start guide

---

## PHASE 4: ANDROID OS (ROG 6 / Samsung / SBC)

### Research
- [ ] Decide: full custom AOSP ROM vs automated setup script on stock Android
- [ ] If script approach: write ADB debloat script for Samsung devices
- [ ] If script approach: write ADB debloat script for ASUS ROG devices
- [ ] If script approach: write Termux auto-setup script (installs everything unattended)
- [ ] Research Samsung DeX programmatic configuration
- [ ] Research Android accessibility services for AI-driven app control
- [ ] Research Termux:Boot auto-start reliability across Android versions

### Android Setup Script
- [ ] Write master setup script: `setup-futurebuddy-android.sh` (runs on PC, talks to phone via ADB)
- [ ] Script: Detect device model and Android version
- [ ] Script: Debloat based on device (Samsung, ASUS, Pixel, generic)
- [ ] Script: Install Termux + addons via ADB sideload
- [ ] Script: Configure Termux (install packages, set up proot, install OpenClaw)
- [ ] Script: Install and configure VNC server
- [ ] Script: Install and configure SSH server
- [ ] Script: Set up Termux:Boot auto-start scripts
- [ ] Script: Configure Android settings via ADB (disable sleep, disable sensors, etc.)
- [ ] Script: Install FutureBuddy API server inside Termux
- [ ] Script: Generate pairing QR code
- [ ] Script: Print completion summary
- [ ] Test on ROG Phone 6
- [ ] Test on Samsung Galaxy S22/S23
- [ ] Test on Google Pixel 6/7
- [ ] Document device-specific quirks

---

## PHASE 5: BRANDING & MARKETING

### Brand Identity
- [ ] Design FutureBuddy logo (simple, clean, recognizable at small sizes)
- [ ] Choose brand colors (recommend: dark background, blue accent — matches LED concept)
- [ ] Choose brand fonts
- [ ] Create logo variations: full, icon only, horizontal, vertical, white, dark
- [ ] Design app icon (must look good at 1024x1024 and 29x29)
- [ ] Design FutureBuddy "device" LED indicator concept art

### Website
- [ ] Build landing page at futurebuddy.ai
- [ ] Hero section: "Your AI lives in a box. You talk to it from your phone."
- [ ] How it works section (3 steps: download, install, scan QR code)
- [ ] Features section (chat, terminal, desktop, privacy, permissions)
- [ ] Pricing section (Free: app + OS, Future paid tiers)
- [ ] Download section (app links, OS ISO download)
- [ ] FAQ section
- [ ] Blog (for launch post, tutorials, updates)
- [ ] Email signup for launch notification
- [ ] SEO basics: meta tags, OpenGraph, sitemap

### Commercial / Demo Video
- [ ] Write shot list based on commercial script
- [ ] Secure gym location (garage gym)
- [ ] Get a physical object to represent FutureBuddy on shelf (3D printed case, or just a small black box with an LED)
- [ ] Film Scene 1: "Hey Future, I want to get jacked" + gym pan + photo
- [ ] Film Scene 2: Chat conversation on phone screen (screen recording)
- [ ] Film Scene 3: Workout montage with phone check-ins
- [ ] Film Scene 4: "Two weeks later" — progress chart on phone
- [ ] Film Scene 5: Reveal shot — FutureBuddy on shelf, LED pulsing
- [ ] Record voiceover: "FutureBuddy. My AI lives in a box. I just live my life."
- [ ] Film post-credits tag: "Am I overtraining?" "Yes. Take tomorrow off."
- [ ] Edit video (60 seconds main + 5 second tag)
- [ ] Create thumbnail for YouTube/social
- [ ] Export versions: YouTube (16:9), Instagram Reels (9:16), TikTok (9:16), Twitter (16:9)

### Social Media
- [ ] Create accounts: Twitter/X, YouTube, Instagram, TikTok, Reddit (r/selfhosted, r/LocalLLaMA)
- [ ] Create GitHub organization and repos (app, os, api-server, docs)
- [ ] Write launch post for each platform
- [ ] Write "Behind the scenes: Building FutureBuddy" thread/post
- [ ] Create "What would you ask your FutureBuddy?" engagement post
- [ ] Plan weekly content: build progress, demos, tips, use cases
- [ ] Engage with OpenClaw community (Discord, Reddit) — don't spam, add value
- [ ] Engage with r/selfhosted, r/LocalLLaMA, r/homelab communities
- [ ] Engage with privacy-focused communities

### Documentation
- [ ] Write README.md for GitHub repos
- [ ] Write "Getting Started" guide (app + laptop OS)
- [ ] Write "Getting Started" guide (app + Android device)
- [ ] Write "Getting Started" guide (app + Mac Mini)
- [ ] Write "Getting Started" guide (app + cloud server)
- [ ] Write "Supported Hardware" page
- [ ] Write "FAQ" page
- [ ] Write "Security & Privacy" page (explain the architecture, what data goes where)
- [ ] Write "Contributing" guide (for open source contributors)
- [ ] Write API documentation (for developers building on FutureBuddy)
- [ ] Create video tutorial: "Set up FutureBuddy in 5 minutes"

---

## PHASE 6: LAUNCH

### Pre-Launch
- [ ] Beta test with 10-20 people (mix of technical and non-technical)
- [ ] Collect feedback and fix critical bugs
- [ ] Write beta tester testimonials
- [ ] Prepare launch day social posts
- [ ] Prepare Hacker News "Show HN" post
- [ ] Prepare Product Hunt listing
- [ ] Prepare Reddit posts for r/selfhosted, r/LocalLLaMA, r/privacy, r/homelab
- [ ] Submit companion app to App Store (allow 1-2 weeks for review)
- [ ] Submit companion app to Google Play Store
- [ ] Submit companion app to F-Droid (open source credibility)
- [ ] Final test of full flow: download OS → flash USB → boot laptop → install app → pair → chat

### Launch Day
- [ ] Publish app to stores (or flip to public)
- [ ] Publish OS ISO to GitHub Releases + website
- [ ] Publish all GitHub repos (make public)
- [ ] Post Show HN
- [ ] Post on Product Hunt
- [ ] Post on Reddit (multiple subreddits, staggered)
- [ ] Post commercial video on YouTube, TikTok, Instagram, Twitter
- [ ] Post launch announcement on Twitter/X
- [ ] Email launch notification to signups
- [ ] Monitor feedback channels and respond quickly
- [ ] Fix any critical bugs reported in first 24 hours

### Post-Launch
- [ ] Track downloads, installs, active users
- [ ] Collect feature requests and bug reports
- [ ] Prioritize top 5 requested features
- [ ] Plan v1.1 release (2-4 weeks post-launch)
- [ ] Write "Week 1 stats and learnings" blog post
- [ ] Start building community (Discord server or GitHub Discussions)
- [ ] Identify potential contributors from community
- [ ] Plan hardware partnerships (Radxa, used phone resellers, etc.)
- [ ] Explore revenue: premium app features, managed hosting, hardware sales

---

## STRETCH GOALS (Post-Launch)

### App Enhancements
- [ ] Apple Watch / WearOS companion (approve/deny from wrist)
- [ ] Home screen widget (status + quick actions)
- [ ] iPad / Android tablet optimized layout
- [ ] macOS / Windows desktop companion app
- [ ] Voice mode ("Hey Future" wake word on phone)
- [ ] Multi-user profiles (multiple fingerprints → separate environments)
- [ ] File manager tab (browse FutureBuddy filesystem from app)
- [ ] Skill/plugin browser and installer within app

### OS Enhancements
- [ ] Auto-update mechanism (pull latest FutureBuddy updates without reinstall)
- [ ] Backup and restore (export/import FutureBuddy state)
- [ ] Encrypted storage by default (LUKS full disk encryption)
- [ ] VPN client built in (Tailscale one-click setup for remote access)
- [ ] Multiple AI model management (download, switch, delete models from app)
- [ ] Resource monitoring dashboard (accessible via companion app)
- [ ] Scheduled tasks (cron-like interface managed from app)
- [ ] Plugin/skill marketplace integration

### Hardware Product
- [ ] Identify ideal SBC or compute module (Radxa Dragon Q6A, RUBIK Pi 3, or custom)
- [ ] Design minimal enclosure (3D printable first, injection mold later)
- [ ] Design LED indicator system (status colors)
- [ ] Design packaging
- [ ] Source components for first batch (50-100 units)
- [ ] Assemble and flash first batch
- [ ] Set up e-commerce (Shopify or direct sales)
- [ ] Price and list hardware product
- [ ] Fulfillment logistics (shipping, returns, warranty)

---

## KEY DECISIONS TO MAKE BEFORE STARTING

These decisions affect everything downstream. Make them first:

1. [ ] **App framework:** React Native or Flutter?
   - React Native: larger ecosystem, xterm.js works natively, more JS developers
   - Flutter: better performance, single codebase iOS+Android, growing ecosystem

2. [ ] **App name in stores:** "FutureBuddy" or "FutureBuddy Companion" or "FutureBuddy AI"?

3. [ ] **OS base:** Ubuntu Server 24.04 LTS or Debian 12?
   - Ubuntu: broader hardware support, more packages, more tutorials
   - Debian: lighter, more stable, more "pure" open source

4. [ ] **VNC vs RDP vs NoMachine?**
   - VNC: simplest, most compatible, open source
   - RDP: better performance, native on Windows
   - NoMachine: best performance, but proprietary

5. [ ] **License:** MIT, Apache 2.0, or GPL?
   - MIT: maximum freedom, easy for others to use
   - GPL: forces derivatives to stay open source (protects the community)

6. [ ] **Default AI model:** Phi-3 Mini (fast, small) or Mistral 7B (better quality)?

7. [ ] **Revenue model for app:** Free forever? Freemium? Donation-based?

---

## DAILY STANDUP TEMPLATE

Copy this and fill it out each day to stay on track:

```
Date: ____
Yesterday: What I completed
Today: What I'm working on
Blockers: What's stopping me
Decisions needed: What I need to decide
Notes: Anything else
```

---

*Last updated: February 2026*
*Feed this document into Claude Code and say: "I'm building FutureBuddy. Here's my master checklist. Let's start with Phase ___."*
