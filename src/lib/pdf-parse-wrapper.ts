import { getDocument } from "pdfjs-dist/legacy/build/pdf";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log("[extractPdfText] Starting text extraction");

  const loadingTask = getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;

  console.log("[extractPdfText] Loaded PDF document");
  const numPages = pdfDoc.numPages;
  console.log(`[extractPdfText] PDF has ${numPages} pages`);

  let fullText = "";

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();

    console.log(
      `[extractPdfText] Page ${pageNum} items: ${content.items.length}`,
    );

    const pageText = content.items
      .map((item: any) => item.str)
      .filter(Boolean)
      .join(" ");

    console.log(
      `[extractPdfText] Page ${pageNum} preview: ${pageText.slice(0, 100)}`,
    );
    fullText += pageText + "\n\n";
  }

  console.log("[extractPdfText] Final extracted text length:", fullText.length);
  return fullText.trim();
}
