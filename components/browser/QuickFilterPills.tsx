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
  const coreFilters = availableFilters.filter(f => 
    ["missing-any", "complete", "has-videos"].includes(f.key)
  );
  
  const mediaFilters = availableFilters.filter(f => 
    !["missing-any", "complete", "has-videos"].includes(f.key)
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
          "h-8 gap-1.5 transition-all duration-200 flex-shrink-0",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted/80"
        )}
      >
        <IconComponent className="h-3.5 w-3.5" />
        <span className="hidden sm:inline whitespace-nowrap">{filter.label}</span>
        {filter.count !== undefined && (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className={cn(
              "ml-1 h-5 px-1.5 text-xs",
              isActive
                ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            {filter.count}
          </Badge>
        )}
        {isActive && (
          <X className="h-3 w-3 ml-1 opacity-70" />
        )}
      </Button>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Quick filters:</span>
      </div>
      
      {/* Core Filters */}
      {coreFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {coreFilters.map(renderFilterButton)}
        </div>
      )}
      
      {/* Media Type Filters */}
      {mediaFilters.length > 0 && (
        <div className="space-y-2">
          {coreFilters.length > 0 && (
            <div className="text-xs text-muted-foreground font-medium">
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
