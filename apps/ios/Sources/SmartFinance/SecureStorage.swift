import Foundation
import KeychainSwift

/**
 * Secure Storage wrapper using KeychainSwift.
 * Sprint 11.4 — Securely saves auth credentials via Apple Keychain services.
 */
public class SecureStorage {
    public static let shared = SecureStorage()
    private let keychain = KeychainSwift()

    private init() {}

    public func saveAccessToken(_ token: String) {
        keychain.set(token, forKey: "access_token")
    }

    public func getAccessToken() -> String? {
        return keychain.get("access_token")
    }

    public func saveRefreshToken(_ token: String) {
        keychain.set(token, forKey: "refresh_token")
    }

    public func getRefreshToken() -> String? {
        return keychain.get("refresh_token")
    }

    public func clearTokens() {
        keychain.delete("access_token")
        keychain.delete("refresh_token")
    }
}
