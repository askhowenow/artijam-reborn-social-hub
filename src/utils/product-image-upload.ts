
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      throw new Error('User not authenticated');
    }

    // Create a unique file name with user ID path
    const userId = session.session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    console.log('Attempting to upload to product-images bucket...');
    
    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log('Upload successful, public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in image upload function:', error);
    toast.error(`Failed to upload image: ${error.message}`);
    return null;
  }
}

export async function checkStorageBuckets(): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking buckets:", error);
      return false;
    }
    
    const productImagesBucketExists = buckets?.some(bucket => bucket.name === 'product-images');
    
    if (!productImagesBucketExists) {
      console.warn('Product images bucket does not exist! Form uploads may fail.');
      return false;
    } else {
      console.log('Product images bucket found and ready.');
      return true;
    }
  } catch (err) {
    console.error("Failed to check buckets:", err);
    return false;
  }
}
