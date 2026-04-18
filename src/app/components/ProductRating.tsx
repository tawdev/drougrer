'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface ProductRatingProps {
    productId: number;
    className?: string;
    starSize?: number;
    textSize?: string;
}

export default function ProductRating({ 
    productId, 
    className = "", 
    starSize = 12,
    textSize = "text-[10px]"
}: ProductRatingProps) {
    const [stats, setStats] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        const loadStats = () => {
            try {
                const saved = localStorage.getItem(`reviews_${productId}`);
                if (saved) {
                    const reviews = JSON.parse(saved);
                    if (Array.isArray(reviews) && reviews.length > 0) {
                        const avg = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length;
                        setStats({ avg, count: reviews.length });
                        return;
                    }
                }
                setStats({ avg: 0, count: 0 });
            } catch (err) {
                console.error('Error loading review stats:', err);
                setStats({ avg: 0, count: 0 });
            }
        };

        loadStats();

        // Listen for local custom events if reviews are added in the same window
        const handleReviewUpdate = () => loadStats();
        window.addEventListener('reviewsUpdated', handleReviewUpdate);
        
        // Listen for storage changes in other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === `reviews_${productId}`) loadStats();
        });

        return () => {
            window.removeEventListener('reviewsUpdated', handleReviewUpdate);
            window.removeEventListener('storage', loadStats);
        };
    }, [productId]);

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        size={starSize} 
                        className={`${s <= Math.round(stats.avg) ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-slate-100 text-slate-100'}`} 
                        strokeWidth={s <= Math.round(stats.avg) ? 0 : 1.5}
                    />
                ))}
            </div>
            <span className={`${textSize} font-bold text-slate-400 uppercase tracking-wider`}>
                {stats.count} Avis
            </span>
        </div>
    );
}
