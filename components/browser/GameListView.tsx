"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Game } from "@/types";
import { CONSOLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GameListViewProps {
  games: Game[];
  onViewGame: (game: Game) => void;
  className?: string;
}

/**
 * List view component that displays games in a compact table format
 */
export function GameListView({ games, onViewGame, className = "" }: GameListViewProps) {
  const getCompletionPercentage = (game: Game): number => {
    const totalTypes = Object.keys(game.mediaStatus).length;
    const presentTypes = Object.values(game.mediaStatus).filter(Boolean).length;
    return Math.round((presentTypes / totalTypes) * 100);
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  const getMediaTypeIndicator = (isPresent: boolean) => {
    return isPresent ? (
      <CheckCircle className="h-3 w-3 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 text-red-400" />
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Game</TableHead>
            <TableHead className="w-[120px]">Console</TableHead>
            <TableHead className="w-[100px]">Completion</TableHead>
            <TableHead className="w-[60px] text-center">Cover</TableHead>
            <TableHead className="w-[60px] text-center">Logo</TableHead>
            <TableHead className="w-[60px] text-center">Screen</TableHead>
            <TableHead className="w-[60px] text-center">Title</TableHead>
            <TableHead className="w-[60px] text-center">Video</TableHead>
            <TableHead className="w-[80px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => {
            const completion = getCompletionPercentage(game);
            const consoleLabel = CONSOLES.find(c => c.value === game.console)?.label || game.console;
            
            return (
              <TableRow key={game.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[220px]" title={game.name}>
                      {game.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {consoleLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", getCompletionColor(completion))}>
                      {completion}%
                    </span>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          completion === 100 ? "bg-green-500" :
                          completion >= 75 ? "bg-blue-500" :
                          completion >= 50 ? "bg-yellow-500" :
                          completion >= 25 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getMediaTypeIndicator(game.mediaStatus.covers)}
                </TableCell>
                <TableCell className="text-center">
                  {getMediaTypeIndicator(game.mediaStatus.marquees)}
                </TableCell>
                <TableCell className="text-center">
                  {getMediaTypeIndicator(game.mediaStatus.screenshots)}
                </TableCell>
                <TableCell className="text-center">
                  {getMediaTypeIndicator(game.mediaStatus.titlescreens)}
                </TableCell>
                <TableCell className="text-center">
                  {getMediaTypeIndicator(game.mediaStatus.videos)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewGame(game)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {games.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No games found matching your filters
        </div>
      )}
    </div>
  );
}
