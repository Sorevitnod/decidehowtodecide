#!/usr/bin/env bash
# Publish decidehowtodecide.org: mirror site/ to S3, then invalidate CloudFront.
# Requires an active AWS SSO session on the 091844124359 account:  aws sso login
# Only files under site/ are deployed; docs/, tests/ and this script never are.
set -euo pipefail

BUCKET="decidehowtodecide"
DISTRIBUTION_ID="E1CJLNAOY573D"

# --delete keeps the bucket an exact mirror of site/ (removes stale objects).
# --exclude ".DS_Store" stops macOS Finder cruft reaching S3.
aws s3 sync site/ "s3://${BUCKET}/" --delete --exclude ".DS_Store"

aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"

echo "Deployed site/ to s3://${BUCKET}/ and invalidated CloudFront ${DISTRIBUTION_ID}."
