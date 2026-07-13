package com.smartfinance.analyzer.domain.model

/**
 * Domain Models — Sprint 11.3 Android Platform
 * Mirrors the shared-types DTOs from the monorepo packages layer.
 */

data class Transaction(
    val id: String,
    val userId: String,
    val amount: Double,
    val currency: String,
    val type: TransactionType,
    val description: String,
    val date: String,
    val categoryId: String?,
    val categoryName: String?,
    val source: TransactionSource,
    val createdAt: String,
    val updatedAt: String,
)

enum class TransactionType { Income, Expense }
enum class TransactionSource { Manual, Import, BankSync, Recurring }

data class Budget(
    val id: String,
    val userId: String,
    val name: String,
    val amount: Double,
    val spent: Double,
    val period: String,
    val categoryId: String?,
    val startDate: String,
) {
    val utilizationPercent: Int get() {
        if (amount == 0.0) return 0
        return minOf(100, ((spent / amount) * 100).toInt())
    }
    val isOverBudget: Boolean get() = spent > amount
}

data class Goal(
    val id: String,
    val userId: String,
    val name: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val deadline: String?,
    val category: String,
    val status: GoalStatus,
) {
    val progressPercent: Int get() {
        if (targetAmount == 0.0) return 0
        return minOf(100, ((currentAmount / targetAmount) * 100).toInt())
    }
}

enum class GoalStatus { Active, Completed, Paused }

data class AuthResponse(
    val ok: Boolean,
    val token: String?,
    val refreshToken: String?,
    val userId: String?,
    val error: String?,
)

data class User(
    val id: String,
    val email: String,
    val name: String?,
)
