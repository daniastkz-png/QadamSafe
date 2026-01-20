
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Send, X, Sparkles, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, AIAnalysisResult } from '../services/aiService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    analysis?: AIAnalysisResult;
}

export const CyberMate: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: t('cyberMate.welcome', 'Привет! Я CyberMate, твой ИИ-помощник. Отправь мне подозрительное сообщение или ссылку, и я проверю их на безопасность.'),
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPro = user?.subscriptionTier === 'PRO' || user?.subscriptionTier === 'BUSINESS';

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const analysis = await aiService.analyzeText(userMessage.text);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: analysis.summary,
                sender: 'ai',
                timestamp: new Date(),
                analysis
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: 'Извините, произошла ошибка анализа. Попробуйте позже.',
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-50 ${isOpen ? 'scale-0' : 'scale-100'
                    } bg-gradient-to-r from-cyber-blue to-purple-600 text-white border border-white/20`}
                title="CyberMate AI"
            >
                <Bot className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 w-full max-w-sm md:w-96 bg-card border border-cyber-blue/50 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                    }`}
                style={{ height: '500px', maxHeight: '80vh' }}
            >
                {/* Header */}
                <div className="p-4 border-b border-border bg-gradient-to-r from-cyber-blue/10 to-purple-600/10 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-cyber-blue to-purple-600 rounded-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">CyberMate</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-muted-foreground">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                    {!isPro && (
                        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 relative">
                                <Lock className="w-8 h-8 text-cyber-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('subscription.lockedProTitle', 'Доступно в PRO')}</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                {t('subscription.lockedProDesc', 'Обновите тариф до PRO для доступа к этой функции.')}
                            </p>
                            <div className="text-xs text-muted-foreground mb-4 bg-muted/50 px-3 py-2 rounded-lg">
                                <p>Demo: <kbd className="font-mono bg-background px-1 rounded border border-border">Cmd+P</kbd></p>
                            </div>
                            <button className="cyber-button w-full justify-center text-sm py-2">
                                {t('subscription.upgradeTo', { plan: 'PRO' })}
                            </button>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted rounded-bl-none'
                                    }`}
                            >
                                <p className="text-sm">{msg.text}</p>

                                {msg.analysis && (
                                    <div className={`mt-3 p-3 rounded-lg border-l-4 text-xs ${msg.analysis.riskLevel === 'SAFE' ? 'bg-green-500/10 border-green-500' :
                                        msg.analysis.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500' :
                                            'bg-yellow-500/10 border-yellow-500'
                                        }`}>
                                        <div className="font-bold mb-1 flex items-center gap-1">
                                            {msg.analysis.riskLevel === 'SAFE' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                            {msg.analysis.riskLevel === 'SAFE' ? 'БЕЗОПАСНО' : 'УГРОЗА'}
                                        </div>
                                        <p>{msg.analysis.advice}</p>
                                    </div>
                                )}

                                <span className="text-[10px] opacity-70 mt-1 block text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-muted p-3 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-border bg-background/50 rounded-b-2xl">
                    <div className="relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isPro ? "Вставьте текст или ссылку..." : "Доступно в PRO версии"}
                            disabled={!isPro || isTyping}
                            className="w-full bg-muted/50 border border-input rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyber-blue resize-none h-[50px] disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || !isPro || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyber-blue to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none"
                        >
                            {isTyping ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
