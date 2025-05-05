
import React from 'react';
import { getSecurityMetaTags } from '../../middleware/security';

/**
 * React component that renders security-related meta tags
 * to implement Content Security Policy and other security headers
 */
export function SecurityHeaders() {
  const metaTags = getSecurityMetaTags();
  
  return (
    <>
      {metaTags.map((tag, index) => (
        <meta key={index} httpEquiv={tag.httpEquiv} content={tag.content} />
      ))}
    </>
  );
}

export default SecurityHeaders;
