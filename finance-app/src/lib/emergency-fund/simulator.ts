export interface SimulationResult {
  scenario: string;
  cashRemaining: number;
  monthsCovered: number;
  financialRisk: "Critical" | "High" | "Medium" | "Low";
  recoveryTimelineMonths: number | null;
  suggestedActions: string[];
}

export function simulateScenario(
  scenario: string,
  params: {
    currentReserve: number;
    essentialExpenses: number;
    monthlyContribution: number;
    averageMonthlyIncome: number;
    paramValue?: number; // e.g. amount of expense, reduction percentage, or pause months
  }
): SimulationResult {
  const { currentReserve, essentialExpenses, monthlyContribution, averageMonthlyIncome, paramValue = 0 } = params;

  let cashRemaining = currentReserve;
  let monthsCovered = essentialExpenses > 0 ? currentReserve / essentialExpenses : 0;
  let financialRisk: "Critical" | "High" | "Medium" | "Low" = "Low";
  let recoveryTimelineMonths: number | null = null;
  let suggestedActions: string[] = [];

  switch (scenario) {
    case "job_loss": {
      cashRemaining = currentReserve;
      monthsCovered = essentialExpenses > 0 ? currentReserve / essentialExpenses : 0;
      financialRisk = monthsCovered < 3 ? "Critical" : monthsCovered < 6 ? "High" : "Medium";
      recoveryTimelineMonths = 6; // Average search time
      suggestedActions = [
        "Apply for unemployment benefits immediately.",
        "Pause all discretionary budget categories and subscription services.",
        "Update resume and portfolio and start professional networking.",
        "Limit dining out and delivery spending to absolute zero.",
      ];
      break;
    }

    case "medical_emergency": {
      const cost = paramValue > 0 ? paramValue : 2000;
      cashRemaining = Math.max(0, currentReserve - cost);
      monthsCovered = essentialExpenses > 0 ? cashRemaining / essentialExpenses : 0;
      financialRisk = cashRemaining < currentReserve * 0.5 ? "High" : "Medium";
      recoveryTimelineMonths = monthlyContribution > 0 ? cost / monthlyContribution : null;
      suggestedActions = [
        "Request an itemized medical bill and review for double billing errors.",
        "Negotiate an interest-free payment installation plan with the provider.",
        "Verify insurance claim status and appeal any wrongful denials.",
        "Redirect all monthly goal contributions to rebuild this fund.",
      ];
      break;
    }

    case "unexpected_repair": {
      const cost = paramValue > 0 ? paramValue : 1500;
      cashRemaining = Math.max(0, currentReserve - cost);
      monthsCovered = essentialExpenses > 0 ? cashRemaining / essentialExpenses : 0;
      financialRisk = monthsCovered < 2 ? "High" : "Medium";
      recoveryTimelineMonths = monthlyContribution > 0 ? cost / monthlyContribution : null;
      suggestedActions = [
        "Gather quotes from at least three different repair shops/contractors.",
        "Check if repair is covered under home/auto insurance or manufacturer warranties.",
        "Consider using a credit card with 0% introductory APR if timeline to rebuild exceeds 6 months.",
      ];
      break;
    }

    case "income_reduction": {
      const pct = paramValue > 0 ? paramValue : 20; // Default 20% drop
      const newIncome = averageMonthlyIncome * (1 - pct / 100);
      const netSavings = newIncome - essentialExpenses;

      cashRemaining = currentReserve;
      if (netSavings < 0) {
        // Essential expenses exceed new income, drawing down reserve
        const monthlyDeficit = Math.abs(netSavings);
        monthsCovered = monthlyDeficit > 0 ? currentReserve / monthlyDeficit : 0;
        financialRisk = monthsCovered < 6 ? "Critical" : "High";
      } else {
        monthsCovered = essentialExpenses > 0 ? currentReserve / essentialExpenses : 0;
        financialRisk = "Medium";
      }

      recoveryTimelineMonths = null; // continuous state until income restores
      suggestedActions = [
        "Create a strict bare-bones budget prioritizing shelter, utility, and food bills.",
        "Negotiate recurring rates on internet, cellular, and insurance policies.",
        "Explore side-gigs or secondary freelance income sources to cover the deficit.",
      ];
      break;
    }

    case "large_expense": {
      const cost = paramValue > 0 ? paramValue : 3000;
      cashRemaining = Math.max(0, currentReserve - cost);
      monthsCovered = essentialExpenses > 0 ? cashRemaining / essentialExpenses : 0;
      financialRisk = monthsCovered < 3 ? "High" : "Medium";
      recoveryTimelineMonths = monthlyContribution > 0 ? cost / monthlyContribution : null;
      suggestedActions = [
        "Delay the optional purchase until you have separate savings earmarked for it.",
        "Avoid tapping your emergency fund for non-critical discretionary items.",
        "Look for second-hand alternatives or rental options to lower the cost.",
      ];
      break;
    }

    case "income_pause": {
      const months = paramValue > 0 ? paramValue : 3;
      const totalLost = essentialExpenses * months;
      cashRemaining = Math.max(0, currentReserve - totalLost);
      monthsCovered = essentialExpenses > 0 ? cashRemaining / essentialExpenses : 0;
      financialRisk = currentReserve < totalLost ? "Critical" : "High";
      recoveryTimelineMonths = monthlyContribution > 0 ? totalLost / monthlyContribution : null;
      suggestedActions = [
        "Pause all investment contributions and other savings goals.",
        "Build a temporary cash cushion leading up to the scheduled pause.",
        "Secure low-interest bridge financing options before the pause begins.",
      ];
      break;
    }

    default:
      break;
  }

  return {
    scenario,
    cashRemaining: Math.round(cashRemaining * 100) / 100,
    monthsCovered: Math.round(monthsCovered * 100) / 100,
    financialRisk,
    recoveryTimelineMonths: recoveryTimelineMonths !== null ? Math.round(recoveryTimelineMonths * 10) / 10 : null,
    suggestedActions,
  };
}
