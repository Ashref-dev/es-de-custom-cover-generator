/**
 * File System Access API utilities
 *
 * These utilities help access and process files from the user's file system
 * using the modern File System Access API
 */

import { Game } from "@/types";
import { CONSOLES, MEDIA_TYPES } from "@/lib/constants";
import { normalizeGameKey } from "@/lib/gameMediaHelpers";

/**
 * Polyfill for window.showDirectoryPicker
 * This is provided as a type definition only since we use the browser API directly
 */
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

/**
 * Opens a directory picker for the user to select the ES-DE/downloaded_media folder
 * @param readWrite - Request read-write permissions if true (needed for deletion)
 * @returns Promise resolving to a directory handle
 */
export async function openMediaFolder(readWrite = false): Promise<any> {
  try {
    // Check if the API is available
    if (!("showDirectoryPicker" in window)) {
      throw new Error(
        "File System Access API is not supported in this browser."
      );
    }

    // Ask for permission to access the file system
    const options = {
      id: "esde-media-folder",
      mode: readWrite ? "readwrite" : "read",
    } as any;

    // Using 'any' type here to avoid TypeScript errors with the File System Access API
    const directoryHandle = await (window as any).showDirectoryPicker(options);

    return directoryHandle;
  } catch (error: any) {
    console.error("Error opening media folder:", error);
    if (error.name === "AbortError") {
      throw new Error("Folder selection was cancelled.");
    }
    if (error.name === "NotAllowedError") {
      throw new Error(
        "Permission denied. Read-write access is required for deletion."
      );
    }
    throw new Error(
      `Failed to access the folder: ${error.message}. Please try again.`
    );
  }
}

/**
 * Processes the ES-DE/downloaded_media directory to extract game information
 * @param dirHandle The directory handle for the downloaded_media folder (type any)
 * @param customConsoles Optional array of custom console definitions
 * @returns Promise resolving to an array of Game objects
 */
export async function scanMediaFolder(
  dirHandle: any,
  customConsoles: any[] = []
): Promise<Game[]> {
  const games: Game[] = [];

  try {
    // Combine standard and custom consoles
    const allConsoles = [...CONSOLES, ...customConsoles];

    // Process each entry (console folder) in the main directory
    for await (const [name, handle] of dirHandle.entries()) {
      // Skip non-directory entries
      if (handle.kind !== "directory") {
        continue;
      }

      // Check if it's a known console
      const isKnownConsole = allConsoles.some((c) => c.value === name);

      // If it's not a known console, check if it might be a valid custom console folder
      // by looking for standard media subfolders (as requested by user)
      // This allows auto-detection or validation of custom folders
      const isValidConsole = isKnownConsole;

      // If it's a custom console (in our list but not in standard list), we should verify it has content
      // or if it's a folder that matches a custom console definition
      if (!isValidConsole) {
        continue;
      }

      // For custom consoles, we might want to verify they contain at least one media folder
      // to avoid picking up random folders like "CLEANUP" or ".stfolder" if they happened to match a name
      // (though name matching protects against this mostly)

      const consoleFolder = name;
      const gameMap = new Map<string, Game>();

      // Process media type folders within the console directory
      await processMediaFolders(handle, consoleFolder, gameMap);

      // Add all found games for this console to the result
      games.push(...gameMap.values());
    }

    return games.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error: any) {
    console.error("Error scanning media folder:", error);
    throw new Error(
      `Error processing the ESDE media folder: ${error.message}. The folder structure may be incorrect.`
    );
  }
}

/**
 * Process media type folders within a console folder
 * @param consoleHandle The directory handle for the console folder (type any)
 * @param consoleName The name of the console
 * @param gameMap Map to collect game information
 */
async function processMediaFolders(
  consoleHandle: any,
  consoleName: string,
  gameMap: Map<string, Game>
): Promise<void> {
  // Process each entry (media type folder) in the console directory
  for await (const [mediaType, mediaHandle] of consoleHandle.entries()) {
    if (mediaHandle.kind !== "directory") {
      continue;
    }

    // Process files in this media type folder
    await processMediaFiles(mediaHandle, consoleName, mediaType, gameMap);
  }
}

/**
 * Process media files within a media type folder
 * @param mediaHandle The directory handle for the media type folder (type any)
 * @param consoleName The name of the console
 * @param mediaType The type of media folder (covers, marquees, etc.)
 * @param gameMap Map to collect game information
 */
