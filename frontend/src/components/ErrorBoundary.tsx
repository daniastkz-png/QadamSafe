import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="max-w-md w-full cyber-card border-cyber-red/30 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-cyber-red/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-cyber-red" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Что-то пошло не так
                            </h1>
                            <p className="text-muted-foreground mb-4">
                                Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left mt-4 p-4 bg-muted rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-foreground mb-2">
                                        Детали ошибки (только для разработки)
                                    </summary>
                                    <pre className="text-xs text-muted-foreground overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <button
                            onClick={this.handleReset}
                            className="cyber-button inline-flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Вернуться на главную
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

