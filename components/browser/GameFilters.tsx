"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, X } from "lucide-react";
import { ConsoleOption } from "@/types";
import { ConsoleCarousel } from "./ConsoleCarousel";
import { MEDIA_FILTER_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GameFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedConsole: string;
  onConsoleChange: (value: string) => void;
  selectedMediaFilter: string;
  onMediaFilterChange: (value: string) => void;
  availableConsoles: ConsoleOption[];
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

/**
 * Component that renders the game filtering controls
 */
export function GameFilters({
  searchQuery,
  onSearchChange,
  selectedConsole,
  onConsoleChange,
  selectedMediaFilter,
  availableConsoles,
  onResetFilters,
  filteredCount,
  totalCount,
}: GameFiltersProps) {
  const filtersActive =
    selectedConsole !== "all" ||
    searchQuery !== "" ||
    selectedMediaFilter !== "all";
  const hasNoResults = filteredCount === 0 && totalCount > 0;

  // Add "All Consoles" option
  const consoleOptions = [
    { value: "all", label: "All Consoles" },
    ...availableConsoles,
  ];

  return (
    <>
      <div className="space-y-6">
        <ConsoleCarousel
          consoles={consoleOptions}
          selectedConsole={selectedConsole}
          onConsoleChange={onConsoleChange}
        />

        <div className="flex w-full items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search games..."
              className="border-border/60 focus:border-primary/50 h-11 w-full pr-10 transition-colors"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/80 absolute top-1/2 right-1 h-9 w-9 -translate-y-1/2 transition-colors"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-11 gap-2 border-red-500/60 px-4 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700",
              !filtersActive ? "cursor-not-allowed opacity-50" : ""
            )}
            onClick={onResetFilters}
            disabled={!filtersActive}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-sm font-medium">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {filteredCount}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-semibold">{totalCount}</span>{" "}
            games
          </p>

          {/* Active Filter Badges */}
          {filtersActive && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedConsole !== "all" && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                >
                  Console:{" "}
                  {availableConsoles.find((c) => c.value === selectedConsole)
                    ?.label || selectedConsole}
                </Badge>
              )}
              {selectedMediaFilter !== "all" && (
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-xs text-purple-700"
                >
                  {
                    MEDIA_FILTER_OPTIONS.find(
                      (f) => f.key === selectedMediaFilter
                    )?.label
                  }
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-xs text-green-700"
                >
                  Search: &ldquo;{searchQuery}&rdquo;
                </Badge>
              )}
            </div>
          )}
        </div>

        {hasNoResults && (
          <Badge
            variant="outline"
            className="flex items-center gap-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-800"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            No results found
          </Badge>
        )}
      </div>

      <Separator className="my-4" />
    </>
  );
}
