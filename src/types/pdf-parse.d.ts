declare module "pdf-parse" {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(
    buffer: Buffer,
    options?: Record<string, unknown>,
  ): Promise<PDFParseResult>;

  export = pdfParse;
}
