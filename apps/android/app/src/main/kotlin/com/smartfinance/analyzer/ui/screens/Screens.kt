package com.smartfinance.analyzer.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.smartfinance.analyzer.domain.model.TransactionType
import com.smartfinance.analyzer.ui.viewmodel.TransactionsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionsScreen(
    navController: NavController,
    viewModel: TransactionsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Transactions", fontWeight = FontWeight.Bold) })
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                icon = { Icon(Icons.Filled.Add, "Add transaction") },
                text = { Text("Add") }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            items(uiState.transactions, key = { it.id }) { tx ->
                ListItem(
                    headlineContent = { Text(tx.description, fontWeight = FontWeight.Medium) },
                    supportingContent = { Text("${tx.date.take(10)} · ${tx.categoryName ?: "Uncategorized"}") },
                    trailingContent = {
                        Text(
                            text = "${if (tx.type == TransactionType.Expense) "-" else "+"}₹${String.format("%.2f", tx.amount)}",
                            color = if (tx.type == TransactionType.Expense)
                                MaterialTheme.colorScheme.error
                            else
                                androidx.compose.ui.graphics.Color(0xFF22C55E),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                )
                HorizontalDivider()
            }
            if (uiState.isLoading) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                        contentAlignment = androidx.compose.ui.Alignment.Center
                    ) { CircularProgressIndicator() }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BudgetsScreen(navController: NavController, viewModel: androidx.lifecycle.ViewModel = hiltViewModel<com.smartfinance.analyzer.ui.viewmodel.BudgetsViewModel>()) {
    Scaffold(topBar = { TopAppBar(title = { Text("Budgets", fontWeight = FontWeight.Bold) }) }) { pad ->
        Box(Modifier.fillMaxSize().padding(pad), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("Budgets coming soon", style = MaterialTheme.typography.bodyLarge)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GoalsScreen(navController: NavController) {
    Scaffold(topBar = { TopAppBar(title = { Text("Goals", fontWeight = FontWeight.Bold) }) }) { pad ->
        Box(Modifier.fillMaxSize().padding(pad), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("Goals coming soon", style = MaterialTheme.typography.bodyLarge)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AICopilotScreen(navController: NavController) {
    Scaffold(topBar = { TopAppBar(title = { Text("AI Copilot", fontWeight = FontWeight.Bold) }) }) { pad ->
        Box(Modifier.fillMaxSize().padding(pad), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("AI Copilot coming soon", style = MaterialTheme.typography.bodyLarge)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Scaffold { pad ->
        Column(
            modifier = Modifier.fillMaxSize().padding(pad).padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
        ) {
            Text("Smart Finance", style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(32.dp))
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("Email") }, modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Password") }, modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(24.dp))
            Button(onClick = { /* login */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Sign In")
            }
        }
    }
}
