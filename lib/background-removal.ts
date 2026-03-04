'use server';

/**
 * Remove background from an image using remove.bg API
 * Free tier: 50 images/month
 * Sign up at: https://www.remove.bg/
 */

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

export async function removeBackground(imageBase64: string): Promise<Blob> {
  // Check if API key is configured
  if (!REMOVE_BG_API_KEY) {
    console.warn('[removeBackground] REMOVE_BG_API_KEY not configured, returning original image');
    // Return original image as fallback
    const response = await fetch(imageBase64);
    return response.blob();
  }

  try {
    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Create form data
    const formData = new FormData();
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`remove.bg API error: ${response.status}`);
    }

    // Return processed image
    const resultBlob = await response.blob();
    return resultBlob;
  } catch (error) {
    console.error('[removeBackground] Error:', error);
    // Return original on error
    const response = await fetch(imageBase64);
    return response.blob();
  }
}

/**
 * Alternative: Use client-side background removal
 * This uses the BodyPix model from TensorFlow.js
 * Heavier but doesn't require API key
 */
export async function removeBackgroundClientSide(imageSrc: string): Promise<string> {
  // This would require installing @tensorflow-models/body-pix
  // and implementing client-side segmentation
  // For now, return original
  console.warn('[removeBackgroundClientSide] Not implemented, returning original');
  return imageSrc;
}