'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Game, MediaType as MediaTypeConfig } from "@/types"; // Renamed MediaType to MediaTypeConfig to avoid conflict
import { CONSOLES, MEDIA_TYPES } from "@/lib/constants";
import Image from 'next/image';
import { ImageOff, X, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TrashIcon } from '@radix-ui/react-icons';
import FileUploadDropzone from '@/components/FileUploadDropzone'; // Assuming this is the correct path
import { ScrollArea } from '@/components/ui/scroll-area'; // Corrected ScrollArea import
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface GameDetailsDrawerProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  mainDirHandle: any; // Ideally FileSystemDirectoryHandle
  onGameUpdate: (updatedGame: Game) => void;
}

/**
 * Loads a file from a FileSystemFileHandle and returns an object URL
 */
async function loadFileAsUrl(fileHandle: any): Promise<string> {
  if (!fileHandle || typeof fileHandle.getFile !== 'function') {
    // If it's already a File object (e.g. from a preview), create object URL directly
    if (fileHandle instanceof File) {
      return URL.createObjectURL(fileHandle);
    }
    console.warn('Invalid or missing file handle for loadFileAsUrl:', fileHandle);
    return ''; // Return empty string or a placeholder to avoid breaking UI
  }
  try {
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch (error) {
    console.error("Error loading file from handle:", error);
    return ''; // Return empty string or a placeholder
  }
}

// Helper to map mediaType.key to Game file handle properties
// This needs to be comprehensive and match the Game type definition
const mediaKeyToGameHandle: Record<string, keyof Game | undefined> = {
  'covers': 'coverFileHandle',
  'marquees': 'logoFileHandle',
  // Note: Game type doesn't have videoFileHandle property
  // Videos are detected via hasVideo flag, not through a file handle
  'screenshots': 'screenshotFileHandle',
  '3dboxes': 'box3dFileHandle',
  'backcovers': 'backCoverFileHandle',
  'fanart': 'fanartFileHandle',
  'physicalmedia': 'physicalMediaFileHandle',
  'titlescreens': 'titleScreenFileHandle',
};

export function GameDetailsDrawer({ game, isOpen, onClose, mainDirHandle, onGameUpdate }: GameDetailsDrawerProps) {
  const [editableMediaFiles, setEditableMediaFiles] = useState<Record<string, File | null>>({});
  const [currentMediaUrls, setCurrentMediaUrls] = useState<Record<string, string>>({});
  const [isLoadingUrls, setIsLoadingUrls] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const consoleLabel = game ? CONSOLES.find(c => c.value === game.console)?.label || game.console : '';

  // Effect to load current media URLs when game changes
  useEffect(() => {
    if (game && isOpen) {
      const loadUrls = async () => {
        setIsLoadingUrls(true);
        const urls: Record<string, string> = {};
        for (const mediaType of MEDIA_TYPES) {
          if (mediaType.key === 'videos') {
            if (game.hasVideo && mainDirHandle) {
              try {
                const consoleDirHandle = await mainDirHandle.getDirectoryHandle(game.console);
                const videosDirHandle = await consoleDirHandle.getDirectoryHandle(mediaType.folder);
                const videoFileHandle = await videosDirHandle.getFileHandle(game.name + mediaType.extension);
                urls[mediaType.key] = await loadFileAsUrl(videoFileHandle);
              } catch (error) {
                console.error(`Error loading URL for video '${game.name}${mediaType.extension}':`, error);
                urls[mediaType.key] = ''; // Fallback if video file can't be loaded
              }
            } else {
              urls[mediaType.key] = ''; // No video or no mainDirHandle
            }
            continue;
          }
          
          // For other media types, use the file handle approach
          const handleName = mediaKeyToGameHandle[mediaType.key];
          if (handleName) {
            const fileHandle = game[handleName];
            if (fileHandle) {
              try {
                urls[mediaType.key] = await loadFileAsUrl(fileHandle);
              } catch (error) {
                console.error(`Error loading URL for ${mediaType.label}:`, error);
                urls[mediaType.key] = ''; // Placeholder or error image URL
              }
            } else {
               urls[mediaType.key] = ''; // No handle
            }
          }
        }
        setCurrentMediaUrls(urls);
        setIsLoadingUrls(false);
      };
      loadUrls();
      setEditableMediaFiles({}); // Reset editable files when game changes
      setSaveError(null);
      setSaveSuccess(null);
    } else if (!isOpen) {
        // Clean up object URLs when drawer is closed
        Object.values(currentMediaUrls).forEach(url => {
            if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        setCurrentMediaUrls({});
    }

    return () => {
      // Cleanup on unmount or when game/isOpen changes leading to closure
      Object.values(currentMediaUrls).forEach(url => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [game, isOpen, mainDirHandle]);


  const handleMediaFileChange = useCallback((mediaKey: string, file: File | null) => {
    setEditableMediaFiles(prev => ({ ...prev, [mediaKey]: file }));
    setSaveError(null);
    setSaveSuccess(null);
  }, []);

  const handleSaveChanges = async () => {
    if (!game || !mainDirHandle) {
      setSaveError("Game data or directory handle is missing.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    let changesMade = 0;
    const updatedGameData = { ...game }; // Shallow copy

    try {
      const consoleDirHandle = await mainDirHandle.getDirectoryHandle(game.console, { create: true });

      for (const mediaType of MEDIA_TYPES) {
        const newFile = editableMediaFiles[mediaType.key];
        if (newFile) {
          changesMade++;
          
          // Special handling for videos
          if (mediaType.key === 'videos') {
            const mediaFolderHandle = await consoleDirHandle.getDirectoryHandle(mediaType.folder, { create: true });
            const fileName = game.name + mediaType.extension;
            
            const fileHandle = await mediaFolderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(newFile);
            await writable.close();
            
            // Update hasVideo flag directly
            updatedGameData.hasVideo = true;
            
            // Add media type to the list if not present
            if (!updatedGameData.mediaTypes.includes(mediaType.folder)) {
              updatedGameData.mediaTypes.push(mediaType.folder);
            }
            continue;
          }
          
          // Handle other media types as before
          const mediaFolderHandle = await consoleDirHandle.getDirectoryHandle(mediaType.folder, { create: true });
          const fileName = game.name + mediaType.extension;
          
          const fileHandle = await mediaFolderHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(newFile);
          await writable.close();

          // Update game object's handle and boolean flag
          const gameHandleKey = mediaKeyToGameHandle[mediaType.key];
          if (gameHandleKey) {
            (updatedGameData as any)[gameHandleKey] = fileHandle;
          }
          
          // Update specific boolean flags
          if (mediaType.key === 'covers') updatedGameData.hasCover = true;
          if (mediaType.key === 'marquees') updatedGameData.hasLogo = true;
          
          // Update mediaTypes array if this type wasn't there
          if (!updatedGameData.mediaTypes.includes(mediaType.folder)) {
            updatedGameData.mediaTypes.push(mediaType.folder);
          }
        }
      }

      if (changesMade > 0) {
        onGameUpdate(updatedGameData);
        setSaveSuccess(`${changesMade} media file(s) updated successfully!`);
         // Refresh current media URLs for the updated files
        const urls: Record<string, string> = { ...currentMediaUrls };
        for (const mediaType of MEDIA_TYPES) {
            if (editableMediaFiles[mediaType.key]) { // If this file was just updated
                const handleName = mediaKeyToGameHandle[mediaType.key];
                if (handleName) {
                    const fileHandle = updatedGameData[handleName];
                    if (fileHandle) {
                        if (urls[mediaType.key] && urls[mediaType.key].startsWith('blob:')) {
                            URL.revokeObjectURL(urls[mediaType.key]);
                        }
                        urls[mediaType.key] = await loadFileAsUrl(fileHandle);
                    }
                }
            }
        }
        setCurrentMediaUrls(urls);
        setEditableMediaFiles({}); // Clear staging files

      } else {
        setSaveSuccess("No changes to save.");
      }
    } catch (err) {
      console.error("Error saving media files:", err);
      setSaveError(err instanceof Error ? err.message : "An unknown error occurred during save.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!game) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Clean up object URLs when drawer is closed
        Object.values(currentMediaUrls).forEach(url => {
            if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        Object.values(editableMediaFiles).forEach(file => {
            if (file) { 
                // If we created URLs for editableMediaFiles previews directly, clean them here.
            }
        });
        setCurrentMediaUrls({});
        setEditableMediaFiles({});
      }
    }}>
      <SheetContent 
        side="bottom" 
        className="h-screen w-screen p-0 flex flex-col border-none max-h-screen overflow-hidden"
      >
        <SheetHeader className="p-6 bg-background border-b border-border/40 shadow-sm sticky top-0 z-10 flex-shrink-0">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="flex-1">
                <SheetTitle className="text-3xl font-bold tracking-tight">{game.name}</SheetTitle>
                <SheetDescription className="text-lg text-muted-foreground mt-1">
                  {consoleLabel} — Media Management
                </SheetDescription>
            </div>
            <SheetClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full ml-4 flex-shrink-0 hover:bg-muted/80 transition-colors">
                  <X className="h-5 w-5" />
                </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow min-h-0 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {saveError && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Save Error</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
            {saveSuccess && (
              <Alert variant="default" className="border-green-500 bg-green-50 text-green-700 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{saveSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {MEDIA_TYPES.map((mediaType: MediaTypeConfig) => {
                const currentUrl = currentMediaUrls[mediaType.key];
                const newFile = editableMediaFiles[mediaType.key];
                const isVideo = mediaType.key === 'videos';
                
                const hasContent = isVideo 
                  ? (!!currentUrl || game.hasVideo || !!newFile) // Updated for video: currentUrl is now blob or ''
                  : (!!currentUrl || !!newFile);

                return (
                  <div key={mediaType.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{mediaType.label}</h3>
                      {hasContent && (
                        <div className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          Active
                        </div>
                      )}
                    </div>
                    
                    {isLoadingUrls && !newFile ? (
                      <div className="h-48 w-full bg-muted rounded-lg flex items-center justify-center animate-pulse">
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      </div>
                    ) : hasContent && !newFile ? (
                      <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden group">
                        {isVideo ? (
                          currentUrl ? ( // If currentUrl is a blob URL (truthy)
                            <video 
                              src={currentUrl}
                              controls
                              className="w-full h-full object-contain"
                              onError={(e) => console.error("Video player error:", e)}
                            />
                          ) : ( // currentUrl is empty, but game.hasVideo was true (or newFile would be handled)
                            <div className="flex items-center justify-center h-full flex-col text-center px-4">
                              <div className="text-primary text-sm font-medium">Video Available</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Preview could not be loaded. File might be missing or corrupted.
                              </div>
                            </div>
                          )
                        ) : (
                          <Image 
                            src={currentUrl} 
                            alt={`Current ${mediaType.label}`} 
                            layout="fill" 
                            objectFit="contain" 
                            className="transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        )}
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                          onClick={async () => {
                            // TODO: Implement deletion of this specific media file
                            console.log("Delete functionality for individual media to be implemented.");
                            alert(`Delete for ${mediaType.label} to be implemented.`);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : !newFile && (
                      <div className="h-48 w-full bg-muted/30 rounded-lg flex flex-col items-center justify-center border border-dashed">
                        <ImageOff className="h-8 w-8 text-muted-foreground/60 mb-1" />
                        <p className="text-sm text-muted-foreground">No {mediaType.label} available</p>
                      </div>
                    )}

                    <FileUploadDropzone
                      value={editableMediaFiles[mediaType.key] || null}
                      onChange={(file) => handleMediaFileChange(mediaType.key, file)}
                      accept={mediaType.accept}
                      label={hasContent ? `Replace ${mediaType.label}` : `Upload ${mediaType.label}`}
                      description={hasContent ? `Current: ${game?.name}${mediaType.extension}` : mediaType.description}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-border/40 sticky bottom-0 bg-background z-10 flex-shrink-0">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-4">
            <SheetClose asChild>
              <Button variant="outline" size="lg" className="px-6">Close</Button>
            </SheetClose>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving || Object.keys(editableMediaFiles).every(k => !editableMediaFiles[k])}
              size="lg"
              className="px-6"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 