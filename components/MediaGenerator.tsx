'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { MEDIA_TYPES } from '@/lib/constants';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import ConsoleSelector from '@/components/ConsoleSelector';
import SubmitButton from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Client component that handles all the interactive functionality
 * for the media generator, including file uploads and zip generation.
 */
export default function MediaGenerator() {
  // State for ROM name
  const [romName, setRomName] = useState<string>('');
  
  // State for selected console
  const [consoleName, setConsoleName] = useState<string>('');
  
  // State for file uploads, one state per media type
  const [mediaFiles, setMediaFiles] = useState<Record<string, File | null>>(
    MEDIA_TYPES.reduce((acc, mediaType) => ({ ...acc, [mediaType.key]: null }), {})
  );
  
  // State for pending/loading status
  const [isPending, setIsPending] = useState<boolean>(false);
  
  // State for error message
  const [error, setError] = useState<string | null>(null);
  
  // State for success message
  const [success, setSuccess] = useState<string | null>(null);

  // Use useCallback for functions passed down to memoized components if needed
  const updateMediaFile = useCallback((key: string, file: File | null) => {
    setMediaFiles((prev) => ({ ...prev, [key]: file }));
    // Clear messages when user makes changes
    setError(null);
    setSuccess(null);
  }, []);

  // Count how many files have been uploaded
  const uploadedFileCount = Object.values(mediaFiles).filter(Boolean).length;

  // Helper function to get file extension from MIME type
  const getExtensionFromMimeType = (mimeType: string): string => {
      if (mimeType === 'image/jpeg') return '.jpg';
      if (mimeType === 'image/png') return '.png';
      if (mimeType === 'video/mp4') return '.mp4';
      // Fallback based on the original config if type is unusual but allowed?
      const mediaConfig = MEDIA_TYPES.find(mt => mt.accept === mimeType);
      return mediaConfig?.extension || ''; // Return empty string if no match
  };

  // Generate zip file
  const generateZip = async () => {
    // Clear any previous messages
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      // Validation
      if (!romName.trim()) {
        throw new Error('Please enter a ROM name');
      }

      if (!consoleName) {
        throw new Error('Please select a console/system');
      }

      if (uploadedFileCount === 0) {
        throw new Error('Please upload at least one media file');
      }

      // Initialize JSZip
      const zip = new JSZip();
      
      // Create console folder
      const consoleFolder = zip.folder(consoleName);
      
      if (!consoleFolder) {
        throw new Error('Failed to create console folder in zip');
      }

      // Add files to zip with proper folder structure
      for (const mediaType of MEDIA_TYPES) {
        const file = mediaFiles[mediaType.key];
        
        if (file) {
          // Create media type folder (e.g., covers, marquees)
          const mediaFolder = consoleFolder.folder(mediaType.folder);
          
          if (!mediaFolder) {
            throw new Error(`Failed to create ${mediaType.folder} folder in zip`);
          }
          
          // Use the actual file extension based on its MIME type
          const fileExtension = getExtensionFromMimeType(file.type);
          if (!fileExtension) {
              console.warn(`Could not determine extension for file ${file.name} with type ${file.type}. Skipping.`);
              continue; // Skip files with unknown/unsupported types
          }

          // Construct target filename with proper extension
          const targetFilename = `${romName.trim()}${fileExtension}`;
          
          // Add file to zip
          mediaFolder.file(targetFilename, file);
        }
      }

      // Generate zip file as blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${consoleName}_${romName.trim()}_media.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Media files have been successfully zipped and downloaded!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border dark:border-slate-800 shadow-sm dark:shadow-slate-950/20">
      <CardHeader className="text-center pt-8 pb-6">
        <CardTitle className="font-pixel font-normal text-4xl md:text-6xl mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          ESDE Media Generator
        </CardTitle>
        <CardDescription className="text-base md:text-lg max-w-lg mx-auto">
          Generate the correct folder structure for Emulation Station Desktop Edition media files.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Error or success messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* ROM Name */}
        <div className="space-y-2">
          <Label htmlFor="rom-name">ROM Name</Label>
          <Input
            id="rom-name"
            value={romName}
            onChange={(e) => {
              setRomName(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Enter ROM name (e.g., Super Mario Bros)"
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            This name will be used to rename all media files
          </p>
        </div>

        {/* Console Selector */}
        <ConsoleSelector
          value={consoleName}
          onChange={(value: string) => {
            setConsoleName(value);
            setError(null);
            setSuccess(null);
          }}
          disabled={isPending}
        />

        {/* Media Upload Sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-2xl font-pixel bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Media Files</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Upload the media files for your ROM. At least one file is required.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MEDIA_TYPES.map((mediaType) => (
              <FileUploadDropzone
                key={mediaType.key}
                value={mediaFiles[mediaType.key]}
                accept={mediaType.accept}
                onChange={(file: File | null) => updateMediaFile(mediaType.key, file)}
                label={mediaType.label}
                description={mediaType.description}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 pb-8 px-6">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center bg-muted/30 px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">
              {uploadedFileCount} file{uploadedFileCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <SubmitButton
            isPending={isPending}
            text="Generate & Download Zip"
            pendingText="Generating Zip..."
            onClick={generateZip}
            disabled={isPending || uploadedFileCount === 0 || !romName.trim() || !consoleName}
            className="w-full sm:w-auto"
          />
        </div>
      </CardFooter>
    </Card>
  );
} 