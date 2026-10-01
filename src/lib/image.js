import imageCompression from 'browser-image-compression';

/**
 * Compress an image in the browser without uploading it.
 *
 * @param {File} file
 * @param {{ maxEdge?: number, type?: string, quality?: number }} [options]
 * @returns {Promise<File>}
 */
export function compressImage(file, {
  maxEdge = 1200,
  type = 'image/webp',
  quality = 0.8,
} = {}) {
  return imageCompression(file, {
    maxWidthOrHeight: maxEdge,
    fileType: type,
    initialQuality: quality,
    useWebWorker: true,
  });
}

/**
 * @param {Blob} file
 * @returns {string|null}
 */
export function fileToObjectUrl(file) {
  return typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function'
    ? null
    : URL.createObjectURL(file);
}
