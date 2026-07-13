# Release Management Policy

## 1. Release Cadence
- **Hotfixes**: Deployed immediately upon regression test verification.
- **Minor Releases**: Every 2 weeks, containing non-breaking features.
- **Major Releases**: Every 6 months, coordinating migration updates.

## 2. Support & Maintenance
- **Active Support**: Current major version receives active bug fixes and performance improvements.
- **LTS (Long Term Support)**: Legacy major versions receive security patches for 12 months post-successor release.

## 3. Rollback Policy
- **Database Migrations**: Every schema update must include a fully tested down-migration script.
- **Deployment Rollback**: Continuous Delivery pipeline triggers automatic rollback if health check failures occur within 5 minutes of deploy.
