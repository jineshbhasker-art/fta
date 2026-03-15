import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let details = "";

      try {
        if (this.state.error?.message.startsWith('{')) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error: ${parsed.error}`;
            details = `Failed to ${parsed.operationType} at ${parsed.path || 'unknown path'}`;
            
            if (parsed.error.includes('Missing or insufficient permissions')) {
              errorMessage = "Permission Denied: You don't have access to this data.";
            } else if (parsed.error.includes('Quota exceeded')) {
              errorMessage = "Quota Exceeded: The database limit has been reached. Please try again tomorrow.";
            }
          }
        }
      } catch (e) {
        // Fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 uppercase">Something went wrong</h2>
              <p className="text-sm text-gray-600 font-medium">{errorMessage}</p>
              {details && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{details}</p>}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#0A192F] text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
