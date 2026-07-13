import SwiftUI

/**
 * Main Content View — iOS client entry point
 * Sprint 11.4: Apple Human Interface guidelines compliant bottom TabView
 */
struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack {
                DashboardView()
            }
            .tabItem {
                Label("Dashboard", systemImage: "house.fill")
            }

            NavigationStack {
                Text("Transactions List")
                    .navigationTitle("Transactions")
            }
            .tabItem {
                Label("Transactions", systemImage: "doc.text.fill")
            }

            NavigationStack {
                Text("Budgets")
                    .navigationTitle("Budgets")
            }
            .tabItem {
                Label("Budgets", systemImage: "chart.pie.fill")
            }

            NavigationStack {
                Text("AI Copilot Chat")
                    .navigationTitle("Copilot")
            }
            .tabItem {
                Label("Copilot", systemImage: "cpu")
            }
        }
        .tint(.indigo)
    }
}
