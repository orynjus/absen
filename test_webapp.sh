#!/usr/bin/env bash
set -euo pipefail

URL=${1:-${WEBAPP_URL:-}}
if [ -z "$URL" ]; then
  echo "Usage: $0 <WEBAPP_URL>"
  exit 1
fi

printf "--- GET %s ---\n" "$URL"
curl -sS -D - "$URL" | sed -n '1,120p'

printf "\n--- POST sample log ---\n"
PAYLOAD=$(cat <<JSON
{"studentId":"TEST-001","name":"Test Murid","kelas":"X-A","date":"$(date +%Y-%m-%d)","time":"$(date +%H:%M)","type":"Masuk","method":"Curl"}
JSON
)

printf "Payload: %s\n" "$PAYLOAD"
RES=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$URL" -H "Content-Type: application/json" -d "$PAYLOAD")

printf "Response:\n%s\n" "$RES"

# check for JSON success:true
if echo "$RES" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
  echo "POST OK"
  exit 0
else
  echo "POST failed or no success:true in response"
  exit 2
fi
