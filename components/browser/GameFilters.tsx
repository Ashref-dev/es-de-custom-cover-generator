"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { ConsoleOption } from "@/types";
import Image from "next/image";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

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

  // Convert available consoles to ComboboxOption format with icons
  const consoleOptions: ComboboxOption[] = [
    {
      value: "all",
      label: "All Consoles",
    },
    ...availableConsoles.map((console) => ({
      value: console.value,
      label: console.label,
      icon: (
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src={`/logos/${console.value}.png`}
            alt={console.label}
            fill
            className="object-contain"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ),
    })),
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-6 lg:col-span-5">
          <Input
            placeholder="Search games..."
            className="w-full h-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <Combobox 
            options={consoleOptions}
            value={selectedConsole}
            onValueChange={onConsoleChange}
            placeholder="Select Console"
            emptyText="No console found"
            popoverWidth="content"
            contentClassName="min-w-[220px]"
            triggerClassName="h-10"
          />
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          <Button
            variant="outline"
            className="w-full h-10"
            onClick={onResetFilters}
            disabled={!filtersActive}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
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
