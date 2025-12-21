import React, { useEffect, useState } from 'react';
import { Mail, AlertTriangle, Shield, MessageSquare } from 'lucide-react';

interface ThreatEmail {
    id: number;
    x: number;
    y: number;
    isDangerous: boolean;
    icon: 'mail' | 'message' | 'alert';
    opacity: number;
    blocked: boolean;
}

export const ThreatProtectionVisual: React.FC = () => {
    const [threats, setThreats] = useState<ThreatEmail[]>([]);

    useEffect(() => {
        // Initialize threats
        const initialThreats: ThreatEmail[] = [
            { id: 1, x: 10, y: 20, isDangerous: true, icon: 'mail', opacity: 0.7, blocked: false },
            { id: 2, x: 80, y: 40, isDangerous: false, icon: 'message', opacity: 0.6, blocked: false },
            { id: 3, x: 15, y: 60, isDangerous: true, icon: 'alert', opacity: 0.8, blocked: false },
            { id: 4, x: 75, y: 75, isDangerous: true, icon: 'mail', opacity: 0.65, blocked: false },
            { id: 5, x: 50, y: 15, isDangerous: false, icon: 'message', opacity: 0.55, blocked: false },
            { id: 6, x: 30, y: 85, isDangerous: true, icon: 'mail', opacity: 0.75, blocked: false },
        ];
        setThreats(initialThreats);

        // Animation loop - move threats and block dangerous ones
        const interval = setInterval(() => {
            setThreats(prevThreats =>
                prevThreats.map(threat => {
                    // Move threat towards center (shield)
                    const centerX = 50;
                    const centerY = 50;
                    const dx = centerX - threat.x;
                    const dy = centerY - threat.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If close to shield and dangerous, block it
                    if (distance < 25 && threat.isDangerous && !threat.blocked) {
                        return { ...threat, blocked: true, opacity: 0.3 };
                    }

                    // Move slowly towards center
                    const speed = 0.15;
                    const newX = threat.x + (dx / distance) * speed;
                    const newY = threat.y + (dy / distance) * speed;

                    // Reset if too close to center
                    if (distance < 5) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 40 + Math.random() * 10;
                        return {
                            ...threat,
                            x: centerX + Math.cos(angle) * radius,
                            y: centerY + Math.sin(angle) * radius,
                            blocked: false,
                            opacity: 0.5 + Math.random() * 0.3,
                        };
                    }

                    return { ...threat, x: newX, y: newY };
                })
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const getThreatIcon = (iconType: string, isDangerous: boolean, blocked: boolean) => {
        const className = `w-6 h-6 ${blocked ? 'text-gray-600' : isDangerous ? 'text-cyber-red' : 'text-cyber-blue'}`;

        switch (iconType) {
            case 'mail':
                return <Mail className={className} />;
            case 'message':
                return <MessageSquare className={className} />;
            case 'alert':
                return <AlertTriangle className={className} />;
            default:
                return <Mail className={className} />;
        }
    };

    return (
        <div className="relative w-full h-[400px] bg-background/30 rounded-lg border border-border overflow-hidden">
            {/* Animated threats */}
            {threats.map(threat => (
                <div
                    key={threat.id}
                    className="absolute transition-all duration-100 ease-linear"
                    style={{
                        left: `${threat.x}%`,
                        top: `${threat.y}%`,
                        opacity: threat.opacity,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className={`relative ${threat.blocked ? 'animate-pulse' : ''}`}>
                        {getThreatIcon(threat.icon, threat.isDangerous, threat.blocked)}
                        {threat.isDangerous && !threat.blocked && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-red rounded-full animate-pulse shadow-[0_0_6px_rgba(255,0,65,0.8)]" />
                        )}
                        {threat.blocked && (
                            <>
                                {/* Blocked indicator - crossed out */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 border-2 border-cyber-green rounded-full opacity-60 animate-ping" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-0.5 bg-cyber-green rotate-45" />
                                    <div className="absolute w-8 h-0.5 bg-cyber-green -rotate-45" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {/* Central protection - Child with shield */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* Protective shield glow - multiple layers */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-cyber-green/5 animate-pulse" />
                    <div className="absolute w-40 h-40 rounded-full bg-cyber-green/10 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute w-32 h-32 rounded-full bg-cyber-green/20 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>

                {/* Shield icon with enhanced glow */}
                <div className="relative z-10 mb-3">
                    <div className="absolute inset-0 blur-xl bg-cyber-green/30 rounded-full" />
                    <Shield
                        className="relative w-24 h-24 text-cyber-green drop-shadow-[0_0_15px_rgba(0,255,65,0.7)]"
                        strokeWidth={1.5}
                        fill="rgba(0,255,65,0.1)"
                    />
                </div>

                {/* Protected figure representation - improved */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Head with subtle glow */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 mb-1 shadow-lg" />
                    {/* Body with better proportions */}
                    <div className="w-14 h-20 rounded-lg bg-gradient-to-b from-gray-300 to-gray-400 shadow-lg relative">
                        {/* Arms */}
                        <div className="absolute -left-3 top-2 w-3 h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full" />
                        <div className="absolute -right-3 top-2 w-3 h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full" />
                    </div>
                    {/* Legs */}
                    <div className="flex gap-2 mt-1">
                        <div className="w-4 h-14 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg" />
                        <div className="w-4 h-14 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg" />
                    </div>
                </div>

                {/* Shield text with glow */}
                <div className="relative z-10 mt-4 text-center">
                    <p className="text-sm font-bold text-cyber-green drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">QadamSafe</p>
                    <p className="text-xs text-gray-300">Защита активна</p>
                </div>
            </div>

            {/* Corner threat indicators with better styling */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-cyber-red bg-cyber-red/10 px-3 py-1.5 rounded-full border border-cyber-red/30">
                <div className="w-2 h-2 bg-cyber-red rounded-full animate-pulse" />
                <span className="font-medium">Угрозы обнаружены</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-cyber-green bg-cyber-green/10 px-3 py-1.5 rounded-full border border-cyber-green/30">
                <Shield className="w-3 h-3" />
                <span className="font-medium">Защищено</span>
            </div>
        </div>
    );
};
