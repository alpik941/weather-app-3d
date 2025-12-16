import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-6 rounded-xl bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
          <p className="text-sm opacity-80">Try reloading the page or changing settings.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
