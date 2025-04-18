declare module "formidable" {
  import { IncomingMessage } from "http";

  export interface File {
    size: number;
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    newFilename: string;
    hashAlgorithm?: string | false;
    mtime?: Date;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Options {
    multiples?: boolean;
    keepExtensions?: boolean;
    maxFileSize?: number;
    allowEmptyFiles?: boolean;
    uploadDir?: string;
  }

  export default class IncomingForm {
    constructor(options?: Options);
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void,
    ): void;
  }
}
