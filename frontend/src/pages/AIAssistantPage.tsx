
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Shield, Key, Lock, AlertTriangle, Volume2, Square, Mic, MicOff, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ttsService from '../services/ttsService';
import { DashboardLayout } from '../components/DashboardLayout';
import { firebaseAssistantAPI, auth } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

export const AIAssistantPage: React.FC = () => {
    const { showError } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
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

            const cleanText = text
                .replace(/[*#`_~>[\]]/g, '')
                .replace(/https?:\/\/\S+/g, 'ссылка')
                .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
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

    // Initialize chat with welcome message (no Firebase loading)
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setMessages([WELCOME_MSG]);
                setIsReady(true);
            } else {
                setMessages([]);
                setIsReady(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !isReady) return;

        const userMessageText = input.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for API (exclude welcome message)
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
        } catch (error) {
            console.error('Failed to send message:', error);
            showError('Ошибка связи с ИИ. Попробуйте позже.');

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: '⚠️ Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto">
                {/* Header */}
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
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {!isReady ? (
                        <div className="flex items-center justify-center h-32 text-slate-400">
                            Загрузка...
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
                                disabled={isLoading || !isReady}
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
                            disabled={isLoading || !isReady}
                        />

                        {/* Voice Input Button */}
                        <button
                            onClick={toggleVoiceInput}
                            disabled={isLoading || !isReady}
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
                            disabled={!input.trim() || isLoading || !isReady}
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
            </div>
        </DashboardLayout>
    );
};
