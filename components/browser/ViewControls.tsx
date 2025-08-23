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
import { Grid3X3, List, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "detail";
export type SortOption = "name" | "console" | "mediaCount";
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
  const sortOptions: {
    value: SortOption;
    label: string;
    ascLabel: string;
    descLabel: string;
  }[] = [
    {
      value: "name",
      label: "Name",
      ascLabel: "A → Z",
      descLabel: "Z → A",
    },
    {
      value: "console",
      label: "Console",
      ascLabel: "A → Z",
      descLabel: "Z → A",
    },

    {
      value: "mediaCount",
      label: "Media Count",
      ascLabel: "Low → High",
      descLabel: "High → Low",
    },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    const directionLabel =
      sortDirection === "asc" ? option?.ascLabel : option?.descLabel;
    return `${option?.label} (${directionLabel})`;
  };

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* View Mode Toggle - Left Side */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
        className="border-border rounded-lg border"
      >
        <ToggleGroupItem
          value="grid"
          aria-label="Grid view"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2"
        >
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2"
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Sort Dropdown - Right Side */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[120px] justify-start gap-2"
          >
            <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            <span className="hidden truncate text-left sm:inline">
              {getSortLabel()}
            </span>
            <span className="sm:hidden">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Sort by
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <div key={option.value} className="space-y-1">
              <DropdownMenuItem
                onClick={() => onSortChange(option.value, "asc")}
                className={cn(
                  "flex cursor-pointer items-center justify-between py-2.5",
                  sortBy === option.value &&
                    sortDirection === "asc" &&
                    "bg-primary/10 text-primary font-medium"
                )}
              >
                <span>{option.label}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {option.ascLabel}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSortChange(option.value, "desc")}
                className={cn(
                  "flex cursor-pointer items-center justify-between py-2.5",
                  sortBy === option.value &&
                    sortDirection === "desc" &&
                    "bg-primary/10 text-primary font-medium"
                )}
              >
                <span>{option.label}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {option.descLabel}
                </span>
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
