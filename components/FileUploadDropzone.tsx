"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone, FileRejection, DropEvent, Accept } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploadProps } from "@/types";
import { fromBlob } from "image-resize-compress";

// Debounce time in milliseconds
const DEBOUNCE_DELAY = 750;

// Define common image MIME types
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Converts WebP images to JPG format using image-resize-compress library
 * @param file The WebP file to convert
 * @returns A Promise resolving to a JPG File object
 */
async function convertWebPToJPG(file: File): Promise<File> {
  try {
    // Convert using fromBlob with high quality and original dimensions
    const resizedBlob = await fromBlob(
      file,
      100,
      "auto", // Keep original width
      "auto", // Keep original height
      "jpeg" // Convert to JPEG format
    );

    // Create a new File object with proper name and type
    const originalName = file.name.replace(/\.(webp)$/i, ".jpg");
    return new File([resizedBlob], originalName, { type: "image/jpeg" });
  } catch (error) {
    console.error("Error converting WebP to JPG:", error);
    throw new Error("Failed to convert WebP image to JPG format.");
  }
}

/**
 * Calls the backend API route to fetch an image URL and convert it to a File object.
 * Allows either JPG or PNG if expected type is an image.
 * @param url The URL of the image to fetch.
 * @param expectedMimeType The primary expected MIME type (e.g., 'image/jpeg', 'image/png', 'video/mp4').
 * @returns A Promise resolving to a File object.
 * @throws An error if fetching fails, the response is not the expected type, or other issues occur.
 */
async function fetchMediaViaApi(
  url: string,
  expectedMimeType: string
): Promise<File> {
  try {
    const apiResponse = await fetch("/api/fetch-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: url }), // API expects imageUrl key
    });

    if (!apiResponse.ok) {
      let errorMsg = `Failed to fetch via API: ${apiResponse.statusText}`;
      try {
        const errorBody = await apiResponse.json();
        errorMsg = errorBody.error || errorMsg;
      } catch {
        /* Ignore JSON parsing error */
      }
      throw new Error(errorMsg);
    }

    const blob = await apiResponse.blob();
    const fetchedContentType = apiResponse.headers.get("content-type");

    if (!fetchedContentType) {
      throw new Error("API response missing content type.");
    }

    // Type Validation:
    if (expectedMimeType.startsWith("image/")) {
      // If expecting an image, accept JPG, PNG, or WebP
      if (!IMAGE_MIME_TYPES.includes(fetchedContentType)) {
        throw new Error(
          `Fetched content type (${fetchedContentType}) is not an accepted image type (JPG, PNG, or WebP).`
        );
      }
    } else if (expectedMimeType.startsWith("video/")) {
      // If expecting video, enforce strict match
      if (fetchedContentType !== expectedMimeType) {
        throw new Error(
          `Fetched content type (${fetchedContentType}) does not match expected video type (${expectedMimeType}).`
        );
      }
    } else {
      // Handle other types if necessary, otherwise throw error for unexpected expectedMimeType
      throw new Error(`Unsupported expected media type: ${expectedMimeType}`);
    }

    const filename =
      url.substring(url.lastIndexOf("/") + 1) || "downloaded-media"; // Generic name
    let resultFile = new File([blob], filename, { type: fetchedContentType });

    // Convert WebP to JPG if needed
    if (fetchedContentType === "image/webp") {
      try {
        resultFile = await convertWebPToJPG(resultFile);
      } catch (conversionError) {
        console.error(
          "Failed to convert fetched WebP to JPG:",
          conversionError
        );
        throw new Error("Failed to convert fetched WebP image to JPG format.");
      }
    }

    return resultFile;
  } catch (error) {
    console.error("Error fetching media via API:", error);
    throw error;
  }
}

/**
 * File upload dropzone component with preview and URL input.
 * Accepts JPG/PNG/WebP for image types (WebP automatically converted to JPG).
 */
