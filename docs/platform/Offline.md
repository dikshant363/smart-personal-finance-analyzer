# Offline Sync & Storage Engine
# Platform Guide

## Overview
The application handles offline scenarios by placing transaction commands into a persistent local database Action Queue (indexedDB/Room/Key-Value) and synchronizing with the main PostgreSQL instance once connectivity is restored.

## Key Subcomponents
- **Action Queue**: Persists transactions during offline states.
- **Sync Engine**: Coordinates push/pull sequences to the Next.js API client.
- **Conflict Resolution**: Resolves transaction timestamps in descending sequence.
