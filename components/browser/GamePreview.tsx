"use client";

import { useState, useEffect } from "react";
import { Game } from "@/types";
import { CONSOLES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface GamePreviewProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

async function loadFileAsUrl(fileHandle: any): Promise<string> {
  if (!fileHandle?.getFile) return "";
  try {
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

export function GamePreview({ game, isOpen, onClose }: GamePreviewProps) {
  const [logoUrl, setLogoUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const consoleLabel =
    CONSOLES.find((c) => c.value === game.console)?.label || game.console;

  useEffect(() => {
    if (!isOpen || !game) return;

    const loadMedia = async () => {
      if (game.logoFileHandle) {
        const url = await loadFileAsUrl(game.logoFileHandle);
        setLogoUrl(url);
      }
      if (game.screenshotFileHandle) {
        const url = await loadFileAsUrl(game.screenshotFileHandle);
        setScreenshotUrl(url);
      }
    };

    loadMedia();
  }, [isOpen, game]);

  useEffect(() => {
    return () => {
      if (logoUrl?.startsWith("blob:")) URL.revokeObjectURL(logoUrl);
      if (screenshotUrl?.startsWith("blob:"))
        URL.revokeObjectURL(screenshotUrl);
    };
  }, [logoUrl, screenshotUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!m-0 !h-screen !w-screen !max-w-full border-none bg-black p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Game Preview - {game.name}</DialogTitle>
        </DialogHeader>

        <div className="flex h-screen">
          {/* Left Panel */}
          <div className="w-1/2 bg-black/80">
            <div className="border-b border-gray-800 p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={`/logos/${game.console}.png`}
                  alt={consoleLabel}
                  width={64}
                  height={64}
                  className="opacity-80 brightness-0 invert"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `/logos/${game.console}.svg`;
                  }}
                />
                <div>
                  <h2 className="text-xl font-normal text-white">
                    {consoleLabel.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-400">1 game selected</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-700/30 py-2 pl-3 text-white">
                <div>{game.name}</div>
              </div>

              {/* Placeholder games */}
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="py-2 pl-3 text-gray-500 opacity-50">
                  Game {i + 2}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="relative w-1/2">
            {/* Background Screenshot */}
            {screenshotUrl && (
              <Image
                src={screenshotUrl}
                alt="screenshot"
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Game Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {logoUrl ? (
                <div className="relative flex h-[40%] w-[60%] items-center justify-center">
                  <Image
                    src={logoUrl}
                    alt="logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <h1 className="text-5xl font-light text-white drop-shadow-2xl">
                  {game.name.toUpperCase()}
                </h1>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