export default function FileUploadDropzone({
  value,
  accept: primaryAccept,
  onChange,
  label = "Upload File",
  description = "Drag and drop a file here, or click to select a file",
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [isConvertingWebP, setIsConvertingWebP] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine accepted types for Dropzone
  const acceptConfig: Accept = {};
  if (primaryAccept.startsWith("image/")) {
    acceptConfig["image/jpeg"] = [".jpg", ".jpeg"];
    acceptConfig["image/png"] = [".png"];
    acceptConfig["image/webp"] = [".webp"]; // Add WebP support
  } else if (primaryAccept.startsWith("video/")) {
    acceptConfig["video/mp4"] = [".mp4"];
  }
  // Add other types here if needed

  // --- Effects ---
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      setImageUrlInput("");
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (
      imageUrlInput &&
      (imageUrlInput.startsWith("http://") ||
        imageUrlInput.startsWith("https://"))
    ) {
      debounceTimeoutRef.current = setTimeout(async () => {
        setIsLoadingUrl(true);
        setError(null);
        try {
          // Use primaryAccept for validation within fetchMediaViaApi
          const mediaFile = await fetchMediaViaApi(
            imageUrlInput,
            primaryAccept
          );
          handleFileChange(mediaFile);
        } catch (fetchError) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch from URL."
          );
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
  const handleFileChange = useCallback(
    async (file: File | null) => {
      setError(null);
      setIsLoadingUrl(false);
      setIsConvertingWebP(false);

      if (file) {
        setImageUrlInput("");

        // Check if file is WebP and convert to JPG if needed
        if (file.type === "image/webp") {
          setIsConvertingWebP(true);
          try {
            const convertedFile = await convertWebPToJPG(file);
            setIsConvertingWebP(false);
            onChange(convertedFile);
          } catch (conversionError) {
            setIsConvertingWebP(false);
            setError(
              conversionError instanceof Error
                ? conversionError.message
                : "Failed to convert WebP image."
            );
            return;
          }
        } else {
          onChange(file);
        }
      } else {
        onChange(file);
      }
    },
    [onChange]
  );

  const onDrop = useCallback(
    async (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => {
      setError(null);
      setIsLoadingUrl(false);
      setImageUrlInput("");

      if (acceptedFiles.length > 0) {
        await handleFileChange(acceptedFiles[0]);
        return;
      }
      if (fileRejections.length > 0) {
        // Updated rejection message to include WebP support
        setError(
          `Invalid file type. Please upload ${
            primaryAccept.startsWith("image/") ? "JPG/PNG/WebP" : "MP4"
          }.`
        );
        return;
      }

      let url: string | null = null;
      if (event && "dataTransfer" in event && event.dataTransfer) {
        url =
          event.dataTransfer.getData("text/uri-list") ||
          event.dataTransfer.getData("text/plain");
      }

      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        setIsLoadingUrl(true);
        setError(null);
        try {
          const mediaFile = await fetchMediaViaApi(url, primaryAccept);
          handleFileChange(mediaFile);
        } catch (fetchError) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch from URL."
          );
          setIsLoadingUrl(false);
        }
      } else if (
        event &&
        "dataTransfer" in event &&
        event.dataTransfer?.files?.length === 0 &&
        !url
      ) {
        setError("No valid file or image URL was dropped.");
      }
    },
    [primaryAccept, handleFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig, // Use the generated accept config
    maxFiles: 1,
    multiple: false,
    noClick: isLoadingUrl || isConvertingWebP,
    noKeyboard: isLoadingUrl || isConvertingWebP,
    onDropRejected: undefined,
  });

  const clearFile = () => {
    handleFileChange(null);
  };

  // --- Render Logic ---
  const getBorderColor = () => {
    if (isDragActive) return "border-primary";
    if (error) return "border-destructive";
    if (value) return "border-green-500";
    if (isConvertingWebP) return "border-blue-500";
    return "border-muted-foreground/20";
  };

  return (
    <Card className="flex w-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-center space-y-3">
        {value && !isLoadingUrl && previewUrl ? (
          // Preview Mode
          <div className="space-y-2">
            <div className="bg-muted relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md">
              {value.type.startsWith("image/") ? (
                <Image
                  src={previewUrl}
                  alt={value.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : value.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  muted
                  className="max-h-full max-w-full"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  No preview available
                </p>
              )}
            </div>
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-2">
              <div className="mr-2 flex-1 truncate">
                <p className="truncate text-sm font-medium" title={value.name}>
                  {value.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {(value.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="flex-shrink-0"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : isLoadingUrl || isConvertingWebP ? (
          // URL Loading or WebP Conversion Mode
          <div className="border-primary flex h-full min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
            <p className="text-muted-foreground mb-2 text-sm">
              {isLoadingUrl
                ? "Fetching via server..."
                : "Converting WebP to JPG..."}
            </p>
            <Progress value={undefined} className="w-3/4 animate-pulse" />
            {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
          </div>
        ) : (
          // Input Mode (Dropzone + URL Field)
          <div className="space-y-3">
            <div
              {...getRootProps()}
              className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${getBorderColor()}`}
            >
              <input {...getInputProps()} />
              <UploadIcon className="text-muted-foreground mb-2 h-6 w-6" />
              <div className="text-muted-foreground text-center text-sm">
                {isDragActive
                  ? "Drop file/URL here"
                  : "Drag file/URL here, or click to select"}
              </div>
            </div>
            <div className="relative">
              <Label
                htmlFor={`${label}-url-input`}
                className="text-muted-foreground bg-background absolute -top-2 left-2 px-1 text-xs"
              >
                Or paste image URL
              </Label>
              <Input
                id={`${label}-url-input`}
                type="url"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="pt-2 text-sm"
                disabled={isLoadingUrl || isConvertingWebP}
              />
            </div>
            {error && (
              <p className="text-destructive mt-1 text-center text-xs">
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
