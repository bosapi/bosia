#!/usr/bin/env bash
# Dev-server smoke test, run from inside a scaffolded app (see ci.yml).
#
#   1. `bun run dev` serves the home page
#   2. editing +page.svelte shows up without a restart (watcher + rebuild)
#   3. a new route folder is picked up without a restart (manifest rescan)
#   4. pidsOnPort() finds the dev proxy (lsof on Linux, netstat on Windows)
#   5. after a hard kill of the dev process, a fresh `bun run dev` starts
#      cleanly — the orphaned app server on PORT+1 must not block it
#
# Usage: dev-smoke.sh <path-to-packages/bosia>
# Live browser reload (SSE) is not covered — that still needs a human.
set -euo pipefail

# Read by the `bun -e` snippets through process.env, never pasted into JS source:
# a Windows path like D:\a\bosia would turn into escape sequences there.
export BOSIA_PKG="$1"
PORT=9000
APP_PORT=$((PORT + 1))
URL="http://127.0.0.1:$PORT"
LOG1=dev-1.log
LOG2=dev-2.log

# PIDs listening on a port, via bosia's own cross-platform helper.
pids_on() {
	bun -e "const { join } = await import('node:path'); const { pidsOnPort } = await import(join(process.env.BOSIA_PKG, 'src/core/port.ts')); console.log((await pidsOnPort($1)).join(' '))"
}

kill_pids() {
	for pid in "$@"; do
		bun -e "try { process.kill($pid, 'SIGKILL') } catch {}"
	done
}

cleanup() {
	kill_pids $(pids_on $PORT) $(pids_on $APP_PORT) || true
}
trap cleanup EXIT

dump_logs() {
	for f in "$LOG1" "$LOG2"; do
		[ -f "$f" ] && { echo "── $f ──"; cat "$f"; }
	done
}

# wait_for <what> <seconds> <command...> — retry command until it succeeds.
wait_for() {
	local what="$1" secs="$2"
	shift 2
	for _ in $(seq 1 "$secs"); do
		"$@" > /dev/null 2>&1 && { echo "✓ $what"; return 0; }
		sleep 1
	done
	echo "✗ timed out after ${secs}s: $what"
	dump_logs
	exit 1
}

page_has() { curl -sf "$URL$1" | grep -q "$2"; }
port_free() { [ -z "$(pids_on "$1")" ]; }

# ── 1. start ──────────────────────────────────────────────
bun run dev > "$LOG1" 2>&1 &
wait_for "dev server serves /" 90 curl -sf "$URL/"

# ── 2. edit a page ────────────────────────────────────────
# The home page may sit in a route group, e.g. src/routes/(public)/+page.svelte.
HOME_PAGE=$(ls src/routes/+page.svelte src/routes/\(*\)/+page.svelte 2> /dev/null | head -1 || true)
[ -n "$HOME_PAGE" ] || { echo "✗ no +page.svelte serves /"; exit 1; }
MARK_EDIT="dev-smoke-edit-$RANDOM"
printf '\n<p>%s</p>\n' "$MARK_EDIT" >> "$HOME_PAGE"
wait_for "edit to +page.svelte is served" 60 page_has / "$MARK_EDIT"

# ── 3. add a route ────────────────────────────────────────
MARK_ROUTE="dev-smoke-route-$RANDOM"
mkdir -p src/routes/dev-smoke
printf '<h1>%s</h1>\n' "$MARK_ROUTE" > src/routes/dev-smoke/+page.svelte
wait_for "new route /dev-smoke is served" 60 page_has /dev-smoke "$MARK_ROUTE"

# ── 4. port lookup ────────────────────────────────────────
DEV_PIDS=$(pids_on $PORT)
if [ -z "$DEV_PIDS" ]; then
	echo "✗ pidsOnPort($PORT) found nothing while dev is listening"
	dump_logs
	exit 1
fi
echo "✓ pidsOnPort($PORT) → $DEV_PIDS"

# ── 5. hard kill + restart ────────────────────────────────
# Kill only the dev proxy (like a crash or a closed terminal). Its app server
# on APP_PORT may survive as an orphan; the next dev run must clear it.
kill_pids $DEV_PIDS
wait_for "port $PORT released" 15 port_free $PORT
ORPHANS=$(pids_on $APP_PORT)
echo "  app-server pids still on $APP_PORT after kill: ${ORPHANS:-none}"

bun run dev > "$LOG2" 2>&1 &
wait_for "restarted dev server serves /" 90 curl -sf "$URL/"
wait_for "restarted dev server still has /dev-smoke" 30 page_has /dev-smoke "$MARK_ROUTE"

if grep -qE "EADDRINUSE|already serving|already in use" "$LOG2"; then
	echo "✗ restart hit a port conflict"
	dump_logs
	exit 1
fi
grep -h "Reaped stale app server" "$LOG2" || true

echo "✓ dev smoke passed"
