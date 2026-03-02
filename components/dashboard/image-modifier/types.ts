export interface ImageModifierResponse {
  error?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface StreamEventPayload {
  message?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  progress?: number;
}

export interface OriginalImageMeta {
  width: number;
  height: number;
  ratioLabel: string;
}
