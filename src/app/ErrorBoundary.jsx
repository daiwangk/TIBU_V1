import { Component } from 'react';

/**
 * Catches render errors and shows a full-screen recovery UI.
 * Home uses `<a href="/">` because this wraps outside BrowserRouter.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-screen text-center">
          <h1 className="font-heading text-2xl text-ink">Something went wrong</h1>
          <p className="font-body text-body">
            Please reload the page, or go back home and try again.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-11 rounded-btn bg-primary px-5 font-body text-primary-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Reload
            </button>
            <a
              href="/"
              className="flex min-h-11 items-center rounded-btn border border-border bg-surface px-5 font-body text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
