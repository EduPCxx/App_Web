import { Component } from 'react';
import ErrorPage from '@/pages/ErrorPage';

// Captura errores de renderizado de las pantallas. `resetKey` (la ruta actual) lo reinicia al navegar.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error de renderizado:', error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (this.state.error) return <ErrorPage onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
