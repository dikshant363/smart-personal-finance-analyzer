export {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  recordDividend,
  getDividends,
  createWatchlistItem,
  getWatchlistItems,
  deleteWatchlistItem,
  calculateInvestmentPerformance,
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculatePortfolioAllocation,
  calculateCurrencyAllocation,
  generateAIInvestmentExplanation,
} from "./engine";

export type {
  InvestmentRecordInput,
  InvestmentPerformance,
  PortfolioMetrics,
  AllocationMetric,
  DividendInput,
  WatchlistInput,
} from "./engine";
