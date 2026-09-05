#!/usr/bin/env bash
# Cursor hook (session-start equivalent).
#
# Cursor's hooks config format is newer and evolving - check
# https://cursor.com/docs/hooks for the current registration syntax
# for your installed version. Functionally this does the same thing as
# the Claude Code hook: fetch shared context and print it for injection.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/lib/fetch-context.sh"

fetch_hub_context
