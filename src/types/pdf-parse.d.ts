declare module "pdf-parse" {
  interface PDFParseInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    [key: string]: string | undefined;
  }

  interface PDFParseMetadata {
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: PDFParseInfo;
    metadata: PDFParseMetadata;
    version: string;
    text: string;
  }

  function pdfParse(
    buffer: Buffer,
    options?: Record<string, unknown>,
  ): Promise<PDFParseResult>;

  export = pdfParse;
}
