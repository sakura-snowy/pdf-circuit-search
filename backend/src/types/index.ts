export interface PDFDocument {
  id: string;
  filename: string;
  filepath: string;
  size: number;
  pageCount?: number;
}

export interface SearchResult {
  page: number;
  text: string;
  context: string;
  relevanceScore: number;
  type: 'title' | 'description' | 'table' | 'text';
  position?: {
    x: number;
    y: number;
  };
}

export interface SearchResponse {
  documentId: string;
  query: string;
  results: SearchResult[];
  totalMatches: number;
}

export interface PageText {
  page: number;
  text: string;
  lines: string[];
}
