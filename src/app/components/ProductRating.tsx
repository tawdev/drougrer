'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { api } from '../lib/api';

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
        let isMounted = true;

        const loadStats = async () => {
            try {
                // Quick initial load from localStorage
                const saved = localStorage.getItem(`reviews_${productId}`);
                if (saved) {
                    const reviews = JSON.parse(saved);
                    if (Array.isArray(reviews) && reviews.length > 0) {
                        const avg = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length;
                        if (isMounted) setStats({ avg, count: reviews.length });
                    }
                }

                // Fetch real data from API
                const realReviews = await api.getProductReviews(productId);
                if (isMounted) {
                    if (Array.isArray(realReviews) && realReviews.length > 0) {
                        const avg = realReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / realReviews.length;
                        setStats({ avg, count: realReviews.length });
                        // Update local cache
                        localStorage.setItem(`reviews_${productId}`, JSON.stringify(realReviews));
                    } else {
                        setStats({ avg: 0, count: 0 });
                    }
                }
            } catch (err) {
                console.error(`Error loading review stats for product ${productId}:`, err);
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
            isMounted = false;
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
