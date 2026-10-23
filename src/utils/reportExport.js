function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows, year) {
  const headings = ["Month", "Gross Sales", "Purchases", "Expenses", "Net Profit", "MoM Growth"];
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const content = [headings, ...rows.map((row) => [row.month, row.sales, row.purchases, row.expenses, row.net, row.growth])]
    .map((row) => row.map(escape).join(",")).join("\r\n");
  download(`\uFEFF${content}`, `erp-financial-report-${year}.csv`, "text/csv;charset=utf-8");
}

export function downloadPdf(rows, year) {
  const encoder = new TextEncoder();
  const escapePdf = (value) => String(value).replace(/[\\()]/g, "\\$&");
  const lines = ["ERP System - Financial Report", `Fiscal year: ${year}`, "", "Month      Sales       Purchases   Expenses    Net profit   Growth"];
  rows.forEach((row) => lines.push(`${row.month.padEnd(10)} ${String(row.sales).padEnd(11)} ${String(row.purchases).padEnd(11)} ${String(row.expenses).padEnd(11)} ${String(row.net).padEnd(12)} ${row.growth}`));
  const stream = ["BT", "/F1 18 Tf", "50 780 Td", `(${escapePdf(lines[0])}) Tj`, "/F1 11 Tf"];
  lines.slice(1).forEach((line) => stream.push("0 -22 Td", `(${escapePdf(line)}) Tj`));
  stream.push("ET");
  const streamContent = stream.join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", `<< /Length ${encoder.encode(streamContent).length} >>\nstream\n${streamContent}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(encoder.encode(pdf).length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  download(pdf, `erp-financial-report-${year}.pdf`, "application/pdf");
}
