# Sprint 11.8 — Global Release Engineering & Launch Platform
# Store Readiness Guide

This guide maps out packaging, distribution, and signing configurations required for deploying Smart Personal Finance Analyzer packages to various app stores.

---

## 1. Google Play Store Readiness (Android)

### Package Details
- **Application ID**: `com.smartfinance.analyzer`
- **Minimum SDK**: 26 (Android 8.0)
- **Target SDK**: 35 (Android 15)

### Signing Configuration
1. Generate an upload keystore file using `keytool`:
   ```bash
   keytool -genkey -v -keystore smartfinance-upload-key.peckeys -alias smartfinance-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Configure references inside `apps/android/app/build.gradle.kts` release signing configurations. Do not check passwords in cleartext; reference env variables.

### Assets Requirements
- High-res app icon (512x512 PNG, 32-bit color)
- Feature graphic (1024x500 JPG/PNG)
- Tablet & Phone screenshots showing Dashboard and Transactions flows

---

## 2. Apple App Store Readiness (iOS/iPadOS)

### Package Details
- **Bundle Identifier**: `com.smartfinance.analyzer`
- **Target OS**: iOS 17.0+ / iPadOS 17.0+
- **Architectures**: arm64 (Simulator supports x86_64 / arm64)

### Signing Configuration
- Access developer.apple.com to generate an **iOS Distribution Certificate**.
- Create an explicit App ID with **Push Notifications** and **Keychain Sharing** capabilities enabled.
- Generate an App Store Provisioning Profile mapping the certificate.

### Privacy Manifest (PrivacyInfo.xcprivacy)
Provide declarations for:
- Keychain usage (`NSPrivacyAccessedAPICategoryFileTimestamp`)
- Network connectivity tracking

---

## 3. Microsoft & macOS Desktop Readiness (Tauri 2)

### Windows Distribution
- Package format: MSI (via WiX Toolset) or NSIS installer.
- Requires Code Signing Certificate to prevent SmartScreen warnings.

### macOS Distribution
- Package format: DMG or Apple App Store package.
- Executables must be compiled, signed, and submitted to Apple's notary service using `xcrun notarytool`.
