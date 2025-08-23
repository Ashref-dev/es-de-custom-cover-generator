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
  RefreshCw,
  CheckCircle,
  Video,
  ImageIcon,
  Monitor,
  FileImage,
  Camera,
  Package,
  Palette,
  Disc,
  Play,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GameCard from "./GameCard";
import { GameDetailsDrawer } from "./GameDetailsDrawer";
import { GameFilters } from "./GameFilters";
import { QuickFilterPills, QuickFilter } from "./QuickFilterPills";
import {
  ViewControls,
  ViewMode,
  SortOption,
  SortDirection,
} from "./ViewControls";
import { GameListView } from "./GameListView";
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
import { Badge } from "@/components/ui/badge";

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
  const [selectedMediaFilter, setSelectedMediaFilter] = useState<string>("all");

  // State for view mode and sorting
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [quickFilters, setQuickFilters] = useState<string[]>([]);

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

  // Quick filter configuration with dynamic counts
  const availableQuickFilters = useMemo<QuickFilter[]>(() => {
    const missingAnyCount = games.filter((game) =>
      Object.values(game.mediaStatus).some((status) => !status)
    ).length;

    const completeCount = games.filter((game) =>
      Object.values(game.mediaStatus).every((status) => status)
    ).length;

    const hasVideoCount = games.filter(
      (game) => game.mediaStatus.videos
    ).length;
    const missingVideoCount = games.filter(
      (game) => !game.mediaStatus.videos
    ).length;

    const missingCoversCount = games.filter(
      (game) => !game.mediaStatus.covers
    ).length;
    const missingMarqueesCount = games.filter(
      (game) => !game.mediaStatus.marquees
    ).length;
    const missingScreenshotsCount = games.filter(
      (game) => !game.mediaStatus.screenshots
    ).length;
    const missingTitlescreensCount = games.filter(
      (game) => !game.mediaStatus.titlescreens
    ).length;
    const missing3dBoxesCount = games.filter(
      (game) => !game.mediaStatus["3dboxes"]
    ).length;
    const missingBackcoversCount = games.filter(
      (game) => !game.mediaStatus.backcovers
    ).length;
    const missingFanartCount = games.filter(
      (game) => !game.mediaStatus.fanart
    ).length;
    const missingPhysicalmediaCount = games.filter(
      (game) => !game.mediaStatus.physicalmedia
    ).length;

    return [
      {
        key: "missing-any",
        label: "Missing Media",
        icon: ({ className }) => <AlertCircle className={className} />,
        description: "Games missing at least one media type",
        count: missingAnyCount,
      },
      {
        key: "complete",
        label: "Complete",
        icon: ({ className }) => <CheckCircle className={className} />,
        description: "Games with all media types",
        count: completeCount,
      },
      {
        key: "has-videos",
        label: "Has Videos",
        icon: ({ className }) => <Video className={className} />,
        description: "Games with video files",
        count: hasVideoCount,
      },
      {
        key: "missing-videos",
        label: "No Videos",
        icon: ({ className }) => <Play className={className} />,
        description: "Games without video files",
        count: missingVideoCount,
      },
      {
        key: "missing-covers",
        label: "No Covers",
        icon: ({ className }) => <ImageIcon className={className} />,
        description: "Games missing cover images",
        count: missingCoversCount,
      },
      {
        key: "missing-marquees",
        label: "No Marquees",
        icon: ({ className }) => <FileImage className={className} />,
        description: "Games missing marquee/logo images",
        count: missingMarqueesCount,
      },
      {
        key: "missing-screenshots",
        label: "No Screenshots",
        icon: ({ className }) => <Camera className={className} />,
        description: "Games missing screenshot images",
        count: missingScreenshotsCount,
      },
      {
        key: "missing-titlescreens",
        label: "No Title Screens",
        icon: ({ className }) => <Monitor className={className} />,
        description: "Games missing title screen images",
        count: missingTitlescreensCount,
      },
      {
        key: "missing-3dboxes",
        label: "No 3D Boxes",
        icon: ({ className }) => <Package className={className} />,
        description: "Games missing 3D box images",
        count: missing3dBoxesCount,
      },
      {
        key: "missing-backcovers",
        label: "No Back Covers",
        icon: ({ className }) => <FileImage className={className} />,
        description: "Games missing back cover images",
        count: missingBackcoversCount,
      },
      {
        key: "missing-fanart",
        label: "No Fan Art",
        icon: ({ className }) => <Palette className={className} />,
        description: "Games missing fan art images",
        count: missingFanartCount,
      },
      {
        key: "missing-physicalmedia",
        label: "No Physical Media",
        icon: ({ className }) => <Disc className={className} />,
        description: "Games missing physical media images",
        count: missingPhysicalmediaCount,
      },
    ].filter((filter) => filter.count > 0); // Only show filters that have results
  }, [games]);

  // Sorting and filtering logic
  const sortedAndFilteredGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesConsole =
        selectedConsole === "all" || game.console === selectedConsole;
      const matchesSearch =
        searchQuery === "" ||
        game.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Media filter logic
      let matchesMediaFilter = true;
      if (selectedMediaFilter !== "all") {
        switch (selectedMediaFilter) {
          case "missing-covers":
            matchesMediaFilter = !game.mediaStatus.covers;
            break;
          case "missing-marquees":
            matchesMediaFilter = !game.mediaStatus.marquees;
            break;
          case "missing-screenshots":
            matchesMediaFilter = !game.mediaStatus.screenshots;
            break;
          case "missing-titlescreens":
            matchesMediaFilter = !game.mediaStatus.titlescreens;
            break;
          case "missing-3dboxes":
            matchesMediaFilter = !game.mediaStatus["3dboxes"];
            break;
          case "missing-backcovers":
            matchesMediaFilter = !game.mediaStatus.backcovers;
            break;
          case "missing-fanart":
            matchesMediaFilter = !game.mediaStatus.fanart;
            break;
          case "missing-physicalmedia":
            matchesMediaFilter = !game.mediaStatus.physicalmedia;
            break;
          case "missing-videos":
            matchesMediaFilter = !game.mediaStatus.videos;
            break;
          case "missing-any":
            matchesMediaFilter = Object.values(game.mediaStatus).some(
              (status) => !status
            );
            break;
          case "complete":
            matchesMediaFilter = Object.values(game.mediaStatus).every(
              (status) => status
            );
            break;
          default:
            matchesMediaFilter = true;
        }
      }

      // Quick filter logic
      let matchesQuickFilters = true;
      if (quickFilters.length > 0) {
        matchesQuickFilters = quickFilters.every((filter) => {
          switch (filter) {
            case "missing-any":
              return Object.values(game.mediaStatus).some((status) => !status);
            case "complete":
              return Object.values(game.mediaStatus).every((status) => status);
            case "has-videos":
              return game.mediaStatus.videos;
            case "missing-videos":
              return !game.mediaStatus.videos;
            case "missing-covers":
              return !game.mediaStatus.covers;
            case "missing-marquees":
              return !game.mediaStatus.marquees;
            case "missing-screenshots":
              return !game.mediaStatus.screenshots;
            case "missing-titlescreens":
              return !game.mediaStatus.titlescreens;
            case "missing-3dboxes":
              return !game.mediaStatus["3dboxes"];
            case "missing-backcovers":
              return !game.mediaStatus.backcovers;
            case "missing-fanart":
              return !game.mediaStatus.fanart;
            case "missing-physicalmedia":
              return !game.mediaStatus.physicalmedia;
            default:
              return true;
          }
        });
      }

      return (
        matchesConsole &&
        matchesSearch &&
        matchesMediaFilter &&
        matchesQuickFilters
      );
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "console":
          const consoleA =
            CONSOLES.find((c) => c.value === a.console)?.label || a.console;
          const consoleB =
            CONSOLES.find((c) => c.value === b.console)?.label || b.console;
          comparison = consoleA.localeCompare(consoleB);
          break;

        case "mediaCount":
          comparison = a.mediaTypes.length - b.mediaTypes.length;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    games,
    selectedConsole,
    searchQuery,
    selectedMediaFilter,
    quickFilters,
    sortBy,
    sortDirection,
  ]);

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
    setSelectedMediaFilter("all");
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

  // Filter games based on selected console, search query, and media filter
  const filteredGames = games.filter((game) => {
    const matchesConsole =
      selectedConsole === "all" || game.console === selectedConsole;
    const matchesSearch =
      searchQuery === "" ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Media filter logic
    let matchesMediaFilter = true;
    if (selectedMediaFilter !== "all") {
      switch (selectedMediaFilter) {
        case "missing-covers":
          matchesMediaFilter = !game.mediaStatus.covers;
          break;
        case "missing-marquees":
          matchesMediaFilter = !game.mediaStatus.marquees;
          break;
        case "missing-screenshots":
          matchesMediaFilter = !game.mediaStatus.screenshots;
          break;
        case "missing-titlescreens":
          matchesMediaFilter = !game.mediaStatus.titlescreens;
          break;
        case "missing-3dboxes":
          matchesMediaFilter = !game.mediaStatus["3dboxes"];
          break;
        case "missing-backcovers":
          matchesMediaFilter = !game.mediaStatus.backcovers;
          break;
        case "missing-fanart":
          matchesMediaFilter = !game.mediaStatus.fanart;
          break;
        case "missing-physicalmedia":
          matchesMediaFilter = !game.mediaStatus.physicalmedia;
          break;
        case "missing-videos":
          matchesMediaFilter = !game.mediaStatus.videos;
          break;
        case "missing-any":
          matchesMediaFilter = Object.values(game.mediaStatus).some(
            (status) => !status
          );
          break;
        case "complete":
          matchesMediaFilter = Object.values(game.mediaStatus).every(
            (status) => status
          );
          break;
        default:
          matchesMediaFilter = true;
      }
    }

    return matchesConsole && matchesSearch && matchesMediaFilter;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedConsole("all");
    setSelectedMediaFilter("all");
    setQuickFilters([]);
    setSortBy("name");
    setSortDirection("asc");
  };

  // Handlers for new UX features
  const handleQuickFilterToggle = (filter: string) => {
    setQuickFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleSortChange = (field: SortOption, direction: "asc" | "desc") => {
    setSortBy(field);
    setSortDirection(direction);
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
    <div className="container min-h-screen max-w-screen-2xl space-y-4 p-2">
      <div className="flex flex-col items-start justify-between space-y-3 md:flex-row md:items-center md:space-y-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Media Browser</h1>
            {games.length > 0 && (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 px-3 py-1 text-sm"
              >
                <span className="text-primary mr-1.5 font-bold">
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
          className="group min-w-40"
          size="lg"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
          )}
          {loading ? "Scanning..." : "Scan Media Folder"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <div className="flex w-full items-center justify-between">
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="destructive"
              size="icon"
              className="ml-4 h-6 w-6 rounded-full"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      )}

      {games.length > 0 && (
        <GameFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedConsole={selectedConsole}
          onConsoleChange={setSelectedConsole}
          selectedMediaFilter={selectedMediaFilter}
          onMediaFilterChange={setSelectedMediaFilter}
          availableConsoles={availableConsoles}
          onResetFilters={handleResetFilters}
          filteredCount={filteredGames.length}
          totalCount={games.length}
        />
      )}

      {/* Filters and Controls Section */}
      <div className="space-y-4">
        {/* Quick Filter Pills */}
        <QuickFilterPills
          availableFilters={availableQuickFilters}
          activeFilters={quickFilters}
          onFilterToggle={handleQuickFilterToggle}
          className="pb-2"
        />

        {/* View Controls */}
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          className="py-2"
        />
      </div>

      {/* Games Display */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {sortedAndFilteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onView={() => handleViewGame(game)}
            />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <GameListView
          games={sortedAndFilteredGames}
          onViewGame={handleViewGame}
        />
      )}

      {games.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="bg-muted/50 mb-6 rounded-full p-6">
            <FolderOpen className="text-muted-foreground h-12 w-12" />
          </div>
          <h3 className="mb-3 text-xl font-semibold">No Media Library Found</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Click the &quot;Scan Media Folder&quot; button to select and scan
            your ES-DE downloaded_media folder.
          </p>
          <Button
            onClick={() => setShowHelpDialog(true)}
            size="lg"
            className="group min-w-52"
          >
            <FolderOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Select Media Folder
          </Button>
        </div>
      )}

      {games.length > 0 && filteredGames.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="bg-muted/50 mb-4 rounded-full p-4">
            <AlertTriangle className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
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
              <HelpCircle className="text-primary h-5 w-5" />
              Select the ES-DE Media Folder
            </DialogTitle>
            <DialogDescription>
              Please follow these steps to scan your ES-DE media library:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-muted rounded-md p-4 text-sm">
              <ol className="list-decimal space-y-3 pl-4">
                <li>
                  Navigate to the{" "}
                  <span className="font-semibold">downloaded_media</span> folder
                  inside your ES-DE installation directory
                </li>
                <li>
                  On macOS, this is typically located at:
                  <span className="bg-background mt-1 block rounded border p-1.5 font-mono text-xs">
                    ~/ES-DE/downloaded_media
                  </span>
                </li>
                <li>
                  Select the{" "}
                  <span className="font-semibold">downloaded_media</span> folder
                  when prompted
                </li>
                <li>
                  Accept the browser permission dialog asking for access to the
                  folder
                </li>
              </ol>
            </div>

            <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p>
                Make sure to select the correct{" "}
                <span className="font-semibold">downloaded_media</span> folder,
                not individual console folders within it.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-center sm:gap-0">
            <Button variant="ghost" onClick={() => setShowHelpDialog(false)}>
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
