import { json, error, handleError, requireAuthed } from "@/lib/api";
import { parseCSV, parseJSON, validateTransactionRow, detectDuplicateTransactions } from "@/lib/exchange";

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return error("No file uploaded", 400);

    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      return error("File size exceeds 2MB limit", 400);
    }

    const content = await file.text();
    const ext = file.name.split(".").pop()?.toLowerCase();

    let rawRecords: any[] = [];
    if (ext === "json") {
      const parsed = parseJSON(content);
      rawRecords = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === "csv" || file.type === "text/csv") {
      rawRecords = parseCSV(content);
    } else {
      return error("Unsupported file format. Use CSV or JSON.", 400);
    }

    const validatedList: any[] = [];
    const allErrors: any[] = [];

    rawRecords.forEach((rec, idx) => {
      const { data, errors } = validateTransactionRow(rec, idx);
      if (errors.length > 0) {
        allErrors.push(...errors);
      } else if (data) {
        validatedList.push(data);
      }
    });

    // Detect duplicates
    const checkedList = await detectDuplicateTransactions(user.id, validatedList);

    const exactCount = checkedList.filter((c) => c.isDuplicate).length;
    const probableCount = checkedList.filter((c) => c.isProbableDuplicate).length;

    const totalVolume = checkedList.reduce((sum, c) => sum + c.amount, 0);

    return json({
      previewRows: checkedList,
      validationErrors: allErrors,
      exactDuplicateCount: exactCount,
      probableDuplicateCount: probableCount,
      summary: {
        totalRows: rawRecords.length,
        validRows: checkedList.length,
        invalidRows: allErrors.length,
        totalAmount: Math.round(totalVolume * 100) / 100,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
