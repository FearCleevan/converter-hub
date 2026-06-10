export type ConverterCategory =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "spreadsheet"
  | "presentation"
  | "ebook"
  | "archive"
  | "vector"
  | "cad"
  | "font"
  | "code-data"
  | "hash";

export type InputMode = "file" | "url" | "text" | "file-and-url";

export type ConverterOption = {
  key: string;
  label: string;
  type: "select" | "range" | "number" | "toggle";
  default: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
};

export type ConverterTool = {
  id: string;
  name: string;
  slug: string;
  category: ConverterCategory;
  inputFormats: string[];
  outputFormat: string;
  inputMode: InputMode;
  endpoint: string;
  description: string;
  options?: ConverterOption[];
  popular?: boolean;
};

export type ConverterCategoryMeta = {
  id: ConverterCategory;
  label: string;
  slug: string;
  description: string;
  icon: string;
  tools: ConverterTool[];
};

export type QueueFileStatus =
  | "idle"
  | "uploading"
  | "converting"
  | "done"
  | "error";

export type QueueFile = {
  id: string;
  file: File;
  status: QueueFileStatus;
  progress: number;
  outputFilename?: string;
  outputSize?: number;
  blobUrl?: string;
  error?: string;
};

export type ConversionRecord = {
  id: string;
  toolId: string;
  toolName: string;
  inputFilename: string;
  outputFilename: string;
  timestamp: number;
  status: "success" | "error";
};
