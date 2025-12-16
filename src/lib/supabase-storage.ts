import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageOptimizer";

export const uploadFile = async (
  bucket: 'avatars' | 'recipe-images' | 'ingredient-images',
  file: File,
  userId?: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const compressedFile = await compressImage(file);
    const fileExt = compressedFile.name.split('.').pop() || file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = userId ? `${userId}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '31536000', // 1 year (files are usually unique)
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  bucket: 'avatars' | 'recipe-images' | 'ingredient-images',
  filePath: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: error as Error };
  }
};

export const getPublicUrl = (
  bucket: 'avatars' | 'recipe-images' | 'ingredient-images',
  filePath: string
): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
