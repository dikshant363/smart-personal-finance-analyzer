import type { ForecastPoint, ForecastScenario } from "./types";

export function applyScenario(base: number, variance: number, scenario: ForecastScenario): number {
  const std = Math.sqrt(Math.max(0, variance));
  if (scenario === "best") {
    return base + std * 1.5;
  }
  if (scenario === "worst") {
    return base - std * 1.5;
  }
  return base;
}

export function generateScenarioPoints(
  basePoints: ForecastPoint[],
  scenario: ForecastScenario,
  variance: number
): ForecastPoint[] {
  return basePoints.map((p) => {
    const adjusted = applyScenario(p.value, variance, scenario);
    const spread = scenario === "expected" ? 0 : Math.sqrt(Math.max(0, variance)) * 0.75;
    return {
      date: p.date,
      value: adjusted,
      lower: spread > 0 ? adjusted - spread : undefined,
      upper: spread > 0 ? adjusted + spread : undefined,
    };
  });
}
