#!/usr/bin/env node
// Claude Code PreToolUse hook - fires right before Edit/Write, not just once
// at session start. Pure Node - no bash dependency. Addresses a real bug we
// hit: a session-start-only snapshot goes stale in a long session, so a
// teammate can push a change to a file you're about to edit and you'd never
// know until it broke something.
//
// Register in .claude/settings.json:
//   { "hooks": { "PreToolUse": [{ "matcher": "Edit|Write", "hooks": [
//       { "type": "command", "command": "node hooks/claude-code/pre-edit-check.mjs" }
//   ] }] } }
// (Written automatically by `hub-server init`.)
//
// Claude Code passes the tool call as JSON on stdin, e.g.
//   {"tool_name": "Edit", "tool_input": {"file_path": "..."}}
// Verify this shape against your installed version - it's evolved before.

import { runHubServer } from "../lib/run-hub-server.mjs";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

const raw = await readStdin();

let filePath;
try {
  const parsed = JSON.parse(raw);
  filePath = parsed?.tool_input?.file_path || parsed?.tool_input?.path;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

let result;
try {
  const output = runHubServer(["check-file", filePath]);
  result = JSON.parse(output);
} catch {
  process.exit(0);
}

const hasChangedNote = (result.notes ?? []).some((n) => n.anchorStatus === "changed");
const hasRecentActivity = (result.recentCommitters ?? []).length > 0;

if (hasChangedNote || hasRecentActivity) {
  console.log(`## hub-server: heads up before editing ${filePath}`);
  console.log("");
  console.log("Someone else has touched this file recently, or a note about it is");
  console.log("stale. Read this before proceeding, don't assume your session-start");
  console.log("context is still current:");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(result, null, 2));
  console.log("```");
}
