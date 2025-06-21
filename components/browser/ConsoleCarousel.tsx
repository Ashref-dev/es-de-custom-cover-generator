"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConsoleOption } from "@/types";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ConsoleCarouselProps {
  consoles: ConsoleOption[];
  selectedConsole: string;
  onConsoleChange: (value: string) => void;
}

// Component to handle fallback from PNG to SVG
function ConsoleImage({
  consoleValue,
  consoleLabel,
  className,
}: {
  consoleValue: string;
  consoleLabel: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(`/logos/${consoleValue}.png`);
  const [imgError, setImgError] = useState(false);

  // When image fails to load, try SVG instead
  const handleError = () => {
    if (!imgError) {
      setImgSrc(`/logos/${consoleValue}.svg`);
      setImgError(true);
    } else {
      // If SVG also fails, hide the image
      const img = document.getElementById(`console-img-${consoleValue}`);
      if (img) img.style.display = "none";
    }
  };

  // Show Lucide game icon for "all" instead of fetching an image
  if (consoleValue === "all") {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Gamepad2 className={cn("size-10 text-primary", className)} />
      </div>
    );
  }

  return (
    <Image
      id={`console-img-${consoleValue}`}
      src={imgSrc}
      alt={consoleLabel}
      fill
      className={cn("object-contain", className)}
      onError={handleError}
      sizes="(max-width: 640px) 72px, 100px"
    />
  );
}

export function ConsoleCarousel({
  consoles,
  selectedConsole,
  onConsoleChange,
}: ConsoleCarouselProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConsoles, setFilteredConsoles] = useState(consoles);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const consoleRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Filter consoles based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConsoles(consoles);
    } else {
      const filtered = consoles.filter((console) =>
        console.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConsoles(filtered);
    }
  }, [searchQuery, consoles]);

  // Handle mouse wheel for horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default vertical scrolling
      e.preventDefault();

      // Scroll horizontally based on wheel delta
      const scrollAmount = e.deltaY * 2; // Multiply for smoother scrolling
      scrollContainer.scrollLeft += scrollAmount;
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, consoleValue: string) => {
    const currentIndex = filteredConsoles.findIndex(
      (c) => c.value === consoleValue
    );
    let targetIndex = currentIndex;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        targetIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredConsoles.length - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        targetIndex =
          currentIndex < filteredConsoles.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = filteredConsoles.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onConsoleChange(consoleValue);
        return;
      default:
        return;
    }

    // Focus the target console
    const targetConsole = filteredConsoles[targetIndex];
    if (targetConsole) {
      const targetElement = consoleRefs.current.get(targetConsole.value);
      if (targetElement) {
        targetElement.focus();
        // Scroll the element into view
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search consoles..."
          className="pl-10 h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search consoles"
        />
      </div>

      <div className="relative">
        <ScrollArea
          ref={scrollAreaRef}
          className="w-full whitespace-nowrap rounded-md pb-2"
          role="region"
          aria-label="Console selection carousel"
        >
          <div className="flex w-max space-x-3 py-4 px-1" role="list">
            {filteredConsoles.map((console) => (
              <motion.button
                key={console.value}
                ref={(el) => {
                  if (el) {
                    consoleRefs.current.set(console.value, el);
                  } else {
                    consoleRefs.current.delete(console.value);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 h-36 w-28 md:w-32 lg:w-36 rounded-lg border-2 cursor-pointer transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden",
                  selectedConsole === console.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:bg-accent hover:border-primary/30"
                )}
                whileHover={{
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onConsoleChange(console.value)}
                onKeyDown={(e) => handleKeyDown(e, console.value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
                role="listitem"
                tabIndex={0}
                aria-pressed={selectedConsole === console.value}
                aria-label={`Select ${console.label} console${
                  selectedConsole === console.value
                    ? " (currently selected)"
                    : ""
                }`}
                aria-describedby={
                  selectedConsole === console.value
                    ? `selected-${console.value}`
                    : undefined
                }
              >
                {/* Selected Badge Overlay */}
                {selectedConsole === console.value && (
                  <motion.div
                    id={`selected-${console.value}`}
                    className="absolute -top-[1px] -right-[1px] z-10"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 10 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                      duration: 0.3,
                    }}
                  >
                    <div className="bg-orange-100 text-orange-600 text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-md shadow-sm border border-orange-200 whitespace-nowrap">
                      Selected
                    </div>
                  </motion.div>
                )}

                <div
                  className={cn(
                    "relative w-16 h-16 md:w-20 lg:w-24 flex-shrink-0 mb-2 transition-transform duration-200",
                    selectedConsole === console.value && "scale-110"
                  )}
                  aria-hidden="true"
                >
                  <ConsoleImage
                    consoleValue={console.value}
                    consoleLabel={console.label}
                    className={
                      selectedConsole === console.value ? "priority" : ""
                    }
                  />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {console.label}
                </span>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Screen reader instructions */}
        <div className="sr-only" aria-live="polite">
          Use arrow keys to navigate between consoles, Enter or Space to select,
          Home/End to jump to first/last console.
          {filteredConsoles.length > 0 &&
            `${filteredConsoles.length} consoles available.`}
        </div>
      </div>

      {filteredConsoles.length === 0 && (
        <div
          className="text-center text-sm text-muted-foreground py-3 bg-muted/30 rounded-md"
          role="status"
          aria-live="polite"
        >
          No consoles found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
