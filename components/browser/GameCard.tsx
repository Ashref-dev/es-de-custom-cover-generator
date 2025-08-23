"use client";

import { useState, useEffect } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ImageOff } from "lucide-react";
import { CONSOLES } from "@/lib/constants";
import { Game } from "@/types";
import Image from "next/image";
import { MediaStatusBadge } from "./MediaStatusBadge";

interface GameCardProps {
  game: Game;
  onView: (game: Game) => void;
}

/**
 * Loads a file from a FileSystemFileHandle and returns an object URL
 */
async function loadFileAsUrl(fileHandle: {
  getFile: () => Promise<File>;
}): Promise<string> {
  if (!fileHandle || typeof fileHandle.getFile !== "function") {
    throw new Error("Invalid file handle provided");
  }
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
}

/**
 * Displays an individual game card with screenshot background and logo overlay
 */
export default function GameCard({ game, onView }: GameCardProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [isLoadingScreenshot, setIsLoadingScreenshot] = useState(false);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);

  // Load images when the component mounts or game data changes
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      // Reset state before loading
      if (isMounted) {
        setScreenshotUrl(null);
        setLogoImageUrl(null);
      }
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
      if (logoImageUrl) URL.revokeObjectURL(logoImageUrl);

      // Load screenshot if available, otherwise try title screen or cover as fallback
      if (game.screenshotFileHandle) {
        if (isMounted) setIsLoadingScreenshot(true);
        try {
          const url = await loadFileAsUrl(game.screenshotFileHandle);
          if (isMounted) setScreenshotUrl(url);
        } catch (error) {
          console.error("Error loading screenshot:", error);
          // Try title screen as fallback
          if (game.titleScreenFileHandle) {
            try {
              const url = await loadFileAsUrl(game.titleScreenFileHandle);
              if (isMounted) setScreenshotUrl(url);
            } catch (error) {
              console.error("Error loading title screen:", error);
              // Try cover as second fallback
              if (game.hasCover && game.coverFileHandle) {
                try {
                  const url = await loadFileAsUrl(game.coverFileHandle);
                  if (isMounted) setScreenshotUrl(url);
                } catch (error) {
                  console.error("Error loading cover image:", error);
                }
              }
            }
          }
        } finally {
          if (isMounted) setIsLoadingScreenshot(false);
        }
      } else if (game.titleScreenFileHandle) {
        if (isMounted) setIsLoadingScreenshot(true);
        try {
          const url = await loadFileAsUrl(game.titleScreenFileHandle);
          if (isMounted) setScreenshotUrl(url);
        } catch (error) {
          console.error("Error loading title screen:", error);
          // Try cover as fallback
          if (game.hasCover && game.coverFileHandle) {
            try {
              const url = await loadFileAsUrl(game.coverFileHandle);
              if (isMounted) setScreenshotUrl(url);
            } catch (error) {
              console.error("Error loading cover image:", error);
            }
          }
        } finally {
          if (isMounted) setIsLoadingScreenshot(false);
        }
      } else if (game.hasCover && game.coverFileHandle) {
        if (isMounted) setIsLoadingScreenshot(true);
        try {
          const url = await loadFileAsUrl(game.coverFileHandle);
          if (isMounted) setScreenshotUrl(url);
        } catch (error) {
          console.error("Error loading cover image:", error);
        } finally {
          if (isMounted) setIsLoadingScreenshot(false);
        }
      }

      // Load logo/marquee if available
      if (game.hasLogo && game.logoFileHandle) {
        if (isMounted) setIsLoadingLogo(true);
        try {
          const url = await loadFileAsUrl(game.logoFileHandle);
          if (isMounted) setLogoImageUrl(url);
        } catch (error) {
          console.error("Error loading logo image:", error);
        } finally {
          if (isMounted) setIsLoadingLogo(false);
        }
      }
    };

    loadImages();

    // Cleanup function
    return () => {
      isMounted = false;
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
      if (logoImageUrl) URL.revokeObjectURL(logoImageUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  // Get the console label
  const consoleLabel =
    CONSOLES.find((c) => c.value === game.console)?.label || game.console;

  return (
    <Card className="group hover:shadow-primary/10 hover:border-primary/30 relative gap-0 overflow-hidden rounded-xl border p-0 transition-all duration-300 hover:shadow-lg">
      {/* Background Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Screenshot Background */}
        <div className="from-muted/30 to-muted absolute inset-0 flex items-center justify-center bg-gradient-to-br">
          {isLoadingScreenshot ? (
            <div className="h-full w-full">
              <div className="bg-muted-foreground/10 absolute inset-0 animate-pulse"></div>
              <div className="bg-muted-foreground/20 absolute top-1/3 right-1/4 left-1/4 h-8 animate-pulse rounded-md"></div>
            </div>
          ) : screenshotUrl ? (
            <Image
              src={screenshotUrl}
              alt={`Screenshot for ${game.name}`}
              layout="fill"
              objectFit="cover"
              className="opacity-95 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:brightness-110"
              priority
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <ImageOff className="text-muted-foreground/60 h-12 w-12" />
              <p className="text-muted-foreground/80 mt-2 text-sm">
                No image available
              </p>
            </div>
          )}
        </div>

        {/* Dark gradient overlay for better text visibility and logo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

        {/* Header Section with Tags - Side by Side */}
        <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between">
          {/* Console Badge - Left */}
          <Badge
            variant="outline"
            className="border-white/10 bg-black/40 py-1 font-medium text-white backdrop-blur-md"
          >
            {consoleLabel}
          </Badge>

          {/* Media Status Badge - Right */}
          <MediaStatusBadge
            mediaStatus={game.mediaStatus}
            variant="compact"
            className="bg-white/10 text-xs text-white backdrop-blur-md"
          />
        </div>

        {/* Video Badge - If present */}
        {game.hasVideo && (
          <div className="absolute top-12 right-3 z-10">
            <Badge
              variant="default"
              className="bg-red-500/80 font-medium text-white backdrop-blur-md"
            >
              Video
            </Badge>
          </div>
        )}

        {/* Game Title Overlay at bottom */}
        <div className="absolute right-0 bottom-0 left-0 z-10 p-4">
          <h3 className="truncate text-xl font-semibold text-white drop-shadow-md">
            {game.name}
          </h3>
        </div>

        {/* Logo/Marquee overlay in center */}
        {game.hasLogo && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
            {isLoadingLogo ? (
              <div className="flex aspect-[3/1] w-full max-w-[80%] animate-pulse items-center justify-center rounded-md backdrop-blur-sm">
                <div className="h-4 w-3/4 rounded bg-white/30"></div>
              </div>
            ) : logoImageUrl ? (
              <div className="relative mx-auto aspect-[3/1] w-full max-w-[85%]">
                <Image
                  src={logoImageUrl}
                  alt={`${game.name} Logo`}
                  layout="fill"
                  objectFit="contain"
                  className="brightness-125 drop-shadow-xl filter"
                  priority
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Action Button - Only View Details */}
      <CardFooter className="bg-card/95 flex items-center justify-center px-3 py-3 backdrop-blur-sm">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(game)}
          className="hover:bg-primary hover:text-primary-foreground w-full font-medium transition-colors duration-200"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
