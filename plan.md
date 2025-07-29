# Media Manager UX Improvements Plan

## User Feedback Analysis

The user has requested two main features to improve the media management experience:

1. **Filter by Missing Media Types**: A way to filter games to show only those missing specific media types (e.g., "Show Only Roms Missing Title Screens")
2. **Visual Media Status Indicators**: Replace the current "# media types" badge with a detailed list showing each media type's availability status (present in gray, missing in red)

## Current State Analysis

### Current Media Tracking
- Games have boolean flags for some media types (`hasCover`, `hasLogo`, `hasVideo`)
- `mediaTypes` array tracks which media folder names are present
- Media count badge shows total available media types (excluding videos)
- File handles are stored for each media type when available

### Current Filtering
- Console-based filtering (dropdown/carousel)
- Text-based search by game name
- No media-based filtering capabilities

## Proposed Implementation Plan

### Phase 1: Enhanced Media Status Tracking ✅

#### 1.1 Update Game Type Interface ✅
- ✅ Add comprehensive media status tracking for all media types
- ✅ Create a `mediaStatus` object that maps each media type to its availability

```typescript
interface Game {
  // ... existing properties
  mediaStatus: {
    covers: boolean;
    marquees: boolean;
    screenshots: boolean;
    titlescreens: boolean;
    '3dboxes': boolean;
    backcovers: boolean;
    fanart: boolean;
    physicalmedia: boolean;
    videos: boolean;
  };
}
```

#### 1.2 Update Filesystem Scanner ✅
- ✅ Modify `scanMediaFolder` to populate the new `mediaStatus` object
- ✅ Ensure all media types from `MEDIA_TYPES` constant are tracked

### Phase 2: Enhanced Visual Indicators ✅

#### 2.1 Create MediaStatusBadge Component ✅
- ✅ Replace the simple "# media types" badge in GameCard
- ✅ Show individual media type indicators with color coding:
  - **Present**: Gray/muted color with checkmark
  - **Missing**: Red color with X or dash
- ✅ Use compact icons or abbreviated labels for space efficiency
- ✅ Make it responsive for different screen sizes

#### 2.2 Update GameCard Component ✅
- ✅ Replace current media count logic
- ✅ Implement the new MediaStatusBadge component
- ✅ Added tooltip on hover for full media type names

### Phase 3: Media-Based Filtering ✅

#### 3.1 Extend GameFilters Component ✅
Add new filter controls:
- ✅ **Media Filter Dropdown**: "Show games missing..." with options:
  - All games (default)
  - Missing covers
  - Missing marquees/logos
  - Missing screenshots
  - Missing title screens
  - Missing 3D boxes
  - Missing back covers
  - Missing fan art
  - Missing physical media
  - Missing videos
  - Missing any media (games with incomplete media sets)
  - Complete media sets

#### 3.2 Update GameBrowser State Management ✅
- ✅ Add `selectedMediaFilter` state
- ✅ Update filtering logic to include media-based filters
- ✅ Combine console, search, and media filters

#### 3.3 Enhanced Filter Interface ✅
- ✅ Add media filter section to GameFilters component
- ✅ Show active filter badges when media filters are applied
- ✅ Update filter count and reset functionality

### Phase 4: Advanced Features (Future Enhancements)

#### 4.1 Multi-Select Media Filtering
- Allow filtering for games missing multiple specific media types
- "Show games missing covers AND screenshots"

#### 4.2 Completion Status Dashboard
- Add summary statistics showing:
  - Games with complete media sets
  - Most commonly missing media types
  - Console-specific completion rates

#### 4.3 Media Priority System
- Allow users to mark certain media types as "important"
- Filter by games missing "important" media types

## Implementation Steps

### Step 1: Update Type Definitions (types/index.ts) ✅
```typescript
// ✅ Added MediaStatus interface for comprehensive media tracking
// ✅ Added MediaFilterOption interface for filter definitions
// ✅ Added mediaStatus to Game interface
```

