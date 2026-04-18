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
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
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
        >
            <Link
                href={`/blog/post/${post.slug}`}
                className="group bg-white rounded-[32px] blog-card-shadow border border-slate-200 flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#BF1737]/5 hover:-translate-y-2 hover:border-[#BF1737]/10"
            >
            {/* Image Section */}
            <div className="aspect-[1.5] w-full relative overflow-hidden">
                <img
                    src={post.imageUrl || '/placeholder-product.png'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={priority ? 'eager' : 'lazy'}
                />

                {/* Floating Badges — Unified Container to Prevent Overlap */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-3 flex-wrap">
                    {/* Category Badge */}
                    <span className="px-3.5 py-1.5 rounded-full bg-[#BF1737] text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-xl whitespace-nowrap">
                        {post.category || 'GUIDE'}
                    </span>

                    {/* Read Time Badge — Dynamic */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap">
                        <Clock size={12} className="text-[#BF1737]" strokeWidth={3} />
                        {readTime} MIN
                    </div>
                </div>

                {/* Gradient Overlay (Bottom to Top) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Section */}
            <div className="p-7 flex flex-col flex-1">
                {/* HashTags Row — New */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-100/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="text-[20px] font-black text-slate-900 leading-[1.3] mb-3 uppercase tracking-tight group-hover:text-[#BF1737] transition-colors line-clamp-2 italic">
                    {post.title}
                </h3>
                <p className="text-[14px] font-medium text-slate-500 leading-relaxed line-clamp-3 mb-8 overflow-hidden">
                    {post.excerpt || "Explorez les dernières actualités et conseils d'experts sur l'outillage professionnel."}
                </p>

                {/* Footer Section */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#BF1737]/10 flex items-center justify-center text-[#BF1737] font-black text-xs border border-[#BF1737]/20 uppercase">
                            {(post.author || 'A').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-900 uppercase">{post.author || 'Admin'}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(post.createdAt).toLocaleDateString('fr-MA', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#BF1737] group-hover:text-white transition-all transform group-hover:rotate-[-45deg] shadow-sm">
                        <ArrowRight size={18} strokeWidth={3} />
                    </div>
                </div>
            </div>
        </Link>
        </motion.div>
    );
}