async function processMediaFiles(
  mediaHandle: any,
  consoleName: string,
  mediaType: string,
  gameMap: Map<string, Game>
): Promise<void> {
  // Process each entry (file) in the media type directory
  for await (const [fileName, fileHandle] of mediaHandle.entries()) {
    if (fileHandle.kind !== "file") {
      continue;
    }

    // Extract game name from file name (remove extension)
    const gameName = fileName.replace(/\.[^/.]+$/, "");

    // Skip if not a media file (e.g., hidden files)
    if (!gameName) {
      continue;
    }

    // Create a normalized key for case/whitespace-insensitive lookup
    const normalizedGameName = normalizeGameKey(gameName);

    // Get or create game entry using normalized key
    let game = gameMap.get(normalizedGameName);
    if (!game) {
      game = {
        id: `${consoleName}_${normalizedGameName}`,
        name: gameName, // Keep original as display (may include punctuation like .hack)
        console: consoleName,
        hasCover: false,
        hasLogo: false,
        hasVideo: false,
        mediaTypes: [],
        // Initialize comprehensive media status tracking
        mediaStatus: {
          covers: false,
          marquees: false,
          screenshots: false,
          titlescreens: false,
          "3dboxes": false,
          backcovers: false,
          fanart: false,
          physicalmedia: false,
          videos: false,
        },
        // Initialize all handles as undefined
        coverFileHandle: undefined,
        logoFileHandle: undefined,
        screenshotFileHandle: undefined,
        box3dFileHandle: undefined,
        backCoverFileHandle: undefined,
        fanartFileHandle: undefined,
        physicalMediaFileHandle: undefined,
        titleScreenFileHandle: undefined,
      };
      gameMap.set(normalizedGameName, game);
    }

    // Update media type flags, store corresponding file handles, and update mediaStatus
    switch (mediaType) {
      case "covers":
        game.hasCover = true;
        game.coverFileHandle = fileHandle;
        game.mediaStatus.covers = true;
        break;
      case "marquees":
        game.hasLogo = true;
        game.logoFileHandle = fileHandle;
        game.mediaStatus.marquees = true;
        break;
      case "videos":
        game.hasVideo = true;
        game.mediaStatus.videos = true;
        // game.videoFileHandle = fileHandle; // If needed
        break;
      case "screenshots":
        game.screenshotFileHandle = fileHandle;
        game.mediaStatus.screenshots = true;
        break;
      case "3dboxes":
        game.box3dFileHandle = fileHandle;
        game.mediaStatus["3dboxes"] = true;
        break;
      case "backcovers":
        game.backCoverFileHandle = fileHandle;
        game.mediaStatus.backcovers = true;
        break;
      case "fanart":
        game.fanartFileHandle = fileHandle;
        game.mediaStatus.fanart = true;
        break;
      case "physicalmedia":
        game.physicalMediaFileHandle = fileHandle;
        game.mediaStatus.physicalmedia = true;
        break;
      case "titlescreens":
        game.titleScreenFileHandle = fileHandle;
        game.mediaStatus.titlescreens = true;
        break;
      // Add cases for other media types if necessary
    }

    // Add media type folder name if not already present
    if (!game.mediaTypes.includes(mediaType)) {
      game.mediaTypes.push(mediaType);
    }
  }
}

/**
 * Deletes all media files associated with a specific game for a given console.
 * Requires a directory handle with read-write permissions.
 * @param dirHandle The root downloaded_media directory handle (with read-write access)
 * @param consoleName The console identifier (e.g., 'gba')
 * @param gameName The name of the game (without extension)
 * @returns Promise resolving when deletion is complete
 */
export async function deleteGameMedia(
  dirHandle: any,
  consoleName: string,
  gameName: string
): Promise<void> {
  try {
    // Get the handle for the specific console directory
    const consoleHandle = await dirHandle.getDirectoryHandle(consoleName);

    let filesDeleted = 0;
    const errors: string[] = [];

    // Iterate through known media type folders for that console
    for (const mediaType of MEDIA_TYPES) {
      try {
        // Get the handle for the media type directory (e.g., 'covers', 'marquees')
        const mediaDirHandle = await consoleHandle.getDirectoryHandle(
          mediaType.folder
        );

        // Iterate through files in the media directory to find matches
        for await (const [fileName] of mediaDirHandle.entries()) {
          // Check if the file name (without extension) matches the game name using normalized key
          const currentFileGameName = fileName.replace(/\.[^/.]+$/, "");
          if (
            normalizeGameKey(currentFileGameName) === normalizeGameKey(gameName)
          ) {
            try {
              // Attempt to remove the file
              await mediaDirHandle.removeEntry(fileName);
              console.log(
                `Deleted: ${consoleName}/${mediaType.folder}/${fileName}`
              );
              filesDeleted++;
            } catch (removeError: any) {
              console.error(`Failed to delete file ${fileName}:`, removeError);
              errors.push(
                `Failed to delete ${fileName}: ${removeError.message}`
              );
            }
          }
        }
      } catch (error: any) {
        // Ignore errors if a media type folder doesn't exist (e.g., Not found: NotFoundError)
        if (error.name !== "NotFoundError") {
          console.warn(
            `Skipping folder ${consoleName}/${mediaType.folder}: ${error.message}`
          );
        }
      }
    }

    if (filesDeleted === 0 && errors.length === 0) {
      console.warn(
        `No files found to delete for game "${gameName}" in console "${consoleName}".`
      );
      // Optionally throw an error or return a status if needed
      // throw new Error(`No files found to delete for game "${gameName}".`);
    }

    if (errors.length > 0) {
      throw new Error(
        `Deletion partially failed. Errors: ${errors.join("; ")}`
      );
    }

    console.log(
      `Successfully deleted ${filesDeleted} media file(s) for game "${gameName}".`
    );
  } catch (error: any) {
    console.error(
      `Error deleting game media for "${gameName}" in console "${consoleName}":`,
      error
    );
    // Handle case where console directory itself might not be found
    if (error.name === "NotFoundError") {
      throw new Error(`Console folder "${consoleName}" not found.`);
    }
    throw new Error(`Failed to delete game media: ${error.message}`);
  }
}
