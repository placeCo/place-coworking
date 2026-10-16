#!/usr/bin/env bash
# Usage: set_webhook.sh https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
# Sets LINE webhook endpoint, reads it back, runs the API test. Prints no secrets.
set -euo pipefail
URL="${1:?webhook /exec URL required}"
set -a; . /home/box/secrets/line.env; set +a
H="Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN"
echo "PUT endpoint:"; curl -s -w ' HTTP %{http_code}\n' -X PUT -H "$H" -H 'Content-Type: application/json' \
  -d "{\"endpoint\":\"$URL\"}" https://api.line.me/v2/bot/channel/webhook/endpoint
echo "GET endpoint:"; curl -s -w ' HTTP %{http_code}\n' -H "$H" https://api.line.me/v2/bot/channel/webhook/endpoint
echo "POST test:"; curl -s -w ' HTTP %{http_code}\n' -X POST -H "$H" -H 'Content-Type: application/json' \
  -d "{\"endpoint\":\"$URL\"}" https://api.line.me/v2/bot/channel/webhook/test
