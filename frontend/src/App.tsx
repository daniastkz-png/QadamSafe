import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { WelcomePage } from './pages/WelcomePage';
import { TrainingPage } from './pages/TrainingPage';
import { ScenarioPage } from './pages/ScenarioPage';
import { ProgressPage } from './pages/ProgressPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import './i18n/i18n';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />

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
        </BrowserRouter>
    );
}

export default App;
