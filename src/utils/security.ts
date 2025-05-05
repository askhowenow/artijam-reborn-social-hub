
import { z } from 'zod';

/**
 * Utility functions for input validation and security
 */

// Product input validation schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().url().optional().nullable(),
  stock_quantity: z.number().int().nonnegative().optional(),
  is_available: z.boolean().optional(),
});

// Cart item input validation schema
export const cartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// User input validation schema
export const userProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().nullable(),
});

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  // Basic sanitization - in a real app, use a library like DOMPurify
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validate cart operations
export function validateCartOperation(
  productId: string, 
  quantity: number
): { success: boolean; error?: string } {
  try {
    cartItemSchema.parse({ productId, quantity });
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(", ") 
      };
    }
    return { success: false, error: "Invalid input" };
  }
}

// Secure object to JSON string conversion
export function safeStringify(obj: unknown): string {
  return JSON.stringify(obj, (key, value) => {
    // Prevent leaking sensitive data
    if (key === 'password' || key === 'token' || key === 'secret') {
      return undefined;
    }
    return value;
  });
}
