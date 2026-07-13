# Android Native Platform Shell
# Platform Guide

## Overview
The Android application is built as a native Jetpack Compose presentation shell, consuming Next.js backend API services.

## Architecture
- **Framework**: Jetpack Compose (Material Design 3)
- **Networking**: Retrofit + OkHttp
- **Secure Token Storage**: EncryptedSharedPreferences (Android Keystore integration)
- **Local Cache**: Room Database for offline persistence
- **Biometrics**: Android BiometricPrompt API

## Configuration
Android resources default to:
- Currency: Indian Rupee (`INR`, `₹`)
- Localizations: Standard English-India locale defaults.
