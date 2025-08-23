"use client";

import FloatingIcons from "./FloatingIcons";

/**
 * A demo component that displays floating icons on their own
 * for testing and demonstration purposes
 */
export default function FloatingIconsDemo() {
  return (
    <div className="bg-muted/30 relative h-[500px] w-full overflow-hidden rounded-xl border">
      {/* Demonstration background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)]/5 to-[var(--gradient-2)]/5"></div>

      {/* Multiple background blobs for visual interest */}
      <div className="absolute top-[20%] left-[10%] h-[200px] w-[250px] -rotate-12 transform rounded-full bg-gradient-to-r from-[var(--gradient-1)]/10 to-[var(--gradient-2)]/10 blur-[80px]"></div>
      <div className="absolute right-[20%] bottom-[20%] h-[150px] w-[200px] rotate-45 transform rounded-full bg-gradient-to-r from-[var(--gradient-2)]/8 to-[var(--gradient-1)]/8 blur-[100px]"></div>

      {/* Title */}
      <div className="relative z-10 pt-8 pb-4 text-center">
        <h2 className="font-pixel text-2xl">Floating Icons Demo</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Showcasing rotation-preserving animations
        </p>
      </div>

      {/* Floating icons using our component */}
      <FloatingIcons />

      {/* Description at the bottom */}
      <div className="text-muted-foreground absolute right-0 bottom-4 left-0 text-center text-sm">
        <p>Each icon maintains its rotation throughout the float animation</p>
      </div>
    </div>
  );
}
