import GameBrowser from "@/components/browser/GameBrowser";

export const metadata = {
  title: "Browse Media",
  description:
    "Browse and manage your ESDE media files for different consoles.",
};

/**
 * Browse page component - Server Component
 * Acts as a container for the client-side GameBrowser component
 */
export default function BrowsePage() {
  return (
    <div className="py-8">
      <GameBrowser />
    </div>
  );
}
