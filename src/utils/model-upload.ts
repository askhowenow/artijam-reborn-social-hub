
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Supported 3D model formats
export const SUPPORTED_MODEL_FORMATS = ['.glb', '.gltf', '.usdz'];
export const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50MB

// Check if file has a valid 3D model extension
export const isValidModelFormat = (filename: string): boolean => {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_MODEL_FORMATS.includes(extension);
};

// Upload model to Supabase storage
export const uploadProductModel = async (
  file: File,
  productId: string
): Promise<{ url: string | null; format: string | null; error: string | null }> => {
  try {
    // Validate file size
    if (file.size > MAX_MODEL_SIZE) {
      return {
        url: null,
        format: null,
        error: `Model file size must be less than ${MAX_MODEL_SIZE / (1024 * 1024)}MB`
      };
    }

    // Validate file format
    if (!isValidModelFormat(file.name)) {
      return {
        url: null,
        format: null,
        error: `Invalid file format. Supported formats: ${SUPPORTED_MODEL_FORMATS.join(', ')}`
      };
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return {
        url: null,
        format: null,
        error: 'You must be logged in to upload models'
      };
    }

    // Extract file extension and format type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const format = fileExt;
    
    // Create a unique file name
    const fileName = `${productId}/${uuidv4()}.${fileExt}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from('product-models')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading model:', error);
      return {
        url: null,
        format: null,
        error: 'Failed to upload model file. Please try again.'
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('product-models')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      format: format || null,
      error: null
    };
  } catch (error) {
    console.error('Model upload error:', error);
    return {
      url: null,
      format: null,
      error: 'An unexpected error occurred during upload'
    };
  }
};

// Check if product-models bucket exists
export const checkModelStorageBucket = async (): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error);
      return false;
    }
    
    return buckets.some(bucket => bucket.name === 'product-models');
  } catch (error) {
    console.error('Failed to check storage buckets:', error);
    return false;
  }
};
