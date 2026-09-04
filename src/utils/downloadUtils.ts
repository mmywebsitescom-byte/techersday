import JSZip from 'jszip';

export interface PhotoDownloadItem {
  url: string;
  title?: string;
  filename?: string;
}

export interface DownloadProgress {
  current: number;
  total: number;
  percent: number;
  statusText: string;
}

/**
 * Cleans a filename to be safe for saving across operating systems
 */
export function sanitizeFilename(name: string, fallback = 'photo'): string {
  if (!name || typeof name !== 'string') return fallback;
  const safe = name
    .trim()
    .replace(/[^a-zA-Z0-9-_ \.]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
  return safe || fallback;
}

/**
 * Attempts to fetch an image as a Blob, handling CORS where possible
 */
export async function fetchImageBlob(imageUrl: string): Promise<Blob | null> {
  if (!imageUrl) return null;

  try {
    // If it's already a data URL
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      return await response.blob();
    }

    // Try standard CORS fetch
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (response.ok) {
      return await response.blob();
    }
  } catch (err) {
    // CORS fetch failed, try HTMLImageElement + canvas conversion fallback
    try {
      const blob = await fetchViaImageElement(imageUrl);
      if (blob) return blob;
    } catch {
      // ignore fallback error
    }
  }

  return null;
}

/**
 * Fallback to load an image into an Image element and extract canvas blob
 */
function fetchViaImageElement(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Downloads a single image directly to the user's computer.
 */
export async function downloadImageFile(
  imageUrl: string,
  filename: string = 'teachers-day-photo.jpg'
): Promise<boolean> {
  if (!imageUrl) return false;

  const baseName = sanitizeFilename(filename.replace(/\.[^/.]+$/, ''));
  const finalFilename = `${baseName}.jpg`;

  try {
    // Data or Blob URLs
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // Fetch Blob
    const blob = await fetchImageBlob(imageUrl);
    if (blob) {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      return true;
    }

    // Direct anchor fallback
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (e) {
    window.open(imageUrl, '_blank');
    return false;
  }
}

/**
 * Packages multiple photos into a ZIP file and prompts a single download for all of them.
 */
export async function downloadMultipleImagesAsZip(
  photos: PhotoDownloadItem[],
  zipFilename = 'celebration-memories.zip',
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ success: boolean; downloadedCount: number }> {
  if (!photos || photos.length === 0) {
    return { success: false, downloadedCount: 0 };
  }

  const zip = new JSZip();
  const folder = zip.folder('Celebration_Photos') || zip;
  let downloadedCount = 0;
  const usedFilenames = new Map<string, number>();

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const currentIndex = i + 1;

    onProgress?.({
      current: currentIndex,
      total: photos.length,
      percent: Math.round(((currentIndex - 1) / photos.length) * 80),
      statusText: `Fetching photo ${currentIndex} of ${photos.length}: ${photo.title || 'Photo'}...`,
    });

    try {
      const blob = await fetchImageBlob(photo.url);
      if (blob) {
        let rawName = sanitizeFilename(photo.title || photo.filename || `photo_${currentIndex}`);
        // Ensure extension
        if (!/\.(jpe?g|png|webp|gif)$/i.test(rawName)) {
          rawName = `${rawName}.jpg`;
        }

        // Avoid duplicate filenames in zip
        const count = usedFilenames.get(rawName) || 0;
        let finalZipEntryName = rawName;
        if (count > 0) {
          const ext = rawName.substring(rawName.lastIndexOf('.'));
          const withoutExt = rawName.substring(0, rawName.lastIndexOf('.'));
          finalZipEntryName = `${withoutExt}_(${count + 1})${ext}`;
        }
        usedFilenames.set(rawName, count + 1);

        folder.file(finalZipEntryName, blob);
        downloadedCount++;
      }
    } catch (err) {
      console.warn(`Could not add photo ${photo.title || photo.url} to zip:`, err);
    }
  }

  if (downloadedCount === 0) {
    // If CORS prevented all blob fetches, fallback to sequential download
    return { success: false, downloadedCount: 0 };
  }

  onProgress?.({
    current: photos.length,
    total: photos.length,
    percent: 85,
    statusText: 'Compressing into ZIP archive...',
  });

  try {
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        onProgress?.({
          current: photos.length,
          total: photos.length,
          percent: 85 + Math.round(metadata.percent * 0.15),
          statusText: `Creating ZIP: ${Math.round(metadata.percent)}% complete...`,
        });
      }
    );

    const safeZipName = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
    const zipUrl = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = safeZipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(zipUrl), 3000);

    onProgress?.({
      current: photos.length,
      total: photos.length,
      percent: 100,
      statusText: `Downloaded ${downloadedCount} photos successfully as ZIP!`,
    });

    return { success: true, downloadedCount };
  } catch (err) {
    console.error('Failed to generate ZIP:', err);
    return { success: false, downloadedCount: 0 };
  }
}

/**
 * Downloads multiple photos individually with a short interval between each
 */
export async function downloadMultipleImagesSequentially(
  photos: PhotoDownloadItem[],
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ success: boolean; downloadedCount: number }> {
  if (!photos || photos.length === 0) {
    return { success: false, downloadedCount: 0 };
  }

  let downloadedCount = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const currentIndex = i + 1;

    onProgress?.({
      current: currentIndex,
      total: photos.length,
      percent: Math.round((currentIndex / photos.length) * 100),
      statusText: `Downloading ${currentIndex} of ${photos.length}: ${photo.title || 'Photo'}...`,
    });

    const safeName = sanitizeFilename(photo.title || `photo_${currentIndex}`);
    await downloadImageFile(photo.url, safeName);
    downloadedCount++;

    // Small delay between file triggers to avoid browser popup blocking
    if (i < photos.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  onProgress?.({
    current: photos.length,
    total: photos.length,
    percent: 100,
    statusText: `Successfully triggered download for ${downloadedCount} photos!`,
  });

  return { success: true, downloadedCount };
}
