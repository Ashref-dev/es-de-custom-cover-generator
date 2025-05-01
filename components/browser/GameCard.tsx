'use client';

import { useState, useEffect } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2, ImageOff } from 'lucide-react';
import { CONSOLES } from '@/lib/constants';
import { Game } from '@/types';
import Image from 'next/image';

interface GameCardProps {
  game: Game;
  onView: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

/**
 * Loads a file from a FileSystemFileHandle and returns an object URL
 */
async function loadFileAsUrl(fileHandle: { getFile: () => Promise<File> }): Promise<string> {
  if (!fileHandle || typeof fileHandle.getFile !== 'function') {
    throw new Error('Invalid file handle provided');
  }
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
}

/**
 * Displays an individual game card with its details, loading images dynamically
 */
export default function GameCard({ game, onView, onEdit, onDelete }: GameCardProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);

  // Load images when the component mounts or game data changes
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      // Reset state before loading
      if (isMounted) {
        setCoverImageUrl(null);
        setLogoImageUrl(null);
      }
      if (coverImageUrl) URL.revokeObjectURL(coverImageUrl);
      if (logoImageUrl) URL.revokeObjectURL(logoImageUrl);
      
      if (game.hasCover && game.coverFileHandle) {
        if (isMounted) setIsLoadingCover(true);
        try {
          const url = await loadFileAsUrl(game.coverFileHandle);
          if (isMounted) setCoverImageUrl(url);
        } catch (error) {
          console.error('Error loading cover image:', error);
        } finally {
          if (isMounted) setIsLoadingCover(false);
        }
      }
      
      if (game.hasLogo && game.logoFileHandle) {
         if (isMounted) setIsLoadingLogo(true);
        try {
          const url = await loadFileAsUrl(game.logoFileHandle);
          if (isMounted) setLogoImageUrl(url);
        } catch (error) {
          console.error('Error loading logo image:', error);
        } finally {
          if (isMounted) setIsLoadingLogo(false);
        }
      }
    };

    loadImages();

    // Cleanup function
    return () => {
      isMounted = false;
      if (coverImageUrl) URL.revokeObjectURL(coverImageUrl);
      if (logoImageUrl) URL.revokeObjectURL(logoImageUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]); // Rerun effect if game object changes

  // Get the console label
  const consoleLabel = CONSOLES.find(c => c.value === game.console)?.label || game.console;
  
  // Count media types available
  const mediaCount = game.mediaTypes.length;
  
  return (
    <Card className="group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 rounded-xl">
      <div className="relative aspect-[4/5]"> {/* Adjusted aspect ratio */}
        {/* Cover Image Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted flex items-center justify-center overflow-hidden">
          {isLoadingCover ? (
            <div className="w-full h-full">
              <div className="absolute inset-0 animate-pulse bg-muted-foreground/10"></div>
              <div className="absolute top-1/3 left-1/4 right-1/4 h-8 rounded-md animate-pulse bg-muted-foreground/20"></div>
            </div>
          ) : coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`Cover for ${game.name}`}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100 group-hover:brightness-105"
              priority
            />
          ) : (
            <div className="text-center p-4 flex flex-col items-center justify-center h-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-muted-foreground/80 text-sm mt-2">No cover available</p>
            </div>
          )}
        </div>
        
        {/* Dark gradient overlay for better text visibility and logo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Console Badge - Top left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className="backdrop-blur-md bg-black/40 text-white border-white/10 py-1 font-medium">
            {consoleLabel}
          </Badge>
        </div>
        
        {/* Media Type + Video Badge - Bottom right */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2 items-end">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/10 text-white text-xs">
            {mediaCount} media type{mediaCount !== 1 ? 's' : ''}
          </Badge>
          
          {game.hasVideo && (
            <Badge variant="default" className="bg-red-500/80 backdrop-blur-md text-white font-medium">
              Video
            </Badge>
          )}
        </div>
        
        {/* Game Title Overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-xl font-semibold text-white truncate drop-shadow-md">{game.name}</h3>
        </div>
        
        {/* Logo/Marquee overlay in center */}
        {game.hasLogo && (
          <div className="absolute inset-0 flex items-center justify-center p-5 z-10">
            {isLoadingLogo ? (
              <div className="w-full max-w-[80%] aspect-[3/1] backdrop-blur-sm flex items-center justify-center animate-pulse rounded-md">
                <div className="h-4 w-3/4 bg-white/30 rounded"></div>
              </div>
            ) : logoImageUrl ? (
              <div className="relative w-full max-w-[85%] aspect-[3/1] mx-auto">
                <Image
                  src={logoImageUrl}
                  alt={`${game.name} Logo`}
                  layout="fill"
                  objectFit="contain"
                  className="drop-shadow-xl filter brightness-125"
                  priority
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <CardFooter className="flex items-center justify-between py-3 px-3 bg-card/95 backdrop-blur-sm">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onView(game)}
          className="font-medium hover:bg-primary hover:text-primary-foreground"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View Details
        </Button>
        
        <div className="flex gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            onClick={() => onEdit(game)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(game)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 