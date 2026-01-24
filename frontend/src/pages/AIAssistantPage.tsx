
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Shield, Key, Lock, AlertTriangle, Volume2, Square, Mic, MicOff, Copy, Trash2, Check, RefreshCw, History, X, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ttsService from '../services/ttsService';
import { DashboardLayout } from '../components/DashboardLayout';
import { firebaseAssistantAPI, auth, type ChatThread } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

export const AIAssistantPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null); // Use any for SpeechRecognition to avoid type issues
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        return () => {
            ttsService.stop();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Helper to detect language
    const detectLanguage = (text: string): string => {
        const kazakhChars = /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/;
        const cyrillicChars = /[а-яА-Я]/;

        if (kazakhChars.test(text)) return 'kk-KZ';
        if (cyrillicChars.test(text)) return 'ru-RU';
        return 'en-US';
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showError('Ваш браузер не поддерживает голосовой ввод');
            return;
        }

        const recognition = new SpeechRecognition();
        // Use Russian as default for input, or could be dynamic based on user settings
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => (prev ? prev + ' ' + transcript : transcript));
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleSpeak = (id: string, text: string) => {
        if (playingMessageId === id) {
            ttsService.stop();
            setPlayingMessageId(null);
        } else {
            ttsService.stop();
            setPlayingMessageId(id);

            // Clean text for speech: remove markdown, emojis, etc.
            const cleanText = text
                // Remove markdown markers (*, #, _, `, ~, >)
                .replace(/[*#`_~>\[\]]/g, '')
                // Remove URLs (simplified)
                .replace(/https?:\/\/\S+/g, 'ссылка')
                // Remove emojis and symbols
                .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
                // Remove extra whitespace
                .replace(/\s+/g, ' ')
                .trim();

            const lang = detectLanguage(cleanText);

            ttsService.speak(cleanText, { lang })
                .then(() => setPlayingMessageId(null))
                .catch(() => setPlayingMessageId(null));
        }
    };

    const quickActions = [
        { icon: <Shield className="w-4 h-4" />, label: 'Проверь это сообщение', prompt: 'Проверь этот текст на фишинг: ' },
        { icon: <Key className="w-4 h-4" />, label: 'Придумай пароль', prompt: 'Придумай надежный пароль и объясни, как его запомнить.' },
        { icon: <Lock className="w-4 h-4" />, label: 'Что такое 2FA?', prompt: 'Расскажи простыми словами, что такое двухфакторная аутентификация и зачем она нужна.' },
        { icon: <AlertTriangle className="w-4 h-4" />, label: 'Симуляция атаки', prompt: 'Давай сыграем. Представь, что ты мошенник, который хочет украсть данные моей карты. Напиши мне первое сообщение.' },
    ];

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const WELCOME_MSG: Message = {
        id: 'welcome',
        role: 'model',
        content: 'Привет! Я QadamSafe AI — твой персональный эксперт по кибербезопасности. \n\nЯ могу:\n🔹 Проверить подозрительное сообщение\n🔹 Помочь придумать пароль\n🔹 Объяснить сложные термины\n🔹 Потренировать тебя в роли мошенника\n\nЧем могу помочь?',
        timestamp: new Date(),
    };

    // Load threads and active chat on auth; migrate legacy chatHistory once if needed
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setMessages([]);
                setActiveThreadId(null);
                setThreads([]);
                setIsLoadingHistory(false);
                return;
            }
            try {
                let list = await firebaseAssistantAPI.listThreads();
                let tid: string;
                if (list.length > 0) {
                    const fromLs = localStorage.getItem('qadamsafe_activeThreadId');
                    tid = list.some(t => t.id === fromLs) ? fromLs! : list[0].id;
                } else {
                    const legacy = await firebaseAssistantAPI.getLegacyHistory();
                    if (legacy.length > 0) {
                        tid = await firebaseAssistantAPI.migrateLegacyToThread();
                        list = await firebaseAssistantAPI.listThreads();
                    } else {
                        const t = await firebaseAssistantAPI.createThread();
                        tid = t.id;
                        list = [{ id: t.id, title: t.title, createdAt: t.createdAt, updatedAt: t.updatedAt }];
                    }
                }
                setActiveThreadId(tid);
                setThreads(list);
                localStorage.setItem('qadamsafe_activeThreadId', tid);
                const history = await firebaseAssistantAPI.getHistory(tid);
                setMessages(history.length > 0 ? history : [WELCOME_MSG]);
            } catch (error) {
                console.error('Failed to load chat:', error);
                setMessages([WELCOME_MSG]);
                // Fallback: try to create a thread so the user can still send (activeThreadId was never set)
                try {
                    const t = await firebaseAssistantAPI.createThread();
                    setActiveThreadId(t.id);
                    setThreads([{ id: t.id, title: t.title, createdAt: t.createdAt, updatedAt: t.updatedAt }]);
                    localStorage.setItem('qadamsafe_activeThreadId', t.id);
                } catch (e2) {
                    console.error('Fallback createThread failed:', e2);
                    showError('Не удалось загрузить чат. Проверьте интернет и обновите страницу.');
                }
            } finally {
                setIsLoadingHistory(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
        // Use timeout to ensure DOM is updated
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // When opening history panel, refresh threads list
    useEffect(() => {
        if (showHistoryPanel) {
            firebaseAssistantAPI.listThreads().then(setThreads).catch(() => setThreads([]));
        }
    }, [showHistoryPanel]);

    const handleSelectThread = async (threadId: string) => {
        setShowHistoryPanel(false);
        setActiveThreadId(threadId);
        localStorage.setItem('qadamsafe_activeThreadId', threadId);
        setIsLoadingHistory(true);
        try {
            const history = await firebaseAssistantAPI.getHistory(threadId);
            setMessages(history.length > 0 ? history : [WELCOME_MSG]);
        } catch {
            setMessages([WELCOME_MSG]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleNewChat = async () => {
        try {
            const t = await firebaseAssistantAPI.createThread();
            setActiveThreadId(t.id);
            setThreads(prev => [{ id: t.id, title: t.title, createdAt: t.createdAt, updatedAt: t.updatedAt }, ...prev]);
            localStorage.setItem('qadamsafe_activeThreadId', t.id);
            setMessages([WELCOME_MSG]);
            setShowHistoryPanel(false);
        } catch (e) {
            console.error('Failed to create thread:', e);
            showError('Не удалось создать чат');
        }
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleClearChat = async () => {
        if (!activeThreadId) return;
        if (window.confirm('Вы уверены, что хотите очистить историю чата?')) {
            try {
                await firebaseAssistantAPI.clearHistory(activeThreadId);
                setMessages([WELCOME_MSG]);
                showSuccess('История чата очищена');
            } catch (error) {
                console.error('Failed to clear history:', error);
                showError('Не удалось очистить историю');
            }
        }
    };

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !activeThreadId) return;

        const userMessageText = input.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessageText,
            timestamp: new Date(),
        };

        const isFirstUserMessage = messages.filter(m => m.id !== 'welcome').length === 0;

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        firebaseAssistantAPI.saveMessage(activeThreadId, newMessage).catch(err => console.error("Failed to save msg", err));

        // Set thread title from first user message
        if (isFirstUserMessage) {
            const raw = userMessageText.replace(/\s+/g, ' ').trim();
            const newTitle = (raw.slice(0, 50) + (raw.length > 50 ? '…' : '')) || 'Новый чат';
            firebaseAssistantAPI.updateThreadTitle(activeThreadId, newTitle).catch(err => console.error("Failed to update title", err));
            setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, title: newTitle, updatedAt: new Date() } : t));
        }

        try {
            // Prepare history for API
            // Prepare history for API (exclude local welcome message to ensure correct User/Model alternation)
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.role,
                    parts: m.content
                }));

            const responseText = await firebaseAssistantAPI.sendMessage(userMessageText, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: responseText,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);

            firebaseAssistantAPI.saveMessage(activeThreadId, aiMessage).catch(err => console.error("Failed to save AI msg", err));
        } catch (error) {
            console.error('Failed to send message:', error);
            showError('Ошибка связи с ИИ. Попробуйте позже.');

            // Optional: add error message to chat
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: '⚠️ Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Refocus input after sending
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (prompt: string) => {
        setInput(prompt);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Format time
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto">
                {/* Header Area within the page */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="w-10 h-10 rounded-full bg-cyber-green/10 flex items-center justify-center border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                        <Bot className="w-6 h-6 text-cyber-green" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Qadam AI <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-green/20 text-cyber-green border border-cyber-green/30">BETA</span>
                        </h1>
                        <p className="text-xs text-slate-400">Личный ассистент по кибербезопасности</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            onClick={() => setShowHistoryPanel(true)}
                            className="p-2 text-slate-400 hover:text-cyber-green hover:bg-cyber-green/10 rounded-lg transition-all"
                            title="История чатов"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        {messages.length > 1 && (
                            <button
                                onClick={handleClearChat}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Очистить чат"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center h-32 text-slate-400">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                            Загрузка переписки...
                        </div>
                    ) : (
                    <>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                                ${msg.role === 'user'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                    : 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                                }
                            `}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            {/* Bubble */}
                            <div className={`
                                max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg overflow-hidden
                                ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-tr-none whitespace-pre-wrap'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                }
                            `}>
                                {msg.role === 'user' ? (
                                    msg.content
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li>{children}</li>,
                                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-cyber-green">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                                            code: ({ children, className }) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return match ? (
                                                    <div className="my-2 rounded-lg overflow-hidden border border-slate-700">
                                                        <div className="bg-slate-900 px-3 py-1 text-xs text-slate-400 border-b border-slate-700">
                                                            {match[1]}
                                                        </div>
                                                        <pre className="bg-slate-950 p-3 overflow-x-auto text-xs font-mono text-emerald-400 scrollbar-thin scrollbar-thumb-slate-700">
                                                            <code>{children}</code>
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <code className="bg-slate-900 px-1 py-0.5 rounded text-cyber-green font-mono text-xs border border-slate-700">
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-2 border-cyber-green/50 pl-3 italic text-slate-400 my-2">
                                                    {children}
                                                </blockquote>
                                            ),
                                            a: ({ href, children }) => (
                                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyber-green hover:underline">
                                                    {children}
                                                </a>
                                            ),
                                            strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                                <div className="flex items-center justify-end gap-2 mt-2">
                                    {msg.role === 'model' && (
                                        <>
                                            <button
                                                onClick={() => handleCopy(msg.id, msg.content)}
                                                className="p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-cyber-green transition-colors"
                                                title="Копировать"
                                            >
                                                {copiedId === msg.id ? (
                                                    <Check className="w-3.5 h-3.5 text-cyber-green" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleSpeak(msg.id, msg.content)}
                                                className="p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-cyber-green transition-colors"
                                                title={playingMessageId === msg.id ? "Остановить" : "Прослушать"}
                                            >
                                                {playingMessageId === msg.id ? (
                                                    <Square className="w-3.5 h-3.5 fill-current" />
                                                ) : (
                                                    <Volume2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </>
                                    )}
                                    <div className={`
                                        text-[10px] opacity-70
                                        ${msg.role === 'user' ? 'text-purple-200' : 'text-slate-400'}
                                    `}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyber-green/10 flex items-center justify-center flex-shrink-0 border border-cyber-green/30">
                                <Bot className="w-5 h-5 text-cyber-green" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700 flex items-center gap-1">
                                <span className="w-2 h-2 bg-cyber-green/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-cyber-green/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-cyber-green/50 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                    </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    {/* Quick Actions */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar mask-gradient-x">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action.prompt)}
                                disabled={isLoading || isLoadingHistory}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyber-green/50 rounded-full text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all"
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="relative flex items-end gap-2 bg-slate-950 p-2 rounded-xl border border-slate-700 focus-within:border-cyber-green/50 focus-within:ring-1 focus-within:ring-cyber-green/20 transition-all shadow-inner">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Задайте вопрос о кибербезопасности..."
                            className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-sm px-3 py-2 focus:outline-none resize-none max-h-32 min-h-[44px]"
                            rows={1}
                            style={{ height: 'auto', minHeight: '44px' }}
                            disabled={isLoading || isLoadingHistory}
                        />

                        {/* Voice Input Button */}
                        <button
                            onClick={toggleVoiceInput}
                            disabled={isLoading || isLoadingHistory}
                            className={`p-2.5 rounded-lg flex-shrink-0 transition-all duration-200 ${isListening
                                ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50'
                                : 'bg-slate-800 text-slate-400 hover:text-cyber-green hover:bg-slate-700'
                                }`}
                            title="Голосовой ввод"
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || isLoadingHistory || !activeThreadId}
                            className={`
                                p-2.5 rounded-lg flex-shrink-0 transition-all duration-200
                                ${input.trim() && !isLoading
                                    ? 'bg-cyber-green text-black hover:bg-cyber-green-dark shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }
                            `}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-500">
                            ИИ может ошибаться. Не передавайте реальные пароли и данные карт.
                        </p>
                    </div>
                </div>

                {/* Панель «История чатов» */}
                {showHistoryPanel && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowHistoryPanel(false)} aria-hidden />
                        <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-slate-900 border-l border-slate-700 z-50 shadow-xl flex flex-col">
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <span className="font-semibold text-white">История чатов</span>
                                <button onClick={() => setShowHistoryPanel(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-5 h-5" /></button>
                            </div>
                            <button onClick={handleNewChat} className="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-cyber-green/20 text-cyber-green border border-cyber-green/50 rounded-lg hover:bg-cyber-green/30 transition-colors">
                                <Plus className="w-4 h-4" /> Новый чат
                            </button>
                            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                                {threads.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelectThread(t.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${t.id === activeThreadId ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/40' : 'text-slate-300 hover:bg-slate-800 border-transparent'}`}
                                    >
                                        <span className="block truncate text-sm font-medium">{t.title}</span>
                                        <span className="block text-xs text-slate-500 mt-0.5">{t.updatedAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};
