"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/**
 * Provides theme context to the application using next-themes.
 * Enables light/dark/system theme switching.
 * @param {ThemeProviderProps} props - Props for the ThemeProvider.
 * @returns {React.ReactElement} The theme provider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.ReactElement {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 