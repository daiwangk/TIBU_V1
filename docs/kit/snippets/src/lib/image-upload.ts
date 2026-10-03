// src/lib/image-upload.ts — compress in browser, then upload to Supabase Storage
// npm i browser-image-compression
import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

type Kind = 'logo' | 'banner' | 'gallery' | 'product';

export async function uploadBusinessImage(file: File, businessId: string, kind: Kind, productId?: string) {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: kind === 'logo' ? 512 : 1600,
    maxSizeMB: kind === 'logo' ? 0.3 : 0.8,
    fileType: 'image/webp',
    useWebWorker: true,
  });
  const id = crypto.randomUUID();
  const path =
    kind === 'product' ? `${businessId}/products/${productId}/${id}.webp`
    : kind === 'gallery' ? `${businessId}/gallery/${id}.webp`
    : `${businessId}/${kind}-${Date.now()}.webp`;

  const { error } = await supabase.storage.from('business-media')
    .upload(path, compressed, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('business-media').getPublicUrl(path);
  return { path, url: data.publicUrl };
}
// Then insert { storage_path: path, url } into product_images / business_images,
// or update businesses.logo_url / banner_url.
