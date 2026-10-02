import { describe, expect, it, vi } from 'vitest';

const { imageCompression } = vi.hoisted(() => ({ imageCompression: vi.fn() }));
vi.mock('browser-image-compression', () => ({ default: imageCompression }));

import { compressImage, fileToObjectUrl } from './image.js';

describe('image helpers', () => {
  it('passes the documented compression options to browser-image-compression', async () => {
    const file = new Blob(['image'], { type: 'image/jpeg' });
    imageCompression.mockResolvedValueOnce(file);

    await expect(compressImage(file)).resolves.toBe(file);
    expect(imageCompression).toHaveBeenCalledWith(file, {
      maxWidthOrHeight: 1200,
      fileType: 'image/webp',
      initialQuality: 0.8,
      useWebWorker: true,
    });
  });

  it('creates a local object URL when the browser supports it', () => {
    const createObjectURL = vi.fn(() => 'blob:tibu-preview');
    vi.stubGlobal('URL', { createObjectURL });

    expect(fileToObjectUrl(new Blob())).toBe('blob:tibu-preview');
    vi.unstubAllGlobals();
  });
});
