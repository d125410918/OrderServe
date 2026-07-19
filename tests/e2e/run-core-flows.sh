#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

PORT="$(node --input-type=module - <<'NODE'
import { createServer } from 'node:net';
const server = createServer();
server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  if (!address || typeof address === 'string') process.exit(1);
  console.log(address.port);
  server.close();
});
NODE
)"
export E2E_BASE_URL="http://localhost:${PORT}"

setsid env PORT="$PORT" node node_modules/next/dist/bin/next start >/tmp/dongji-e2e-server.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill -TERM -- "-$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 100); do
  curl -sf "${E2E_BASE_URL}/menu" >/dev/null && break
  sleep 0.2
done
curl -sf "${E2E_BASE_URL}/menu" >/dev/null || { cat /tmp/dongji-e2e-server.log; exit 1; }

if [[ -x /tmp/chromium ]]; then
  export PLAYWRIGHT_CHROMIUM_PATH=/tmp/chromium
else
  PLAYWRIGHT_CHROMIUM_PATH="$(node --input-type=module -e "import chromium from '@sparticuz/chromium'; console.log(await chromium.executablePath())")"
  export PLAYWRIGHT_CHROMIUM_PATH
fi

run_viewport() {
  local name="$1" width="$2" height="$3"
  timeout --kill-after=5s 120s node tests/e2e/viewport-runner.mjs "$name" "$width" "$height" all
}

run_viewport 手機 390 844
run_viewport 桌面 1440 1000

echo "E2E 驗證完成：手機與桌面核心流程及主要版面檢查全部通過"
