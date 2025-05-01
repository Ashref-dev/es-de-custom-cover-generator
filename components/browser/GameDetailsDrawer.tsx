'use client';;
import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types";
import { CONSOLES, MEDIA_TYPES } from "@/lib/constants";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { ImageOff, X, Info, Download, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameDetailsDrawerProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

// Media types to display with labels and corresponding handle names
const displayableMedia = [
  { label: 'Screenshot', handleName: 'screenshotFileHandle', aspectRatio: 'aspect-video', priority: 1 },
  { label: 'Title Screen', handleName: 'titleScreenFileHandle', aspectRatio: 'aspect-video', priority: 2 },
  { label: 'Cover Art', handleName: 'coverFileHandle', aspectRatio: 'aspect-[3/4]', priority: 3 },
  { label: 'Logo/Marquee', handleName: 'logoFileHandle', aspectRatio: 'aspect-[3/1]', priority: 4 },
  { label: '3D Box', handleName: 'box3dFileHandle', aspectRatio: 'aspect-square', priority: 5 },
  { label: 'Back Cover', handleName: 'backCoverFileHandle', aspectRatio: 'aspect-[3/4]', priority: 6 },
  { label: 'Fan Art', handleName: 'fanartFileHandle', aspectRatio: 'aspect-video', priority: 7 },
  { label: 'Physical Media', handleName: 'physicalMediaFileHandle', aspectRatio: 'aspect-square', priority: 8 },
];

// Type for image loading state
type ImageState = { url: string | null; loading: boolean };

/**
 * Loads a file from a FileSystemFileHandle and returns an object URL
 */
async function loadFileAsUrl(fileHandle: any): Promise<string> {
  if (!fileHandle || typeof fileHandle.getFile !== 'function') {
    throw new Error('Invalid file handle provided');
  }
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
}

/**
 * Renders a single media item (image) with loading state
 */
function MediaItemDisplay({ 
  label, 
  game, 
  handleName, 
  aspectRatio, 
  size = "normal"
}: { 
  label: string;
  game: Game;
  handleName: keyof Game;
  aspectRatio: string;
  size?: "large" | "normal" | "small";
}) {
  const [imageState, setImageState] = useState<ImageState>({ url: null, loading: false });

  useEffect(() => {
    let isMounted = true;
    const handle = game[handleName];

    const loadImage = async () => {
      if (handle) {
        if (isMounted) setImageState({ url: null, loading: true });
        try {
          const url = await loadFileAsUrl(handle);
          if (isMounted) setImageState({ url: url, loading: false });
        } catch (error) {
          console.error(`Error loading ${label}:`, error);
          if (isMounted) setImageState({ url: null, loading: false });
        }
      } else {
        if (isMounted) setImageState({ url: null, loading: false }); // No handle, not loading
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (imageState.url) {
        URL.revokeObjectURL(imageState.url);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, handleName, label]);

  // Size-based classes
  const containerClasses = {
    large: "col-span-full mb-8",
    normal: "",
    small: ""
  };

  const innerClasses = {
    large: "relative aspect-video w-full max-w-5xl mx-auto overflow-hidden rounded-xl",
    normal: `relative w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center ${aspectRatio}`,
    small: `relative w-full bg-muted rounded-md overflow-hidden flex items-center justify-center ${aspectRatio}`
  };

  const titleClasses = {
    large: "font-bold text-xl mb-3 text-center",
    normal: "font-semibold mb-2 text-sm md:text-base",
    small: "font-medium mb-1 text-xs"
  };

  return (
    <div className={`flex flex-col items-center ${containerClasses[size]}`}>
      {label && <h4 className={titleClasses[size]}>{label}</h4>}
      
      <div className={innerClasses[size]}>
        {imageState.loading ? (
          <div className="animate-pulse bg-muted-foreground/20 w-full h-full"></div>
        ) : imageState.url ? (
          <div className="relative w-full h-full">
            <Image
              src={imageState.url}
              alt={`${label} for ${game.name}`}
              layout="fill"
              objectFit="contain"
              className={`${size === "large" ? "hover:scale-[1.02]" : "p-1"} transition-transform duration-300`}
              priority={size === "large"}
            />
          </div>
        ) : (
          <div className="text-center p-2 h-full flex flex-col items-center justify-center">
            <ImageOff className={`mx-auto ${size === "large" ? "h-16 w-16" : "h-8 w-8 md:h-12 md:w-12"} text-muted-foreground/50`} />
            <p className="text-muted-foreground/70 text-xs md:text-sm mt-1">Not available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function GameDetailsDrawer({ game, isOpen, onClose }: GameDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("gallery");
  
  useEffect(() => {
    // Add/remove class to body to prevent scrolling when drawer is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Reset to gallery tab when opening a new game
    if (isOpen) {
      setActiveTab("gallery");
    }
    
    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isOpen]);

  if (!game) {
    return null;
  }

  const consoleLabel = CONSOLES.find(c => c.value === game.console)?.label || game.console;
  
  // Sort displayable media by priority and availability
  const sortedMedia = [...displayableMedia].sort((a, b) => {
    // If one has a file handle and the other doesn't, prioritize the one with handle
    const aHasHandle = !!game[a.handleName as keyof Game];
    const bHasHandle = !!game[b.handleName as keyof Game];
    
    if (aHasHandle && !bHasHandle) return -1;
    if (!aHasHandle && bHasHandle) return 1;
    
    // If both have or both don't have handles, sort by priority
    return a.priority - b.priority;
  });

  // Primary image is the first item with a handle, defaulting to the first item
  const primaryMedia = sortedMedia.find(item => !!game[item.handleName as keyof Game]) || sortedMedia[0];
  
  // Rest of the media items (excluding primary)
  const secondaryMedia = sortedMedia.filter(item => 
    item.handleName !== primaryMedia.handleName && !!game[item.handleName as keyof Game]
  );
  
  // Count available media types
  const availableMediaCount = game.mediaTypes.length;

  // Gallery tab content
  const GalleryContent = (
    <>
      {/* Primary Image (Screenshot or Cover) */}
      <MediaItemDisplay
        label={primaryMedia.label}
        game={game}
        handleName={primaryMedia.handleName as keyof Game}
        aspectRatio={primaryMedia.aspectRatio}
        size="large"
      />
      
      {secondaryMedia.length > 0 && <Separator className="my-8" />}
      
      {/* Grid for other media types with nice shadows and effects */}
      {secondaryMedia.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6 text-center">Additional Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {secondaryMedia.map(item => (
              <div key={item.handleName} className="transition-all duration-300 hover:scale-[1.03]">
                <MediaItemDisplay
                  label={item.label}
                  game={game}
                  handleName={item.handleName as keyof Game}
                  aspectRatio={item.aspectRatio}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* If no secondary media is available */}
      {secondaryMedia.length === 0 && (
        <div className="text-center my-8 p-8 bg-muted/30 rounded-lg max-w-xl mx-auto">
          <Info className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Additional Media</h3>
          <p className="text-muted-foreground text-sm">
            There are no additional media files available for this game. 
            You may add more media types in the ES-DE media folder.
          </p>
        </div>
      )}
    </>
  );

  // Info tab content
  const InfoContent = (
    <div className="max-w-3xl mx-auto">
      <div className="bg-muted/30 p-6 rounded-xl mb-8">
        <h3 className="text-xl font-semibold mb-4">Game Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col space-y-1">
            <dt className="text-muted-foreground">Game Name</dt>
            <dd className="font-medium">{game.name}</dd>
          </div>
          <div className="flex flex-col space-y-1">
            <dt className="text-muted-foreground">Console</dt>
            <dd className="font-medium">{consoleLabel}</dd>
          </div>
          <div className="flex flex-col space-y-1">
            <dt className="text-muted-foreground">Media Types</dt>
            <dd className="font-medium">{availableMediaCount} types available</dd>
          </div>
          <div className="flex flex-col space-y-1">
            <dt className="text-muted-foreground">Video</dt>
            <dd className="font-medium">{game.hasVideo ? "Available" : "Not available"}</dd>
          </div>
        </dl>
      </div>
      
      {/* Media files status grid */}
      <h3 className="text-xl font-semibold mb-4">Media Files Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MEDIA_TYPES.map(mt => {
          const isAvailable = game.mediaTypes.includes(mt.folder);
          return (
            <div 
              key={mt.key} 
              className={`
                flex items-center justify-between p-4 rounded-lg 
                ${isAvailable 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-muted/50 border border-muted-foreground/10'
                }
              `}
            >
              <span className="font-medium">{mt.label}</span>
              <Badge 
                variant={isAvailable ? "default" : "outline"} 
                className={`
                  text-xs 
                  ${isAvailable 
                    ? 'bg-primary/90 hover:bg-primary/80 text-primary-foreground' 
                    : 'text-muted-foreground'
                  }
                `}
              >
                {isAvailable ? 'Found' : 'Missing'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-screen w-screen p-0 flex flex-col max-h-screen">
        <SheetHeader className="p-4 bg-background border-b shadow-sm sticky top-0 z-10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <SheetTitle className="text-2xl font-bold">{game.name}</SheetTitle>
                  <SheetDescription className="text-lg text-muted-foreground">
                    {consoleLabel}
                  </SheetDescription>
                </div>
                
                <Badge className="ml-auto" variant="outline">
                  {availableMediaCount} Media Types
                </Badge>
              </div>
            </div>
            
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-4 flex-shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Tabs with proper height and overflow handling */}
        <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
          <div className="px-4 pt-4 pb-2 bg-background border-b flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="gallery" className="flex-1 py-2.5">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="info" className="flex-1 py-2.5">
                  Media Info
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-grow min-h-0 relative">
            {activeTab === "gallery" ? (
              <div className="absolute inset-0 overflow-auto">
                <div className="p-4 md:p-6">
                  {GalleryContent}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 overflow-auto">
                <div className="p-4 md:p-6">
                  {InfoContent}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer remains at bottom */}
        <SheetFooter className="p-4 border-t sticky bottom-0 bg-background z-10 flex-shrink-0">
          <div className="w-full flex justify-between items-center">
            <Button variant="outline" size="sm" disabled className="invisible">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            
            <SheetClose asChild>
              <Button variant="default">Close</Button>
            </SheetClose>
            
            <Button variant="outline" size="sm" disabled className="invisible">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 