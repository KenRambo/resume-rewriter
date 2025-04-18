// eslint-disable-next-line @typescript-eslint/no-var-requires
const formidable = require("formidable");

import type { Fields, Files } from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { extractPdfText } from "@/lib/extractPdfText";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> {
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { files } = await parseForm(req);
    const uploaded = files.file;
    const pdfFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!pdfFile || !pdfFile.filepath) {
      console.error("[upload-resume] No file uploaded");
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const buffer = fs.readFileSync(pdfFile.filepath);
    const debugPath = path.join("/tmp", "debug-upload.pdf");
    fs.writeFileSync(debugPath, buffer);
    console.log("[upload-resume] Saved debug copy to:", debugPath);

    const text = await extractPdfText(buffer);
    console.log("[upload-resume] Extracted text length:", text.length);

    res.status(200).json({ text });
  } catch (err: unknown) {
    console.error("[upload-resume] Extraction failed:", err);
    res.status(500).json({
      error: "Text extraction failed",
      detail: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
