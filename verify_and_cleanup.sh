#!/usr/bin/env bash
set -euo pipefail

# CoatVision Supabase verification script
# - Read-only DB checks are expected to be run inside Supabase UI
# - This script performs REST RPC verifications and captures outputs.

SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"

out_json="verify_output.json"
ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

function write_json() {
  # Minimal JSON writer without jq
  cat > "$out_json" <<EOF
{
  "created": [
    {"type":"extension","name":"pgcrypto"},
    {"type":"extension","name":"uuid-ossp"},
    {"type":"table","name":"public.analyses"},
    {"type":"policy","name":"public.analyses.anon_read_analyses"},
    {"type":"policy","name":"public.analyses.forbid_anon_write_analyses"},
    {"type":"table","name":"public.jobs"},
    {"type":"table","name":"public.reports"},
    {"type":"table","name":"public.training_sessions"},
    {"type":"function","name":"public.insert_analysis_from_payload"},
    {"type":"function","name":"public.get_dashboard_summary"},
    {"type":"function","name":"public.get_latest_analyses"},
    {"type":"storage_bucket","id":"outputs","public":true}
  ],
  "verification": {
    "extensions": "Run via Supabase UI: SELECT extname, extversion FROM pg_extension ORDER BY extname;",
    "tables_columns": "Run via Supabase UI: SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE (table_schema='public' AND table_name IN ('analyses','jobs','reports','training_sessions')) ORDER BY table_name, ordinal_position;",
    "rls_analyses": "Run via Supabase UI: SELECT relname, relrowsecurity FROM pg_class JOIN pg_namespace n ON pg_class.relnamespace=n.oid WHERE n.nspname='public' AND relname='analyses'; and list policies via pg_policy.",
    "functions": "Run via Supabase UI: list RPCs via pg_proc for names insert_analysis_from_payload, get_dashboard_summary, get_latest_analyses.",
    "storage_bucket": "Run via Supabase UI: SELECT * FROM storage.buckets WHERE id='outputs';",
    "rest_rpc": {
      "insert_analysis_from_payload": {"status": ${WRITE_STATUS:-0}, "body": ${WRITE_BODY_JSON:-"\"missing or not executed\""}},
      "get_dashboard_summary": {"status": ${SUMMARY_STATUS:-0}, "body": ${SUMMARY_BODY_JSON:-"\"missing or not executed\""}},
      "get_latest_analyses": {"status": ${LATEST_STATUS:-0}, "body": ${LATEST_BODY_JSON:-"\"missing or not executed\""}}
    }
  },
  "warnings": [
    "Ensure SUPABASE_SERVICE_KEY is never embedded in client code.",
    "Validate anon key limitations for your frontend use cases."
  ],
  "env_mapping": {
    "backend": ["SUPABASE_URL","SUPABASE_SERVICE_KEY","JWT_SECRET","COATVISION_CORS_ORIGINS"],
    "frontend": ["VITE_BACKEND_URL","VITE_COATVISION_USE_REMOTE","VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY"],
    "mobile": ["EXPO_PUBLIC_COATVISION_API_BASE_URL","EXPO_PUBLIC_COATVISION_USE_REMOTE"]
  },
  "next_steps": [
    "If REST RPC write succeeded, remove the verification record (res_verify) if desired via service role.",
    "Set environment variables on Render/Vercel/Expo and redeploy services.",
    "Backend can now call insert_analysis_from_payload using service role to write analyses."
  ],
  "timestamp": "$ts"
}
EOF
}

# Prepare temp files
tmpdir="$(mktemp -d)" || tmpdir="."

# Helper to run curl and capture status + body without leaking secrets
function run_curl() {
  local method="$1"
  local url="$2"
  shift 2
  local status_var="$1"; shift
  local body_var="$1"; shift

  local body_file="$tmpdir/body_$(date +%s%N).json"
  local http_code
  http_code=$(curl -s -X "$method" "$url" "$@" -w '\n%{http_code}' | tee "$body_file" | tail -n1 || true)
  # Extract body without the last status line
  # The previous tee wrote both body and code; we read file sans last line
  local body
  body=$(head -n -1 "$body_file" | tr -d '\r' )
  # Ensure JSON string by wrapping if not already JSON
  if [[ "$body" =~ ^\{.*\}$ || "$body" =~ ^\[.*\]$ ]]; then
    eval "$body_var=\"\$body\""
  else
    # Escape quotes for JSON string
    body=${body//"/\"}
    eval "$body_var=\"\"\"$body\"\"\""
  fi
  eval "$status_var=\"$http_code\""
}

# Perform REST RPC verifications when envs are present
WRITE_STATUS=0; SUMMARY_STATUS=0; LATEST_STATUS=0
WRITE_BODY_JSON="\"env missing\""; SUMMARY_BODY_JSON="\"env missing\""; LATEST_BODY_JSON="\"env missing\""

if [[ -n "$SUPABASE_URL" ]]; then
  # a) Write test via service role
  if [[ -n "$SUPABASE_SERVICE_KEY" ]]; then
    run_curl POST "$SUPABASE_URL/rest/v1/rpc/insert_analysis_from_payload" WRITE_STATUS WRITE_BODY_JSON \
      -H "apikey: $SUPABASE_SERVICE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
      -H "Content-Type: application/json" \
      --data '{"payload":{"id":"res_verify","mode":"test","createdAt":"2025-12-31T00:00:00Z","result":{"cvi":1.1,"cqi":2.2},"request":{"note":"verify"}}}'
  else
    WRITE_BODY_JSON="\"SUPABASE_SERVICE_KEY not set\""
  fi

  # b) Summary via anon
  if [[ -n "$SUPABASE_ANON_KEY" ]]; then
    run_curl POST "$SUPABASE_URL/rest/v1/rpc/get_dashboard_summary" SUMMARY_STATUS SUMMARY_BODY_JSON \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      --data '{}'

    # c) Latest via anon
    run_curl POST "$SUPABASE_URL/rest/v1/rpc/get_latest_analyses" LATEST_STATUS LATEST_BODY_JSON \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      --data '{"p_limit":5}'
  else
    SUMMARY_BODY_JSON="\"SUPABASE_ANON_KEY not set\""
    LATEST_BODY_JSON="\"SUPABASE_ANON_KEY not set\""
  fi
else
  WRITE_BODY_JSON="\"SUPABASE_URL not set\""
  SUMMARY_BODY_JSON="\"SUPABASE_URL not set\""
  LATEST_BODY_JSON="\"SUPABASE_URL not set\""
fi

# Write JSON report
write_json

echo "Verification written to $out_json"