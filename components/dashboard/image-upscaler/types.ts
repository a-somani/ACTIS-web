export interface UpscalerResponse {
  error?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface UpscalerStreamEventPayload {
  message?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  progress?: number;
}

export interface UpscalerOriginalImageMeta {
  width: number;
  height: number;
}
