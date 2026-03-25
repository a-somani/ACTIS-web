const UPLOAD_LIMIT = 4 * 1024 * 1024;
const MAX_DIMENSION = 2048;

export async function compressForUpload(file: File): Promise<File> {
  if (file.size <= UPLOAD_LIMIT) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.6]) {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    if (blob.size <= UPLOAD_LIMIT) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      });
    }
  }

  const scale = 0.7;
  const smallCanvas = new OffscreenCanvas(Math.round(width * scale), Math.round(height * scale));
  const smallCtx = smallCanvas.getContext('2d');
  if (!smallCtx) throw new Error('Canvas 2D context unavailable');
  smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

  const blob = await smallCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  });
}
