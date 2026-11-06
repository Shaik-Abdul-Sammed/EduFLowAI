#!/usr/bin/env bash
# ==============================================================================
# EduFlow AI OS - Automated Production Release Keystore Setup for Android
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$MOBILE_DIR/android"
KEY_FILE="$ANDROID_DIR/app/eduflow-release.jks"
PROPERTIES_FILE="$ANDROID_DIR/key.properties"

echo "🔐 Generating production upload keystore for EduFlow Mobile..."

if [ ! -f "$KEY_FILE" ]; then
  keytool -genkey -v \
    -keystore "$KEY_FILE" \
    -alias eduflow \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass eduflow2026 \
    -keypass eduflow2026 \
    -dname "CN=EduFlow AI OS, OU=Engineering, O=EduFlow Technologies, L=Hyderabad, ST=Telangana, C=IN"
  echo "✅ Keystore created: $KEY_FILE"
else
  echo "ℹ️ Keystore already exists at: $KEY_FILE"
fi

cat <<EOF > "$PROPERTIES_FILE"
storePassword=eduflow2026
keyPassword=eduflow2026
keyAlias=eduflow
storeFile=eduflow-release.jks
EOF

echo "✅ key.properties written to: $PROPERTIES_FILE"
echo "🚀 Production release signing is now fully configured for Play Store deployment!"
