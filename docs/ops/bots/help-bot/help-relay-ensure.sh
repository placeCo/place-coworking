#!/bin/sh
# Start help-relay.py if not already running (single instance via flock on the lock file).
D=/home/box/place-bots
exec /usr/bin/flock -n "$D/help-relay.lock" /usr/bin/python3 "$D/help-relay.py" >>"$D/help-relay.stderr" 2>&1
