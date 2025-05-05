
import { type NextFunction, type Request, type Response } from 'express';

/**
 * Content Security Policy middleware
 * Implements CSP headers to mitigate XSS and other injection attacks
 */
export function setupContentSecurityPolicy(req: Request, res: Response, next: NextFunction) {
  // Define CSP directives
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://gqceeliuclgzjzmubywy.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://gqceeliuclgzjzmubywy.supabase.co https://*.supabase.co blob:",
    "connect-src 'self' https://gqceeliuclgzjzmubywy.supabase.co https://*.supabase.co",
    "frame-src 'self'",
    "object-src 'none'"
  ].join("; ");

  // Set CSP header
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // Set additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

/**
 * This is a client-side alternative for CSP in a React application
 * using Meta tags, since many React apps don't have server middleware
 * 
 * Note: This should be imported in a .tsx file
 */
export function getSecurityMetaTags() {
  const cspContent = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://gqceeliuclgzjzmubywy.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https://gqceeliuclgzjzmubywy.supabase.co https://*.supabase.co blob:;
    connect-src 'self' https://gqceeliuclgzjzmubywy.supabase.co https://*.supabase.co;
    frame-src 'self';
    object-src 'none'
  `;

  return [
    { httpEquiv: "Content-Security-Policy", content: cspContent },
    { httpEquiv: "X-Content-Type-Options", content: "nosniff" },
    { httpEquiv: "X-Frame-Options", content: "SAMEORIGIN" },
    { httpEquiv: "X-XSS-Protection", content: "1; mode=block" },
    { httpEquiv: "Referrer-Policy", content: "strict-origin-when-cross-origin" }
  ];
}

/**
 * React component for security headers (for use in .tsx files)
 */
export function ClientSecurityHeaders() {
  const metaTags = getSecurityMetaTags();
  
  // Return string representation to avoid JSX in .ts file
  return `ClientSecurityHeaders Component: Use in a .tsx file to render ${metaTags.length} security meta tags`;
}
