import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 p-8 ml-64">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-cyber-green mb-2">
                        {t('common.appName')}
                    </h1>
                    <p className="text-muted-foreground">
                        {user?.name || user?.email}
                    </p>
                </div>

                {/* Welcome Card */}
                <div className="cyber-card max-w-2xl mx-auto text-center py-12">
                    <TrendingUp className="w-16 h-16 text-cyber-green mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {t('dashboard.welcome')}
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Вся ваша статистика и активность теперь в разделе "Прогресс"
                    </p>
                    <button
                        onClick={() => navigate('/progress')}
                        className="cyber-button text-lg px-8 py-3"
                    >
                        {t('dashboard.viewProgress')}
                    </button>
                </div>
            </div>
        </div>
    );
};
