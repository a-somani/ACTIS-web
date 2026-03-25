export interface CreditSummaryResponse {
  balance: number;
  generationCost: number;
  activeTierId: string | null;
  activeTierName: string | null;
  error?: string;
}

export interface CreateHistoryItem {
  id: string;
  sourceFile: File;
  sourcePreviewUrl: string;
  resultImage: string;
  fileName: string;
  targetRatio: string;
}
