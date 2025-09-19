"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { CONSOLES, MEDIA_TYPES } from "@/lib/constants";
import { sanitizeBasenameForSave } from "@/lib/gameMediaHelpers";
import { MEDIA_KEY_TO_GAME_HANDLE } from "@/lib/gameMediaHelpers";
import { loadFileAsUrl } from "@/lib/mediaFileOperations";
import { ArrowLeft, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameMediaForm } from "./GameMediaForm";
import { GamePreview } from "./GamePreview";

interface GameDetailsDrawerProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  mainDirHandle: any; // Ideally FileSystemDirectoryHandle
  onGameUpdate: (updatedGame: Game) => void;
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
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

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
                let loaded = false;
                const candidates = [
                  game.name + mediaType.extension,
                  sanitizeBasenameForSave(game.name) + mediaType.extension,
                ];
                for (const candidate of candidates) {
                  try {
                    const fh = await videosDirHandle.getFileHandle(candidate);
                    urls[mediaType.key] = await loadFileAsUrl(fh);
                    loaded = true;
                    break;
                  } catch {}
                }
                if (!loaded) urls[mediaType.key] = "";
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
          const handleName = MEDIA_KEY_TO_GAME_HANDLE[mediaType.key];
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
      setCurrentMediaUrls({});
    }
  }, [game, isOpen, mainDirHandle]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      Object.values(currentMediaUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [currentMediaUrls]);

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
        className="flex h-[100dvh] w-screen flex-col !gap-0 border-none"
      >
        <SheetHeader className="bg-background border-border/40 z-10 flex-shrink-0 border-b shadow-sm">
          <div className="mx-auto flex w-full max-w-7xl items-start justify-between">
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-2xl font-bold tracking-tight">
                {game.name}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                {consoleLabel} — Media Management
              </SheetDescription>
            </div>
            <div className="ml-4 flex flex-shrink-0 gap-2">
              {/* Game preview button is WIP  */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 transition-colors"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="h-4 w-4" />
                Preview Game
              </Button>
              <SheetClose asChild>
                <Button size="sm" className="gap-2 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Go back
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full px-4">
            <div className="mx-auto max-w-7xl py-4">
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

        {/* Game Preview Dialog */}
        <GamePreview
          game={game}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
