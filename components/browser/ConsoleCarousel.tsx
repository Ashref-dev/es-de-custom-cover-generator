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
  customLogo,
}: {
  consoleValue: string;
  consoleLabel: string;
  className?: string;
  customLogo?: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    customLogo || `/logos/${consoleValue}.png`
  );
  const [imgError, setImgError] = useState(false);

  // Update imgSrc if customLogo changes (e.g. after adding a new system)
  useEffect(() => {
    if (customLogo) {
      setImgSrc(customLogo);
      setImgError(false);
    } else {
      setImgSrc(`/logos/${consoleValue}.png`);
      setImgError(false);
    }
  }, [customLogo, consoleValue]);

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
      <div className="flex h-full w-full items-center justify-center">
        <Gamepad2 className={cn("text-primary size-10", className)} />
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
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          placeholder="Search consoles..."
          className="h-10 pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search consoles"
        />
      </div>

      <div className="relative">
        <ScrollArea
          ref={scrollAreaRef}
          className="w-full rounded-md pb-2 whitespace-nowrap"
          role="region"
          aria-label="Console selection carousel"
        >
          <div className="flex w-max space-x-3 px-1 py-4" role="list">
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
                  "focus:ring-primary relative flex h-36 w-28 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 p-2 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none md:w-32 lg:w-36",
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
                    <div className="rounded-md border border-orange-200 bg-orange-100 px-1.5 py-0.5 text-[0.6rem] font-semibold whitespace-nowrap text-orange-600 shadow-sm">
                      Selected
                    </div>
                  </motion.div>
                )}

                <div
                  className={cn(
                    "relative mb-2 h-16 w-16 flex-shrink-0 transition-transform duration-200 md:w-20 lg:w-24",
                    selectedConsole === console.value && "scale-110"
                  )}
                  aria-hidden="true"
                >
                  <ConsoleImage
                    consoleValue={console.value}
                    consoleLabel={console.label}
                    customLogo={console.logo}
                    className={
                      selectedConsole === console.value ? "priority" : ""
                    }
                  />
                </div>
                <span className="w-full truncate text-center text-xs font-medium">
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
          className="text-muted-foreground bg-muted/30 rounded-md py-3 text-center text-sm"
          role="status"
          aria-live="polite"
        >
          No consoles found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
