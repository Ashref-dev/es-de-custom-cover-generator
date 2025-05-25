import { fromBlob } from "image-resize-compress";

/**
 * Client-side image optimization utilities.
 */

/**
 * Optimizes an image file using the image-resize-compress library.
 * Resizes the image if its dimensions exceed the specified maximum,
 * while maintaining aspect ratio. It attempts to preserve the original
 * file format (PNG to PNG, JPG to JPG). For other types, it may convert to PNG.
 *
 * @param originalFile The original image File object.
 * @param maxDimension The maximum allowed dimension (width or height) in pixels.
 * @param qualitySetting The quality setting for compression (0-100), primarily for JPEG/WebP. Defaults to 85.
 * @returns A Promise that resolves with the optimized File object (or the original if no optimization was needed).
 */
export async function optimizeImage(
  originalFile: File,
  maxDimension: number,
  qualitySetting: number = 85 // Used for 'jpeg' and 'webp'
): Promise<File> {
  let outputFormat: "jpeg" | "png" | "webp";
  let outputMimeType: string;
  const originalMimeType = originalFile.type;

  // Determine output format based on original file type, aiming to preserve it
  switch (originalMimeType) {
    case "image/png":
      outputFormat = "png";
      outputMimeType = "image/png";
      break;
    case "image/jpeg":
      outputFormat = "jpeg";
      outputMimeType = "image/jpeg";
      break;
    case "image/webp":
      // Preserve WebP if it reaches here.
      // Note: FileUploadDropzone currently converts WebP to JPG prior to this stage.
      // If a raw WebP is processed, it will attempt to output WebP.
      outputFormat = "webp";
      outputMimeType = "image/webp";
      break;
    default:
      // For other image types, default to PNG to preserve potential transparency.
      console.warn(
        `Optimizing an unsupported input type ${originalMimeType}. Converting to PNG.`
      );
      outputFormat = "png";
      outputMimeType = "image/png";
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(originalFile);

    image.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      const { width: originalWidth, height: originalHeight } = image;
      let targetWidth: number | string = originalWidth;
      let targetHeight: number | string = originalHeight;
      let needsResize = false;

      // Check if resizing is needed
      if (originalWidth > maxDimension || originalHeight > maxDimension) {
        needsResize = true;
        if (originalWidth > originalHeight) {
          targetWidth = maxDimension;
          targetHeight = "auto"; // Library calculates this based on aspect ratio
        } else {
          targetHeight = maxDimension;
          targetWidth = "auto"; // Library calculates this
        }
      }

      // Determine if format conversion is effectively happening
      // This is true if the originalMimeType is different from the determined outputMimeType (e.g., fallback case)
      const needsFormatConversion = originalMimeType !== outputMimeType;

      // Always apply compression for optimization, even if no resizing is needed
      // Only skip processing if it's already the exact same format and we want to preserve original quality
      // For now, we'll always process to ensure compression is applied
      const shouldProcess = true; // Always process for compression benefits

      if (!shouldProcess) {
        resolve(originalFile);
        return;
      }

      // If only format conversion is needed (no resize), ensure original dimensions are used for target
      if (needsFormatConversion && !needsResize) {
        targetWidth = originalWidth;
        targetHeight = originalHeight;
      }

      // If no resizing but we want compression, keep original dimensions
      if (!needsResize && !needsFormatConversion) {
        targetWidth = originalWidth;
        targetHeight = originalHeight;
      }

      // At this point, processing (resize or format change or both) is required.
      try {
        const optimizedBlob = await fromBlob(
          originalFile,
          qualitySetting,
          targetWidth as number | "auto", // Explicit cast
          targetHeight as number | "auto", // Explicit cast
          outputFormat
        );

        // Preserve original filename but update extension if format changed
        const nameParts = originalFile.name.split(".");
        const originalExtension = nameParts.length > 1 ? nameParts.pop() : "";
        const baseName = nameParts.join(".");

        // Use the outputFormat for the new extension (e.g., 'jpeg', 'png')
        const newExtension = outputFormat;

        const optimizedFileName = `${baseName}.${newExtension}`;

        const optimizedFile = new File([optimizedBlob], optimizedFileName, {
          type: outputMimeType,
          lastModified: Date.now(),
        });

        // Single clear log message with compression info
        const originalSizeKB = (originalFile.size / 1024).toFixed(1);
        const newSizeKB = (optimizedFile.size / 1024).toFixed(1);
        const compressionRatio = (
          (optimizedFile.size / originalFile.size) *
          100
        ).toFixed(1);

        console.log(
          `Image optimized: ${originalSizeKB} KB → ${newSizeKB} KB (${compressionRatio}% of original)`
        );

        resolve(optimizedFile);
      } catch (error) {
        console.error(
          "Error during image optimization with image-resize-compress:",
          error
        );
        reject(
          new Error(
            `Failed to optimize image: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      }
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      console.error("Error loading image for optimization check:", error);
      reject(
        new Error(
          "Failed to load the image. It might be corrupted or an unsupported format."
        )
      );
    };

    image.src = objectUrl;
  });
}
