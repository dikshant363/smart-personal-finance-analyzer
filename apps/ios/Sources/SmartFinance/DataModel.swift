import Foundation

/**
 * Canonical Data Models for Apple Clients
 * Sprint 11.4 — Mirrors the shared-types package contracts.
 */

public struct UserDTO: Codable, Identifiable {
    public let id: String
    public let email: String
    public let name: String?
}

public enum TransactionType: String, Codable {
    case income = "Income"
    case expense = "Expense"
}

public enum TransactionSource: String, Codable {
    case manual = "Manual"
    case importFlow = "Import"
    case bankSync = "BankSync"
    case recurring = "Recurring"
}

public struct TransactionDTO: Codable, Identifiable {
    public let id: String
    public let userId: String
    public let amount: Double
    public let currency: String
    public let type: TransactionType
    public let description: String
    public let date: String
    public let categoryId: String?
    public let categoryName: String?
    public let source: TransactionSource
    public let createdAt: String
    public let updatedAt: String
}

public struct BudgetDTO: Codable, Identifiable {
    public let id: String
    public let userId: String
    public let name: String
    public let amount: Double
    public let spent: Double
    public let period: String
    public let categoryId: String?
    public let startDate: String
}

public struct GoalDTO: Codable, Identifiable {
    public let id: String
    public let userId: String
    public let name: String
    public let targetAmount: Double
    public let currentAmount: Double
    public let deadline: String?
    public let category: String
    public let status: String
}
