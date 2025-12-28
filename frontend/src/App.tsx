
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PartnersPage } from './pages/PartnersPage';
import { WelcomePage } from './pages/WelcomePage';
import { TrainingPage } from './pages/TrainingPage';
import { ScenarioPage } from './pages/ScenarioPage';
import { AIScenarioPage } from './pages/AIScenarioPage';
import { ProgressPage } from './pages/ProgressPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import './i18n/i18n';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ToastProvider>
                    <AuthProvider>
                        <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/partners" element={<PartnersPage />} />

                    {/* Redirect dashboard to progress */}
                    <Route path="/dashboard" element={<Navigate to="/progress" replace />} />
                    <Route
                        path="/welcome"
                        element={
                            <ProtectedRoute>
                                <WelcomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/training"
                        element={
                            <ProtectedRoute>
                                <TrainingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/training/:id"
                        element={
                            <ProtectedRoute>
                                <ScenarioPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai-scenarios"
                        element={
                            <ProtectedRoute>
                                <AIScenarioPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai-scenarios/:scenarioId"
                        element={
                            <ProtectedRoute>
                                <AIScenarioPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/progress"
                        element={
                            <ProtectedRoute>
                                <ProgressPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/achievements"
                        element={
                            <ProtectedRoute>
                                <AchievementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/subscription"
                        element={
                            <ProtectedRoute>
                                <SubscriptionPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </ToastProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
