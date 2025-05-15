"use client";

import { useState, useCallback, useRef } from "react";
import { MEDIA_TYPES, CONSOLES } from "@/lib/constants";
import { openMediaFolder } from "@/lib/filesystem";
import FileUploadDropzone from "@/components/FileUploadDropzone";
import ConsoleSelector from "@/components/ConsoleSelector";
import SubmitButton from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Client component that handles all the interactive functionality
 * for the media generator, including file uploads and creating the correct
 * folder structure directly in the user's ES-DE downloaded_media folder.
 */
export default function MediaGenerator() {
  // State for ROM name
  const [romName, setRomName] = useState<string>("");

  // State for selected console
  const [consoleName, setConsoleName] = useState<string>("");

  // State for file uploads, one state per media type
  const [mediaFiles, setMediaFiles] = useState<Record<string, File | null>>(
    MEDIA_TYPES.reduce(
      (acc, mediaType) => ({ ...acc, [mediaType.key]: null }),
      {}
    )
  );

  // State for pending/loading status
  const [isPending, setIsPending] = useState<boolean>(false);

  // State for error message
  const [error, setError] = useState<string | null>(null);

  // State for success message
  const [success, setSuccess] = useState<string | null>(null);

  // State for help dialog
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);

  // State for confetti animation
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Ref to store the directory handle
  const dirHandleRef = useRef<any>(null);

  // Ref for success message to scroll to
  const successRef = useRef<HTMLDivElement>(null);

  // State to track if user has selected a folder
  const [hasFolderAccess, setHasFolderAccess] = useState<boolean>(false);

  // Use useCallback for functions passed down to memoized components if needed
  const updateMediaFile = useCallback((key: string, file: File | null) => {
    setMediaFiles((prev) => ({ ...prev, [key]: file }));
    // Clear messages when user makes changes
    setError(null);
    setSuccess(null);
  }, []);

  // Count how many files have been uploaded
  const uploadedFileCount = Object.values(mediaFiles).filter(Boolean).length;

  // Reset the form to start a new game
  const handleStartNewGame = () => {
    // Reset all form fields
    setRomName("");
    setConsoleName("");
    setMediaFiles(
      MEDIA_TYPES.reduce(
        (acc, mediaType) => ({ ...acc, [mediaType.key]: null }),
        {}
      )
    );

    // Clear messages
    setSuccess(null);
    setError(null);

    // Reset confetti
    setShowConfetti(false);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select the downloaded_media folder
  const selectMediaFolder = async () => {
    setShowHelpDialog(false);
    setError(null);
    setIsPending(true);

    try {
      const dirHandle = await openMediaFolder(true); // Request with write permissions
      dirHandleRef.current = dirHandle;
      setHasFolderAccess(true);
      setSuccess("ES-DE downloaded_media folder successfully selected!");
    } catch (err) {
      console.error("Error selecting folder:", err);
      setError(err instanceof Error ? err.message : "Failed to select folder");
      setHasFolderAccess(false);
    } finally {
      setIsPending(false);
    }
  };

  // Create files directly in the ES-DE folder structure
  const createMediaFiles = async () => {
    // Clear any previous messages
    setError(null);
    setSuccess(null);
    setIsPending(true);
    setShowConfetti(false);

    try {
      // Validation
      if (!romName.trim()) {
        throw new Error("Please enter a ROM name");
      }

      if (!consoleName) {
        throw new Error("Please select a console/system");
      }

      if (uploadedFileCount === 0) {
        throw new Error("Please upload at least one media file");
      }

      if (!dirHandleRef.current) {
        throw new Error(
          "Please select the ES-DE downloaded_media folder first"
        );
      }

      // Try to access the media folder with write permissions
      const permissionStatus = await dirHandleRef.current.requestPermission({
        mode: "readwrite",
      });
      if (permissionStatus !== "granted") {
        throw new Error(
          "Write permission denied. Please grant write access to create files."
        );
      }

      // Check if console folder exists, create if not
      let consoleHandle;
      try {
        consoleHandle = await dirHandleRef.current.getDirectoryHandle(
          consoleName,
          { create: true }
        );
      } catch (err) {
        throw new Error(
          `Failed to create or access ${consoleName} folder: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }

      // Create media folders and files
      const processedFiles = [];

      for (const mediaType of MEDIA_TYPES) {
        const file = mediaFiles[mediaType.key];

        if (file) {
          try {
            // Create or get media type folder (e.g., covers, marquees)
            const mediaFolder = await consoleHandle.getDirectoryHandle(
              mediaType.folder,
              { create: true }
            );

            // Determine file extension from mediaType config
            const fileExtension = mediaType.extension;

            // Construct target filename with proper extension
            const targetFilename = `${romName.trim()}${fileExtension}`;

            // Create a file in the media folder
            const fileHandle = await mediaFolder.getFileHandle(targetFilename, {
              create: true,
            });

            // Get a writable stream
            const writable = await fileHandle.createWritable();

            // Write file content
            await writable.write(file);

            // Close the file
            await writable.close();

            processedFiles.push(`${mediaType.label} (${targetFilename})`);
          } catch (err) {
            console.error(`Error creating ${mediaType.key} file:`, err);
            throw new Error(
              `Failed to create ${mediaType.label} file: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      const consoleLabel =
        CONSOLES.find((c) => c.value === consoleName)?.label || consoleName;

      setSuccess(
        `Successfully created ${processedFiles.length} media file${
          processedFiles.length !== 1 ? "s" : ""
        } for "${romName}" on ${consoleLabel}!`
      );

      // Trigger confetti animation
      setShowConfetti(true);

      // Scroll to success message after a brief delay to ensure it's rendered
      setTimeout(() => {
        if (successRef.current) {
          successRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border dark:border-slate-800 shadow-sm dark:shadow-slate-950/20">
      {/* Confetti component */}
      <Confetti active={showConfetti} duration={6000} />

      <CardHeader className="text-center pt-8 pb-6">
        <CardTitle className="font-pixel text-4xl md:text-6xl mb-4 bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] bg-clip-text text-transparent">
          ESDE Media Generator
        </CardTitle>
        <CardDescription className="text-base md:text-lg max-w-lg mx-auto">
          Generate the correct folder structure for Emulation Station Desktop
          Edition media files.
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
          <div ref={successRef}>
            <Alert
              variant="default"
              className="border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 animate-in fade-in-50 duration-500"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span>{success}</span>
                <Button
                  onClick={handleStartNewGame}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-800 dark:hover:text-green-200 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Start New Game
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Media Folder Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-pixel bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] bg-clip-text text-transparent">
              Step 1: Select Folder
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--gradient-1)]/20 to-transparent"></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex-grow">
              <p className="text-sm font-medium mb-1">
                ES-DE downloaded_media Folder
              </p>
              <p className="text-xs text-muted-foreground">
                {hasFolderAccess
                  ? "✓ Folder access granted"
                  : "Select the downloaded_media folder to create files"}
              </p>
            </div>
            <Button
              onClick={() => setShowHelpDialog(true)}
              disabled={isPending}
              className="gap-2"
              variant={hasFolderAccess ? "outline" : "default"}
            >
              <FolderOpen className="h-4 w-4" />
              {hasFolderAccess ? "Change Folder" : "Select Folder"}
            </Button>
          </div>
        </div>

        {/* ROM Name */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-pixel bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] bg-clip-text text-transparent">
              Step 2: Game Details
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--gradient-1)]/20 to-transparent"></div>
          </div>

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
              This should match the exact filename of your ROM (without
              extension)
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
        </div>

        {/* Media Upload Sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-pixel bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] bg-clip-text text-transparent">
              Step 3: Media Files
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--gradient-1)]/20 to-transparent"></div>
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
                onChange={(file: File | null) =>
                  updateMediaFile(mediaType.key, file)
                }
                label={mediaType.label}
                description={mediaType.description}
              />
            ))}
          </div>
        </div>

        {/* Start New Game Button */}
        {(romName || consoleName || uploadedFileCount > 0) && !success && (
          <div className="border-t pt-6 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNewGame}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Form
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-6 pb-8 px-6">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center bg-muted/30 px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">
              {uploadedFileCount} file{uploadedFileCount !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <SubmitButton
            isPending={isPending}
            text="Create Media Files"
            pendingText="Creating Files..."
            onClick={createMediaFiles}
            disabled={
              isPending ||
              uploadedFileCount === 0 ||
              !romName.trim() ||
              !consoleName ||
              !hasFolderAccess
            }
            className="w-full sm:w-auto"
          />
        </div>
      </CardFooter>

      {/* Help Dialog for media folder selection */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Select the ES-DE Media Folder
            </DialogTitle>
            <DialogDescription>
              Please follow these steps to select your ES-DE downloaded_media
              folder:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted p-4 text-sm">
              <ol className="list-decimal pl-4 space-y-3">
                <li>
                  Navigate to the{" "}
                  <span className="font-semibold">downloaded_media</span> folder
                  inside your ES-DE installation directory
                </li>
                <li>
                  On macOS, this is typically located at:
                  <span className="font-mono text-xs block mt-1 bg-background p-1.5 rounded border">
                    ~/ES-DE/downloaded_media
                  </span>
                </li>
                <li>
                  Select the{" "}
                  <span className="font-semibold">downloaded_media</span> folder
                  when prompted
                </li>
                <li>
                  Accept the browser permission dialog asking for access to the
                  folder
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p>
                Make sure to select the correct{" "}
                <span className="font-semibold">downloaded_media</span> folder,
                as this is where the media files will be created.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowHelpDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={selectMediaFolder} className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Browse for Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
