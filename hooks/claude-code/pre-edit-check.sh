#!/usr/bin/env bash
# Claude Code PreToolUse hook - fires right before Edit/Write, not just once
# at session start. Addresses a real bug we hit: a session-start-only
# snapshot goes stale in a long session, so a teammate can push a change to
# a file you're about to edit and you'd never know until it broke something.
#
# Register in .claude/settings.json:
#   { "hooks": { "PreToolUse": [{ "matcher": "Edit|Write", "hooks": [
#       { "type": "command", "command": "bash hooks/claude-code/pre-edit-check.sh" }
#   ] }] } }
#
# Claude Code passes the tool call as JSON on stdin, e.g.
#   {"tool_name": "Edit", "tool_input": {"file_path": "..."}}
# Verify this shape against your installed version - it's evolved before.

if ! command -v hub-server >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "
  let d='';
  process.stdin.on('data', c => d += c);
  process.stdin.on('end', () => {
    try {
      const j = JSON.parse(d);
      const p = j.tool_input?.file_path || j.tool_input?.path || '';
      process.stdout.write(p);
    } catch { process.stdout.write(''); }
  });
")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

RESULT=$(hub-server check-file "$FILE_PATH" 2>/dev/null)
if [ -z "$RESULT" ]; then
  exit 0
fi

HAS_ACTIVITY=$(echo "$RESULT" | node -e "
  let d='';
  process.stdin.on('data', c => d += c);
  process.stdin.on('end', () => {
    try {
      const j = JSON.parse(d);
      const changed = (j.notes || []).some(n => n.anchorStatus === 'changed');
      const recent = (j.recentCommitters || []).length > 0;
      process.stdout.write((changed || recent) ? 'yes' : 'no');
    } catch { process.stdout.write('no'); }
  });
")

if [ "$HAS_ACTIVITY" = "yes" ]; then
  echo "## hub-server: heads up before editing $FILE_PATH"
  echo ""
  echo "Someone else has touched this file recently, or a note about it is"
  echo "stale. Read this before proceeding, don't assume your session-start"
  echo "context is still current:"
  echo ""
  echo '```json'
  echo "$RESULT"
  echo '```'
fi
