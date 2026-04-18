'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, type BlogPost, type Tip, type TagCount } from '../lib/api';
import { Check, AlertCircle } from 'lucide-react';

interface BlogListingSidebarProps {
    recentPosts?: BlogPost[];
    activeTag?: string | null;
    onTagClick?: (tag: string) => void;
    // New props for article details
    author?: {
        name: string;
        role: string;
        bio: string;
        avatar: string;
    };
    tags?: string[];
    toc?: { id: string; text: string }[];
    hideTip?: boolean;
    variant?: 'light' | 'dark';
}

export default function BlogListingSidebar({ 
    recentPosts = [], 
    activeTag = null, 
    onTagClick,
    author,
    tags: articleTags,
    toc,
    hideTip = false,
    variant = 'light'
}: BlogListingSidebarProps) {
    const [email, setEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [newsletterMessage, setNewsletterMessage] = useState('');

    const [tags, setTags] = useState<TagCount[]>([]);
    const [activeTip, setActiveTip] = useState<Tip | null>(null);

    useEffect(() => {
        // Load tags
        api.getPopularTags()
            .then(setTags)
            .catch(() => setTags([]));

        // Load active tip
        api.getActiveTip()
            .then(setActiveTip)
            .catch(() => setActiveTip(null));
    }, []);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setNewsletterStatus('loading');
        try {
            await api.subscribeNewsletter(email.trim());
            setNewsletterStatus('success');
            setNewsletterMessage('Merci ! Vous êtes maintenant abonné.');
            setEmail('');
            setTimeout(() => setNewsletterStatus('idle'), 4000);
        } catch (err: any) {
            setNewsletterStatus('error');
            setNewsletterMessage(
                err.message?.includes('already') 
                    ? 'Cet email est déjà abonné.' 
                    : 'Une erreur est survenue. Réessayez.'
            );
            setTimeout(() => setNewsletterStatus('idle'), 4000);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { month: 'long', day: '2-digit' }).toUpperCase();
    };

    return (
        <aside className="w-full lg:w-[360px] shrink-0 space-y-8 lg:sticky lg:top-28">
            {/* Table of Contents — Only for Articles */}
            {toc && toc.length > 0 && (
                <div className="bg-white rounded-[24px] p-8 blog-card-shadow border border-slate-200 transition-all hover:border-slate-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-full bg-[#BF1737]" />
                        <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">
                            Sommaire
                        </h4>
                    </div>
                    <nav className="space-y-1">
                        {toc.map((item, idx) => (
                            <a 
                                key={idx}
                                href={`#${item.id}`}
                                className="block py-2 text-[14px] font-bold text-slate-500 hover:text-[#BF1737] hover:translate-x-1 transition-all"
                            >
                                <span className="opacity-30 mr-2">0{idx + 1}.</span> {item.text}
                            </a>
                        ))}
                    </nav>
                </div>
            )}

            {/* Author Profile Card — Only for Articles */}
            {author && (
                <div className="bg-white rounded-[24px] p-8 blog-card-shadow border border-slate-200 transition-all hover:border-slate-300">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="size-24 rounded-full bg-slate-100 p-1.5 border border-slate-200">
                                <div className="size-full rounded-full bg-[#BF1737] flex items-center justify-center text-white text-3xl font-black uppercase">
                                    {author.name.charAt(0)}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#BF1737] shadow-sm">
                                <span className="material-symbols-outlined text-[16px] font-black">verified</span>
                            </div>
                        </div>
                        <h4 className="text-[18px] font-black text-slate-900 uppercase tracking-tight mb-1">{author.name}</h4>
                        <span className="text-[11px] font-black text-[#BF1737] uppercase tracking-[0.2em] mb-4">{author.role}</span>
                        <p className="text-[14px] font-medium text-slate-500 leading-relaxed">
                            {author.bio}
                        </p>
                    </div>
                </div>
            )}

            {/* Newsletter Pro Card — New Dual-Theme Design */}
            <div className={`rounded-[32px] overflow-hidden blog-card-shadow border transition-all hover:border-slate-300 group ${
                variant === 'dark' 
                ? 'bg-[#0D0D0D] border-white/5 p-10 pt-12 pb-12' 
                : 'bg-white border-slate-200'
            }`}>
                {/* Visual Header Block — Only for Light Variant */}
                {variant === 'light' && (
                    <div className="h-32 bg-gradient-to-br from-[#BF1737] to-[#8C1028] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-xl" />
                    </div>
                )}

                <div className={`${variant === 'light' ? 'p-8 pt-10' : ''} text-center`}>
                    <h4 className={`text-[22px] font-black uppercase tracking-tight mb-4 font-montserrat ${
                        variant === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                        Newsletter Pro
                    </h4>
                    <p className={`text-[14px] font-medium leading-relaxed mb-10 ${
                        variant === 'dark' ? 'text-white/60' : 'text-slate-500'
                    }`}>
                        {variant === 'dark' ? 'Recevez nos meilleurs conseils chaque semaine.' : 'Recevez nos meilleurs articles chaque semaine.'} <br />
                        <span className={`${variant === 'dark' ? 'text-white/40' : 'text-slate-400 font-bold'}`}>
                            {variant === 'dark' ? '+12 000 abonnés.' : 'Rejoignez 12 000+ professionnels.'}
                        </span>
                    </p>
                    
                    <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                        <div className="relative group/input">
                            <input
                                className={`w-full rounded-2xl border px-6 py-4.5 text-[15px] font-bold outline-none transition-all text-center ${
                                    variant === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:bg-white/10 focus:ring-4 focus:ring-[#BF1737]/20 focus:border-[#BF1737]/40'
                                    : 'bg-[#F8FAFC] border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-[#BF1737]/10 focus:border-[#BF1737]/20'
                                }`}
                                placeholder={variant === 'dark' ? 'votre@email.com' : 'Votre email'}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={newsletterStatus === 'loading'}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={newsletterStatus === 'loading'}
                            className="w-full rounded-2xl bg-[#BF1737] py-4.5 text-[13px] font-black text-white uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#D41C3D] hover:scale-[1.02] shadow-xl shadow-[#BF1737]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {newsletterStatus === 'loading' ? (
                                <div className="h-5 w-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                variant === 'dark' ? "S'ABONNER" : "S'ABONNER GRATUITEMENT"
                            )}
                        </button>
                    </form>
                    
                    {/* Status messages adjusted for each theme */}
                    {newsletterStatus === 'success' && (
                        <div className={`mt-6 flex items-center gap-3 rounded-2xl px-5 py-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                            variant === 'dark'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        }`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${
                                variant === 'dark' ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-emerald-500 shadow-emerald-500/20'
                            }`}>
                                <Check size={16} strokeWidth={3} />
                            </div>
                            <span className="text-[12px] font-black text-left leading-tight">{newsletterMessage.toUpperCase()}</span>
                        </div>
                    )}
                    {newsletterStatus === 'error' && (
                        <div className={`mt-6 flex items-center gap-3 rounded-2xl px-5 py-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                            variant === 'dark'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            : 'text-rose-600 bg-rose-50 border-rose-100'
                        }`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${
                                variant === 'dark' ? 'bg-rose-500 shadow-rose-500/10' : 'bg-rose-500 shadow-rose-500/20'
                            }`}>
                                <AlertCircle size={16} strokeWidth={3} />
                            </div>
                            <span className="text-[12px] font-black text-left leading-tight">{newsletterMessage.toUpperCase()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags section — Using article specific tags if available, otherwise popular ones */}
            {(articleTags || tags.length > 0) && (
                <div className="bg-white rounded-[24px] p-8 blog-card-shadow border border-slate-200 transition-all hover:border-slate-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-full bg-[#BF1737]" />
                        <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">
                            {articleTags ? 'Mots-clés Article' : 'Tags Populaires'}
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {(() => {
                            const clean = (t: string) => t.replace(/[\[\]"]+/g, '').trim();
                            const allTags = (articleTags || tags.map(t => t.tag))
                                .map(clean)
                                .filter(t => t.length > 0);
                            // Fixed slice to keep sidebar height balanced
                            const visibleTags = allTags.slice(0, 12);
                            
                            return (
                                <>
                                    {visibleTags.map((t, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onTagClick?.(t)}
                                            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                                                activeTag === t 
                                                    ? 'bg-[#BF1737] text-white border-[#BF1737] shadow-lg shadow-[#BF1737]/15' 
                                                    : 'bg-slate-50 text-slate-600 hover:bg-[#BF1737]/5 hover:text-[#BF1737] border-slate-200 hover:border-[#BF1737]/15'
                                            }`}
                                        >
                                            #{t}
                                        </button>
                                    ))}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
                <div className="bg-white rounded-[24px] p-8 blog-card-shadow border border-slate-200 transition-all hover:border-slate-300">
                    <h4 className="text-[15px] font-black text-slate-700 uppercase tracking-wider mb-6">
                        Recent Posts
                    </h4>
                    <div className="space-y-5">
                        {recentPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/post/${post.slug}`}
                                className="flex items-start gap-4 group"
                            >
                                <div className="w-[72px] h-[72px] rounded-md overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl.startsWith('http') ? post.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                            <span className="text-slate-300 text-[18px] font-black">{post.title.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#BF1737] transition-colors">
                                        {post.title}
                                    </h5>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5 block">
                                        {formatDate(post.publishDate || post.createdAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Astuce du Moment — Dynamic — Hidden on detail pages if hideTip is true */}
            {activeTip && !hideTip && (
                <div className="bg-[#0D0D0D] rounded-[32px] p-9 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#BF1737] opacity-[0.06] rounded-full translate-x-[20%] -translate-y-[20%] blur-3xl group-hover:opacity-[0.12] transition-opacity" />
                    
                    <div className="relative z-10">
                        <span className="text-[13px] font-black uppercase tracking-[0.3em] text-[#BF1737] mb-6 block drop-shadow-[0_0_10px_rgba(191,23,55,0.3)]">
                            Astuce du Moment
                        </span>
                        <p className="text-[17px] font-medium text-white/90 leading-relaxed mb-8">
                            {activeTip.content}
                        </p>
                        <div className="border-t border-white/10 pt-6">
                            <p className="text-[14px] font-medium text-white/40">
                                Par <span className="text-[#BF1737] font-bold">{activeTip.authorName},</span>{' '}
                                <span className="text-white/30">{activeTip.authorRole}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
