#!/data/data/com.termux/files/usr/bin/bash
# Termux:Boot auto-start script for FutureBuddy
# Place in ~/.termux/boot/

# Wait for network
sleep 5

# Start Ollama in background
ollama serve &

# Wait for Ollama to be ready
for i in $(seq 1 30); do
  curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1 && break
  sleep 1
done

# Start FutureBuddy server
cd /data/data/com.termux/files/home/futurebuddy/server
NODE_ENV=production DATA_DIR=$HOME/futurebuddy-data node dist/index.js &

echo "FutureBuddy started at $(date)" >> $HOME/futurebuddy-boot.log
