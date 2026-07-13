import SwiftUI

/**
 * Dashboard View — iOS client
 * Sprint 11.4: Dynamic typography, cards, and MPEPs styling.
 */
struct DashboardView: View {
    @State private var netWorth: Double = 15450.25
    @State private var monthlyChange: Double = 2364.75
    @State private var monthlyIncome: Double = 2500.0
    @State private var monthlyExpenses: Double = 135.50

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Good morning greeting
                VStack(alignment: .leading, spacing: 4) {
                    Text("Good morning 👋")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("Dashboard")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                }
                .padding(.horizontal)

                // Net Worth Hero Card
                VStack(alignment: .leading, spacing: 12) {
                    Text("Net Worth")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(formatCurrency(netWorth))
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                    
                    let isPositive = monthlyChange >= 0
                    Label(
                        title: { Text("\(isPositive ? "+" : "")\(formatCurrency(monthlyChange)) this month") },
                        icon: { Image(systemName: isPositive ? "arrow.up.right" : "arrow.down.right") }
                    )
                    .font(.subheadline)
                    .foregroundStyle(isPositive ? .green : .red)
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(uiColor: .secondarySystemBackground))
                .cornerRadius(20)
                .padding(.horizontal)

                // Quick statistics row
                HStack(spacing: 16) {
                    // Income
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Income")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(formatCurrency(monthlyIncome))
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundStyle(.green)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .cornerRadius(16)

                    // Expenses
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Expenses")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(formatCurrency(monthlyExpenses))
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundStyle(.red)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .cornerRadius(16)
                }
                .padding(.horizontal)

                // Recent Activity Header
                Text("Recent Activity")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.horizontal)
                    .padding(.top, 10)

                // Quick Transactions List
                VStack(spacing: 0) {
                    TransactionRow(description: "Groceries", date: "2026-07-13", amount: -120.00)
                    Divider().padding(.leading, 56)
                    TransactionRow(description: "Salary Payment", date: "2026-07-01", amount: 2500.00)
                    Divider().padding(.leading, 56)
                    TransactionRow(description: "Coffee", date: "2026-07-12", amount: -15.50)
                }
                .background(Color(uiColor: .secondarySystemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: value)) ?? "$0.00"
    }
}

struct TransactionRow: View {
    let description: String
    let date: String
    let amount: Double

    var body: some View {
        HStack(spacing: 16) {
            Circle()
                .fill(amount >= 0 ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: amount >= 0 ? "arrow.up.right" : "arrow.down.right")
                        .foregroundStyle(amount >= 0 ? .green : .red)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(description)
                    .font(.body)
                    .fontWeight(.medium)
                Text(date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(formatAmount(amount))
                .font(.body)
                .fontWeight(.semibold)
                .foregroundStyle(amount >= 0 ? .green : .primary)
        }
        .padding()
    }

    private func formatAmount(_ val: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: val)) ?? "$0.00"
    }
}
