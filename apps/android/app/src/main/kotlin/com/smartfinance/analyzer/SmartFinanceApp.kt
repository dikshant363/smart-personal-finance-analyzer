package com.smartfinance.analyzer

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Application class for Smart Personal Finance Analyzer.
 * Sprint 11.3: Android Native Experience Platform
 */
@HiltAndroidApp
class SmartFinanceApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // App-level initialization handled by Hilt + Startup library
    }
}
