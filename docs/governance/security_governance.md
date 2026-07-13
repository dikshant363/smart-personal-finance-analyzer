# Security Governance Policy

## 1. Secrets Management
- All keys, tokens, and database URIs must be loaded through environment variables.
- Under no circumstances should raw secrets be committed to source code repositories.

## 2. Dependency Scans
- Pre-receive hooks run vulnerability audits.
- Direct upgrades of dependencies require confirmation from security review channels.

## 3. Incident Response Process
- **Detection**: Automated telemetry alerts on API usage spikes.
- **Triage**: Containment via token revocation or service isolation within 30 minutes.
- **Resolution**: Post-mortem report published to security logs.
