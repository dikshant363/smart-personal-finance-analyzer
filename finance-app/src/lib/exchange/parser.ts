export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      record[header.trim()] = values[index] ? values[index].trim() : "";
    });

    records.push(record);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseJSON(content: string): any {
  return JSON.parse(content);
}
