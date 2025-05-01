import MediaGenerator from '@/components/MediaGenerator';

export const metadata = {
  title: "Generate Files",
  description: "Generate the Emulation Station Desktop Edition (ESDE) media folder structure by uploading your media files.",
};

/**
 * Generator page component - Server Component
 * Displays the MediaGenerator client component for processing media files
 */
export default function GeneratorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <MediaGenerator />
    </div>
  );
} 