# Operations & Runbook Guide

## 1. Monitoring & Health Checks
- Telemetry endpoint: `/api/health`
- Check variables: DB connection status, Redis sync, storage mounts.

## 2. Backup Execution
- Commands: `pg_dump -U postgres finance > backup_$(date +%F).sql`
- S3 upload: `aws s3 cp backup_$(date +%F).sql s3://finance-backups/`

## 3. Database Migration Procedures
- Step 1: Suspend automated workflow jobs.
- Step 2: Trigger db backup snapshot.
- Step 3: Execute `npx prisma migrate deploy`.
- Step 4: Resume workflow engine.
