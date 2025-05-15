"use client";

import FloatingIcons from "./FloatingIcons";

/**
 * A demo component that displays floating icons on their own
 * for testing and demonstration purposes
 */
export default function FloatingIconsDemo() {
  return (
    <div className="w-full h-[500px] relative bg-muted/30 rounded-xl overflow-hidden border">
      {/* Demonstration background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)]/5 to-[var(--gradient-2)]/5"></div>
      
      {/* Multiple background blobs for visual interest */}
      <div className="absolute left-[10%] top-[20%] h-[200px] w-[250px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/10 to-[var(--gradient-2)]/10 blur-[80px] transform -rotate-12"></div>
      <div className="absolute right-[20%] bottom-[20%] h-[150px] w-[200px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/8 to-[var(--gradient-1)]/8 blur-[100px] transform rotate-45"></div>
      
      {/* Title */}
      <div className="relative z-10 text-center pt-8 pb-4">
        <h2 className="font-pixel text-2xl">Floating Icons Demo</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Showcasing rotation-preserving animations
        </p>
      </div>
      
      {/* Floating icons using our component */}
      <FloatingIcons />
      
      {/* Description at the bottom */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
        <p>Each icon maintains its rotation throughout the float animation</p>
      </div>
    </div>
  );
} 