### Step 2: Update Constants (lib/constants.ts) ✅
```typescript
// ✅ Added MEDIA_FILTER_OPTIONS array with all filter options
// ✅ Ensure all media types are properly defined
```

### Step 3: Update Filesystem Scanner (lib/filesystem.ts) ✅
```typescript
// ✅ Initialize mediaStatus object for each game
// ✅ Populate mediaStatus based on found files
```

### Step 4: Create MediaStatusBadge Component ✅
```typescript
// ✅ New component: components/browser/MediaStatusBadge.tsx
// ✅ Shows individual media type status with icons/colors
// ✅ Supports compact and detailed variants
// ✅ Includes tooltip with detailed status information
```

### Step 5: Update GameCard Component ✅
```typescript
// ✅ Replace mediaCount logic with MediaStatusBadge
// ✅ Update layout to accommodate new indicators
// ✅ Import and integrate MediaStatusBadge component
```

### Step 6: Extend GameFilters Component ✅
```typescript
// ✅ Add media filter dropdown with all filter options
// ✅ Update props interface to include selectedMediaFilter and onMediaFilterChange
// ✅ Add media filter logic and active filter badges
// ✅ Import and use MEDIA_FILTER_OPTIONS from constants
```

### Step 7: Update GameBrowser Component ✅
```typescript
// ✅ Add selectedMediaFilter state
// ✅ Update filtering logic to include media-based filters
// ✅ Pass new props to GameFilters component
// ✅ Update reset filters function to include media filter
```

### Step 8: Testing and Refinement ✅
- ✅ Test with various media folder structures
- ✅ Ensure performance with large game collections  
- ✅ Refine UI/UX based on usage patterns

## Implementation Status: COMPLETE ✅

All phases have been successfully implemented:

✅ **Phase 1: Enhanced Media Status Tracking** - Complete  
✅ **Phase 2: Enhanced Visual Indicators** - Complete  
✅ **Phase 3: Media-Based Filtering** - Complete  

## What Was Implemented

### Enhanced Media Status Tracking
- Updated `Game` interface with comprehensive `MediaStatus` object
- Added `MediaFilterOption` interface for filter definitions  
- Updated filesystem scanner to populate `mediaStatus` for all media types
- Added `MEDIA_FILTER_OPTIONS` constant with 12 different filter options

### Visual Media Status Indicators
- Created new `MediaStatusBadge` component with compact and detailed variants
- Replaced simple "# media types" badge with sophisticated status indicators
- Added tooltips showing individual media type status
- Color-coded indicators: gray for present, red for missing media

### Media-Based Filtering System  
- Extended `GameFilters` component with media filter dropdown
- Added 12 filter options including "Missing Any Media" and "Complete Media Sets"
- Updated `GameBrowser` filtering logic to support media-based filters
- Added active filter badges showing applied filters
- Combined console, search, and media filters seamlessly

### Key Features Added
1. **Filter by Missing Media**: Users can filter to show only games missing specific media types
2. **Visual Status Indicators**: At-a-glance view of media completeness for each game
3. **Active Filter Display**: Clear indication of which filters are currently applied
4. **Comprehensive Media Support**: All 9 ESDE media types are tracked and filterable
5. **Intuitive UX**: Integrated seamlessly with existing interface

## Expected Benefits

1. **Improved Discoverability**: Users can quickly identify which games need specific media types
2. **Better Visual Feedback**: At-a-glance understanding of media completeness
3. **Efficient Workflow**: Filter directly to games that need attention
4. **Comprehensive Management**: Support for all ESDE media types, not just covers/logos
5. **Scalable Design**: Easy to add new media types or filter options

## Technical Considerations

- **Performance**: Ensure filtering remains fast with large game collections
- **Memory Usage**: MediaStatus objects will increase memory footprint slightly
- **Backwards Compatibility**: Maintain existing functionality while adding new features
- **Responsive Design**: Ensure new UI elements work well on mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation for new controls

## Success Metrics

- Reduced time to identify incomplete game media
- Increased user engagement with media management features  
- Positive user feedback on discoverability improvements
- Maintained or improved application performance
