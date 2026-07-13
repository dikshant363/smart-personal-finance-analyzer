export {
  createTaxRecord,
  getTaxRecords,
  getTaxRecordById,
  updateTaxRecord,
  deleteTaxRecord,
  compileTaxReport,
  generateAITaxExplanation,
} from "./engine";

export type {
  TaxRecordInput,
  TaxReportSummary,
} from "./engine";
