import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-cream text-brand-black">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="font-heading text-xl uppercase mb-2">Something went wrong</h2>
          <pre className="text-xs font-mono bg-white border-2 border-brand-black p-4 rounded-2xl max-w-md overflow-auto">
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <p className="text-[10px] mt-4 text-gray-500">Check the browser console (F12) for details.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 editorial-button py-2 px-4 text-xs uppercase"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
