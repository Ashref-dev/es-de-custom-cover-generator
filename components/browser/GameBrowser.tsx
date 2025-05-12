"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CONSOLES } from "@/lib/constants";
import {
  FolderOpen,
  Loader2,
  AlertCircle,
  X,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
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
import { Game, ConsoleOption } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for games data
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainDirHandle, setMainDirHandle] = useState<DirectoryHandle | null>(
    null
  );

  // State for the details drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // State for delete confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  // State for help dialog
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Get available consoles (only those that have games)
  const availableConsoles = useMemo(() => {
    // Get unique console types from games array
    const consoleValues = [...new Set(games.map((game) => game.console))];

    // Map these to console objects with labels from the constants
    return consoleValues
      .map((value) => CONSOLES.find((c) => c.value === value))
      .filter((c): c is ConsoleOption => c !== undefined)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [games]);

  // Scan the downloaded_media folder
  const handleScanMediaFolder = async (readWrite = false) => {
    // Close the help dialog if it was open
    setShowHelpDialog(false);
    
    setLoading(true);
    setError(null);
    setGames([]);
    setMainDirHandle(null);
    setSelectedGame(null);
    setIsDrawerOpen(false);
    setSearchQuery("");
    setSelectedConsole("all");

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

  // Filter games based on selected console and search query
  const filteredGames = games.filter((game) => {
    const matchesConsole =
      selectedConsole === "all" || game.console === selectedConsole;
    const matchesSearch =
      searchQuery === "" ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesConsole && matchesSearch;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedConsole("all");
  };

  // Handlers for game actions
  const handleViewGame = (game: Game) => {
    setSelectedGame(game);
    setIsDrawerOpen(true);
  };

  const handleGameUpdate = (updatedGame: Game) => {
    setGames((prevGames) =>
      prevGames.map((g) => (g.id === updatedGame.id ? updatedGame : g))
    );
    // Optionally, re-select the game to refresh details if it was the one being viewed
    if (selectedGame?.id === updatedGame.id) {
      setSelectedGame(updatedGame);
    }
  };

  // These functions are kept for potential future use in the GameDetailsDrawer component
  // but are not currently in use - we'll keep them for when we add these actions to the drawer
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleEditGame = (game: Game) => {
    console.log(`Edit game with ID: ${game.id}`);
    // This would open an edit modal or navigate to an edit page
    alert(`Editing game: ${game.name}`);
  };

  const confirmDeleteGame = (game: Game) => {
    if (!mainDirHandle) {
      setError(
        "Please scan the media folder again with write permissions to delete files."
      );
      return;
    }
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const executeDeleteGame = async () => {
    if (!gameToDelete || !mainDirHandle) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Request write permissions again if necessary (browser might prompt)
      // Use type assertion here when interacting with the specific API method
      const permissionStatus = await (mainDirHandle as any).requestPermission({
        mode: "readwrite",
      });
      if (permissionStatus !== "granted") {
        throw new Error("Write permission denied.");
      }

      await deleteGameMedia(
        mainDirHandle,
        gameToDelete.console,
        gameToDelete.name
      );

      // Remove the deleted game from the state
      setGames((prevGames) =>
        prevGames.filter((g) => g.id !== gameToDelete.id)
      );

      // Close drawer if the deleted game was selected
      if (selectedGame?.id === gameToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedGame(null);
      }
    } catch (err) {
      console.error("Error deleting game:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete game media."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    }
  };

  return (
    <div className="container min-h-screen p-2 space-y-4 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Media Browser</h1>
            {games.length > 0 && (
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-primary/20 bg-primary/5"
              >
                <span className="font-bold text-primary mr-1.5">
                  {games.length}
                </span>
                Games
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Browse and manage your ES-DE media files
          </p>
        </div>

        <Button
          onClick={() => setShowHelpDialog(true)}
          disabled={loading}
          className="min-w-40 group"
          size="lg"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
          {loading ? "Scanning..." : "Scan Media Folder"}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6 lg:col-span-5">
            <Input
              placeholder="Search games..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <Select value={selectedConsole} onValueChange={setSelectedConsole}>
              <SelectTrigger>
                <SelectValue placeholder="All Consoles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consoles</SelectItem>
                {availableConsoles.map((console) => (
                  <SelectItem key={console.value} value={console.value}>
                    {console.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetFilters}
              disabled={selectedConsole === "all" && searchQuery === ""}
            >
              Reset Filters
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
            <Badge
              variant="outline"
              className="flex gap-2 items-center bg-yellow-50 text-yellow-800 border-yellow-300"
            >
              <AlertTriangle className="h-3 w-3" />
              No results for your search
            </Badge>
          )}
        </div>
      )}

      {games.length > 0 && <Separator className="my-2" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onView={() => handleViewGame(game)}
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
            Click the &quot;Scan Media Folder&quot; button to select and scan
            your ES-DE downloaded_media folder.
          </p>
          <Button
            onClick={() => setShowHelpDialog(true)}
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
            No games match your current filter criteria. Try adjusting your
            filters or search query.
          </p>
          <Button onClick={handleResetFilters} variant="outline">
            Reset Filters
          </Button>
        </div>
      )}

      <GameDetailsDrawer
        game={selectedGame}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mainDirHandle={mainDirHandle}
        onGameUpdate={handleGameUpdate}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all media files for the game
              &quot;{gameToDelete?.name}&quot; on{" "}
              {CONSOLES.find((c) => c.value === gameToDelete?.console)?.label}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteGame}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Dialog for media folder selection */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Select the ES-DE Media Folder
            </DialogTitle>
            <DialogDescription>
              Please follow these steps to scan your ES-DE media library:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted p-4 text-sm">
              <ol className="list-decimal pl-4 space-y-3">
                <li>
                  Navigate to the <span className="font-semibold">downloaded_media</span> folder 
                  inside your ES-DE installation directory
                </li>
                <li>
                  On macOS, this is typically located at: 
                  <span className="font-mono text-xs block mt-1 bg-background p-1.5 rounded border">
                    ~/ES-DE/downloaded_media
                  </span>
                </li>
                <li>
                  Select the <span className="font-semibold">downloaded_media</span> folder when prompted
                </li>
                <li>
                  Accept the browser permission dialog asking for access to the folder
                </li>
              </ol>
            </div>
            
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p>
                Make sure to select the correct <span className="font-semibold">downloaded_media</span> folder, 
                not individual console folders within it.
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center gap-2 sm:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => setShowHelpDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={() => handleScanMediaFolder(!!mainDirHandle)}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Browse for Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
