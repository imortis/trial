#!/usr/bin/env bash
# Claude Code SessionStart hook.
#
# Register in .claude/settings.json:
#   { "hooks": { "SessionStart": [{ "hooks": [{ "type": "command",
#       "command": "bash hooks/claude-code/session-start.sh" }] }] } }
#
# NOTE: Claude Code's hook I/O contract (stdin JSON shape, how stdout is
# consumed as context vs. requiring structured JSON on stdout) has changed
# across versions - verify against `claude --help` / current docs for your
# installed version before relying on this in production. As written, this
# prints plain text to stdout, which is the common convention for
# SessionStart hooks adding context.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/lib/fetch-context.sh"

fetch_hub_context
