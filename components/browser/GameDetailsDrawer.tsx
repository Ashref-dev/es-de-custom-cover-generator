"use client";

import { useState, useEffect } from "react";
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
import { Game } from "@/types";
import { CONSOLES, MEDIA_TYPES } from "@/lib/constants";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameMediaForm } from "./GameMediaForm";

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

export function GameDetailsDrawer({
  game,
  isOpen,
  onClose,
  mainDirHandle,
  onGameUpdate,
}: GameDetailsDrawerProps) {
  const [currentMediaUrls, setCurrentMediaUrls] = useState<
    Record<string, string>
  >({});
  const [isLoadingUrls, setIsLoadingUrls] = useState<boolean>(true);

  const consoleLabel = game
    ? CONSOLES.find((c) => c.value === game.console)?.label || game.console
    : "";

  // Effect to load current media URLs when game changes
  useEffect(() => {
    if (game && isOpen) {
      const loadUrls = async () => {
        setIsLoadingUrls(true);
        const urls: Record<string, string> = {};

        for (const mediaType of MEDIA_TYPES) {
          if (mediaType.key === "videos") {
            if (game.hasVideo && mainDirHandle) {
              try {
                const consoleDirHandle = await mainDirHandle.getDirectoryHandle(
                  game.console
                );
                const videosDirHandle =
                  await consoleDirHandle.getDirectoryHandle(mediaType.folder);
                const videoFileHandle = await videosDirHandle.getFileHandle(
                  game.name + mediaType.extension
                );
                urls[mediaType.key] = await loadFileAsUrl(videoFileHandle);
              } catch (error) {
                console.error(
                  `Error loading URL for video '${game.name}${mediaType.extension}':`,
                  error
                );
                urls[mediaType.key] = "";
              }
            } else {
              urls[mediaType.key] = "";
            }
            continue;
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

          const handleName = mediaKeyToGameHandle[mediaType.key];
          if (handleName) {
            const fileHandle = game[handleName];
            if (fileHandle) {
              try {
                urls[mediaType.key] = await loadFileAsUrl(fileHandle);
              } catch (error) {
                console.error(
                  `Error loading URL for ${mediaType.label}:`,
                  error
                );
                urls[mediaType.key] = "";
              }
            } else {
              urls[mediaType.key] = "";
            }
          }
        }
        setCurrentMediaUrls(urls);
        setIsLoadingUrls(false);
      };
      loadUrls();
    } else if (!isOpen) {
      // Clean up object URLs when drawer is closed
      Object.values(currentMediaUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      setCurrentMediaUrls({});
    }

    return () => {
      // Cleanup on unmount
      Object.values(currentMediaUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [game, isOpen, mainDirHandle]);

  if (!game) {
    return null;
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Clean up object URLs when drawer is closed
          Object.values(currentMediaUrls).forEach((url) => {
            if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
          setCurrentMediaUrls({});
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="h-[99vh] w-screen flex flex-col border-none"
      >
        <SheetHeader className="p-6 bg-background border-b border-border/40 shadow-sm z-10 flex-shrink-0">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="flex-1">
              <SheetTitle className="text-3xl font-bold tracking-tight">
                {game.name}
              </SheetTitle>
              <SheetDescription className="text-lg text-muted-foreground mt-1">
                {consoleLabel} — Media Management
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full ml-4 flex-shrink-0 hover:bg-muted/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="max-w-7xl mx-auto p-6">
              <GameMediaForm
                game={game}
                mainDirHandle={mainDirHandle}
                currentMediaUrls={currentMediaUrls}
                isLoadingUrls={isLoadingUrls}
                onGameUpdate={onGameUpdate}
              />
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="p-6 border-t border-border/40 bg-background z-10 flex-shrink-0 mt-auto">
          <div className="max-w-7xl mx-auto w-full flex justify-center">
            <SheetClose asChild>
              <Button variant="outline" size="lg" className="px-6">
                Close
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
