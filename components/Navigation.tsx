"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { type NavigationItem } from "@/types";
import {
  HomeIcon,
  Settings2Icon,
  FolderOpenIcon,
  GamepadIcon,
} from "lucide-react";

/**
 * Navigation component that provides links to all main pages
 * and highlights the current active page
 */
export function Navigation() {
  const pathname = usePathname();

  const navItems: NavigationItem[] = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/generator", label: "Generator", icon: Settings2Icon },
    { href: "/browse", label: "Browse", icon: FolderOpenIcon },
  ];

  return (
    <header className="border-b sticky top-0 bg-background !z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <GamepadIcon className="h-6 w-6 gradient-icon" />
          <span className="font-semibold">ES-DE Media Manager</span>
        </Link>

        <nav className="flex items-center space-x-2">
          <ul className="flex items-center space-x-1 md:space-x-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.icon && <item.icon className="mr-1.5 h-4 w-4" />}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <ThemeToggle className="ml-2" />
        </nav>
      </div>
    </header>
  );
}
