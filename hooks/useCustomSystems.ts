"use client";

import { useState, useEffect, useCallback } from "react";
import { ConsoleOption } from "@/types";

const STORAGE_KEY = "esde-custom-systems";

export function useCustomSystems() {
  const [customSystems, setCustomSystems] = useState<ConsoleOption[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomSystems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load custom systems:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customSystems));
    }
  }, [customSystems, isLoaded]);

  const addSystem = useCallback((system: ConsoleOption) => {
    setCustomSystems((prev) => {
      if (prev.some((s) => s.value === system.value)) {
        return prev;
      }
      return [...prev, system];
    });
  }, []);

  const removeSystem = useCallback((value: string) => {
    setCustomSystems((prev) => prev.filter((s) => s.value !== value));
  }, []);

  const updateSystem = useCallback(
    (value: string, updates: Partial<ConsoleOption>) => {
      setCustomSystems((prev) =>
        prev.map((s) => (s.value === value ? { ...s, ...updates } : s))
      );
    },
    []
  );

  return {
    customSystems,
    addSystem,
    removeSystem,
    updateSystem,
    isLoaded,
  };
}
