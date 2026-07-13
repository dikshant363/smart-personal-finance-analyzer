package com.smartfinance.analyzer.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartfinance.analyzer.domain.model.Transaction
import com.smartfinance.analyzer.domain.model.TransactionType
import com.smartfinance.analyzer.domain.model.TransactionSource
import com.smartfinance.analyzer.domain.model.Budget
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.flow.MutableStateFlow
import kotlinx.flow.StateFlow
import kotlinx.flow.asStateFlow
import kotlinx.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = false,
    val netWorth: Double = 0.0,
    val monthlyChange: Double = 0.0,
    val monthlyIncome: Double = 0.0,
    val monthlyExpenses: Double = 0.0,
    val recentTransactions: List<Transaction> = emptyList()
)

@HiltViewModel
class DashboardViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            // Mock or offline database retrieval representation
            val mockTx = listOf(
                Transaction("1", "u1", 120.0, "INR", TransactionType.Expense, "Groceries", "2026-07-13", "cat1", "Food", TransactionSource.Manual, "2026-07-13", "2026-07-13"),
                Transaction("2", "u1", 2500.0, "INR", TransactionType.Income, "Salary", "2026-07-01", "cat2", "Salary", TransactionSource.BankSync, "2026-07-01", "2026-07-01"),
                Transaction("3", "u1", 15.50, "INR", TransactionType.Expense, "Coffee", "2026-07-12", "cat1", "Food", TransactionSource.Manual, "2026-07-12", "2026-07-12")
            )
            _uiState.update {
                it.copy(
                    isLoading = false,
                    netWorth = 15450.25,
                    monthlyChange = 2364.75,
                    monthlyIncome = 2500.0,
                    monthlyExpenses = 135.50,
                    recentTransactions = mockTx
                )
            }
        }
    }
}

data class TransactionsUiState(
    val isLoading: Boolean = false,
    val transactions: List<Transaction> = emptyList()
)

@HiltViewModel
class TransactionsViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(TransactionsUiState())
    val uiState: StateFlow<TransactionsUiState> = _uiState.asStateFlow()

    init {
        loadTransactions()
    }

    private fun loadTransactions() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val mockTx = listOf(
                Transaction("1", "u1", 120.0, "INR", TransactionType.Expense, "Groceries", "2026-07-13", "cat1", "Food", TransactionSource.Manual, "2026-07-13", "2026-07-13"),
                Transaction("2", "u1", 2500.0, "INR", TransactionType.Income, "Salary", "2026-07-01", "cat2", "Salary", TransactionSource.BankSync, "2026-07-01", "2026-07-01"),
                Transaction("3", "u1", 15.50, "INR", TransactionType.Expense, "Coffee", "2026-07-12", "cat1", "Food", TransactionSource.Manual, "2026-07-12", "2026-07-12")
            )
            _uiState.update {
                it.copy(
                    isLoading = false,
                    transactions = mockTx
                )
            }
        }
    }
}

data class BudgetsUiState(
    val isLoading: Boolean = false,
    val budgets: List<Budget> = emptyList()
)

@HiltViewModel
class BudgetsViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(BudgetsUiState())
    val uiState: StateFlow<BudgetsUiState> = _uiState.asStateFlow()

    init {
        loadBudgets()
    }

    private fun loadBudgets() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            _uiState.update {
                it.copy(
                    isLoading = false,
                    budgets = listOf(
                        Budget("b1", "u1", "Food", 500.0, 135.50, "Monthly", "cat1", "2026-07-01")
                    )
                )
            }
        }
    }
}
