package com.smartfinance.analyzer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.smartfinance.analyzer.ui.viewmodel.DashboardViewModel

/**
 * Dashboard Screen — Sprint 11.3: Android Native Experience Platform
 * Material Design 3 with adaptive layouts.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            LargeTopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Good morning 👋",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Dashboard",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize().padding(paddingValues),
                contentAlignment = Alignment.Center
            ) { CircularProgressIndicator() }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Net Worth Card
                item {
                    NetWorthCard(
                        netWorth = uiState.netWorth,
                        monthlyChange = uiState.monthlyChange
                    )
                }

                // Quick Stats Row
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        QuickStatCard(
                            modifier = Modifier.weight(1f),
                            label = "Income",
                            value = uiState.monthlyIncome,
                            isPositive = true
                        )
                        QuickStatCard(
                            modifier = Modifier.weight(1f),
                            label = "Expenses",
                            value = uiState.monthlyExpenses,
                            isPositive = false
                        )
                    }
                }

                // Recent Transactions Header
                item {
                    Text(
                        text = "Recent Transactions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(uiState.recentTransactions.take(5)) { tx ->
                    TransactionListItem(transaction = tx)
                }
            }
        }
    }
}

@Composable
private fun NetWorthCard(netWorth: Double, monthlyChange: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Net Worth",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
            )
            Text(
                text = formatCurrency(netWorth),
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            val changeColor = if (monthlyChange >= 0)
                Color(0xFF22C55E) else Color(0xFFEF4444)
            val changeSign = if (monthlyChange >= 0) "+" else ""
            Text(
                text = "${changeSign}${formatCurrency(monthlyChange)} this month",
                style = MaterialTheme.typography.bodyMedium,
                color = changeColor
            )
        }
    }
}

@Composable
private fun QuickStatCard(
    modifier: Modifier = Modifier,
    label: String,
    value: Double,
    isPositive: Boolean
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
                formatCurrency(value),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = if (isPositive) Color(0xFF22C55E) else MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
private fun TransactionListItem(transaction: com.smartfinance.analyzer.domain.model.Transaction) {
    ListItem(
        headlineContent = { Text(transaction.description, fontWeight = FontWeight.Medium) },
        supportingContent = { Text(transaction.date.take(10)) },
        trailingContent = {
            val isExpense = transaction.type == com.smartfinance.analyzer.domain.model.TransactionType.Expense
            Text(
                text = "${if (isExpense) "-" else "+"}${formatCurrency(transaction.amount)}",
                color = if (isExpense) MaterialTheme.colorScheme.error else Color(0xFF22C55E),
                fontWeight = FontWeight.SemiBold
            )
        }
    )
}

private fun formatCurrency(amount: Double): String {
    return "$${String.format("%.2f", amount)}"
}
