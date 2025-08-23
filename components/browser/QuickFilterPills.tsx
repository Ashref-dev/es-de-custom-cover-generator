"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Filter } from "lucide-react";

export interface QuickFilter {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count?: number;
}

interface QuickFilterPillsProps {
  activeFilters: string[];
  onFilterToggle: (filterKey: string) => void;
  availableFilters: QuickFilter[];
  className?: string;
}

/**
 * Component that provides quick one-click filter pills for common filtering operations
 */
export function QuickFilterPills({
  activeFilters,
  onFilterToggle,
  availableFilters,
  className = "",
}: QuickFilterPillsProps) {
  if (availableFilters.length === 0) {
    return null;
  }

  // Prioritize core filters first, then specific media type filters
  const coreFilters = availableFilters.filter((f) =>
    ["missing-any", "complete", "has-videos"].includes(f.key)
  );

  const mediaFilters = availableFilters.filter(
    (f) => !["missing-any", "complete", "has-videos"].includes(f.key)
  );

  const renderFilterButton = (filter: QuickFilter) => {
    const isActive = activeFilters.includes(filter.key);
    const IconComponent = filter.icon;

    return (
      <Button
        key={filter.key}
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterToggle(filter.key)}
        className={cn(
          "relative h-9 flex-shrink-0 gap-2 transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            : "hover:bg-muted/80 hover:border-primary/30"
        )}
      >
        <IconComponent className="h-4 w-4" />
        <span className="hidden font-medium whitespace-nowrap sm:inline">
          {filter.label}
        </span>
        {filter.count !== undefined && (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className={cn(
              "ml-1 h-5 px-2 text-xs font-semibold",
              isActive
                ? "bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            {filter.count}
          </Badge>
        )}
        {isActive && (
          <X className="ml-1 h-3.5 w-3.5 opacity-60 transition-opacity hover:opacity-100" />
        )}
      </Button>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Quick Filters</span>
      </div>

      {/* Core Filters */}
      {coreFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {coreFilters.map(renderFilterButton)}
        </div>
      )}

      {/* Media Type Filters */}
      {mediaFilters.length > 0 && (
        <div className="space-y-3">
          {coreFilters.length > 0 && (
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Missing Media Types
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {mediaFilters.map(renderFilterButton)}
          </div>
        </div>
      )}
    </div>
  );
}
