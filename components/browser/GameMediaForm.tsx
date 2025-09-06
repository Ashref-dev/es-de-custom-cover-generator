"use client";

import { useState, useCallback } from "react";
import { Game, MediaType as MediaTypeConfig } from "@/types";
import { MEDIA_TYPES } from "@/lib/constants";
import { optimizeImage } from "@/lib/imageOptimizers";
import {
  saveMediaFile,
  getOrCreateConsoleDirectory,
} from "@/lib/mediaFileOperations";
import {
  updateGameWithMediaFile,
  getOptimizationDimension,
  supportsOptimization,
  getDefaultOptimizationSettings,
} from "@/lib/gameMediaHelpers";
import { toast } from "sonner";
import Image from "next/image";
import { ImageOff, Loader2, Save, AlertCircle, Settings } from "lucide-react";
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

interface GameMediaFormProps {
  game: Game;
  mainDirHandle: any; // Ideally FileSystemDirectoryHandle
  currentMediaUrls: Record<string, string>;
  isLoadingUrls: boolean;
  onGameUpdate: (updatedGame: Game) => void;
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

  // State for optimization toggles per media type
  const [optimizationEnabled, setOptimizationEnabled] = useState<
    Record<string, boolean>
  >(getDefaultOptimizationSettings());

  const handleMediaFileChange = useCallback(
    (mediaKey: string, file: File | null) => {
      setEditableMediaFiles((prev) => ({ ...prev, [mediaKey]: file }));
      setSaveError(null);
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
    let changesMade = 0;
    let updatedGameData = { ...game }; // Shallow copy

    try {
      const consoleDirHandle = await getOrCreateConsoleDirectory(
        mainDirHandle,
        game.console
      );

      for (const mediaType of MEDIA_TYPES) {
        let newFile = editableMediaFiles[mediaType.key];
        if (newFile) {
          changesMade++;

          // Optimize images before saving if enabled and supported
          if (
            supportsOptimization(mediaType.key) &&
            optimizationEnabled[mediaType.key]
          ) {
            try {
              const maxDimension = getOptimizationDimension(mediaType.key);
              const optimizedFile = await optimizeImage(newFile, maxDimension);
              newFile = optimizedFile; // Use the optimized file
            } catch (optimizationError) {
              console.error(
                `${mediaType.label} optimization failed:`,
                optimizationError
              );
              toast.warning("Image optimization failed", {
                description: `${mediaType.label} will be saved without optimization`,
                duration: 3000,
              });
            }
          }

          // Save the media file
          const fileHandle = await saveMediaFile(
            consoleDirHandle,
            mediaType,
            game.name,
            newFile
          );

          // Update game object with new file information
          updatedGameData = updateGameWithMediaFile(
            updatedGameData,
            mediaType.key,
            fileHandle,
            mediaType.folder
          );
        }
      }

      if (changesMade > 0) {
        onGameUpdate(updatedGameData);
        toast.success("Media files updated successfully!", {
          description: `${changesMade} file${changesMade > 1 ? "s" : ""} updated for ${game.name}`,
          duration: 4000,
        });
        setEditableMediaFiles({}); // Clear staging files
      } else {
        toast.info("No changes to save", {
          description: "Please select files to upload before saving",
          duration: 3000,
        });
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

        {/* Media Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {MEDIA_TYPES.map((mediaType: MediaTypeConfig) => {
            const currentUrl = currentMediaUrls[mediaType.key];
            const newFile = editableMediaFiles[mediaType.key];
            const isVideo = mediaType.key === "videos";

            const hasContent = isVideo
              ? !!currentUrl || game.hasVideo || !!newFile
              : !!currentUrl || !!newFile;

            return (
              <div
                key={mediaType.key}
                className="group border-border hover:border-primary/40 bg-background/30 space-y-4 overflow-hidden rounded-xl border-2 border-dotted transition-all duration-300"
              >
                {/* Section Header */}
                <div className="border-border/20 bg-background/50 flex items-center justify-between border-b px-4 pt-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-foreground text-lg font-semibold">
                      {mediaType.label}
                    </h3>

                    {/* Optimization Toggle for all image types except videos */}
                    {mediaType.key !== "videos" &&
                      supportsOptimization(mediaType.key) && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              optimizationEnabled[mediaType.key] || false
                            }
                            onCheckedChange={(checked) =>
                              handleOptimizationToggle(mediaType.key, checked)
                            }
                            id={`optimize-${mediaType.key}`}
                            className="scale-75"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <Settings className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              {mediaType.key === "marquees" ? (
                                <p className="text-sm">
                                  <strong>Image Optimization:</strong> PNG
                                  images will be resized (not compressed) to a
                                  maximum of 600 pixels on the longest side to
                                  keep their size small while preserving
                                  transparency.
                                </p>
                              ) : (
                                <p className="text-sm">
                                  <strong>Image Optimization:</strong> Images
                                  will be resized and compressed (75% quality)
                                  to a maximum of 1920 pixels on the longest
                                  side.
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                  </div>

                  {hasContent && (
                    <div className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </div>
                  )}
                </div>

                {/* Media Content Section */}
                <div className="space-y-3 px-4 pb-4">
                  {/* Media Preview */}
                  {isLoadingUrls && !newFile ? (
                    <div className="bg-muted border-border/20 flex h-48 w-full animate-pulse items-center justify-center rounded-lg border">
                      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                  ) : hasContent && !newFile ? (
                    <div className="bg-muted group/preview border-border/20 relative h-48 w-full overflow-hidden rounded-lg border">
                      {isVideo ? (
                        currentUrl ? (
                          <video
                            src={currentUrl}
                            controls
                            className="h-full w-full rounded-lg object-contain"
                            onError={(e) =>
                              console.error("Video player error:", e)
                            }
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                            <div className="text-primary text-sm font-medium">
                              Video Available
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
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
                          className="rounded-lg transition-transform duration-300 group-hover/preview:scale-[1.02]"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-md opacity-0 shadow-lg transition-opacity group-hover/preview:opacity-100"
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
                      <div className="bg-muted/30 border-border/40 flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
                        <ImageOff className="text-muted-foreground/60 mb-2 h-8 w-8" />
                        <p className="text-muted-foreground text-sm font-medium">
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
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 flex justify-end pt-4">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving || !hasChangesToSave}
            size="lg"
            className={`border px-6 py-3 shadow-xl transition-all duration-300 ${
              isSaving || !hasChangesToSave
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed hover:shadow-xl"
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:shadow-2xl"
            }`}
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
