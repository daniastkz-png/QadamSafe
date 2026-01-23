import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Shield, Lock, Cpu, Globe, Wifi } from 'lucide-react';

interface CyberTerminalProps {
    onComplete?: () => void;
    duration?: number;
}

export const CyberTerminal: React.FC<CyberTerminalProps> = ({ onComplete, duration = 5000 }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const logMessages = [
        "Initializing QadamAI Core...",
        "Connecting to Neural Network...",
        "Analying Threat Vector...",
        "Scanning specific phishing patterns...",
        "Decrypting sender signatures...",
        "Consulting global threat database...",
        "Simulating victim response patterns...",
        "Generating social engineering context...",
        "Finalizing interactive scenario...",
        "Optimization complete."
    ];

    useEffect(() => {
        let currentLine = 0;
        const lineInterval = setInterval(() => {
            if (currentLine < logMessages.length) {
                setLines(prev => [...prev, `> ${logMessages[currentLine]}`]);
                currentLine++;
            }
        }, duration / logMessages.length);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, duration / 100);

        const timeout = setTimeout(() => {
            if (onComplete) onComplete();
        }, duration + 500);

        return () => {
            clearInterval(lineInterval);
            clearInterval(progressInterval);
            clearTimeout(timeout);
        };
    }, [duration, onComplete]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative bg-black/90 rounded-xl border border-cyber-green/50 shadow-[0_0_50px_rgba(0,255,65,0.2)] overflow-hidden font-mono text-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-cyber-green/10 border-b border-cyber-green/30">
                    <div className="flex items-center gap-2 text-cyber-green">
                        <Terminal className="w-4 h-4" />
                        <span className="font-bold tracking-wider">QADAM_AI_CORE v2.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                        <span className="text-xs text-cyber-green/70">ONLINE</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 h-64 flex flex-col relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* Left Side: Visuals */}
                    <div className="absolute top-6 right-6 flex flex-col gap-4">
                        <div className="w-16 h-16 rounded-lg border border-cyber-green/30 flex items-center justify-center relative overflow-hidden">
                            <Shield className="w-8 h-8 text-cyber-green/50 animate-pulse" />
                            <div className="absolute inset-0 bg-cyber-green/10 animate-[ping_3s_linear_infinite]" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Cpu className="w-6 h-6 text-cyber-green/40" />
                            <Globe className="w-6 h-6 text-cyber-green/40" />
                            <Wifi className="w-6 h-6 text-cyber-green/40" />
                            <Lock className="w-6 h-6 text-cyber-green/40" />
                        </div>
                    </div>

                    {/* Console Output */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto z-10 pr-24 no-scrollbar"
                    >
                        {lines.map((line, i) => (
                            <div key={i} className="mb-1 text-cyber-green/80 animate-fade-in">
                                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {line}
                            </div>
                        ))}
                        <div className="animate-pulse text-cyber-green">_</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-cyber-green/20">
                        <div className="flex justify-between text-xs text-cyber-green/70 mb-1">
                            <span>GENERATION_SEQUENCE</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1 bg-cyber-green/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyber-green shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
