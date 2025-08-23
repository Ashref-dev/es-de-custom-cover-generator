import Link from "next/link";
import Image from "next/image";
import {
  GamepadIcon,
  Settings2Icon,
  FolderOpenIcon,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FloatingIcons from "@/components/ui/FloatingIcons";

export const metadata = {
  title: "ES-DE Media Manager - Home",
  description:
    "Generate and manage media files for Emulation Station Desktop Edition (ES-DE) entirely on the client-side.",
};

/**
 * Home page component - Server Component
 * Serves as a landing page with links to generator and browse pages
 */
export default function Home() {
  // Random user profile images for the testimonials section with their GitHub profile links
  const users = [
    {
      avatar: "https://avatars.githubusercontent.com/u/109633107?v=4",

      github: "https://github.com/Ashref-dev",
      name: "Ashref Ben Abdallah",
    },
    {
      avatar: "https://avatars.githubusercontent.com/u/85387641?v=4",
      github: "https://github.com/Baltii",
      name: "Ahmed Balti",
    },
    {
      avatar: "https://avatars.githubusercontent.com/u/93385261?v=4",
      github: "https://github.com/rayenfassatoui",
      name: "Rayen Fassatoui",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with background overlay */}
      <div
        className="relative mt-6 overflow-hidden rounded-3xl px-6 py-16 md:mt-10 md:px-12 md:py-24"
        style={{
          background: `linear-gradient(135deg, rgba(255,75,43,0.05) 0%, rgba(255,65,108,0.07) 100%)`,
        }}
      >
        {/* Multiple gradient blobs for a more dynamic background - with stronger opacity */}
        <div className="absolute top-[20%] left-[10%] h-[300px] w-[400px] -rotate-12 transform rounded-full bg-gradient-to-r from-[var(--gradient-1)]/10 to-[var(--gradient-2)]/10 blur-[100px]"></div>
        <div className="absolute right-[15%] bottom-[10%] h-[250px] w-[350px] rotate-45 transform rounded-full bg-gradient-to-r from-[var(--gradient-2)]/8 to-[var(--gradient-1)]/8 blur-[120px]"></div>
        <div className="absolute top-[30%] right-[5%] h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/7 opacity-30 blur-[150px] md:block"></div>
        <div className="absolute bottom-[15%] left-[20%] h-[200px] w-[300px] rotate-12 transform rounded-full bg-gradient-to-r from-[var(--gradient-2)]/10 to-[var(--gradient-1)]/8 blur-[90px]"></div>

        {/* Floating console icons */}
        <FloatingIcons />

        {/* Main hero content */}
        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 flex items-center">
            <GamepadIcon className="gradient-icon mr-3 h-8 w-8 animate-pulse" />
            <h2 className="font-pixel text-2xl font-normal">
              ES-DE Media Manager
            </h2>
          </div>

          <div className="mb-6">
            <h1 className="font-pixel text-6xl tracking-tight text-[var(--gradient-1)] lowercase md:text-8xl">
              Customize
              <span className="text-foreground"> your </span>
              Game Collection easily.
            </h1>
          </div>

          <p className="text-muted-foreground mb-8 max-w-xl text-lg font-medium">
            Create perfectly structured media files for Emulation Station
            Desktop Edition with ease, and edit your existing games too!
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="group relative bg-[var(--gradient-1)] transition-all duration-300 hover:opacity-90"
            >
              <Link href="/generator" className="flex items-center gap-2">
                Generate New Rom Media
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group transition-all duration-300"
            >
              <Link href="/browse" className="flex items-center gap-2">
                Manage Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center space-x-3">
            <div className="flex -space-x-3 transition-all duration-300 hover:-space-x-1">
              {users.map((user, index) => (
                <Link
                  key={index}
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "border-background h-10 w-10 transform overflow-hidden rounded-full border-2 transition-all duration-300",
                    "focus:ring-primary hover:z-10 hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  )}
                  title={`Visit ${user.name}'s GitHub profile`}
                >
                  <Image
                    src={user.avatar}
                    alt={`${user.name}'s GitHub avatar`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
            <p className="text-muted-foreground">
              Endorsed by
              <span className="text-foreground font-semibold">
                {" "}
                atleast 3
              </span>{" "}
              gamers xD
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative scroll-mt-16 space-y-8">
        {/* Background blobs for features section */}
        <div className="absolute top-[10%] left-[5%] h-[300px] w-[400px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/6 opacity-30 blur-[150px]"></div>
        <div className="absolute right-[10%] bottom-[20%] h-[250px] w-[350px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/7 to-[var(--gradient-1)]/8 opacity-30 blur-[130px]"></div>

        <div className="relative z-10 text-center">
          <h2 className="font-pixel mb-3 text-4xl font-normal">
            Powerful Media Management
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-lg font-medium">
            Everything you need to organize and customize your ES-DE media
            collection
          </p>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          <div className="group bg-card relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 hover:border-[var(--gradient-1)]/30 hover:shadow-[var(--gradient-1)]/10 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] opacity-0 transition-opacity duration-500 group-hover:opacity-5"></div>
            <div className="bg-primary/5 group-hover:bg-primary/10 mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
              <Settings2Icon className="gradient-icon h-7 w-7" />
            </div>
            <h3 className="font-pixel group-hover:gradient-text mb-3 text-2xl font-normal transition-colors duration-300">
              Generate Media Files
            </h3>
            <p className="text-muted-foreground mb-6 text-base font-medium">
              Upload your media files and organize them into the perfect folder
              structure for ES-DE with just a few clicks. Supports all major
              console platforms.
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Box Art
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Logos
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Screenshots
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                All Platforms
              </Badge>
            </div>
            <Button
              asChild
              className="group w-full transition-all duration-300"
            >
              <Link
                href="/generator"
                className="flex items-center justify-center gap-2"
              >
                Go to Generator
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="group bg-card relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 hover:border-[var(--gradient-1)]/30 hover:shadow-[var(--gradient-1)]/10 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] opacity-0 transition-opacity duration-500 group-hover:opacity-5"></div>
            <div className="bg-primary/5 group-hover:bg-primary/10 mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
              <FolderOpenIcon className="gradient-icon h-7 w-7" />
            </div>
            <h3 className="font-pixel group-hover:gradient-text mb-3 text-2xl font-normal transition-colors duration-300">
              Browse Media
            </h3>
            <p className="text-muted-foreground mb-6 text-base font-medium">
              View and manage your existing ES-DE media files for different
              consoles with an intuitive interface. Preview and edit your
              collection in one place.
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Preview
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Organize
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Edit
              </Badge>
              <Badge
                variant="secondary"
                className="transition-all duration-300 hover:bg-[var(--gradient-1)]/10"
              >
                Manage Collections
              </Badge>
            </div>
            <Button
              asChild
              className="group w-full transition-all duration-300"
            >
              <Link
                href="/browse"
                className="flex items-center justify-center gap-2"
              >
                Browse Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonial/Info Section */}
      <div className="bg-card/50 relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-[var(--gradient-1)]/15 hover:shadow-xl md:p-10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/8 opacity-15"></div>
        {/* Additional subtle blobs */}
        <div className="absolute right-[10%] bottom-[10%] h-[200px] w-[300px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/12 to-[var(--gradient-2)]/10 blur-[100px]"></div>
        <div className="absolute top-[20%] left-[15%] h-[150px] w-[250px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/10 to-[var(--gradient-1)]/8 blur-[90px]"></div>

        <div className="relative z-10 md:flex md:items-center md:justify-between">
          <div className="md:max-w-xl">
            <h3 className="font-pixel mb-4 text-3xl font-normal">
              100% Client-Side Processing
            </h3>
            <p className="text-muted-foreground text-lg font-medium">
              Your files never leave your device. All processing happens locally
              in your browser, ensuring complete privacy and security for your
              media collection.
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Button
              asChild
              size="lg"
              className="group transition-all duration-300"
            >
              <Link href="/generator" className="flex items-center gap-2">
                Generator
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="group transition-all duration-300"
            >
              <Link href="/browse" className="flex items-center gap-2">
                Browse
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
