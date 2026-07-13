# Desktop Native Container Shell
# Platform Guide

## Overview
The desktop application is powered by Tauri, loading the Next.js production web build and exposing native OS system capabilities.

## Architecture
- **Framework**: Tauri (Rust backend + webview presentation)
- **Routing**: Points to the Next.js web workspace
- **Build configuration**: Declared in `apps/desktop/tauri.conf.json`
