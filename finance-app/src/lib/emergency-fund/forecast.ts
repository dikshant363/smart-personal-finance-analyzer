export interface ForecastPoint {
  monthName: string;
  projectedReserve: number;
  projectedCoverageMonths: number;
}

export function generateEmergencyForecast(params: {
  currentReserve: number;
  essentialExpenses: number;
  monthlyContribution: number;
  targetMonths: number;
  monthsAhead?: number;
}): ForecastPoint[] {
  const { currentReserve, essentialExpenses, monthlyContribution, targetMonths, monthsAhead = 12 } = params;
  const points: ForecastPoint[] = [];

  const now = new Date();
  const targetAmount = essentialExpenses * targetMonths;

  for (let i = 0; i <= monthsAhead; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = forecastDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    // Growth capped at target if needed, but in real life emergency funds can grow beyond targets. Let's let it grow!
    const projectedReserve = currentReserve + (monthlyContribution * i);
    const projectedCoverageMonths = essentialExpenses > 0 ? projectedReserve / essentialExpenses : 0;

    points.push({
      monthName,
      projectedReserve: Math.round(projectedReserve * 100) / 100,
      projectedCoverageMonths: Math.round(projectedCoverageMonths * 100) / 100,
    });
  }

  return points;
}
