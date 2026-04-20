'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, type BlogPost } from '../../../lib/api';
import { calculateReadTime } from '../../../lib/utils';
import { Share2, Facebook, Twitter, Instagram, ChevronRight, User, ArrowRight, ArrowLeft, Clock, Eye } from 'lucide-react';
import BlogTicker from '../../../components/BlogTicker';
import BlogSidebar from '../../../components/BlogSidebar';
import BlogSocialShare from '../../../components/BlogSocialShare';
import BlogCard from '../../../components/BlogCard';
import { motion } from 'framer-motion';

export default function BlogPostDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const unwrappedParams = use(params);
    const slug = unwrappedParams.slug;

    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        if (!slug) return;
        try {
            setLoading(true);
            const data = await api.getPostBySlug(slug);
            setPost(data);

            const allPosts = await api.getPosts(1, 4);
            setRelatedPosts(allPosts.data.filter(p => p.slug !== slug).slice(0, 3));
        } catch (err) {
            console.error('Failed to load blog post details', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const [toc, setToc] = useState<{ id: string; text: string }[]>([]);

    useEffect(() => {
        if (post?.content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(post.content, 'text/html');
            const headings = doc.querySelectorAll('h2, h3');
            const tocItems = Array.from(headings).map((h, i) => {
                const id = h.id || `section-${i}`;
                if (!h.id) h.id = id;
                return { id, text: h.textContent || '' };
            });
            setToc(tocItems);
        }
    }, [post]);

    if (loading) {
        return (
        <div className="bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-[4px] border-[#BF1737] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/40 text-[13px] font-black uppercase tracking-[0.3em] animate-pulse">Chargement de l'article...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                    <User className="text-slate-200" size={48} />
                </div>
                <h1 className="text-[32px] font-black text-slate-900 mb-4 uppercase tracking-tight">Article Introuvable</h1>
                <p className="text-slate-400 mb-10 max-w-sm leading-relaxed font-medium">L'article que vous recherchez a peut-être été déplacé ou supprimé.</p>
                <Link href="/blog" className="rounded-2xl bg-[#BF1737] px-10 py-4.5 text-[14px] font-black text-white transition-all shadow-xl shadow-[#BF1737]/20 hover:bg-[#A3142F] hover:-translate-y-1">
                    RETOUR AU BLOG
                </Link>
            </div>
        );
    }

    // Author data from the post or fallback
    const postAuthor = {
        name: post.author || "Admin",
        role: "Expert Outillage",
        bio: `${post.author || "Notre équipe"} est spécialisé dans le domaine de l'outillage professionnel et partage son expertise pour conseiller artisans et bricoleurs passionnés.`,
        avatar: "/author-avatar.png"
    };

    const articleTags = post.tags || ["Direct", "Nouveau", "Tendance"];
    const readTime = calculateReadTime(post.content);

    const handleTagClick = (tag: string) => {
        // Navigate to the blog list page with the tag filter
        window.location.href = `/blog?tag=${encodeURIComponent(tag)}`;
    };

    return (
        <div className="flex-1 flex flex-col bg-[#F9FAFC] font-sans text-slate-900 selection:bg-[#BF1737]/20">
            {/* Dark Hero Section */}
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative min-h-[85vh] flex flex-col bg-[#0D0D0D] overflow-hidden pt-12"
            >
                <motion.div 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1.05, opacity: 0.4 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 z-0"
                >
                    <img
                        src={post.imageUrl || '/blog-hero-bg.png'}
                        className="w-full h-full object-cover mix-blend-luminosity grayscale"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#BF1737]/20 to-transparent mix-blend-multiply" />
                </motion.div>

                <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex-1 flex flex-col pt-12 pb-24">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <Link href="/blog" className="group flex items-center gap-3 text-white/50 hover:text-white transition-all w-fit mb-12">
                          <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#BF1737] group-hover:bg-[#BF1737] transition-all">
                              <ArrowLeft size={16} />
                          </div>
                          <span className="text-[12px] font-black uppercase tracking-[0.2em]">Retour au Blog</span>
                      </Link>
                    </motion.div>

                    <div className="max-w-4xl space-y-8 mt-auto">
                        <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="flex flex-wrap items-center gap-4"
                        >
                            <span className="px-5 py-2 rounded-full bg-[#BF1737] text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                                {post.category || 'CONSEILS PRO'}
                            </span>
                            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-white/60 uppercase tracking-widest backdrop-blur-md">
                                <Clock size={14} className="text-[#BF1737]" strokeWidth={3} />
                                {readTime} MIN DE LECTURE
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-white/60 uppercase tracking-widest backdrop-blur-md">
                                <Eye size={14} className="text-[#BF1737]" strokeWidth={3} />
                                3.2K VUES
                            </div>
                        </motion.div>

                        <motion.h1 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tight italic"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.p 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="text-xl md:text-2xl font-medium text-white/50 leading-relaxed max-w-3xl font-display"
                        >
                            {post.excerpt || "Découvrez notre analyse complète et nos recommandations d'experts pour vous aider à choisir les meilleurs équipements."}
                        </motion.p>

                        <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.7 }}
                          className="pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-white/10"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-full bg-[#BF1737] text-white flex items-center justify-center text-xl font-black border-2 border-white/10 uppercase">
                                    {(post.author || 'A').charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-[16px] uppercase tracking-wide">{post.author || 'Admin'}</span>
                                    <span className="text-white/40 text-[12px] font-bold uppercase tracking-widest">
                                        Expert Outillage • {new Date(post.publishDate || post.createdAt).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <button className="flex items-center gap-4 px-10 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-[#BF1737] hover:border-transparent group">
                                Partager
                                <Share2 size={16} className="transition-transform group-hover:rotate-12" strokeWidth={3} />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <BlogTicker />

            <main className="mx-auto max-w-[1400px] px-6 lg:px-12 py-20 lg:py-32">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col lg:flex-row gap-20"
                >
                    <div className="flex-1">
                        {/* Article Lead Section */}
                        <div className="mb-12">
                            <div className="border-l-4 border-[#BF1737] pl-8 py-2">
                                <p className="text-[22px] md:text-[26px] font-black text-slate-800 leading-tight italic uppercase tracking-tight">
                                    {post.excerpt || "Découvrez notre analyse complète et nos recommandations d'experts."}
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-100 py-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-[#BF1737]" />
                                    {readTime} MIN DE LECTURE
                                </div>
                                <div className="h-4 w-px bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-[#BF1737]" />
                                    PAR {post.author || 'ADMIN'}
                                </div>
                                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                                <div className="hidden sm:block">
                                    PUBLIÉ LE {new Date(post.publishDate || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <article className="blog-content max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </article>

                        <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-center">
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="h-px w-20 bg-slate-100" />
                                <span className="text-[12px] font-black uppercase tracking-[0.4em]">Fin de l'article</span>
                                <div className="h-px w-20 bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    <aside className="lg:w-[400px] shrink-0">
                        <div className="sticky top-32 self-start space-y-8">
                            <BlogSidebar 
                                author={postAuthor} 
                                tags={articleTags} 
                                toc={toc} 
                                onTagClick={handleTagClick} 
                                hideTip={true} 
                                variant="dark"
                            />
                        </div>
                    </aside>
                </motion.div>
            </main>

            <BlogSocialShare />

            <section className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-40">
                <div className="flex items-center justify-between mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-[2.5px] bg-[#BF1737]" />
                            <span className="text-[13px] font-black uppercase tracking-[0.3em] text-[#BF1737]">VOUS POURRIEZ AIMER</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tight italic">
                            ARTICLES SIMILAIRES
                        </h2>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-4 px-10 py-4.5 rounded-2xl border border-slate-200 text-slate-600 font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50">
                        VOIR TOUT
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {relatedPosts.map((rp) => (
                        <BlogCard key={rp.id} post={rp} />
                    ))}
                </div>
            </section>
        </div>
    );
}
