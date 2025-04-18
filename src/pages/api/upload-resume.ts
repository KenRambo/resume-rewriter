import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import { extractPdfText } from "@/lib/extractPdfText";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

    console.log("[upload-resume] Uploaded file path:", pdfFile.filepath);

    const buffer = fs.readFileSync(pdfFile.filepath);
    console.log("[upload-resume] Buffer length:", buffer.length);

    // Optional: Save a debug copy
    const debugPath = path.join("/tmp", "debug-upload.pdf");
    fs.writeFileSync(debugPath, buffer);
    console.log("[upload-resume] Saved debug copy to:", debugPath);

    const text = await extractPdfText(buffer);
    console.log("[upload-resume] Extracted text length:", text.length);

    res.status(200).json({ text });
  } .catch((err: unknown) => {
  if (err instanceof Error) {
    reject(err);
  } else {
    reject(new Error("Unknown parsing error"));
  }
});
}
