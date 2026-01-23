import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Skeleton } from './components/Skeleton';
import './i18n/i18n';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const PartnersPage = React.lazy(() => import('./pages/PartnersPage').then(m => ({ default: m.PartnersPage })));
const WelcomePage = React.lazy(() => import('./pages/WelcomePage').then(m => ({ default: m.WelcomePage })));
const AIScenarioPage = React.lazy(() => import('./pages/AIScenarioPage').then(m => ({ default: m.AIScenarioPage })));
const AIAssistantPage = React.lazy(() => import('./pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const AchievementsPage = React.lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const CertificatePage = React.lazy(() => import('./pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const CallSimulatorPage = React.lazy(() => import('./pages/CallSimulatorPage').then(m => ({ default: m.CallSimulatorPage })));
const VoiceCallPage = React.lazy(() => import('./pages/VoiceCallPage').then(m => ({ default: m.VoiceCallPage })));
const CyberDefensePage = React.lazy(() => import('./pages/CyberDefensePage').then(m => ({ default: m.CyberDefensePage })));
const TeamChallengesPage = React.lazy(() => import('./pages/TeamChallengesPage').then(m => ({ default: m.TeamChallengesPage })));

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
            <Skeleton variant="circular" width={64} height={64} className="mx-auto" />
            <Skeleton variant="text" width={200} className="mx-auto" />
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <BrowserRouter>
                    <ToastProvider>
                        <AuthProvider>
                            <Suspense fallback={<PageLoader />}>
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
                                                <AIScenarioPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/training/:scenarioId"
                                        element={
                                            <ProtectedRoute>
                                                <AIScenarioPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/assistant"
                                        element={
                                            <ProtectedRoute>
                                                <AIAssistantPage />
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
                                    <Route
                                        path="/leaderboard"
                                        element={
                                            <ProtectedRoute>
                                                <LeaderboardPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/certificates"
                                        element={
                                            <ProtectedRoute>
                                                <CertificatePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/teacher"
                                        element={
                                            <ProtectedRoute>
                                                <TeacherDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/call-simulator"
                                        element={
                                            <ProtectedRoute>
                                                <CallSimulatorPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/voice-call"
                                        element={
                                            <ProtectedRoute>
                                                <VoiceCallPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/cyber-defense"
                                        element={
                                            <ProtectedRoute>
                                                <CyberDefensePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/team-challenges"
                                        element={
                                            <ProtectedRoute>
                                                <TeamChallengesPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Catch all - redirect to landing */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Suspense>
                        </AuthProvider>
                    </ToastProvider>
                </BrowserRouter>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
