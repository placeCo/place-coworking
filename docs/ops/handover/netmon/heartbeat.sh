#!/bin/sh
# Place Coworking — heartbeat for a Linux device (Raspberry Pi / OpenWrt router). DRAFT.
# Cron (every 2 min):   */2 * * * * /usr/local/bin/place-heartbeat.sh
# HC_URL = Healthchecks.io ping URL for THIS network (one check per network/floor).
HC_URL="https://hc-ping.com/REPLACE-WITH-CHECK-UUID"
# Optional: bind to a specific interface (e.g. wlan0 connected to the floor SSID)
IFACE="${IFACE:-}"
OPT=""; [ -n "$IFACE" ] && OPT="--interface $IFACE"
# Send a success ping only if the public internet is really reachable.
if curl -fsS $OPT -m 10 -o /dev/null https://www.google.com/generate_204; then
  curl -fsS $OPT -m 10 --retry 3 -o /dev/null "$HC_URL"
else
  # internet is down: nothing reaches Healthchecks; it alerts after the grace time.
  :
fi
