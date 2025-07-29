"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grid3X3, List, LayoutGrid, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "compact" | "detail";
export type SortOption = "name" | "console" | "completion" | "mediaCount";
export type SortDirection = "asc" | "desc";

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  className?: string;
}

/**
 * Component that provides view mode switching and sorting controls
 */
export function ViewControls({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  className = "",
}: ViewControlsProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "console", label: "Console" },
    { value: "completion", label: "Completion" },
    { value: "mediaCount", label: "Media Count" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return `${option?.label} ${sortDirection === "asc" ? "↑" : "↓"}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* View Mode Toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
        className="border border-border"
      >
        <ToggleGroupItem
          value="grid"
          aria-label="Grid view"
          className="px-2.5"
        >
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="px-2.5"
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        
      </ToggleGroup>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{getSortLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <div key={option.value}>
              <DropdownMenuItem
                onClick={() => onSortChange(option.value, "asc")}
                className={cn(
                  "cursor-pointer",
                  sortBy === option.value && sortDirection === "asc" && "bg-muted"
                )}
              >
                {option.label} (A → Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSortChange(option.value, "desc")}
                className={cn(
                  "cursor-pointer",
                  sortBy === option.value && sortDirection === "desc" && "bg-muted"
                )}
              >
                {option.label} (Z → A)
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
