"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, X } from "lucide-react";
import { MediaStatus } from "@/types";

interface MediaStatusBadgeProps {
  mediaStatus: MediaStatus;
  variant?: "compact" | "detailed";
  className?: string;
}

/**
 * Component that displays the media status for a game with individual indicators
 * for each media type, showing present types in gray and missing types in red
 */
export function MediaStatusBadge({
  mediaStatus,
  variant = "compact",
  className = "",
}: MediaStatusBadgeProps) {
  // Map media type keys to display labels for tooltips
  const mediaTypeLabels: Record<keyof MediaStatus, string> = {
    covers: "Cover",
    marquees: "Logo",
    screenshots: "Screenshot",
    titlescreens: "Title Screen",
    "3dboxes": "3D Box",
    backcovers: "Back Cover",
    fanart: "Fan Art",
    physicalmedia: "Physical Media",
    videos: "Video",
  };

  // Get available and missing media counts
  const availableCount = Object.values(mediaStatus).filter(Boolean).length;
  const totalCount = Object.keys(mediaStatus).length;

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={`bg-white/10 text-xs text-white backdrop-blur-md ${className}`}
            >
              {availableCount}/{totalCount} media
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Media Status</div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {Object.entries(mediaStatus).map(([key, isPresent]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-1 ${
                      isPresent ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPresent ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="truncate">
                      {mediaTypeLabels[key as keyof MediaStatus]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant shows individual indicators
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {Object.entries(mediaStatus).map(([key, isPresent]) => (
        <TooltipProvider key={key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={isPresent ? "secondary" : "destructive"}
                className={`px-1.5 py-0.5 text-xs ${
                  isPresent
                    ? "bg-muted text-muted-foreground border-muted-foreground/20"
                    : "border-red-500/20 bg-red-500/10 text-red-600"
                }`}
              >
                {isPresent ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-sm">
                {mediaTypeLabels[key as keyof MediaStatus]}
                {isPresent ? " ✓" : " ✗"}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
