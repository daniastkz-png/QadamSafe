import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Building2, Rocket, Puzzle, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Link } from 'react-router-dom';

export const PartnersPage: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        organizationType: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
                    <LanguageSwitcher />
                </div>

                <div className="max-w-md w-full text-center">
                    <div className="cyber-card">
                        <div className="w-16 h-16 bg-cyber-green/10 border border-cyber-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-cyber-green" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                            {t('partners.thankYou', 'Спасибо за вашу заявку!')}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {t('partners.responseTime', 'Мы свяжемся с вами в течение одного рабочего дня')}
                        </p>
                        <Link to="/auth" className="cyber-button inline-block">
                            {t('partners.backToAuth', 'Вернуться на главную')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
                <LanguageSwitcher />
            </div>

            {/* Back to Auth Link */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
                <Link
                    to="/auth"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyber-green transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('partners.backToAuth', 'Назад')}
                </Link>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
                            <Shield className="w-10 h-10 text-cyber-green" />
                        </div>
                        <span className="text-2xl font-bold text-cyber-green">QadamSafe</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {t('partners.title', 'Для организаций и партнёров')}
                    </h1>

                    <p className="text-xl text-cyber-green font-medium mb-4 max-w-3xl mx-auto">
                        {t('partners.subtitle', 'Хотите запустить партнёрство с QadamSafe — для школы, колледжа, университета или компании?')}
                    </p>

                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('partners.description', 'Заполните короткую форму — обсудим пилот, интеграции и масштабирование.')}
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* Partnership Card */}
                    <div className="cyber-card text-center">
                        <div className="w-12 h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-6 h-6 text-cyber-green" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            {t('partners.partnershipTitle', 'Партнёрство')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('partners.partnershipDesc', 'Совместные программы и мероприятия')}
                        </p>
                    </div>

                    {/* Pilot Card */}
                    <div className="cyber-card text-center">
                        <div className="w-12 h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Rocket className="w-6 h-6 text-cyber-green" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            {t('partners.pilotTitle', 'Пилот')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('partners.pilotDesc', 'Быстрый запуск и оценка эффекта')}
                        </p>
                    </div>

                    {/* Integration Card */}
                    <div className="cyber-card text-center">
                        <div className="w-12 h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Puzzle className="w-6 h-6 text-cyber-green" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            {t('partners.integrationTitle', 'Интеграции')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('partners.integrationDesc', 'LMS / HR и кастомные сценарии')}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="cyber-card">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            {t('partners.formTitle', 'Оставить заявку')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('partners.organizationName', 'Название организации')} *
                                </label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    className="cyber-input"
                                    placeholder={t('partners.organizationNamePlaceholder', 'ООО "Компания"')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('partners.organizationType', 'Тип организации')} *
                                </label>
                                <select
                                    name="organizationType"
                                    value={formData.organizationType}
                                    onChange={handleChange}
                                    className="cyber-input"
                                    required
                                >
                                    <option value="">{t('partners.selectType', 'Выберите тип')}</option>
                                    <option value="school">{t('partners.school', 'Школа')}</option>
                                    <option value="college">{t('partners.college', 'Колледж')}</option>
                                    <option value="university">{t('partners.university', 'Университет')}</option>
                                    <option value="company">{t('partners.company', 'Компания')}</option>
                                    <option value="government">{t('partners.government', 'Государственная организация')}</option>
                                    <option value="other">{t('partners.other', 'Другое')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('partners.contactPerson', 'Контактное лицо')} *
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="cyber-input"
                                    placeholder={t('partners.contactPersonPlaceholder', 'Иван Иванов')}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('partners.email', 'Email')} *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="cyber-input"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('partners.phone', 'Телефон')} *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="cyber-input"
                                        placeholder="+7 (___) ___-__-__"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('partners.message', 'Сообщение')}
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="cyber-input min-h-[120px] resize-none"
                                    placeholder={t('partners.messagePlaceholder', 'Расскажите о ваших целях и задачах...')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('common.loading') : t('partners.submitButton', 'Оставить заявку')}
                            </button>

                            <p className="text-xs text-muted-foreground text-center">
                                {t('partners.responseTime', 'Ответим в течение одного рабочего дня')}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
