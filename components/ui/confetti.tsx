'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  /**
   * Controls whether the confetti is active
   */
  active?: boolean;
  
  /**
   * Duration of the confetti effect in milliseconds
   * @default 5000
   */
  duration?: number;
  
  /**
   * Optional callback when confetti animation completes
   */
  onComplete?: () => void;
}

/**
 * Confetti celebration component to provide visual feedback for successful operations
 */
export function Confetti({ 
  active = false, 
  duration = 5000, 
  onComplete 
}: ConfettiProps) {
  const [isActive, setIsActive] = useState(active);
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0 
  });

  // Set the dimensions to the window size
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set dimensions on initial render
    handleResize();

    // Set up event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle the active state
  useEffect(() => {
    if (active && !isActive) {
      setIsActive(true);
      
      // Set timeout to disable confetti after duration
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
    
    setIsActive(active);
  }, [active, duration, isActive, onComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.2}
      colors={[
        '#ff80ed', // pink
        '#65dc98', // green
        '#0080ff', // blue
        '#fd5c63', // red
        '#ffba00'  // yellow
      ]}
      tweenDuration={5000}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    />
  );
} 