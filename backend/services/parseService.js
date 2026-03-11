const XLSX = require("xlsx");
const path = require("path");

/**
 * Parse an uploaded CSV or XLSX file buffer into an array of objects.
 */
function parseFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  let workbook;
  if (ext === ".csv") {
    const csvString = file.buffer.toString("utf-8");
    workbook = XLSX.read(csvString, { type: "string" });
  } else {
    workbook = XLSX.read(file.buffer, { type: "buffer" });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // No row limit — aiService aggregates the data before sending to Groq
  return rows;
}

module.exports = { parseFile };
