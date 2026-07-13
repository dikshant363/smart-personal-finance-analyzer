package com.smartfinance.analyzer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import com.smartfinance.analyzer.ui.FinanceApp
import com.smartfinance.analyzer.ui.theme.SmartFinanceTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main Activity — Smart Personal Finance Analyzer
 * Sprint 11.3: Android Native Experience Platform
 *
 * Single-activity architecture using Jetpack Compose Navigation.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SmartFinanceTheme(darkTheme = isSystemInDarkTheme()) {
                FinanceApp()
            }
        }
    }
}
