import pdfParse from "pdf-parse";

/**
 * Extracts text from a PDF buffer using pdf-parse
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log("[extractPdfText] Parsing PDF with pdf-parse");

  const data = await pdfParse(buffer);

  const cleaned = data.text
    .replace(/\n{2,}/g, "\n")
    .replace(/(\n\s*){3,}/g, "\n\n")
    .trim();

  console.log("[extractPdfText] Extracted text length:", cleaned.length);

  return cleaned;
}
