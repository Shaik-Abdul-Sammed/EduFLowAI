#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   EduFlow AI OS — Air-Gapped Bundle Creator Utility      "
echo "=========================================================="

BUNDLE_DIR="eduflow-bundle"
OUTPUT_TAR="eduflow-airgapped-bundle-v1.0.tar.gz"

rm -rf "$BUNDLE_DIR" "$OUTPUT_TAR"
mkdir -p "$BUNDLE_DIR/images" "$BUNDLE_DIR/config" "$BUNDLE_DIR/models"

echo "[1/4] Pulling and packaging required Docker images..."
IMAGES=(
  "postgres:16-alpine"
  "nginx:alpine"
  "ollama/ollama:latest"
)

for img in "${IMAGES[@]}"; do
  echo "Pulling $img..."
  docker pull "$img"
done

echo "Saving container images into tar archive..."
docker save "${IMAGES[@]}" -o "$BUNDLE_DIR/images/base-images.tar"

echo "[2/4] Copying deployment configs, migrations, and scripts..."
cp -r ../on-premise/docker-compose.onprem.yml "$BUNDLE_DIR/config/"
cp -r ../on-premise/.env.onprem.example "$BUNDLE_DIR/config/.env.example"
cp -r ../on-premise/nginx "$BUNDLE_DIR/config/"
cp -r ../on-premise/health-check.sh "$BUNDLE_DIR/"
cp -r ../../eduflow-backend/src/db/migrations "$BUNDLE_DIR/config/migrations"

echo "[3/4] Creating offline installation runner..."
cat << 'EOF' > "$BUNDLE_DIR/install-airgapped.sh"
#!/usr/bin/env bash
set -e
echo "Loading pre-packaged Docker images into local Docker daemon..."
docker load -i images/base-images.tar

if [ ! -f config/.env ]; then
  cp config/.env.example config/.env
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" config/.env
  sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$(openssl rand -hex 32)/" config/.env
fi

echo "Launching EduFlow AI OS Air-Gapped Stack..."
docker compose -f config/docker-compose.onprem.yml up -d
echo "Stack started successfully."
EOF
chmod +x "$BUNDLE_DIR/install-airgapped.sh"

echo "[4/4] Compressing air-gapped bundle and generating SHA-256 checksum..."
tar -czvf "$OUTPUT_TAR" "$BUNDLE_DIR"
sha256sum "$OUTPUT_TAR" > "${OUTPUT_TAR}.sha256"

rm -rf "$BUNDLE_DIR"

echo "=========================================================="
echo " Air-Gapped Bundle Created: ${OUTPUT_TAR}                "
echo " Checksum File:             ${OUTPUT_TAR}.sha256         "
echo " Size:                      $(du -h ${OUTPUT_TAR} | cut -f1) "
echo "=========================================================="
