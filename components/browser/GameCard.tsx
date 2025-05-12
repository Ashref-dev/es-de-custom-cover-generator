"use client";

import { useState, useEffect } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ImageOff } from "lucide-react";
import { CONSOLES } from "@/lib/constants";
import { Game } from "@/types";
import Image from "next/image";

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

  // Count media types available, excluding video
  const mediaCount = game.mediaTypes.filter((type) => type !== "videos").length;

  return (
    <Card className="group relative p-0 gap-0 overflow-hidden border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 rounded-xl">
      {/* Background Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Screenshot Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted flex items-center justify-center">
          {isLoadingScreenshot ? (
            <div className="w-full h-full">
              <div className="absolute inset-0 animate-pulse bg-muted-foreground/10"></div>
              <div className="absolute top-1/3 left-1/4 right-1/4 h-8 rounded-md animate-pulse bg-muted-foreground/20"></div>
            </div>
          ) : screenshotUrl ? (
            <Image
              src={screenshotUrl}
              alt={`Screenshot for ${game.name}`}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500 group-hover:scale-105 opacity-95 group-hover:opacity-100 group-hover:brightness-110"
              priority
            />
          ) : (
            <div className="text-center p-4 flex flex-col items-center justify-center h-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-muted-foreground/80 text-sm mt-2">
                No image available
              </p>
            </div>
          )}
        </div>

        {/* Dark gradient overlay for better text visibility and logo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

        {/* Header Section with Tags - Side by Side */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center">
          {/* Console Badge - Left */}
          <Badge
            variant="outline"
            className="backdrop-blur-md bg-black/40 text-white border-white/10 py-1 font-medium"
          >
            {consoleLabel}
          </Badge>

          {/* Media Type Count - Right */}
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-white/10 text-white text-xs"
          >
            {mediaCount} media type{mediaCount !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Video Badge - If present */}
        {game.hasVideo && (
          <div className="absolute top-12 right-3 z-10">
            <Badge
              variant="default"
              className="bg-red-500/80 backdrop-blur-md text-white font-medium"
            >
              Video
            </Badge>
          </div>
        )}

        {/* Game Title Overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-xl font-semibold text-white truncate drop-shadow-md">
            {game.name}
          </h3>
        </div>

        {/* Logo/Marquee overlay in center */}
        {game.hasLogo && (
          <div className="absolute inset-0 flex items-center justify-center p-5 z-10">
            {isLoadingLogo ? (
              <div className="w-full max-w-[80%] aspect-[3/1] backdrop-blur-sm flex items-center justify-center animate-pulse rounded-md">
                <div className="h-4 w-3/4 bg-white/30 rounded"></div>
              </div>
            ) : logoImageUrl ? (
              <div className="relative w-full max-w-[85%] aspect-[3/1] mx-auto">
                <Image
                  src={logoImageUrl}
                  alt={`${game.name} Logo`}
                  layout="fill"
                  objectFit="contain"
                  className="drop-shadow-xl filter brightness-125"
                  priority
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Action Button - Only View Details */}
      <CardFooter className="flex items-center justify-center py-3 px-3 bg-card/95 backdrop-blur-sm">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(game)}
          className="font-medium hover:bg-primary hover:text-primary-foreground w-full transition-colors duration-200"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
