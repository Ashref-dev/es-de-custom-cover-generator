'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone, FileRejection, DropEvent, Accept } from 'react-dropzone';
import { FileUploadProps } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrashIcon, UploadIcon } from '@radix-ui/react-icons';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Debounce time in milliseconds
const DEBOUNCE_DELAY = 750;

// Define common image MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];

/**
 * Calls the backend API route to fetch an image URL and convert it to a File object.
 * Allows either JPG or PNG if expected type is an image.
 * @param url The URL of the image to fetch.
 * @param expectedMimeType The primary expected MIME type (e.g., 'image/jpeg', 'image/png', 'video/mp4').
 * @returns A Promise resolving to a File object.
 * @throws An error if fetching fails, the response is not the expected type, or other issues occur.
 */
async function fetchMediaViaApi(url: string, expectedMimeType: string): Promise<File> {
  try {
    const apiResponse = await fetch('/api/fetch-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: url }), // API expects imageUrl key
    });

    if (!apiResponse.ok) {
      let errorMsg = `Failed to fetch via API: ${apiResponse.statusText}`;
      try {
        const errorBody = await apiResponse.json();
        errorMsg = errorBody.error || errorMsg;
      } catch { /* Ignore JSON parsing error */ }
      throw new Error(errorMsg);
    }

    const blob = await apiResponse.blob();
    const fetchedContentType = apiResponse.headers.get('content-type');

    if (!fetchedContentType) {
      throw new Error('API response missing content type.');
    }

    // Type Validation:
    if (expectedMimeType.startsWith('image/')) {
      // If expecting an image, accept JPG or PNG
      if (!IMAGE_MIME_TYPES.includes(fetchedContentType)) {
        throw new Error(`Fetched content type (${fetchedContentType}) is not an accepted image type (JPG or PNG).`);
      }
      // Optional: Warn if fetched type doesn't match the primary expected type?
      // if (fetchedContentType !== expectedMimeType) { console.warn(...) }
    } else if (expectedMimeType.startsWith('video/')) {
      // If expecting video, enforce strict match
      if (fetchedContentType !== expectedMimeType) {
        throw new Error(`Fetched content type (${fetchedContentType}) does not match expected video type (${expectedMimeType}).`);
      }
    } else {
        // Handle other types if necessary, otherwise throw error for unexpected expectedMimeType
        throw new Error(`Unsupported expected media type: ${expectedMimeType}`);
    }

    const filename = url.substring(url.lastIndexOf('/') + 1) || 'downloaded-media'; // Generic name
    return new File([blob], filename, { type: fetchedContentType });

  } catch (error) {
    console.error('Error fetching media via API:', error);
    throw error;
  }
}

/**
 * File upload dropzone component with preview and URL input.
 * Accepts JPG/PNG for image types.
 */
export default function FileUploadDropzone({
  value,
  accept: primaryAccept,
  onChange,
  label = 'Upload File',
  description = 'Drag and drop a file here, or click to select a file'
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine accepted types for Dropzone
  const acceptConfig: Accept = {};
  if (primaryAccept.startsWith('image/')) {
    acceptConfig['image/jpeg'] = ['.jpg', '.jpeg'];
    acceptConfig['image/png'] = ['.png'];
  } else if (primaryAccept.startsWith('video/')) {
    acceptConfig['video/mp4'] = ['.mp4'];
  }
  // Add other types here if needed

  // --- Effects --- 
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      setImageUrlInput('');
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (imageUrlInput && (imageUrlInput.startsWith('http://') || imageUrlInput.startsWith('https://'))) {
      debounceTimeoutRef.current = setTimeout(async () => {
        setIsLoadingUrl(true);
        setError(null);
        try {
          // Use primaryAccept for validation within fetchMediaViaApi
          const mediaFile = await fetchMediaViaApi(imageUrlInput, primaryAccept);
          handleFileChange(mediaFile);
        } catch (fetchError) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch from URL.');
          setIsLoadingUrl(false);
        }
      }, DEBOUNCE_DELAY);
    } else {
       if (isLoadingUrl) setIsLoadingUrl(false);
    }
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [imageUrlInput, primaryAccept, onChange]); // Added onChange as handleFileChange depends on it

  // --- Callbacks --- 
  const handleFileChange = useCallback((file: File | null) => {
    setError(null);
    setIsLoadingUrl(false);
    if (file) {
      setImageUrlInput('');
    }
    onChange(file);
  }, [onChange]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
      setError(null);
      setIsLoadingUrl(false);
      setImageUrlInput('');

      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
        return;
      }
      if (fileRejections.length > 0) {
        // Simplified rejection message
        setError(`Invalid file type. Please upload ${primaryAccept.startsWith('image/') ? 'JPG/PNG' : 'MP4'}.`);
        return;
      }

      let url: string | null = null;
      if (event && 'dataTransfer' in event && event.dataTransfer) {
          url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
      }
      
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        setIsLoadingUrl(true);
        setError(null);
        try {
          const mediaFile = await fetchMediaViaApi(url, primaryAccept);
          handleFileChange(mediaFile);
        } catch (fetchError) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch from URL.');
          setIsLoadingUrl(false);
        }
      } else if (event && 'dataTransfer' in event && event.dataTransfer?.files?.length === 0 && !url) {
           setError('No valid file or image URL was dropped.');
      }
    },
    [primaryAccept, handleFileChange] 
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig, // Use the generated accept config
    maxFiles: 1,
    multiple: false,
    noClick: isLoadingUrl,
    noKeyboard: isLoadingUrl,
    onDropRejected: undefined, 
  });

  const clearFile = () => {
    handleFileChange(null);
  };

  // --- Render Logic --- 
  const getBorderColor = () => {
    if (isDragActive) return 'border-primary';
    if (error) return 'border-destructive';
    if (value) return 'border-green-500';
    return 'border-muted-foreground/20';
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center space-y-3">
        {value && !isLoadingUrl && previewUrl ? (
          // Preview Mode
          <div className="space-y-2">
            <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center">
              {value.type.startsWith('image/') ? (
                <Image 
                  src={previewUrl}
                  alt={value.name}
                  fill
                  style={{ objectFit: 'contain'}}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : value.type.startsWith('video/') ? (
                <video 
                  src={previewUrl} 
                  controls 
                  muted
                  className="max-h-full max-w-full"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No preview available</p>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-2 flex items-center justify-between">
              <div className="truncate flex-1 mr-2">
                <p className="text-sm font-medium truncate" title={value.name}>{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(value.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} className="flex-shrink-0">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : isLoadingUrl ? (
          // URL Loading Mode
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-32 h-full border-primary">
             <p className="text-sm text-muted-foreground mb-2">Fetching via server...</p>
             <Progress value={undefined} className="w-3/4 animate-pulse" /> 
             {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          // Input Mode (Dropzone + URL Field)
          <div className="space-y-3">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-24 ${getBorderColor()}`}
            >
              <input {...getInputProps()} />
              <UploadIcon className="w-6 h-6 mb-2 text-muted-foreground" />
              <div className="text-sm text-center text-muted-foreground">
                {isDragActive ? 'Drop file/URL here' : 'Drag file/URL here, or click to select'}
              </div>
            </div>
            <div className="relative">
              <Label htmlFor={`${label}-url-input`} className="text-xs text-muted-foreground absolute -top-2 left-2 bg-background px-1">Or paste image URL</Label>
              <Input
                id={`${label}-url-input`}
                type="url"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="text-sm pt-2" 
                disabled={isLoadingUrl}
              />
            </div>
            {error && <p className="mt-1 text-xs text-destructive text-center">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 