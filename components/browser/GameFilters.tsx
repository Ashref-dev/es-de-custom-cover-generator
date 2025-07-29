"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, X, Filter } from "lucide-react";
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
  onMediaFilterChange,
  availableConsoles,
  onResetFilters,
  filteredCount,
  totalCount,
}: GameFiltersProps) {
  const filtersActive = selectedConsole !== "all" || searchQuery !== "" || selectedMediaFilter !== "all";
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
              className="w-full h-11 pr-10 border-border/60 focus:border-primary/50 transition-colors"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-muted/80 transition-colors"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Media Filter Dropdown */}
          <div className="flex-shrink-0">
            <Select value={selectedMediaFilter} onValueChange={onMediaFilterChange}>
              <SelectTrigger className="w-52 h-11 border-border/60 focus:border-primary/50">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {MEDIA_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-11 px-4 gap-2 border-red-500/60 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-colors",
              !filtersActive ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={onResetFilters}
            disabled={!filtersActive}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-semibold">{filteredCount}</span> of{" "}
            <span className="text-foreground font-semibold">{totalCount}</span> games
          </p>
          
          {/* Active Filter Badges */}
          {filtersActive && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedConsole !== "all" && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Console: {availableConsoles.find(c => c.value === selectedConsole)?.label || selectedConsole}
                </Badge>
              )}
              {selectedMediaFilter !== "all" && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {MEDIA_FILTER_OPTIONS.find(f => f.key === selectedMediaFilter)?.label}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Search: &ldquo;{searchQuery}&rdquo;
                </Badge>
              )}
            </div>
          )}
        </div>

        {hasNoResults && (
          <Badge
            variant="outline"
            className="flex gap-2 items-center bg-amber-50 text-amber-800 border-amber-300 px-3 py-1.5"
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
