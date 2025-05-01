import Link from "next/link";

export const metadata = {
  title: "ESDE Media Generator - Home",
  description:
    "Generate the Emulation Station Desktop Edition (ESDE) media folder structure entirely on the client-side.",
};

/**
 * Home page component - Server Component
 * Serves as a landing page with links to generator and browse pages
 */
export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
          ESDE Media Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create perfectly structured media files for Emulation Station Desktop
          Edition with ease
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        <Link
          href="/generator"
          className="group block p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all"
        >
          <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
            Generate Media Files
          </h2>
          <p className="text-muted-foreground">
            Upload your media files and organize them into the correct folder
            structure for ESDE
          </p>
        </Link>

        <Link
          href="/browse"
          className="group block p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all"
        >
          <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
            Browse Media
          </h2>
          <p className="text-muted-foreground">
            View and manage your existing media files for different consoles
          </p>
        </Link>
      </div>
    </div>
  );
}
