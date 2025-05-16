"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, X } from "lucide-react";
import { ConsoleOption } from "@/types";
import { ConsoleCarousel } from "./ConsoleCarousel";

interface GameFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedConsole: string;
  onConsoleChange: (value: string) => void;
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
  availableConsoles,
  onResetFilters,
  filteredCount,
  totalCount,
}: GameFiltersProps) {
  const filtersActive = selectedConsole !== "all" || searchQuery !== "";
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

        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search games..."
              className="w-full h-10 pr-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={`h-10 gap-1.5 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 ${
              !filtersActive ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onResetFilters}
            disabled={!filtersActive}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} games
        </p>

        {hasNoResults && (
          <Badge
            variant="outline"
            className="flex gap-2 items-center bg-yellow-50 text-yellow-800 border-yellow-300"
          >
            <AlertTriangle className="h-3 w-3" />
            No results for your search
          </Badge>
        )}
      </div>

      <Separator className="my-2" />
    </>
  );
}
