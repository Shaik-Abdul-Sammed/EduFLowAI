# EduFlow AI OS — Automated Backup & Disaster Recovery Guide

## 1. Automated Cron Scheduling
To automate daily database backups at 03:00 AM (server local time):

```bash
# Open crontab editor
crontab -e

# Add the following entry (adjust path to your backend directory):
0 3 * * * cd /home/rgukt/Github/SriSudha/eduflow-backend && /usr/bin/node scripts/backup.js >> /var/log/eduflow-backup.log 2>&1
```

### Verification
Check the cron log after execution:
```bash
cat /var/log/eduflow-backup.log
ls -lh /home/rgukt/Github/SriSudha/eduflow-backend/backups/
```

---

## 2. Docker Sidecar Container Setup
For containerized deployments using Docker Compose or Kubernetes, schedule backups via a dedicated sidecar container.

### `docker-compose.yml` snippet:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-eduflow}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backup-sidecar:
    image: node:20-alpine
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./eduflow-backend:/app
      - ./backups:/app/backups
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD}@db:5432/${DB_NAME:-eduflow}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BACKUP_BUCKET=${AWS_S3_BACKUP_BUCKET}
    entrypoint: >
      sh -c '
        echo "0 3 * * * cd /app && node scripts/backup.js >> /var/log/cron.log 2>&1" > /etc/crontabs/root
        crond -f -l 2
      '
```

---

## 3. Testing the Restore Process Safely
> [!CAUTION]
> NEVER test database restoration directly against the production database. Always verify backups against a staging or ephemeral test database.

### Step-by-Step Staging Verification:
1. Spin up a temporary test database:
   ```bash
   createdb -h localhost -U postgres eduflow_test_restore
   ```
2. Run restore pointing to the staging DB:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/eduflow_test_restore" node scripts/restore.js backup-2026-09-20-161245.sql.gz
   ```
3. Type `YES` when prompted:
   ```text
   This will OVERWRITE the current database. Type YES to confirm: YES
   ```
4. Verify database tables and rows in staging:
   ```bash
   psql "postgresql://postgres:password@localhost:5432/eduflow_test_restore" -c "\dt"
   psql "postgresql://postgres:password@localhost:5432/eduflow_test_restore" -c "SELECT count(*) FROM users;"
   ```
5. Drop the temporary database after verification:
   ```bash
   dropdb -h localhost -U postgres eduflow_test_restore
   ```

---

## 4. Troubleshooting Backup Failures
If `scripts/backup.js` exits with code 1 or fails:

1. **Inspect Structured Logs**:
   ```bash
   tail -n 100 eduflow-backend/backups/backups-manifest.json
   ```
2. **Check PostgreSQL Connectivity**:
   Ensure `DATABASE_URL` in `.env` is reachable:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```
3. **Check Disk Space**:
   Ensure the host or volume has adequate space for the gzip stream:
   ```bash
   df -h /home/rgukt/Github/SriSudha/eduflow-backend/backups/
   ```
4. **Permissions Check**:
   Ensure the Node process has read/write access to `eduflow-backend/backups/`:
   ```bash
   chmod 755 eduflow-backend/backups
   ```

---

## 5. Recommended AWS S3 Bucket Policy
For cloud offsite storage, configure your AWS S3 bucket with:

### A. Lifecycle Rules
- **Transition to Standard-IA**: After 30 days.
- **Transition to Glacier Flexible Retrieval**: After 90 days.
- **Expiration**: Permanently delete daily backups older than 365 days.

### B. Bucket Encryption & Versioning
- Enable **Default AES-256 (SSE-S3)** or **AWS KMS (SSE-KMS)** encryption.
- Enable **S3 Versioning** and **Object Lock (WORM)** to prevent accidental deletion or ransomware modification.

### C. Minimal IAM Policy for Backup Service:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EduFlowBackupPutAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::eduflow-institution-backups",
        "arn:aws:s3:::eduflow-institution-backups/*"
      ]
    }
  ]
}
```
