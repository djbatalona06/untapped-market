#!/usr/bin/env bash
# One-time Cloudflare Pages provisioning for Untapped Market.
#
# Run this LOCALLY (this repo's CI environment can't reach the Cloudflare API).
# It creates the Pages project that .github/workflows/deploy.yml publishes to.
#
# Usage:
#   export CLOUDFLARE_ACCOUNT_ID=d0b5c55ddfb4d7252d798134db52848f
#   export CLOUDFLARE_API_TOKEN=********           # a Pages:Edit token (then ROTATE it)
#   bash scripts/setup/provision-cloudflare.sh
#
# After it succeeds, add the same two values as GitHub repo secrets:
#   gh secret set CLOUDFLARE_ACCOUNT_ID  --body "$CLOUDFLARE_ACCOUNT_ID"
#   gh secret set CLOUDFLARE_API_TOKEN   --body "$CLOUDFLARE_API_TOKEN"
set -euo pipefail

: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
PROJECT="${PAGES_PROJECT:-untapped-market}"
API="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects"

echo "→ Verifying token…"
curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  https://api.cloudflare.com/client/v4/user/tokens/verify >/dev/null && echo "  token OK"

echo "→ Checking for existing Pages project '${PROJECT}'…"
if curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "${API}/${PROJECT}" >/dev/null 2>&1; then
  echo "  project already exists — nothing to do."
else
  echo "→ Creating Pages project '${PROJECT}' (production branch: main)…"
  curl -fsS -X POST "${API}" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${PROJECT}\",\"production_branch\":\"main\"}" >/dev/null
  echo "  created."
fi

echo
echo "✓ Done. Next:"
echo "  1) Add repo secrets CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (see header)."
echo "  2) Merge to main — deploy.yml will publish to https://${PROJECT}.pages.dev"
echo "  3) ROTATE the API token you used here (it was handled outside CI)."
