
import React, { useState, useEffect } from 'react';
import { Loader2, Info } from 'lucide-react';

// Dynamically importing @google/model-viewer
// This avoids issues with SSR and reduces initial load time
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface Product3DViewerProps {
  modelUrl: string;
  modelFormat?: string | null;
  alt?: string;
  className?: string;
}

const Product3DViewer: React.FC<Product3DViewerProps> = ({
  modelUrl,
  modelFormat = 'glb',
  alt = 'A 3D model',
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelViewerAvailable, setModelViewerAvailable] = useState(false);
  
  // Load model-viewer dynamically
  useEffect(() => {
    async function loadModelViewer() {
      try {
        // Check if <model-viewer> is already defined
        if (customElements.get('model-viewer')) {
          setModelViewerAvailable(true);
          return;
        }
        
        // Dynamically import model-viewer
        const modelViewerScript = document.createElement('script');
        modelViewerScript.type = 'module';
        modelViewerScript.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
        modelViewerScript.async = true;
        
        modelViewerScript.onload = () => {
          setModelViewerAvailable(true);
        };
        
        modelViewerScript.onerror = () => {
          setError('Failed to load 3D viewer component');
          setLoading(false);
        };
        
        document.head.appendChild(modelViewerScript);
        
        return () => {
          document.head.removeChild(modelViewerScript);
        };
      } catch (err) {
        console.error('Error loading model-viewer:', err);
        setError('Failed to load 3D viewer component');
        setLoading(false);
      }
    }
    
    loadModelViewer();
  }, []);
  
  // Generate iOS AR quick look URL
  const generateIOSARQuickLookURL = (url: string): string => {
    // If we have a USDZ model, use it directly
    if (modelFormat === 'usdz') {
      return url;
    }
    
    // If we don't have a USDZ model, try to use a GLB model with AR Quick Look
    return url;
  };
  
  // Check if AR is supported
  const checkARSupport = (): boolean => {
    // iOS AR Quick Look support check
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isARSupportedOnIOS = isIOS && 'getStartARSession' in document.createElement('a');
    
    // Android AR support check
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isARSupportedOnAndroid = isAndroid && 'xr' in navigator && 'isSessionSupported' in (navigator as any).xr;
    
    return isARSupportedOnIOS || isARSupportedOnAndroid;
  };

  // Handle model load events
  const handleModelLoad = () => {
    setLoading(false);
  };

  const handleModelError = () => {
    setError('Failed to load 3D model');
    setLoading(false);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 text-center ${className}`}>
        <div className="text-red-500">
          <Info className="h-10 w-10 mx-auto mb-2" />
          <p>{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Try refreshing the page or viewing on a different device.
          </p>
        </div>
      </div>
    );
  }

  if (!modelViewerAvailable || loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-10 w-10 animate-spin text-artijam-purple" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <model-viewer
        src={modelUrl}
        ios-src={generateIOSARQuickLookURL(modelUrl)}
        alt={alt}
        ar={checkARSupport()}
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        onLoad={handleModelLoad}
        onError={handleModelError}
      >
        {/* AR button overlay rendered by model-viewer */}
        <button slot="ar-button" className="ar-button">
          View in your space
        </button>
      </model-viewer>
    </div>
  );
};

export default Product3DViewer;
