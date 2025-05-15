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
    <div className="container mx-auto space-y-16 pb-20">
      {/* Hero Section with background overlay */}
      <div
        className="relative mt-6 overflow-hidden rounded-3xl px-6 py-16 md:mt-10 md:px-12 md:py-24"
        style={{
          background: `linear-gradient(135deg, rgba(255,75,43,0.05) 0%, rgba(255,65,108,0.07) 100%)`,
        }}
      >
        {/* Multiple gradient blobs for a more dynamic background - with stronger opacity */}
        <div className="absolute left-[10%] top-[20%] h-[300px] w-[400px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/10 to-[var(--gradient-2)]/10 blur-[100px] transform -rotate-12"></div>
        <div className="absolute right-[15%] bottom-[10%] h-[250px] w-[350px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/8 to-[var(--gradient-1)]/8 blur-[120px] transform rotate-45"></div>
        <div className="absolute right-[5%] top-[30%] h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/7 opacity-30 blur-[150px] md:block"></div>
        <div className="absolute left-[20%] bottom-[15%] h-[200px] w-[300px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/10 to-[var(--gradient-1)]/8 blur-[90px] transform rotate-12"></div>

        {/* Floating console icons */}
        <FloatingIcons />

        {/* Main hero content */}
        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 flex items-center">
            <GamepadIcon className="mr-3 h-8 w-8 gradient-icon animate-pulse" />
            <h2 className="font-pixel text-2xl font-normal">
              ES-DE Media Manager
            </h2>
          </div>

          <div className="mb-6 ">
            <h1 className="font-pixel text-6xl md:text-8xl tracking-tight text-[var(--gradient-1)] lowercase">
              Customize
              <span className="text-foreground"> your </span>
              Game Collection easily.
            </h1>
          </div>

          <p className="mb-8 text-lg font-medium text-muted-foreground max-w-xl">
            Create perfectly structured media files for Emulation Station
            Desktop Edition with ease, and edit your existing games too!
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="relative group bg-[var(--gradient-1)] hover:opacity-90 transition-all duration-300"
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
                    "h-10 w-10 rounded-full border-2 border-background overflow-hidden transform transition-all duration-300",
                    "hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              <span className="font-semibold text-foreground">
                {" "}
                atleast 3
              </span>{" "}
              gamers xD
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative space-y-8 scroll-mt-16">
        {/* Background blobs for features section */}
        <div className="absolute left-[5%] top-[10%] h-[300px] w-[400px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/6 blur-[150px] opacity-30"></div>
        <div className="absolute right-[10%] bottom-[20%] h-[250px] w-[350px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/7 to-[var(--gradient-1)]/8 blur-[130px] opacity-30"></div>

        <div className="text-center relative z-10">
          <h2 className="font-pixel text-4xl font-normal mb-3">
            Powerful Media Management
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-lg font-medium text-muted-foreground">
            Everything you need to organize and customize your ES-DE media
            collection
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--gradient-1)]/10 hover:border-[var(--gradient-1)]/30">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] opacity-0 transition-opacity duration-500 group-hover:opacity-5"></div>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/10">
              <Settings2Icon className="h-7 w-7 gradient-icon" />
            </div>
            <h3 className="mb-3 font-pixel text-2xl font-normal group-hover:gradient-text transition-colors duration-300">
              Generate Media Files
            </h3>
            <p className="mb-6 text-base font-medium text-muted-foreground">
              Upload your media files and organize them into the perfect folder
              structure for ES-DE with just a few clicks. Supports all major
              console platforms.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
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
              className="w-full group transition-all duration-300"
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

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--gradient-1)]/10 hover:border-[var(--gradient-1)]/30">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] opacity-0 transition-opacity duration-500 group-hover:opacity-5"></div>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/10">
              <FolderOpenIcon className="h-7 w-7 gradient-icon" />
            </div>
            <h3 className="mb-3 font-pixel text-2xl font-normal group-hover:gradient-text transition-colors duration-300">
              Browse Media
            </h3>
            <p className="mb-6 text-base font-medium text-muted-foreground">
              View and manage your existing ES-DE media files for different
              consoles with an intuitive interface. Preview and edit your
              collection in one place.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
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
              className="w-full group transition-all duration-300"
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
      <div className="relative overflow-hidden rounded-3xl bg-card/50 p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--gradient-1)]/15">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gradient-1)]/8 to-[var(--gradient-2)]/8 rounded-3xl opacity-15"></div>
        {/* Additional subtle blobs */}
        <div className="absolute right-[10%] bottom-[10%] h-[200px] w-[300px] rounded-full bg-gradient-to-r from-[var(--gradient-1)]/12 to-[var(--gradient-2)]/10 blur-[100px]"></div>
        <div className="absolute left-[15%] top-[20%] h-[150px] w-[250px] rounded-full bg-gradient-to-r from-[var(--gradient-2)]/10 to-[var(--gradient-1)]/8 blur-[90px]"></div>

        <div className="relative z-10 md:flex md:items-center md:justify-between">
          <div className="md:max-w-xl">
            <h3 className="mb-4 font-pixel text-3xl font-normal">
              100% Client-Side Processing
            </h3>
            <p className="text-lg font-medium text-muted-foreground">
              Your files never leave your device. All processing happens locally
              in your browser, ensuring complete privacy and security for your
              media collection.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
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
