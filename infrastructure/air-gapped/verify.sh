#!/usr/bin/env bash
set -e

BUNDLE_FILE="${1:-eduflow-airgapped-bundle-v1.0.tar.gz}"
CHECKSUM_FILE="${BUNDLE_FILE}.sha256"

echo "=========================================================="
echo "    EduFlow AI OS — Air-Gapped Integrity Verifier       "
echo "=========================================================="

if [ ! -f "$BUNDLE_FILE" ]; then
  echo "ERROR: Bundle archive '$BUNDLE_FILE' not found!"
  exit 1
fi

if [ ! -f "$CHECKSUM_FILE" ]; then
  echo "WARNING: Checksum file '$CHECKSUM_FILE' not found. Generating current SHA-256:"
  sha256sum "$BUNDLE_FILE"
  exit 0
fi

echo "Verifying SHA-256 cryptographic signature..."
if sha256sum -c "$CHECKSUM_FILE"; then
  echo "SUCCESS: Checksum matches! Bundle is authentic and untampered."
  exit 0
else
  echo "CRITICAL SECURITY WARNING: Checksum verification FAILED!"
  echo "The bundle may have been corrupted or modified in transit."
  exit 2
fi
