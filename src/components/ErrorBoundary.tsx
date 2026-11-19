import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred in The Aurelia.',
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; operationType?: string };
        if (parsed.error) {
          friendly = `Database access error (${parsed.operationType || 'sync'}): ${parsed.error}`;
        }
      } catch {
        // Keep raw message if not JSON
      }

      return (
        <div className="min-h-dvh w-full bg-[#0b0d14] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#121624] border border-slate-800 p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">
              Connection Interrupted
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed break-words">
              {friendly}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Return to The Aurelia
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
