#!/usr/bin/env bash
# =============================================================
# FutureBuddy Companion App — Test Script
# Run after: cd server && npm run dev
# =============================================================
set -euo pipefail

HOST="https://YOUR_PC_IP:3737"

B="\033[1m"
G="\033[32m"
Y="\033[33m"
R="\033[31m"
C="\033[36m"
N="\033[0m"

hr() { echo -e "\n${C}────────────────────────────────────────${N}"; }
jp() { node -e "let buf='';process.stdin.on('data',c=>buf+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(buf);console.log($1)}catch(e){console.error('parse error:',buf.slice(0,200))}})"; }

echo -e "${B}${G}FutureBuddy App Test Script${N}"
echo -e "Server: ${HOST}\n"

# 1. Health check
hr
echo -e "${B}1. Server health check${N}"
STATUS=$(curl -sk "${HOST}/status")
echo "$STATUS" | jp "j.data.version" | while read v; do echo -e "   Server v${v} — ${G}OK${N}"; done

# 2. Create pairing token
hr
echo -e "${B}2. Creating pairing token...${N}"
PAIR_RES=$(curl -sk -X POST "${HOST}/pair/create")
PAIR_TOKEN=$(echo "$PAIR_RES" | jp "j.data.token")
EXPIRES=$(echo "$PAIR_RES" | jp "j.data.expires_at")
echo -e "   Token: ${Y}${PAIR_TOKEN}${N}"
echo -e "   Expires: ${EXPIRES}"

# 3. Exchange for session token
hr
echo -e "${B}3. Exchanging for session token...${N}"
SESSION_RES=$(curl -sk -X POST "${HOST}/pair" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${PAIR_TOKEN}\",\"device_name\":\"Test Script\"}")
SESSION_TOKEN=$(echo "$SESSION_RES" | jp "j.data.session_token")
echo -e "   Session: ${Y}${SESSION_TOKEN:0:20}...${N}"

# 4. Verify auth
hr
echo -e "${B}4. Verifying auth (GET /me)...${N}"
ME=$(curl -sk "${HOST}/me" -H "Authorization: Bearer ${SESSION_TOKEN}")
echo -e "   ${G}Authenticated${N} — $(echo "$ME" | jp "JSON.stringify(j.data)")"

# 5. Show pairing info for the app
hr
echo -e "${B}5. Pairing info for the app${N}"
echo ""
echo -e "   In the app, tap ${B}Manual${N} and enter:"
echo -e "   ${B}Host:${N}  YOUR_PC_IP:3737"
echo -e "   ${B}Token:${N} ${PAIR_TOKEN}"
echo ""
echo -e "   ${Y}Token expires in 15 min. Re-run this script if it expires.${N}"
echo ""
read -p "   Press ENTER to submit test actions (or Ctrl+C to stop)..."

# 6. Submit RED action
hr
echo -e "${B}6. Submitting RED tier action...${N}"
ACTION_RES=$(curl -sk -X POST "${HOST}/actions" \
  -H "Authorization: Bearer ${SESSION_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"shell.exec","tier":"red","title":"Delete temporary build files","description":"rm -rf /tmp/build-artifacts - removes all cached build files"}')
ACTION_ID=$(echo "$ACTION_RES" | jp "j.data.action.id")
DECISION=$(echo "$ACTION_RES" | jp "j.data.decision")
echo -e "   Action ID: ${ACTION_ID}"
echo -e "   Decision:  ${Y}${DECISION}${N}"
echo -e "   ${G}>>> Check the Actions tab in the app! <<<${N}"

# 7. Submit YELLOW action
hr
echo -e "${B}7. Submitting YELLOW tier action...${N}"
curl -sk -X POST "${HOST}/actions" \
  -H "Authorization: Bearer ${SESSION_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"file.write","tier":"yellow","title":"Write config to ~/.futurebuddyrc","description":"Writing default configuration file with AI preferences."}' > /dev/null
echo -e "   ${G}Sent${N}"

# 8. Submit GREEN action
echo -e "${B}8. Submitting GREEN tier action...${N}"
curl -sk -X POST "${HOST}/actions" \
  -H "Authorization: Bearer ${SESSION_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"web.fetch","tier":"green","title":"Fetch weather data from API","description":"GET https://api.weather.gov/forecast - read-only network request."}' > /dev/null
echo -e "   ${G}Sent${N}"

# 9. Pending count
hr
echo -e "${B}9. Pending actions:${N}"
PENDING=$(curl -sk "${HOST}/pending" -H "Authorization: Bearer ${SESSION_TOKEN}")
COUNT=$(echo "$PENDING" | jp "j.data.actions.length")
echo -e "   ${B}${COUNT}${N} pending action(s)"

# 10. Config
hr
echo -e "${B}10. Server config:${N}"
curl -sk "${HOST}/config" -H "Authorization: Bearer ${SESSION_TOKEN}" | \
  jp "Object.entries(j.data).forEach(([k,v])=>console.log('   '+k+' = '+(v||'(empty)')))"

# 11. Models
hr
echo -e "${B}11. Available models:${N}"
curl -sk "${HOST}/models" -H "Authorization: Bearer ${SESSION_TOKEN}" | \
  jp "j.data.models.forEach(m=>console.log('   ['+m.provider+'] '+m.name+(m.size?' ('+m.size+')':'')))" 2>/dev/null || echo "   (none)"

hr
echo -e "\n${G}${B}Done!${N}"
echo -e "Session token for manual testing:"
echo -e "   ${SESSION_TOKEN}"
echo -e "\nApprove the red action:"
echo -e "   curl -sk -X POST ${HOST}/approve/${ACTION_ID} -H \"Authorization: Bearer ${SESSION_TOKEN}\""
echo ""
