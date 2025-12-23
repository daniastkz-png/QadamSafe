import React, { useState, useEffect } from 'react';

interface PhoneSimulatorProps {
    messageType: 'sms' | 'whatsapp' | 'telegram';
    senderName: string;
    senderNumber?: string;
    messageText: string;
    timestamp?: string;
    profileEmoji?: string;
    onAnimationComplete?: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
    messageType,
    senderName,
    senderNumber,
    messageText,
    timestamp,
    profileEmoji = '👤',
    onAnimationComplete,
}) => {
    const [showMessage, setShowMessage] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    // Current time for status bar
    const currentTime = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });

    useEffect(() => {
        // Start animation after a small delay
        const startDelay = setTimeout(() => {
            setShowMessage(true);
        }, 500);

        return () => clearTimeout(startDelay);
    }, []);

    useEffect(() => {
        if (!showMessage) return;

        let currentIndex = 0;
        const typingSpeed = 20; // ms per character

        const typeNextChar = () => {
            if (currentIndex < messageText.length) {
                setTypedText(messageText.slice(0, currentIndex + 1));
                currentIndex++;
                setTimeout(typeNextChar, typingSpeed);
            } else {
                setIsTyping(false);
                onAnimationComplete?.();
            }
        };

        // Small delay before starting to type
        const typingDelay = setTimeout(() => {
            typeNextChar();
        }, 300);

        return () => clearTimeout(typingDelay);
    }, [showMessage, messageText, onAnimationComplete]);

    const getAppColor = () => {
        switch (messageType) {
            case 'whatsapp':
                return {
                    primary: '#25D366',
                    secondary: '#128C7E',
                    bubble: '#005C4B',
                    header: '#075E54',
                };
            case 'telegram':
                return {
                    primary: '#0088CC',
                    secondary: '#54A9EB',
                    bubble: '#2E3440',
                    header: '#2E3440',
                };
            case 'sms':
            default:
                return {
                    primary: '#00FF41',
                    secondary: '#00D835',
                    bubble: '#1a2332',
                    header: '#0f1419',
                };
        }
    };

    const colors = getAppColor();

    const getAppIcon = () => {
        switch (messageType) {
            case 'whatsapp':
                return (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                );
            case 'telegram':
                return (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0088CC">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                );
            case 'sms':
            default:
                return (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#00FF41">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    </svg>
                );
        }
    };

    return (
        <div className="flex justify-center items-center py-6">
            {/* Phone Frame */}
            <div
                className="relative w-[280px] h-[560px] rounded-[40px] p-2 shadow-2xl"
                style={{
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                    boxShadow: `
                        0 25px 50px -12px rgba(0, 0, 0, 0.8),
                        0 0 0 2px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15)
                    `,
                }}
            >
                {/* Inner Screen Bezel */}
                <div
                    className="w-full h-full rounded-[32px] overflow-hidden"
                    style={{
                        background: '#0f1419',
                        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {/* Status Bar */}
                    <div
                        className="flex items-center justify-between px-6 py-2 text-white text-xs"
                        style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                    >
                        <span className="font-medium">{currentTime}</span>
                        <div className="flex items-center gap-1">
                            {/* Signal Bars */}
                            <div className="flex items-end gap-0.5 h-3">
                                <div className="w-0.5 h-1 bg-white rounded-sm"></div>
                                <div className="w-0.5 h-1.5 bg-white rounded-sm"></div>
                                <div className="w-0.5 h-2 bg-white rounded-sm"></div>
                                <div className="w-0.5 h-2.5 bg-white/50 rounded-sm"></div>
                            </div>
                            {/* WiFi Icon */}
                            <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="white">
                                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                            </svg>
                            {/* Battery */}
                            <div className="flex items-center ml-1">
                                <div className="w-5 h-2.5 border border-white rounded-sm relative">
                                    <div
                                        className="absolute left-0.5 top-0.5 bottom-0.5 rounded-sm"
                                        style={{
                                            width: '75%',
                                            background: '#00FF41',
                                        }}
                                    ></div>
                                </div>
                                <div className="w-0.5 h-1 bg-white rounded-r-sm ml-0.5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-800 mr-4"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-900 ring-1 ring-gray-700"></div>
                    </div>

                    {/* App Header */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 border-b"
                        style={{
                            background: colors.header,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <button className="text-white/70 hover:text-white">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                        </button>
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{ background: `${colors.primary}30` }}
                        >
                            {profileEmoji}
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{senderName}</div>
                            {senderNumber && (
                                <div className="text-white/60 text-xs">{senderNumber}</div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">{getAppIcon()}</div>
                    </div>

                    {/* Chat Area */}
                    <div
                        className="flex-1 p-4 h-[380px] overflow-hidden"
                        style={{
                            background:
                                messageType === 'whatsapp'
                                    ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%230d1418\' width=\'100\' height=\'100\'/%3E%3Cpath d=\'M20 20h2v2h-2zM40 40h2v2h-2zM60 60h2v2h-2zM80 80h2v2h-2zM10 50h2v2h-2zM50 10h2v2h-2zM50 90h2v2h-2zM90 50h2v2h-2zM30 70h2v2h-2zM70 30h2v2h-2z\' fill=\'%231a2530\' opacity=\'0.5\'/%3E%3C/svg%3E")'
                                    : '#0f1419',
                        }}
                    >
                        {/* Timestamp */}
                        <div className="text-center mb-4">
                            <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                }}
                            >
                                {timestamp || 'Сегодня'}
                            </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                            className={`transition-all duration-500 ease-out ${showMessage
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4'
                                }`}
                        >
                            <div
                                className="max-w-[220px] rounded-2xl rounded-tl-md p-3 shadow-lg relative"
                                style={{
                                    background: colors.bubble,
                                    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
                                }}
                            >
                                {/* Message Content */}
                                <p
                                    className="text-white text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{ wordBreak: 'break-word' }}
                                >
                                    {typedText}
                                    {isTyping && (
                                        <span
                                            className="inline-block w-0.5 h-4 ml-0.5 animate-pulse"
                                            style={{ background: colors.primary }}
                                        ></span>
                                    )}
                                </p>

                                {/* Message Time */}
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-xs text-white/50">{currentTime}</span>
                                    {messageType === 'whatsapp' && (
                                        <svg
                                            viewBox="0 0 16 11"
                                            className="w-4 h-3"
                                            fill="#53bdeb"
                                        >
                                            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.136.457.457 0 0 0-.347.142.437.437 0 0 0-.14.327c0 .12.047.236.14.327l2.735 2.584a.46.46 0 0 0 .312.117.445.445 0 0 0 .359-.18l6.597-8.14a.414.414 0 0 0-.04-.48z" />
                                            <path d="M14.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.405-1.328.707-.871 1.028.972 6.597-8.14a.414.414 0 0 0-.052-.345z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Bubble Tail */}
                                <div
                                    className="absolute top-0 -left-2 w-3 h-3"
                                    style={{
                                        background: colors.bubble,
                                        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Typing Indicator (optional decorative) */}
                        {isTyping && showMessage && (
                            <div className="flex items-center gap-2 mt-4 opacity-60">
                                <div className="flex gap-1">
                                    <div
                                        className="w-2 h-2 rounded-full animate-bounce"
                                        style={{
                                            background: colors.primary,
                                            animationDelay: '0ms',
                                        }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 rounded-full animate-bounce"
                                        style={{
                                            background: colors.primary,
                                            animationDelay: '150ms',
                                        }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 rounded-full animate-bounce"
                                        style={{
                                            background: colors.primary,
                                            animationDelay: '300ms',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area (decorative) */}
                    <div
                        className="absolute bottom-8 left-2 right-2 flex items-center gap-2 px-4 py-3 rounded-b-[32px]"
                        style={{ background: colors.header }}
                    >
                        <div
                            className="flex-1 rounded-full px-4 py-2 text-sm text-white/40"
                            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                            Сообщение...
                        </div>
                        <button
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: colors.primary }}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Physical Button (bottom) */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
            </div>
        </div>
    );
};
