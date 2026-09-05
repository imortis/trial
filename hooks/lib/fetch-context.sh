#!/usr/bin/env bash
# Shared helper: prints the current shared-team HANDOFF BRIEF as a plain-text
# block suitable for injecting into an agent's context window. Sourced by
# the per-harness hook scripts in this directory.
#
# hub-server is a LOCAL MCP server (no hosted service, no URL) - state lives
# in .hub/ inside the repo itself and syncs via the repo's own git remote.
# This shells out to `hub-server handoff`, which does a git fetch +
# fast-forward pull, then deterministically assembles requirements/design +
# active tasks + structured completion reports + anchor-verified file
# history into ONE payload - every agent gets the same assembled context
# regardless of harness/model, instead of each one deciding for itself how
# much context to bother gathering.
#
# Requires `hub-server` on PATH (npm link, or npm install -g once published).
# Degrades silently if it's not installed or this isn't a git repo, so hooks
# don't break repos that haven't set up hub-server.

fetch_hub_context() {
  if ! command -v hub-server >/dev/null 2>&1; then
    return 0
  fi

  local response
  response=$(hub-server handoff 2>/dev/null)
  if [ -z "$response" ]; then
    return 0
  fi

  echo "## Shared team handoff brief (hub-server, .hub/ in this repo)"
  echo ""
  echo "This repo is shared with teammates using their own AI coding agents."
  echo "This is the FULL current state: project requirements/design, what's"
  echo "still to do, what teammates just finished (with their reasoning and"
  echo "decisions), and file-level history. Read it before asking the user"
  echo "to re-explain anything they've already told a teammate's agent."
  echo ""
  echo "As you work: call declare_task before starting something new (check"
  echo "the conflicts it returns), claim_task to take an existing one,"
  echo "update_task_status with a structured \`completion\` when done (not a"
  echo "one-line summary - whatWasBuilt/decisions/filesChanged/nextSteps),"
  echo "record_file_note when you finish touching a file, and update_plan if"
  echo "requirements or design actually changed."
  echo ""
  echo '```json'
  echo "$response"
  echo '```'
}
