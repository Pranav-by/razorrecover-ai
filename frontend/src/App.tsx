import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Recoveries } from './pages/Recoveries';
import { RecoveryDetail } from './pages/RecoveryDetail';
import { ReviewQueue } from './pages/ReviewQueue';
import { Policies } from './pages/Policies';
import { triggerBatchRun, resetData } from './services/api';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff5757', backgroundColor: '#fffdfa', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Application Rendering Error:</h2>
          <pre style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f6f0', border: '2px solid #000', borderRadius: '12px', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="neo-btn neo-btn-primary"
            style={{ marginTop: '20px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [isRunningBatch, setIsRunningBatch] = useState(false);

  const handleRunBatch = async () => {
    setIsRunningBatch(true);
    try {
      await triggerBatchRun();
      setTimeout(() => {
        setIsRunningBatch(false);
      }, 5000);
    } catch (err: any) {
      console.error('Batch trigger error:', err);
      setIsRunningBatch(false);
    }
  };

  const handleResetData = async () => {
    try {
      await resetData();
      window.location.reload();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div style={{ minHeight: '100vh', width: '100%' }}>
          <Navbar
            isRunning={isRunningBatch}
            onRunBatch={handleRunBatch}
            onResetData={handleResetData}
          />
          <main style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard isRunning={isRunningBatch} onRunBatch={handleRunBatch} />} />
              <Route path="/recoveries" element={<Recoveries />} />
              <Route path="/recoveries/:id" element={<RecoveryDetail />} />
              <Route path="/review" element={<ReviewQueue />} />
              <Route path="/policies" element={<Policies />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
