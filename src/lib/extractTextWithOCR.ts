import Tesseract from "tesseract.js";

export async function extractTextWithOCR(buffer: Buffer): Promise<string> {
  console.log("[OCR] Starting Tesseract OCR");
  const result = await Tesseract.recognize(buffer, "eng", {
    logger: (m) => console.log(`[OCR] ${m.status}: ${m.progress}`),
  });

  const text = result.data.text.trim();
  console.log("[OCR] Done. Extracted OCR text length:", text.length);

  return text;
}
