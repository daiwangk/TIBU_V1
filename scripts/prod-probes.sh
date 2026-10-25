#!/usr/bin/env bash
# =====================================================================
# scripts/prod-probes.sh — Read-only production RLS and smoke probes
#
# Usage:
#   SUPABASE_URL=... SUPABASE_ANON_KEY=... SITE_URL=... PRODUCT_ID=... ./scripts/prod-probes.sh
#
# Constraints:
#   - bash + curl only (no jq or external npm dependencies required)
#   - GET-only probes
#   - Anon key only; refuses service-role key
# =====================================================================

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────
# 1. VALIDATE ENVIRONMENT & SAFETY GATE
# ─────────────────────────────────────────────────────────────────────

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
  echo "❌ Error: Missing required env vars." >&2
  echo "Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... [SITE_URL=...] [PRODUCT_ID=...] $0" >&2
  exit 1
fi

# Clean trailing slashes
SUPABASE_URL="${SUPABASE_URL%/}"
SITE_URL="${SITE_URL:-}"
SITE_URL="${SITE_URL%/}"
PRODUCT_ID="${PRODUCT_ID:-}"

# Reject privileged key prefix
if [[ "$SUPABASE_ANON_KEY" == sb_secret_* ]]; then
  echo "❌ Safety Error: SUPABASE_ANON_KEY starts with 'sb_secret_'. Privileged keys are strictly forbidden." >&2
  exit 1
fi

