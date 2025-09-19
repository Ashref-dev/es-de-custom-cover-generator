/**
 * Game Media Helpers
 *
 * Game-specific utilities and business logic for media management.
 * This includes mappings, game data updates, and media status handling.
 */

import { Game } from "@/types";

/**
 * Mapping from media type keys to Game object file handle properties
 */
export const MEDIA_KEY_TO_GAME_HANDLE: Record<string, keyof Game | undefined> =
  {
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
 * Updates a game object with new media file information
 *
 * @param game The game object to update
 * @param mediaTypeKey The media type key (covers, marquees, etc.)
 * @param fileHandle The new file handle
 * @param mediaTypeFolder The folder name for this media type
 * @returns Updated game object
 */
export function updateGameWithMediaFile(
  game: Game,
  mediaTypeKey: string,
  fileHandle: any,
  mediaTypeFolder: string
): Game {
  const updatedGame = { ...game };

  // Update the appropriate file handle
  const gameHandleKey = MEDIA_KEY_TO_GAME_HANDLE[mediaTypeKey];
  if (gameHandleKey) {
    (updatedGame as any)[gameHandleKey] = fileHandle;
  }

  // Update specific boolean flags
  switch (mediaTypeKey) {
    case "covers":
      updatedGame.hasCover = true;
      updatedGame.mediaStatus.covers = true;
      break;
    case "marquees":
      updatedGame.hasLogo = true;
      updatedGame.mediaStatus.marquees = true;
      break;
    case "videos":
      updatedGame.hasVideo = true;
      updatedGame.mediaStatus.videos = true;
      break;
    case "screenshots":
      updatedGame.mediaStatus.screenshots = true;
      break;
    case "3dboxes":
      updatedGame.mediaStatus["3dboxes"] = true;
      break;
    case "backcovers":
      updatedGame.mediaStatus.backcovers = true;
      break;
    case "fanart":
      updatedGame.mediaStatus.fanart = true;
      break;
    case "physicalmedia":
      updatedGame.mediaStatus.physicalmedia = true;
      break;
    case "titlescreens":
      updatedGame.mediaStatus.titlescreens = true;
      break;
  }

  // Add media type to the list if not present
  if (!updatedGame.mediaTypes.includes(mediaTypeFolder)) {
    updatedGame.mediaTypes.push(mediaTypeFolder);
  }

  return updatedGame;
}

/**
 * Gets the maximum dimension for image optimization based on media type
 *
 * @param mediaTypeKey The media type key
 * @returns The maximum dimension in pixels
 */
export function getOptimizationDimension(mediaTypeKey: string): number {
  switch (mediaTypeKey) {
    case "marquees":
      return 600; // Smaller for logos
    default:
      return 1920; // Standard for most images
  }
}

/**
 * Checks if a media type supports optimization
 *
 * @param mediaTypeKey The media type key
 * @returns True if optimization is supported
 */
export function supportsOptimization(mediaTypeKey: string): boolean {
  return mediaTypeKey !== "videos";
}

/**
 * Gets the default optimization settings for each media type
 *
 * @returns Record of default optimization settings
 */
export function getDefaultOptimizationSettings(): Record<string, boolean> {
  return {
    marquees: true, // Default enabled for marquees only
    covers: false, // Default off for all other image types
    screenshots: false,
    "3dboxes": false,
    backcovers: false,
    fanart: false,
    physicalmedia: false,
    titlescreens: false,
  };
}

/**
 * Validates if a file is appropriate for a given media type
 *
 * @param file The file to validate
 * @param mediaType The media type configuration
 * @returns True if the file is valid for this media type
 */
export function validateMediaFile(file: File, mediaType: any): boolean {
  // Check if file type matches the expected type
  const isVideo = mediaType.key === "videos";
  const isImage = !isVideo;

  if (isVideo && !file.type.startsWith("video/")) {
    return false;
  }

  if (isImage && !file.type.startsWith("image/")) {
    return false;
  }

  // Additional validation could go here (file size, dimensions, etc.)
  return true;
}

/**
 * Generates a filename for a game's media file
 *
 * @param gameName The name of the game
 * @param extension The file extension (including the dot)
 * @returns The complete filename
 */
export function generateMediaFileName(
  gameName: string,
  extension: string
): string {
  return gameName + extension;
}

/**
 * Normalizes a game basename to a canonical key for grouping/lookup.
 * - Unicode normalize (NFKC)
 * - Convert all unicode whitespace (incl. NBSP) to regular spaces
 * - Collapse multiple spaces to a single space
 * - Trim leading/trailing spaces
 * - Lowercase
 * Does NOT remove punctuation (.,-_/& etc.) to avoid breaking titles like .hack
 */
export function normalizeGameKey(name: string): string {
  return (
    name
      .normalize("NFKC")
      // Replace any unicode whitespace class (incl NBSP, en/em spaces, etc.) with plain space
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\s]+/g, " ")
      .trim()
      .toLowerCase()
  );
}

/**
 * Sanitizes a basename for saving to disk while preserving case.
 * Applies the same unicode and spacing normalization as normalizeGameKey,
 * but does NOT lowercase so filenames can retain user-preferred casing.
 */
export function sanitizeBasenameForSave(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\s]+/g, " ")
    .trim();
}
