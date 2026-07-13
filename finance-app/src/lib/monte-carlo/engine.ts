export interface MonteCarloConfig {
  simulationsCount: number;
  seed: number;
  years: number;
  initialValue: number;
  annualContribution: number;
  expectedReturn: number;    // e.g. 0.07 (7%)
  expectedVolatility: number; // e.g. 0.15 (15%)
  inflationRate: number;      // e.g. 0.03 (3%)
  goalTarget: number;
}

export interface MonteCarloResults {
  years: number[];
  p10: number[]; // 10th percentile (conservative / worst case)
  p50: number[]; // 50th percentile (median)
  p90: number[]; // 90th percentile (optimistic / best case)
  goalProbability: number;
}

export interface SensitivityImpact {
  scenarioName: string;
  finalValue: number;
}

// Seedable PRNG (Mulberry32)
export function createPRNG(seed: number): () => number {
  let h = seed;
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (((h ^= h >>> 16) >>> 0) / 4294967296);
  };
}

// Box-Muller Transform for standard normal distribution samples
export function randomNormal(prng: () => number, mean: number, stddev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = prng(); // Converting [0,1) to (0,1)
  while(v === 0) v = prng();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stddev + mean;
}

// 1. Monte Carlo Engine
export function runMonteCarlo(config: MonteCarloConfig): MonteCarloResults {
  const prng = createPRNG(config.seed);
  const yearsArray = Array.from({ length: config.years }, (_, i) => i + 1);

  // Store final year values to calculate percentiles
  const paths: number[][] = Array.from({ length: config.simulationsCount }, () => []);

  let successfulSimsCount = 0;

  for (let sim = 0; sim < config.simulationsCount; sim++) {
    let currentVal = config.initialValue;

    for (let year = 1; year <= config.years; year++) {
      // Sample return from normal distribution
      const annualReturn = randomNormal(prng, config.expectedReturn, config.expectedVolatility);
      
      // Calculate growth and contribution (adjusted for inflation rate drag)
      const inflationDrag = 1 + config.inflationRate;
      currentVal = (currentVal * (1 + annualReturn) + config.annualContribution) / inflationDrag;
      paths[sim].push(Math.round(currentVal));
    }

    if (currentVal >= config.goalTarget) {
      successfulSimsCount++;
    }
  }

  // Extract percentiles for each year
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  for (let yearIdx = 0; yearIdx < config.years; yearIdx++) {
    const yearValues = paths.map((p) => p[yearIdx]).sort((a, b) => a - b);
    
    const idx10 = Math.floor(config.simulationsCount * 0.1);
    const idx50 = Math.floor(config.simulationsCount * 0.5);
    const idx90 = Math.floor(config.simulationsCount * 0.9);

    p10.push(yearValues[idx10]);
    p50.push(yearValues[idx50]);
    p90.push(yearValues[idx90]);
  }

  const goalProbability = Math.round((successfulSimsCount / config.simulationsCount) * 100);

  return {
    years: yearsArray,
    p10,
    p50,
    p90,
    goalProbability,
  };
}

// 2. Sensitivity Analysis Engine
export function runSensitivityAnalysis(
  baseConfig: MonteCarloConfig
): SensitivityImpact[] {
  const baseValue = runMonteCarlo(baseConfig).p50[baseConfig.years - 1];

  const sensitivityScenarios = [
    { name: "Inflation +1%", config: { ...baseConfig, inflationRate: baseConfig.inflationRate + 0.01 } },
    { name: "Inflation -1%", config: { ...baseConfig, inflationRate: Math.max(0, baseConfig.inflationRate - 0.01) } },
    { name: "Expected Return +2%", config: { ...baseConfig, expectedReturn: baseConfig.expectedReturn + 0.02 } },
    { name: "Expected Return -2%", config: { ...baseConfig, expectedReturn: baseConfig.expectedReturn - 0.02 } },
    { name: "Savings Rate +10%", config: { ...baseConfig, annualContribution: baseConfig.annualContribution * 1.10 } },
  ];

  return sensitivityScenarios.map((scen) => {
    const finalVal = runMonteCarlo(scen.config).p50[baseConfig.years - 1];
    return {
      scenarioName: scen.name,
      finalValue: Math.round(finalVal),
    };
  });
}
