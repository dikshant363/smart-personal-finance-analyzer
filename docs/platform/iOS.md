# iOS Native Platform Shell
# Platform Guide

## Overview
The iOS application is built as a native SwiftUI presentation shell, consuming Next.js backend API services.

## Architecture
- **Framework**: SwiftUI (Swift 5)
- **Networking**: URLSession + JSONDecoder
- **Secure Token Storage**: Apple Keychain Services wrappers
- **Design Alignment**: Human Interface Guidelines (HIG) standards

## Configuration
All formatters within the SwiftUI application format double parameters as Indian Rupees (`INR`, `₹`) using standard Swift `NumberFormatter` logic.
