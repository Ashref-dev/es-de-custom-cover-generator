"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CONSOLES } from "@/lib/constants";
import { FolderOpen, Loader2, AlertCircle, X, AlertTriangle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GameCard from "./GameCard";
import { GameDetailsDrawer } from "./GameDetailsDrawer";
import { Game } from "@/types";
import {
    openMediaFolder,
    scanMediaFolder,
    deleteGameMedia,
} from "@/lib/filesystem";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';

// Define a type for the directory handle, even if it's basic
// This avoids using 'any' directly in the state
type DirectoryHandle = object; // Or a more specific type if possible

/**
 * Client component that handles scanning the ES-DE downloaded_media folder
 * and displaying the games found there.
 */
export default function GameBrowser() {
  // State for selected console filter
  const [selectedConsole, setSelectedConsole] = useState<string>("all");

  // State for games data
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainDirHandle, setMainDirHandle] = useState<DirectoryHandle | null>(null);

  // State for the details drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // State for delete confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  // Scan the downloaded_media folder
  const handleScanMediaFolder = async (readWrite = false) => {
    setLoading(true);
    setError(null);
    setGames([]);
    setMainDirHandle(null);
    setSelectedGame(null);
    setIsDrawerOpen(false);

    try {
      // Open the media folder using the file system access API
      const dirHandle = await openMediaFolder(readWrite);
      setMainDirHandle(dirHandle);

      // Process the directory to find games
      const foundGames = await scanMediaFolder(dirHandle);
      setGames(foundGames);

      if (foundGames.length === 0) {
        setError(
          "No games found in the selected folder. Make sure you selected the correct ES-DE/downloaded_media directory."
        );
      }
    } catch (err) {
      console.error("Error scanning media folder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to scan media folder."
      );
      setMainDirHandle(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter games based on selected console
  const filteredGames =
    selectedConsole === "all"
      ? games
      : games.filter((game) => game.console === selectedConsole);

  // Handlers for game actions
  const handleViewGame = (game: Game) => {
    setSelectedGame(game);
    setIsDrawerOpen(true);
  };

  const handleEditGame = (game: Game) => {
    console.log(`Edit game with ID: ${game.id}`);
    // This would open an edit modal or navigate to an edit page
    alert(`Editing game: ${game.name}`);
  };

  const confirmDeleteGame = (game: Game) => {
    if (!mainDirHandle) {
      setError("Please scan the media folder again with write permissions to delete files.");
      return;
    }
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const executeDeleteGame = async () => {
    if (!gameToDelete || !mainDirHandle) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Request write permissions again if necessary (browser might prompt)
      // Use type assertion here when interacting with the specific API method
      const permissionStatus = await (mainDirHandle as any).requestPermission({ mode: 'readwrite' });
      if (permissionStatus !== 'granted') {
        throw new Error('Write permission denied.');
      }

      await deleteGameMedia(mainDirHandle, gameToDelete.console, gameToDelete.name);
      
      // Remove the deleted game from the state
      setGames((prevGames) => prevGames.filter((g) => g.id !== gameToDelete.id));
      
      // Close drawer if the deleted game was selected
      if (selectedGame?.id === gameToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedGame(null);
      }

    } catch (err) {
      console.error("Error deleting game:", err);
      setError(err instanceof Error ? err.message : "Failed to delete game media.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    }
  };

  return (
    <div className="container min-h-screen p-4 space-y-6 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Media Browser</h1>
          <p className="text-muted-foreground">
            Browse and manage your ES-DE media files
          </p>
        </div>
        
        <Button 
          onClick={() => handleScanMediaFolder(!!mainDirHandle)} 
          disabled={loading}
          className="min-w-40 group"
          size="lg"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
          {loading ? 'Scanning...' : 'Scan Media Folder'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <div className="flex items-center justify-between w-full">
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-6 w-6 rounded-full ml-4"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      )}
      
      {games.length > 0 && (
        <div className="flex flex-wrap gap-3 md:gap-5">
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 bg-primary/5">
            <span className="font-bold text-primary mr-1.5">{games.length}</span> Games
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 bg-primary/5">
            <span className="font-bold text-primary mr-1.5">{CONSOLES.find(c => c.value === games[0].console)?.label}</span> Consoles
          </Badge>
        </div>
      )}
      
      {games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6 lg:col-span-5">
            <Input
              placeholder="Search games..."
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-3 lg:col-span-3">
            <Select value={selectedConsole} onValueChange={setSelectedConsole}>
              <SelectTrigger>
                <SelectValue placeholder="All Consoles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consoles</SelectItem>
                {CONSOLES.map(console => (
                  <SelectItem key={console.value} value={console.value}>
                    {console.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-12 lg:col-span-1">
            <Button 
              variant="outline" 
              className="w-full lg:w-auto lg:ml-auto" 
              disabled={selectedConsole === 'all' && !games.length}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
      
      {games.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredGames.length} of {games.length} games
          </p>
          
          {filteredGames.length === 0 && (
            <Badge variant="outline" className="flex gap-2 items-center bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertTriangle className="h-3 w-3" />
              No results for your search
            </Badge>
          )}
        </div>
      )}
      
      {games.length > 0 && <Separator />}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onView={() => handleViewGame(game)}
            onEdit={() => handleEditGame(game)}
            onDelete={() => confirmDeleteGame(game)}
          />
        ))}
      </div>
      
      {games.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-muted/50 rounded-full p-6 mb-6">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No Media Library Found</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Click the &quot;Scan Media Folder&quot; button to select and scan your ES-DE downloaded_media folder.
          </p>
          <Button 
            onClick={() => handleScanMediaFolder()} 
            size="lg"
            className="min-w-52 group"
          >
            <FolderOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Select Media Folder
          </Button>
        </div>
      )}
      
      {games.length > 0 && filteredGames.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-muted/50 rounded-full p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            No games match your current filter criteria. Try adjusting your filters or search query.
          </p>
          <Button 
            onClick={() => handleScanMediaFolder()} 
            variant="outline"
          >
            Reset Filters
          </Button>
        </div>
      )}

      <GameDetailsDrawer
        game={selectedGame}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all media files for the game &quot;{gameToDelete?.name}&quot; on {CONSOLES.find(c => c.value === gameToDelete?.console)?.label}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteGame} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
