import { describe, it, expect } from "vitest";
import { compileTaxReport, generateAITaxExplanation } from "./engine";

describe("Tax Intelligence & Planning Platform Tests", () => {
  const mockRecords = [
    {
      id: "tx1",
      taxYear: 2026,
      jurisdiction: "US-CA",
      type: "Income",
      category: "Employment Income",
      amount: 85000,
      currency: "USD",
      documentId: "doc_w2",
    },
    {
      id: "tx2",
      taxYear: 2026,
      jurisdiction: "US-CA",
      type: "Expense",
      category: "Business Expenses",
      amount: 5000,
      currency: "USD",
    },
    {
      id: "tx3",
      taxYear: 2026,
      jurisdiction: "US-CA",
      type: "Donation",
      category: "Charitable Donations",
      amount: 1500,
      currency: "USD",
      documentId: "doc_receipt_donation",
    },
  ];

  it("compiles taxable income estimates correctly", () => {
    const report = compileTaxReport(2026, "US-CA", mockRecords);

    expect(report.totalIncome).toBe(85000);
    expect(report.totalExpenses).toBe(5000);
    expect(report.totalDonations).toBe(1500);
    expect(report.netTaxableIncomeEstimate).toBe(78500); // 85000 - 5000 - 1500
  });

  it("evaluates documentation completeness checklists correctly", () => {
    const report = compileTaxReport(2026, "US-CA", mockRecords);

    // Business Expenses doesn't have documentId
    const businessCheck = report.checklist.find((c) => c.category === "Business Expenses");
    expect(businessCheck?.hasDocuments).toBe(false);

    const donationCheck = report.checklist.find((c) => c.category === "Charitable Donations");
    expect(donationCheck?.hasDocuments).toBe(true);
  });

  it("builds user safety disclaimers in AI explanation", () => {
    const report = compileTaxReport(2026, "US-CA", mockRecords);
    const expl = generateAITaxExplanation(report);

    expect(expl).toContain("Taxable Income Approximation");
    expect(expl).toContain("does NOT prepare or submit tax filings");
    expect(expl).toContain("US-CA");
  });
});
