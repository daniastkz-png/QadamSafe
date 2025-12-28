import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}) => {
    const baseClasses = 'bg-muted rounded';
    
    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-[shimmer_2s_infinite]',
        none: '',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
            aria-label="Loading"
        />
    );
};

// Pre-built skeleton components
export const SkeletonCard: React.FC = () => (
    <div className="cyber-card space-y-4">
        <Skeleton variant="rectangular" height={200} />
        <div className="space-y-2">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
        </div>
    </div>
);

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? '60%' : '100%'}
            />
        ))}
    </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                </div>
            </div>
        ))}
    </div>
);

