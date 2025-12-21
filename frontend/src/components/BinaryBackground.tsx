import React, { useEffect, useRef } from 'react';

interface BinaryBackgroundProps {
    color?: 'green' | 'red' | 'default';
}

export const BinaryBackground: React.FC<BinaryBackgroundProps> = ({ color = 'default' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to cover entire document
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            // Use document height instead of window height to cover scrollable content
            canvas.height = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                window.innerHeight
            );
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Re-calculate on scroll to handle dynamic content
        window.addEventListener('scroll', resizeCanvas);

        // Binary rain configuration
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(0);
        const chars = '01';

        // Color configuration based on prop
        const getColors = () => {
            if (color === 'green') {
                return {
                    background: 'rgba(0, 50, 20, 0.05)', // Dark green tint
                    text: '#00ff41', // Cyber green
                    rgb: '0, 255, 65' // RGB for cyber green
                };
            } else if (color === 'red') {
                return {
                    background: 'rgba(50, 0, 0, 0.05)', // Dark red tint
                    text: '#ff0041', // Cyber red
                    rgb: '255, 0, 65' // RGB for cyber red
                };
            }
            return {
                background: 'rgba(10, 10, 15, 0.03)', // Default dark
                text: '#00ff41', // Cyber green
                rgb: '0, 255, 65' // RGB for cyber green
            };
        };

        // Animation function
        const draw = () => {
            const colors = getColors();

            // Semi-transparent background to create fade effect
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set text style
            ctx.fillStyle = colors.text;
            ctx.font = `${fontSize}px monospace`;

            // Draw characters
            for (let i = 0; i < drops.length; i++) {
                // Random binary character
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Vary opacity for depth effect (increased brightness)
                const opacity = Math.random() * 0.5 + 0.5;
                ctx.fillStyle = `rgba(${colors.rgb}, ${opacity})`;
                ctx.fillText(char, x, y);

                // Reset drop to top randomly
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Move drop down
                drops[i]++;
            }
        };

        // Animation loop
        const interval = setInterval(draw, 50);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', resizeCanvas);
        };
    }, [color]); // Re-run effect when color changes

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none opacity-40"
            style={{ zIndex: 0 }}
        />
    );
};
