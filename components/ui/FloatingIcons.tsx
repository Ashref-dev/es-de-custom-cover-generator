"use client";

/**
 * Interface for console icon properties
 */
interface ConsoleIcon {
  name: string;
  logoSrc: string;
  position: string;
  rotation: string;
  animation: string;
  delay?: string;
  additionalAnimation?: string;
}

/**
 * Props for the FloatingIcons component
 */
interface FloatingIconsProps {
  icons?: ConsoleIcon[];
  className?: string;
}

/**
 * Default console icons configuration
 */
const defaultIcons: ConsoleIcon[] = [
  {
    name: "NES",
    logoSrc: "/logos/nes.png",
    position: "top-[15%] right-[10%]",
    rotation: "-8deg",
    animation: "float-animation-1",
    delay: "0s",
    additionalAnimation: "animate-pulse",
  },
  {
    name: "SNES",
    logoSrc: "/logos/snes.png",
    position: "top-[30%] right-[25%]",
    rotation: "5deg",
    animation: "float-animation-2",
    delay: "0.2s",
  },
  {
    name: "PS1", // PlayStation 1
    logoSrc: "/logos/psx.png",
    position: "top-[50%] right-[15%]",
    rotation: "10deg",
    animation: "float-animation-3",
    delay: "0.4s",
    additionalAnimation: "animate-pulse",
  },
  {
    name: "N64",
    logoSrc: "/logos/n64.png",
    position: "top-[20%] right-[35%]",
    rotation: "-5deg",
    animation: "float-animation-1",
    delay: "0.6s",
  },
  {
    name: "GameCube",
    logoSrc: "/logos/gc.png",
    position: "top-[80%] right-[10%]",
    rotation: "8deg",
    animation: "float-animation-2",
    delay: "0.1s",
    additionalAnimation: "animate-pulse",
  },
  {
    name: "Wii",
    logoSrc: "/logos/wii.png",
    position: "top-[65%] right-[30%]",
    rotation: "12deg",
    animation: "float-animation-3",
    delay: "0.3s",
  },
];

/**
 * FloatingIcons component that displays game console icons
 * with consistent rotation during animation
 */
export function FloatingIcons({
  icons = defaultIcons,
  className = "",
}: FloatingIconsProps) {
  return (
    <>
      {icons.map((icon, index) => (
        <div
          key={index}
          className={`absolute ${
            icon.position
          } hidden md:flex size-32 items-center justify-center z-10 ${
            icon.animation
          } ${icon.additionalAnimation || ""} ${className}`}
          style={{
            animationDelay: icon.delay || `${index * 0.7}s`,
            transform: `rotate(${icon.rotation})`,
          }}
        >
          <img
            src={icon.logoSrc}
            alt={icon.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ))}
    </>
  );
}

export default FloatingIcons;
