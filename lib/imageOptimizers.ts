import { fromBlob } from "image-resize-compress";

/**
 * Client-side image optimization utilities.
 */

/**
 * Optimizes an image file using the image-resize-compress library.
 * Resizes the image if its dimensions exceed the specified maximum,
 * while maintaining aspect ratio. For PNG files, only resizing is applied
 * to preserve transparency. For other formats, both resizing and compression are applied.
 *
 * @param originalFile The original image File object.
 * @param maxDimension The maximum allowed dimension (width or height) in pixels.
 * @param qualitySetting The quality setting for compression (0-100), used for JPEG/WebP. Defaults to 75.
 * @returns A Promise that resolves with the optimized File object (or the original if no optimization was needed).
 */
export async function optimizeImage(
  originalFile: File,
  maxDimension: number,
  qualitySetting: number = 75
): Promise<File> {
  const originalMimeType = originalFile.type;
  const isPng = originalMimeType === "image/png";

  let outputFormat: "jpeg" | "png" | "webp";
  let outputMimeType: string;

  // Determine output format based on original file type, preserving it
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
      outputFormat = "webp";
      outputMimeType = "image/webp";
      break;
    default:
      // For other image types, default to PNG to preserve potential transparency
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
          targetHeight = "auto";
        } else {
          targetHeight = maxDimension;
          targetWidth = "auto";
        }
      }

      // For PNG files, only resize if needed (preserve transparency, no compression)
      // For other formats, always process for compression benefits
      const shouldProcess = isPng ? needsResize : true;

      if (!shouldProcess) {
        resolve(originalFile);
        return;
      }

      // Process the image - resize only for PNG, resize + compress for others
      try {
        // For PNG files that don't need resizing, return original
        if (isPng && !needsResize) {
          resolve(originalFile);
          return;
        }

        // Use quality setting only for non-PNG formats
        const effectiveQuality = isPng ? 100 : qualitySetting;

        const optimizedBlob = await fromBlob(
          originalFile,
          effectiveQuality,
          targetWidth as number | "auto",
          targetHeight as number | "auto",
          outputFormat
        );

        // Preserve original filename but update extension if format changed
        const nameParts = originalFile.name.split(".");
        const baseName =
          nameParts.length > 1
            ? nameParts.slice(0, -1).join(".")
            : originalFile.name;
        const newExtension = outputFormat === "jpeg" ? "jpg" : outputFormat;
        const optimizedFileName = `${baseName}.${newExtension}`;

        const optimizedFile = new File([optimizedBlob], optimizedFileName, {
          type: outputMimeType,
          lastModified: Date.now(),
        });

        // Log optimization results
        const originalSizeKB = (originalFile.size / 1024).toFixed(1);
        const newSizeKB = (optimizedFile.size / 1024).toFixed(1);
        const compressionRatio = (
          (optimizedFile.size / originalFile.size) *
          100
        ).toFixed(1);

        const optimizationType = isPng ? "resized" : "optimized";
        console.log(
          `Image ${optimizationType}: ${originalSizeKB} KB → ${newSizeKB} KB (${compressionRatio}% of original)`
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
