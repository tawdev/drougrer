'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { type BlogPost } from '../lib/api';
import { calculateReadTime } from '../lib/utils';
import { motion } from 'framer-motion';

interface BlogCardProps {
    post: BlogPost;
    priority?: boolean;
    layout?: 'grid' | 'list';
}

export default function BlogCard({ post, priority = false, layout = 'grid' }: BlogCardProps) {
    const readTime = calculateReadTime(post.content);

    return (
        <motion.div
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 }
            }}
            className="w-full h-full"
        >
            <Link
                href={`/blog/post/${post.slug}`}
                className={`group bg-white rounded-[40px] blog-card-shadow border border-slate-200 flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#BF1737]/5 hover:-translate-y-2 hover:border-[#BF1737]/10 h-full ${
                    layout === 'list' ? 'md:flex-row min-h-[340px]' : ''
                }`}
            >
            {/* Image Section */}
            <div className={`relative overflow-hidden shrink-0 ${
                layout === 'list' ? 'w-full md:w-[420px] aspect-[1.6] md:aspect-auto' : 'aspect-[1.5] w-full'
            }`}>
                <img
                    src={post.imageUrl || '/placeholder-product.png'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={priority ? 'eager' : 'lazy'}
                />

                {/* Floating Badges */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between gap-3 flex-wrap">
                    <span className="px-4 py-2 rounded-full bg-[#BF1737] text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-xl whitespace-nowrap">
                        {post.category || 'GUIDE'}
                    </span>

                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap">
                        <Clock size={12} className="text-[#BF1737]" strokeWidth={3} />
                        {readTime} MIN
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Section */}
            <div className={`flex flex-col flex-1 ${
                layout === 'list' ? 'p-8 md:p-12 justify-center' : 'p-8'
            }`}>
                {/* HashTags Row */}
                <div className={`flex flex-wrap gap-2 mb-5 ${layout === 'grid' ? 'min-h-[32px]' : ''}`}>
                    {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-100/50">
                            #{tag}
                        </span>
                    ))}
                </div>

                <h3 className={`font-black text-slate-900 leading-[1.3] uppercase tracking-tight group-hover:text-[#BF1737] transition-colors line-clamp-2 italic ${
                    layout === 'list' ? 'text-[24px] md:text-[32px] mb-4' : 'text-[20px] h-[52px] mb-3'
                }`}>
                    {post.title}
                </h3>
                
                <p className={`font-medium text-slate-500 leading-relaxed line-clamp-3 overflow-hidden ${
                    layout === 'list' ? 'text-[16px] mb-8 max-w-2xl' : 'text-[14px] h-[69px] mb-8'
                }`}>
                    {post.excerpt || "Explorez les dernières actualités et conseils d'experts sur l'outillage professionnel."}
                </p>

                {/* Footer Section */}
                <div className={`mt-auto pt-8 border-t border-slate-50 flex items-center justify-between ${
                    layout === 'list' ? 'w-full' : ''
                }`}>
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-[#BF1737]/10 flex items-center justify-center text-[#BF1737] font-black text-sm border border-[#BF1737]/20 uppercase">
                            {(post.author || 'A').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{post.author || 'Admin'}</span>
                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 px-2 py-0.5 rounded-md w-fit -ml-2">
                                {new Date(post.createdAt).toLocaleDateString('fr-MA', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#BF1737] group-hover:text-white transition-all transform group-hover:rotate-[-45deg] shadow-sm border border-slate-100/50">
                        <ArrowRight size={20} strokeWidth={3} />
                    </div>
                </div>
            </div>

        </Link>
        </motion.div>
    );
}
