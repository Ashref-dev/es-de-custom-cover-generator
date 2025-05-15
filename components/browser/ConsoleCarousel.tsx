"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConsoleOption } from "@/types";
import { Input } from "@/components/ui/input";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const [api, setApi] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Update current index for pagination dots
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // When filtering, scroll to start
  useEffect(() => {
    if (api) {
      api.scrollTo(0);
    }
  }, [filteredConsoles.length, api]);

  // Get the visible item count for pagination
  const getVisibleItemCount = () => {
    if (typeof window === "undefined") return 5;

    if (window.innerWidth < 640) return 3;
    if (window.innerWidth < 1024) return 4;
    return 5;
  };

  const itemsPerScreen = getVisibleItemCount();
  const pageCount = Math.ceil(filteredConsoles.length / itemsPerScreen);
  const currentPage = Math.floor(currentIndex / itemsPerScreen);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search consoles..."
          className="pl-10 h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="relative py-4 px-2">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-6">
            {filteredConsoles.map((console) => (
              <CarouselItem
                key={console.value}
                className="pl-3 md:pl-6 basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center p-2 h-36 rounded-lg border-2 cursor-pointer transition-all overflow-visible",
                    selectedConsole === console.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:bg-accent hover:border-primary/30"
                  )}
                  whileHover={{
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onConsoleChange(console.value)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <div
                    className={cn(
                      "relative w-16 h-16 md:w-20 lg:w-32 flex-shrink-0 mb-2 transition-transform duration-200",
                      selectedConsole === console.value && "scale-110"
                    )}
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
                  {selectedConsole === console.value && (
                    <Badge
                      variant="secondary"
                      className="mt-1 text-[0.65rem] h-5 bg-primary/10 text-primary"
                    >
                      Selected
                    </Badge>
                  )}
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-3 bg-background border-border hover:bg-accent" />
            <CarouselNext className="-right-3 bg-background border-border hover:bg-accent" />
          </div>
        </Carousel>

        {/* Pagination dots */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: pageCount }).map((_, i) => (
              <motion.button
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === i
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => api?.scrollTo(i * itemsPerScreen)}
                aria-label={`Go to page ${i + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        )}
      </div>

      {filteredConsoles.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-3 bg-muted/30 rounded-md">
          No consoles found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
