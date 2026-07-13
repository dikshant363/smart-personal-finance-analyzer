package com.smartfinance.analyzer.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.smartfinance.analyzer.ui.screens.*

/**
 * Root Composable — FinanceApp
 * Sprint 11.3: Material Design 3 Navigation with Bottom Bar
 *
 * Implements single-activity architecture with Compose Navigation.
 * All screens reuse data from the shared backend via ViewModels.
 */

sealed class Screen(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Filled.Home)
    object Transactions : Screen("transactions", "Transactions", Icons.Filled.Receipt)
    object Budgets : Screen("budgets", "Budgets", Icons.Filled.DonutSmall)
    object Goals : Screen("goals", "Goals", Icons.Filled.Flag)
    object AICopilot : Screen("ai_copilot", "AI Copilot", Icons.Filled.SmartToy)
}

val bottomNavScreens = listOf(
    Screen.Dashboard,
    Screen.Transactions,
    Screen.Budgets,
    Screen.Goals,
    Screen.AICopilot,
)

@Composable
fun FinanceApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val showBottomBar = bottomNavScreens.any {
        currentDestination?.hierarchy?.any { dest -> dest.route == it.route } == true
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomNavScreens.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.label) },
                            label = { Text(screen.label) },
                            selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) { DashboardScreen(navController) }
            composable(Screen.Transactions.route) { TransactionsScreen(navController) }
            composable(Screen.Budgets.route) { BudgetsScreen(navController) }
            composable(Screen.Goals.route) { GoalsScreen(navController) }
            composable(Screen.AICopilot.route) { AICopilotScreen(navController) }

            // Auth flow
            composable("login") { LoginScreen(navController) }
        }
    }
}
