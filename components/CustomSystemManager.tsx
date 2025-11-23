"use client";

import { useState } from "react";
import { ConsoleOption } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Gamepad2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface CustomSystemManagerProps {
  isOpen: boolean;
  onClose: () => void;
  customSystems: ConsoleOption[];
  onAddSystem: (system: ConsoleOption) => void;
  onRemoveSystem: (value: string) => void;
}

export function CustomSystemManager({
  isOpen,
  onClose,
  customSystems,
  onAddSystem,
  onRemoveSystem,
}: CustomSystemManagerProps) {
  const [folderName, setFolderName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        // 500KB limit
        setError("Logo image must be less than 500KB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setError(null);

    // Basic validation
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    // Validate folder name (simple regex for safe directory names)
    if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
      setError(
        "Folder name can only contain letters, numbers, underscores, and hyphens"
      );
      return;
    }

    // Check for duplicates
    if (customSystems.some((s) => s.value === folderName)) {
      setError("A system with this folder name already exists");
      return;
    }

    onAddSystem({
      value: folderName,
      label: displayName,
      logo: logo || undefined,
    });

    // Reset form
    setFolderName("");
    setDisplayName("");
    setLogo(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Custom Systems</DialogTitle>
          <DialogDescription>
            Add custom consoles or systems by specifying their folder name in
            downloaded_media.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Add New System Form */}
          <div className="bg-muted/30 grid gap-4 rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-medium">
              <Plus className="h-4 w-4" /> Add New System
            </h3>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  placeholder="e.g. pico8"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="e.g. PICO-8"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo-upload">System Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Max size: 500KB. Formats: PNG, JPG, WebP
                  </p>
                </div>
                {logo && (
                  <div className="bg-background/50 relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                    <Image
                      src={logo}
                      alt="Logo preview"
                      fill
                      className="object-contain p-1"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={() => setLogo(null)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleAdd} className="w-full">
              Add System
            </Button>
          </div>

          {/* Existing Systems List */}
          <div className="space-y-2">
            <h3 className="text-muted-foreground text-sm font-medium">
              Custom Systems ({customSystems.length})
            </h3>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {customSystems.length === 0 ? (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-sm">
                  <Gamepad2 className="mb-2 h-8 w-8 opacity-20" />
                  No custom systems added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {customSystems.map((system) => (
                    <div
                      key={system.value}
                      className="bg-card flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border">
                          {system.logo ? (
                            <Image
                              src={system.logo}
                              alt={system.label}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Gamepad2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{system.label}</p>
                          <p className="text-muted-foreground font-mono text-xs">
                            /{system.value}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSystem(system.value)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
