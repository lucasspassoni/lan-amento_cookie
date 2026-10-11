#!/bin/sh
set -eu

escape_json() {
  printf '%s' "${1:-}" | sed ':a;N;$!ba;s/\\/\\\\/g;s/"/\\"/g;s/\r//g;s/\n/\\n/g'
}

cat > /usr/share/nginx/html/runtime-env.js <<EOF
window.__COOKIE_PITADA_ENV__ = Object.freeze({
  VITE_SUPABASE_URL: "$(escape_json "${VITE_SUPABASE_URL:-}")",
  VITE_SUPABASE_PUBLISHABLE_KEY: "$(escape_json "${VITE_SUPABASE_PUBLISHABLE_KEY:-}")",
  VITE_N8N_CREATE_ORDER_WEBHOOK_URL: "$(escape_json "${VITE_N8N_CREATE_ORDER_WEBHOOK_URL:-}")",
  VITE_ORDER_SIMULATION: "$(escape_json "${VITE_ORDER_SIMULATION:-false}")"
});
EOF
