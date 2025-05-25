"use client";

import { useState, useCallback } from "react";
import { Game, MediaType as MediaTypeConfig } from "@/types";
import { MEDIA_TYPES } from "@/lib/constants";
import Image from "next/image";
import {
  ImageOff,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { TrashIcon } from "@radix-ui/react-icons";
import FileUploadDropzone from "@/components/FileUploadDropzone";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { optimizeImage } from "@/lib/imageOptimizers";

interface GameMediaFormProps {
  game: Game;
  mainDirHandle: any; // Ideally FileSystemDirectoryHandle
  currentMediaUrls: Record<string, string>;
  isLoadingUrls: boolean;
  onGameUpdate: (updatedGame: Game) => void;
}

// Helper to map mediaType.key to Game file handle properties
const mediaKeyToGameHandle: Record<string, keyof Game | undefined> = {
  covers: "coverFileHandle",
  marquees: "logoFileHandle",
  screenshots: "screenshotFileHandle",
  "3dboxes": "box3dFileHandle",
  backcovers: "backCoverFileHandle",
  fanart: "fanartFileHandle",
  physicalmedia: "physicalMediaFileHandle",
  titlescreens: "titleScreenFileHandle",
};

/**
 * Loads a file from a FileSystemFileHandle and returns an object URL
 */
async function loadFileAsUrl(fileHandle: any): Promise<string> {
  if (!fileHandle || typeof fileHandle.getFile !== "function") {
    if (fileHandle instanceof File) {
      return URL.createObjectURL(fileHandle);
    }
    console.warn(
      "Invalid or missing file handle for loadFileAsUrl:",
      fileHandle
    );
    return "";
  }
  try {
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch (error) {
    console.error("Error loading file from handle:", error);
    return "";
  }
}

export function GameMediaForm({
  game,
  mainDirHandle,
  currentMediaUrls,
  isLoadingUrls,
  onGameUpdate,
}: GameMediaFormProps) {
  const [editableMediaFiles, setEditableMediaFiles] = useState<
    Record<string, File | null>
  >({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // State for optimization toggles per media type
  const [optimizationEnabled, setOptimizationEnabled] = useState<
    Record<string, boolean>
  >({
    marquees: true, // Default enabled for marquees only
    covers: false, // Default off for all other image types
    screenshots: false,
    "3dboxes": false,
    backcovers: false,
    fanart: false,
    physicalmedia: false,
    titlescreens: false,
  });

  const handleMediaFileChange = useCallback(
    (mediaKey: string, file: File | null) => {
      setEditableMediaFiles((prev) => ({ ...prev, [mediaKey]: file }));
      setSaveError(null);
      setSaveSuccess(null);
    },
    []
  );

  const handleOptimizationToggle = useCallback(
    (mediaKey: string, enabled: boolean) => {
      setOptimizationEnabled((prev) => ({
        ...prev,
        [mediaKey]: enabled,
      }));
    },
    []
  );

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
      const consoleDirHandle = await mainDirHandle.getDirectoryHandle(
        game.console,
        { create: true }
      );

      for (const mediaType of MEDIA_TYPES) {
        let newFile = editableMediaFiles[mediaType.key];
        if (newFile) {
          changesMade++;

          // Optimize images before saving if enabled (skip videos)
          if (
            mediaType.key !== "videos" &&
            optimizationEnabled[mediaType.key]
          ) {
            try {
              // Determine max dimension based on media type
              const maxDimension = mediaType.key === "marquees" ? 512 : 1920;

              // Use effective compression quality (90 for good balance of quality/size)
              const qualitySetting = 90;

              const optimizedFile = await optimizeImage(
                newFile,
                maxDimension,
                qualitySetting
              );

              newFile = optimizedFile; // Use the optimized file
            } catch (optimizationError) {
              console.error(
                `${mediaType.label} optimization failed:`,
                optimizationError
              );
              setSaveError(
                `Failed to optimize ${mediaType.label}: ${
                  optimizationError instanceof Error
                    ? optimizationError.message
                    : String(optimizationError)
                }. Original file will be saved.`
              );
            }
          }

          // Special handling for videos
          if (mediaType.key === "videos") {
            const mediaFolderHandle = await consoleDirHandle.getDirectoryHandle(
              mediaType.folder,
              { create: true }
            );
            const fileName = game.name + mediaType.extension;

            const fileHandle = await mediaFolderHandle.getFileHandle(fileName, {
              create: true,
            });
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

          // Handle other media types
          const mediaFolderHandle = await consoleDirHandle.getDirectoryHandle(
            mediaType.folder,
            { create: true }
          );
          const fileName = game.name + mediaType.extension;

          const fileHandle = await mediaFolderHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(newFile);
          await writable.close();

          // Update game object's handle and boolean flag
          const gameHandleKey = mediaKeyToGameHandle[mediaType.key];
          if (gameHandleKey) {
            (updatedGameData as any)[gameHandleKey] = fileHandle;
          }

          // Update specific boolean flags
          if (mediaType.key === "covers") updatedGameData.hasCover = true;
          if (mediaType.key === "marquees") updatedGameData.hasLogo = true;

          // Update mediaTypes array if this type wasn't there
          if (!updatedGameData.mediaTypes.includes(mediaType.folder)) {
            updatedGameData.mediaTypes.push(mediaType.folder);
          }
        }
      }

      if (changesMade > 0) {
        onGameUpdate(updatedGameData);
        setSaveSuccess(`${changesMade} media file(s) updated successfully!`);
        setEditableMediaFiles({}); // Clear staging files
      } else {
        setSaveSuccess("No changes to save.");
      }
    } catch (err) {
      console.error("Error saving media files:", err);
      setSaveError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during save."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasChangesToSave = Object.keys(editableMediaFiles).some(
    (k) => editableMediaFiles[k]
  );

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Save Status Messages */}
        {saveError && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Save Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        {saveSuccess && (
          <Alert
            variant="default"
            className="border-green-500 bg-green-50 text-green-700 animate-in fade-in-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{saveSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {MEDIA_TYPES.map((mediaType: MediaTypeConfig) => {
            const currentUrl = currentMediaUrls[mediaType.key];
            const newFile = editableMediaFiles[mediaType.key];
            const isVideo = mediaType.key === "videos";

            const hasContent = isVideo
              ? !!currentUrl || game.hasVideo || !!newFile
              : !!currentUrl || !!newFile;

            return (
              <div key={mediaType.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{mediaType.label}</h3>

                    {/* Optimization Toggle for all image types (not videos) */}
                    {mediaType.key !== "videos" && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={optimizationEnabled[mediaType.key] || false}
                          onCheckedChange={(checked) =>
                            handleOptimizationToggle(mediaType.key, checked)
                          }
                          id={`optimize-${mediaType.key}`}
                          className="scale-75"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">
                              <strong>Image Optimization:</strong> Resizes
                              images to max{" "}
                              {mediaType.key === "marquees"
                                ? "512px"
                                : "1920px"}{" "}
                              on longest side, preserves original format, and
                              applies 85% quality compression for optimal
                              performance.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {hasContent && (
                    <div className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      Active
                    </div>
                  )}
                </div>

                {/* Media Preview */}
                {isLoadingUrls && !newFile ? (
                  <div className="h-48 w-full bg-muted rounded-lg flex items-center justify-center animate-pulse">
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                  </div>
                ) : hasContent && !newFile ? (
                  <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden group">
                    {isVideo ? (
                      currentUrl ? (
                        <video
                          src={currentUrl}
                          controls
                          className="w-full h-full object-contain"
                          onError={(e) =>
                            console.error("Video player error:", e)
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full flex-col text-center px-4">
                          <div className="text-primary text-sm font-medium">
                            Video Available
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Preview could not be loaded. File might be missing
                            or corrupted.
                          </div>
                        </div>
                      )
                    ) : (
                      <Image
                        src={currentUrl}
                        alt={`Current ${mediaType.label}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "contain" }}
                        className="transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                      onClick={async () => {
                        // TODO: Implement deletion of this specific media file
                        console.log(
                          "Delete functionality for individual media to be implemented."
                        );
                        alert(
                          `Delete for ${mediaType.label} to be implemented.`
                        );
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  !newFile && (
                    <div className="h-48 w-full bg-muted/30 rounded-lg flex flex-col items-center justify-center border border-dashed">
                      <ImageOff className="h-8 w-8 text-muted-foreground/60 mb-1" />
                      <p className="text-sm text-muted-foreground">
                        No {mediaType.label} available
                      </p>
                    </div>
                  )
                )}

                {/* File Upload */}
                <FileUploadDropzone
                  value={editableMediaFiles[mediaType.key] || null}
                  onChange={(file) =>
                    handleMediaFileChange(mediaType.key, file)
                  }
                  accept={mediaType.accept}
                  label={
                    hasContent
                      ? `Replace ${mediaType.label}`
                      : `Upload ${mediaType.label}`
                  }
                  description={
                    hasContent
                      ? `Current: ${game?.name}${mediaType.extension}`
                      : mediaType.description
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving || !hasChangesToSave}
            size="lg"
            className="px-6"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
