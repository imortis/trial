#!/usr/bin/env bash
# Google Antigravity pre_turn hook.
#
# Antigravity 2.0 (I/O 2026) supports a `pre_turn` lifecycle hook that runs a
# local script before each model call, documented for injecting system
# instructions. Register this script per Antigravity's hook config (global
# or workspace-level JSON - see antigravity.google/docs/sdk/lifecycle/ for
# the current config schema, which was still evolving at time of writing).
#
# Unlike SessionStart hooks (which fire once), pre_turn fires on every turn -
# to avoid hammering the Hub, this only fetches on the first turn of a
# session by checking a marker file, then again periodically.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/lib/fetch-context.sh"

MARKER="/tmp/.hub-context-fetched-$(pwd | tr -c 'a-zA-Z0-9' '_')"
NOW=$(date +%s)
LAST=0
[ -f "$MARKER" ] && LAST=$(cat "$MARKER")

# Re-fetch at most once every 60 seconds.
if [ $((NOW - LAST)) -ge 60 ]; then
  fetch_hub_context
  echo "$NOW" > "$MARKER"
fi
