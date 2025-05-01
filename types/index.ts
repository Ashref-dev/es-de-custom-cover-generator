/**
 * Media type configuration
 */
export interface MediaType {
  /** Unique key for the media type */
  key: string;
  /** Folder name in the ESDE structure */
  folder: string;
  /** File extension (.jpg, .png, .mp4) */
  extension: string;
  /** MIME type for accept attribute */
  accept: string;
  /** User-friendly label */
  label: string;
  /** Description for the media type */
  description: string;
}

/**
 * Console/system option
 */
export interface ConsoleOption {
  /** Value used for folder name */
  value: string;
  /** Display label */
  label: string;
}

/**
 * Navigation item for site navigation
 */
export interface NavigationItem {
  /** URL path */
  href: string;
  /** Display label */
  label: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Game data from ESDE media folder
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;
  /** Game name */
  name: string;
  /** Console identifier */
  console: string;
  /** Whether the game has a cover image */
  hasCover: boolean;
  /** Whether the game has a logo/marquee image */
  hasLogo: boolean;
  /** Whether the game has a video */
  hasVideo: boolean;
  /** List of available media types */
  mediaTypes: string[];
  
  // File Handles (using any for simplicity with File System API)
  coverFileHandle?: any; 
  logoFileHandle?: any; 
  screenshotFileHandle?: any;
  box3dFileHandle?: any;
  backCoverFileHandle?: any;
  fanartFileHandle?: any;
  physicalMediaFileHandle?: any;
  titleScreenFileHandle?: any;
  // Add handles for other types like manuals (PDFs) or videos if needed for future display
}

/**
 * File upload component props
 */
export interface FileUploadProps {
  /** File that has been selected */
  value: File | null;
  /** MIME type to accept */
  accept: string;
  /** Function to call when file changes */
  onChange: (file: File | null) => void;
  /** User-friendly label */
  label?: string;
  /** Additional description */
  description?: string;
}

/**
 * Console selector component props
 */
export interface ConsoleSelectorProps {
  /** Selected console value */
  value: string;
  /** Function to call when selection changes */
  onChange: (value: string) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
} 