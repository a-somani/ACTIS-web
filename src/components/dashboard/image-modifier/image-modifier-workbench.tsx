'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ImageModifierResponse {
  error?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

export function ImageModifierWorkbench() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const originalPreview = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalPreview) {
        URL.revokeObjectURL(originalPreview);
      }
    };
  }, [originalPreview]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResultImage(null);
    setFile(event.target.files?.[0] ?? null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Please upload an image.');
      return;
    }

    if (!prompt.trim()) {
      setError('Please add an edit prompt.');
      return;
    }

    const payload = new FormData();
    payload.append('image', file);
    payload.append('prompt', prompt.trim());

    setIsLoading(true);
    try {
      const response = await fetch('/api/image-modifier', {
        method: 'POST',
        body: payload,
      });
      const data = (await response.json()) as ImageModifierResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'Image generation failed.');
      }

      if (data.imageUrl) {
        setResultImage(data.imageUrl);
      } else if (data.imageBase64) {
        const mime = data.mimeType ?? 'image/png';
        setResultImage(`data:${mime};base64,${data.imageBase64}`);
      } else {
        throw new Error('No image returned from Nano Banana.');
      }
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Image Modifier</CardTitle>
          <CardDescription>Upload an image and describe your desired transformation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="modifier-image" className="text-sm font-medium">
                Source image
              </label>
              <Input id="modifier-image" type="file" accept="image/*" onChange={onFileChange} />
            </div>

            <div className="space-y-2">
              <label htmlFor="modifier-prompt" className="text-sm font-medium">
                Prompt
              </label>
              <textarea
                id="modifier-prompt"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Make this look like a product hero shot with a clean studio background..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate image'}
            </Button>
          </form>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Original and generated outputs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Original</p>
            {originalPreview ? (
              <img src={originalPreview} alt="Original upload" className="w-full rounded-md border border-border object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Upload an image to preview it.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Generated</p>
            {resultImage ? (
              <img src={resultImage} alt="Generated output" className="w-full rounded-md border border-border object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Run generation to see output.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
