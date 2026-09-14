import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.handleReset);
      }

      return (
        <div className="my-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-orange-950/90 via-red-950/80 to-black/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/10 text-amber-400 shadow-inner">
            <AlertTriangle className="h-8 w-8 text-amber-400 animate-bounce" />
          </div>

          <span className="inline-block rounded-full border border-amber-400/40 bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
            ॥ श्री गणेशाय नमः ॥
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
            तात्पुरती तांत्रिक अडचण आली आहे
          </h2>

          <p className="text-xs sm:text-sm text-orange-200/80 max-w-md mx-auto mb-6">
            प्लेअर लोड करताना अडचण आली. खालील बटण दाबून पुन्हा प्रयत्न करा किंवा मुख्य पानावर जा.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
            >
              <RefreshCw className="h-4 w-4" />
              <span>पुन्हा प्रयत्न करा (Try Again)</span>
            </button>

            <a
              href="/"
              className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-orange-950/60 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-orange-900/60 transition-all"
            >
              <Home className="h-4 w-4" />
              <span>मुख्य पृष्ठ (Home)</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