# Decode JWT payload to verify role != service_role
JWT_PAYLOAD=$(echo "$SUPABASE_ANON_KEY" | cut -d. -f2 2>/dev/null || true)
if [ -n "$JWT_PAYLOAD" ]; then
  # Pad base64 string if needed
  REM=$(( ${#JWT_PAYLOAD} % 4 ))
  if [ "$REM" -eq 2 ]; then
    JWT_PAYLOAD="${JWT_PAYLOAD}=="
  elif [ "$REM" -eq 3 ]; then
    JWT_PAYLOAD="${JWT_PAYLOAD}="
  fi

  DECODED_JSON=$(echo "$JWT_PAYLOAD" | tr '_-' '/+' | base64 -d 2>/dev/null || true)
  if echo "$DECODED_JSON" | grep -Eq '"role"[[:space:]]*:[[:space:]]*"service_role"'; then
    echo "❌ Safety Error: SUPABASE_ANON_KEY decodes to role='service_role'. Privileged keys are strictly forbidden." >&2
    exit 1
  fi
fi

echo "================================================================="
echo "🔍 Tibu Production Probes"
echo "Target Supabase URL: $SUPABASE_URL"
if [ -n "$SITE_URL" ]; then
  echo "Target Site URL:     $SITE_URL"
fi
echo "================================================================="

FAIL_COUNT=0

# ─────────────────────────────────────────────────────────────────────
# 2. RUNBOOK §5 GET-ONLY RLS PROBES
# ─────────────────────────────────────────────────────────────────────

echo ""
echo "--- 1. RLS Privacy Probes (Runbook §5) ---"

probe_rls_blocked() {
  local label="$1"
  local path="$2"

  local response
  local http_code
  local body

  response=$(curl -s -w "\n%{http_code}" \
    "$SUPABASE_URL/rest/v1/$path" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  # Body is empty array "[]" OR permission error (HTTP 401/403 or code 42501/PGRST...)
  # Must never return data rows (e.g. non-empty array "[{...}]")
  local clean_body
  clean_body=$(echo "$body" | tr -d '[:space:]')

  if [ "$clean_body" = "[]" ] || [ "$http_code" = "401" ] || [ "$http_code" = "403" ] || [[ "$clean_body" == *"\"code\":"* && "$clean_body" != *"\"id\":"* ]]; then
    echo "  ✅ PASS: $label (status $http_code, no data leaked)"
  else
    echo "  ❌ FAIL: $label returned unexpected content (HTTP $http_code): $body"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

probe_rls_blocked "business_contacts (hidden phone/contacts)" "business_contacts?select=*"
probe_rls_blocked "businesses status=neq.approved (draft/pending/rejected)" "businesses?select=id,status&status=neq.approved"
probe_rls_blocked "admin_actions (audit log)" "admin_actions?select=*"
probe_rls_blocked "contact_events (reveal events)" "contact_events?select=*"

# Public read check: categories limit=3 must return 3 items
echo ""
echo "--- 2. Public Read Check (categories?limit=3) ---"
CAT_RESP=$(curl -s -w "\n%{http_code}" \
  "$SUPABASE_URL/rest/v1/categories?select=slug&limit=3" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

CAT_CODE=$(echo "$CAT_RESP" | tail -n1)
CAT_BODY=$(echo "$CAT_RESP" | sed '$d')
CAT_COUNT=$(echo "$CAT_BODY" | grep -o '"slug"' | wc -l | tr -d ' ')

if [ "$CAT_CODE" = "200" ] && [ "$CAT_COUNT" -eq 3 ]; then
  echo "  ✅ PASS: categories?limit=3 returned 3 rows"
else
  echo "  ❌ FAIL: categories?limit=3 returned HTTP $CAT_CODE, row count $CAT_COUNT (expected 3)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ─────────────────────────────────────────────────────────────────────
# 3. CATEGORIES TAXONOMY COVERAGE (CONTRACT §2)
# ─────────────────────────────────────────────────────────────────────

echo ""
echo "--- 3. Categories Taxonomy Coverage (CONTRACT §2) ---"

ALL_CATS_RESP=$(curl -s -w "\n%{http_code}" \
  "$SUPABASE_URL/rest/v1/categories?select=slug" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

ALL_CATS_CODE=$(echo "$ALL_CATS_RESP" | tail -n1)
ALL_CATS_BODY=$(echo "$ALL_CATS_RESP" | sed '$d')

if [ "$ALL_CATS_CODE" != "200" ]; then
  echo "  ❌ FAIL: Failed to query categories (HTTP $ALL_CATS_CODE): $ALL_CATS_BODY"
  FAIL_COUNT=$((FAIL_COUNT + 1))
else
  EXPECTED_SLUGS=(
    "desserts"
    "food"
    "handmade"
    "crochet"
    "embroidery"
    "resin-art"
    "candles"
    "fashion"
    "womens-fashion"
    "mens-fashion"
    "jewellery"
    "gifts"
  )

  MISSING_SLUGS=()
  for slug in "${EXPECTED_SLUGS[@]}"; do
    if ! echo "$ALL_CATS_BODY" | grep -Fq "\"slug\":\"$slug\""; then
      MISSING_SLUGS+=("$slug")
    fi
  done

  if [ ${#MISSING_SLUGS[@]} -eq 0 ]; then
    echo "  ✅ PASS: All 12 canonical category slugs present in database"
  else
    echo "  ❌ FAIL: Missing category slugs: ${MISSING_SLUGS[*]}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
fi

# ─────────────────────────────────────────────────────────────────────
# 4. SITE & OPEN GRAPH PROBES (WHEN SITE_URL IS SET)
# ─────────────────────────────────────────────────────────────────────

if [ -n "$SITE_URL" ]; then
  echo ""
  echo "--- 4. Site & Open Graph Probes ($SITE_URL) ---"

  # OG WhatsApp user-agent test
  if [ -n "$PRODUCT_ID" ]; then
    OG_RESP=$(curl -s -L -A "WhatsApp/2.23.20" "$SITE_URL/p/$PRODUCT_ID")
    HAS_OG_TITLE=$(echo "$OG_RESP" | grep -Ei 'property=["'"'"']og:title["'"'"']|name=["'"'"']og:title["'"'"']' || true)
    HAS_OG_IMAGE=$(echo "$OG_RESP" | grep -Ei 'property=["'"'"']og:image["'"'"']|name=["'"'"']og:image["'"'"']' || true)

    if [ -n "$HAS_OG_TITLE" ] && [ -n "$HAS_OG_IMAGE" ]; then
      echo "  ✅ PASS: WhatsApp OG tags present for /p/$PRODUCT_ID (og:title and og:image found)"
    else
      echo "  ❌ FAIL: WhatsApp OG tags missing for /p/$PRODUCT_ID"
      [ -z "$HAS_OG_TITLE" ] && echo "    Missing: og:title"
      [ -z "$HAS_OG_IMAGE" ] && echo "    Missing: og:image"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    echo "  ℹ️  NOTICE: PRODUCT_ID unset, skipping WhatsApp OG probe for /p/<id>"
  fi

  # Hard-load /p/anything to check SPA fallback shell
  SPA_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$SITE_URL/p/anything")
  if [ "$SPA_CODE" = "200" ]; then
    echo "  ✅ PASS: Hard load of /p/anything returned HTTP 200 (SPA fallback shell OK)"
  else
    echo "  ❌ FAIL: Hard load of /p/anything returned HTTP $SPA_CODE (expected 200)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
fi

# ─────────────────────────────────────────────────────────────────────
# 5. SUMMARY & EXIT
# ─────────────────────────────────────────────────────────────────────

echo ""
echo "================================================================="
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "🎉 All probes PASSED"
  echo "================================================================="
  exit 0
else
  echo "💥 $FAIL_COUNT probe(s) FAILED"
  echo "================================================================="
  exit 1
fi
