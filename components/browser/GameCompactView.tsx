"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Game } from "@/types";
import { CONSOLES } from "@/lib/constants";
import { MediaStatusBadge } from "./MediaStatusBadge";
import { cn } from "@/lib/utils";

interface GameCompactViewProps {
  games: Game[];
  onViewGame: (game: Game) => void;
  className?: string;
}

/**
 * Compact grid view component that displays games in a dense, information-rich layout
 */
export function GameCompactView({ games, onViewGame, className = "" }: GameCompactViewProps) {
  const getCompletionPercentage = (game: Game): number => {
    const totalTypes = Object.keys(game.mediaStatus).length;
    const presentTypes = Object.values(game.mediaStatus).filter(Boolean).length;
    return Math.round((presentTypes / totalTypes) * 100);
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return "border-green-500 bg-green-50";
    if (percentage >= 75) return "border-blue-500 bg-blue-50";
    if (percentage >= 50) return "border-yellow-500 bg-yellow-50";
    if (percentage >= 25) return "border-orange-500 bg-orange-50";
    return "border-red-500 bg-red-50";
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3", className)}>
      {games.map((game) => {
        const completion = getCompletionPercentage(game);
        const consoleLabel = CONSOLES.find(c => c.value === game.console)?.label || game.console;
        
        return (
          <Card
            key={game.id}
            className={cn(
              "group relative transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
              getCompletionColor(completion)
            )}
            onClick={() => onViewGame(game)}
          >
            <CardContent className="p-3 space-y-2">
              {/* Header with console and completion */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {consoleLabel}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {completion}%
                </span>
              </div>
              
              {/* Game title */}
              <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]" title={game.name}>
                {game.name}
              </h3>
              
              {/* Media status - detailed view */}
              <div className="flex flex-wrap gap-1">
                <MediaStatusBadge
                  mediaStatus={game.mediaStatus}
                  variant="detailed"
                  className="justify-start"
                />
              </div>
              
              {/* Action button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewGame(game);
                }}
              >
                <Eye className="mr-1 h-3 w-3" />
                Details
              </Button>
            </CardContent>
          </Card>
        );
      })}
      
      {games.length === 0 && (
        <div className="col-span-full py-8 text-center text-muted-foreground">
          No games found matching your filters
        </div>
      )}
    </div>
  );
}
