import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler to fetch an image from a URL server-side, bypassing CORS.
 * Expects a POST request with a JSON body: { imageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl: unknown = body.imageUrl;

    // Validate input
    if (typeof imageUrl !== 'string' || !imageUrl || !(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      return NextResponse.json(
        { error: 'Invalid or missing imageUrl in request body' },
        { status: 400 }
      );
    }

    // Fetch the image from the URL on the server
    const response = await fetch(imageUrl, {
       headers: {
            // Optional: Mimic a browser user-agent if needed for some sites
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
       }
    });

    if (!response.ok) {
      console.error(`[API Fetch Image] Failed to fetch image from ${imageUrl}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`[API Fetch Image] Fetched content from ${imageUrl} is not an image: ${contentType}`);
      return NextResponse.json(
        { error: 'The fetched URL did not return an image.' },
        { status: 400 }
      );
    }

    // Get image data as Blob
    const imageBlob = await response.blob();

    // Return the image blob directly
    // The browser will interpret this as a file download
    // We need to send headers so the client knows what it is.
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    // Optionally, suggest a filename (though the client will likely rename it)
    // const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'downloaded-image';
    // headers.set('Content-Disposition', `inline; filename="${filename}"`);

    return new NextResponse(imageBlob, {
      status: 200,
      statusText: 'OK',
      headers: headers,
    });

  } catch (error) {
    console.error('[API Fetch Image] Error:', error);
    // Handle JSON parsing errors or other unexpected issues
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
} 