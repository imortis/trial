#!/usr/bin/env bash
# Shared helper: prints the current shared-team context as a plain-text
# block suitable for injecting into an agent's context window. Sourced by
# the per-harness hook scripts in this directory.
#
# hub-server is a LOCAL MCP server (no hosted service, no URL) - state lives
# in .hub/ inside the repo itself and syncs via the repo's own git remote.
# This just shells out to its `dashboard --json` mode, which does a
# git fetch + fast-forward pull before reading, so it's always fresh.
#
# Requires `hub-server` on PATH (npm link, or npm install -g once published).
# Degrades silently if it's not installed or this isn't a git repo, so hooks
# don't break repos that haven't set up hub-server.

fetch_hub_context() {
  if ! command -v hub-server >/dev/null 2>&1; then
    return 0
  fi

  local response
  response=$(hub-server dashboard --json 2>/dev/null)
  if [ -z "$response" ]; then
    return 0
  fi

  echo "## Shared team context (hub-server, .hub/ in this repo)"
  echo ""
  echo "This repo is shared with teammates using their own AI coding agents."
  echo "Below is the live plan, who's doing what, and recent decisions."
  echo "Call the hub-server MCP tools (declare_task, claim_task, log_activity,"
  echo "update_task_status, get_file_history) as you work so teammates stay in sync."
  echo ""
  echo '```json'
  echo "$response"
  echo '```'
}
