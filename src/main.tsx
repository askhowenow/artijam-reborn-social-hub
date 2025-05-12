
import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { toast } from 'sonner';

// Global error boundary
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global error caught:", error);
    console.error("Error info:", errorInfo);
    
    this.setState({
      errorInfo: errorInfo
    });
    
    toast.error("Application Error", {
      description: error.message || "An unexpected error occurred",
      duration: 5000,
    });
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto">
                <p className="font-mono text-sm text-gray-800">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            {this.state.errorInfo && (
              <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-52">
                <p className="font-mono text-xs text-gray-800 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </p>
              </div>
            )}
            <button
              className="px-4 py-2 bg-artijam-purple text-white rounded hover:bg-artijam-purple-dark"
              onClick={this.handleReload}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Add console logging for global errors
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // You could add additional error reporting here
};

window.addEventListener('error', (event) => {
  console.log('Global error caught by event listener:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.log('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
