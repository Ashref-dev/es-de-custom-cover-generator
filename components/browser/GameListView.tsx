"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
export function GameListView({
  games,
  onViewGame,
  className = "",
}: GameListViewProps) {
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
    return (
      <div className="flex h-full w-full items-center justify-center">
        {isPresent ? (
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-red-400/60" />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "border-border/60 bg-card overflow-hidden rounded-lg border shadow-sm",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/30 border-b">
            <TableHead className="text-foreground w-auto min-w-[280px] pl-4 font-semibold">
              Game
            </TableHead>
            <TableHead className="text-foreground hidden w-[110px] font-semibold sm:table-cell">
              Console
            </TableHead>
            <TableHead className="text-foreground w-[100px] font-semibold">
              Completion
            </TableHead>
            <TableHead className="text-foreground w-[50px] px-1 text-center font-semibold">
              Cover
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold md:table-cell">
              Logo
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold lg:table-cell">
              Screen
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold lg:table-cell">
              Title
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold xl:table-cell">
              3D Box
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold xl:table-cell">
              Back
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold xl:table-cell">
              Fan Art
            </TableHead>
            <TableHead className="text-foreground hidden w-[50px] px-1 text-center font-semibold xl:table-cell">
              Physical
            </TableHead>
            <TableHead className="text-foreground w-[50px] px-1 text-center font-semibold">
              Video
            </TableHead>
            <TableHead className="text-foreground w-[60px] pr-4 text-center font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game, index) => {
            const completion = getCompletionPercentage(game);
            const consoleLabel =
              CONSOLES.find((c) => c.value === game.console)?.label ||
              game.console;

            return (
              <TableRow
                key={game.id}
                className={cn(
                  "border-border/40 hover:bg-muted/40 border-b transition-colors duration-150",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <TableCell className="py-3 pl-4 font-medium">
                  <div className="flex flex-col">
                    <span
                      className="text-foreground max-w-[250px] truncate text-sm font-semibold"
                      title={game.name}
                    >
                      {game.name}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                      {consoleLabel} • {completion}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden py-3 sm:table-cell">
                  <Badge
                    variant="outline"
                    className="bg-background border-border/60 text-xs font-medium"
                  >
                    {consoleLabel}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "min-w-[30px] text-sm font-semibold",
                        getCompletionColor(completion)
                      )}
                    >
                      {completion}%
                    </span>
                    <div className="bg-muted/60 h-1.5 w-12 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          completion === 100
                            ? "bg-green-500"
                            : completion >= 75
                              ? "bg-blue-500"
                              : completion >= 50
                                ? "bg-yellow-500"
                                : completion >= 25
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                        )}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-1 py-3">
                  {getMediaTypeIndicator(game.mediaStatus.covers)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 md:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.marquees)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 lg:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.screenshots)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 lg:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.titlescreens)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 xl:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus["3dboxes"])}
                </TableCell>
                <TableCell className="hidden px-1 py-3 xl:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.backcovers)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 xl:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.fanart)}
                </TableCell>
                <TableCell className="hidden px-1 py-3 xl:table-cell">
                  {getMediaTypeIndicator(game.mediaStatus.physicalmedia)}
                </TableCell>
                <TableCell className="px-1 py-3">
                  {getMediaTypeIndicator(game.mediaStatus.videos)}
                </TableCell>
                <TableCell className="py-3 pr-4">
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewGame(game)}
                      className="hover:bg-primary/10 hover:text-primary h-7 w-7 p-0 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {games.length === 0 && (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
              <Eye className="text-muted-foreground h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-sm font-medium">
                No games found
              </p>
              <p className="text-muted-foreground text-xs">
                Try adjusting your filters or search criteria
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
