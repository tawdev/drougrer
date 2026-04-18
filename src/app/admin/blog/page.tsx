'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api, type BlogPost, type Tip, type NewsletterSubscriber, type TagCount } from '../../lib/api';
import { Mail, Quote, Tag, FileText, Check, AlertCircle, Plus, Eye, Trash2, Edit } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />;
}


export default function AdminBlogPage() {
    const { showToast, showConfirm } = useNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Tabs & New Data
    const [activeTab, setActiveTab] = useState<'articles' | 'tips' | 'newsletter' | 'tags'>('articles');
    const [tips, setTips] = useState<Tip[]>([]);
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [tagStats, setTagStats] = useState<TagCount[]>([]);

    // Editor Refs & State
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const editorImageInputRef = useRef<HTMLInputElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Tip Modal State
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [editingTip, setEditingTip] = useState<Tip | null>(null);
    const [tipForm, setTipForm] = useState({
        content: '',
        authorName: '',
        authorRole: 'Expert Outillage',
        isActive: true
    });

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        category: '',
        excerpt: '',
        imageUrl: '',
        status: 'Draft',
        author: 'Admin',
        tags: [] as string[],
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        publishDate: new Date().toISOString().split('T')[0]
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setForm(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const insertTag = (tagName: string, placeholder: string = '') => {
        if (!contentRef.current) return;

        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        let before = text.substring(0, start);
        let after = text.substring(end);
        let tagStart = `<${tagName}>`;
        let tagEnd = `</${tagName}>`;
        let content = selection || placeholder;

        if (tagName === 'a') {
            const url = prompt('Enter URL:', 'https://');
            if (url === null) return;
            tagStart = `<a href="${url}" class="text-blue-600 hover:underline" target="_blank">`;
        } else if (tagName === 'img') {
            triggerEditorImageUpload();
            return;
        } else if (tagName === 'ul') {
            tagStart = '<ul class="list-disc ml-6 my-4 space-y-2">\n  <li>';
            tagEnd = '</li>\n</ul>';
        }

        const newContent = before + tagStart + content + tagEnd + after;
        setForm(prev => ({ ...prev, content: newContent }));

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newPos = start + tagStart.length + content.length + tagEnd.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const triggerEditorImageUpload = () => {
        editorImageInputRef.current?.click();
    };

    const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !contentRef.current) return;

        try {
            setIsUploading(true);
            const result = await api.uploadImage(file);

            const textarea = contentRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;

            let before = text.substring(0, start);
            let after = text.substring(end);
            const imgTag = `<img src="${result.url}" alt="" class="w-full rounded-2xl my-6 shadow-lg" />`;

            const newContent = before + imgTag + after;

            // Use functional update to ensure we have late state
            setForm(prev => ({ ...prev, content: newContent }));

            // Restore focus
            setTimeout(() => {
                textarea.focus();
                const newPos = start + imgTag.length;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        } catch (err) {
            showToast('Échec du téléchargement de l\'image', 'error');
        } finally {
            setIsUploading(false);
            // Reset input
            if (editorImageInputRef.current) editorImageInputRef.current.value = '';
        }
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            if (activeTab === 'articles') {
                const [postsRes, catsRes] = await Promise.all([
                    api.getPosts(page, 5, searchQuery),
                    api.getCategories()
                ]);
                setPosts(postsRes.data);
                setTotal(postsRes.total);
                setTotalPages(postsRes.totalPages);
                setCategories(catsRes);
            } else if (activeTab === 'tips') {
                const tipsData = await api.getTips();
                setTips(tipsData);
            } else if (activeTab === 'newsletter') {
                const subData = await api.getNewsletterSubscribers();
                setSubscribers(subData);
            } else if (activeTab === 'tags') {
                const tagsData = await api.getPopularTags();
                setTagStats(tagsData);
            }
        } catch (err) {
            showToast('Échec du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, activeTab]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const result = await api.uploadImage(file);
            setForm(prev => ({ ...prev, imageUrl: result.url }));
        } catch (err) {
            showToast('Image upload failed', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // Auto-populate SEO fields
            const finalForm = {
                ...form,
                metaTitle: form.title,
                metaDescription: form.excerpt,
                metaKeywords: '' // Not needed
            };

            if (editingPost) {
                await api.updatePost(editingPost.id, finalForm);
                showToast('Article mis à jour avec succès !', 'success');
            } else {
                await api.createPost(finalForm);
                showToast('Article créé avec succès !', 'success');
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save post';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            slug: post.slug || '',
            content: post.content,
            category: post.category || '',
            excerpt: post.excerpt || '',
            imageUrl: post.imageUrl || '',
            status: post.status,
            author: post.author,
            tags: post.tags || [],
            metaTitle: post.metaTitle || '',
            metaDescription: post.metaDescription || '',
            metaKeywords: post.metaKeywords || '',
            publishDate: post.publishDate ? post.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (postId: number) => {
        try {
            setIsDeleting(true);
            await api.deletePost(postId);
            showToast('Article supprimé avec succès !', 'success');
            loadData();
        } catch (err) {
            showToast('Échec de la suppression de l\'article', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // New Handlers for Tips & Newsletter
    const handleTipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingTip) {
                await api.updateTip(editingTip.id, tipForm);
                showToast('Astuce mise à jour !', 'success');
            } else {
                await api.createTip(tipForm);
                showToast('Astuce créée !', 'success');
            }
            setIsTipModalOpen(false);
            loadData();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save tip';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubscriber = async (id: number) => {
        showConfirm({
            title: 'Supprimer l\'abonné',
            message: 'Êtes-vous sûr de vouloir supprimer cet abonné ?',
            confirmText: 'Supprimer',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteSubscriber(id);
                    showToast('Abonné supprimé', 'success');
                    loadData();
                } catch (err: any) {
                    const errorMessage = err.response?.data?.message || err.message || 'Failed to remove subscriber';
                    showToast(errorMessage, 'error');
                }
            }
        });
    };

    const handleToggleTipActive = async (tip: Tip) => {
        try {
            await api.updateTip(tip.id, { isActive: !tip.isActive });
            showToast('Statut de l\'astuce mis à jour', 'success');
            loadData();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update status';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Blog Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Create and manage your articles, news, and updates.</p>
                    </div>
                    {activeTab === 'articles' && (
                        <button
                            onClick={() => {
                                setEditingPost(null);
                                setForm({
                                    title: '',
                                    slug: '',
                                    content: '',
                                    category: '',
                                    excerpt: '',
                                    imageUrl: '',
                                    status: 'Draft',
                                    author: 'Admin',
                                    tags: [],
                                    metaTitle: '',
                                    metaDescription: '',
                                    metaKeywords: '',
                                    publishDate: new Date().toISOString().split('T')[0]
                                });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-primary/10 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Write New Post
                        </button>
                    )}
                    {activeTab === 'tips' && (
                        <button
                            onClick={() => {
                                setEditingTip(null);
                                setTipForm({ content: '', authorName: '', authorRole: 'Expert Outillage', isActive: true });
                                setIsTipModalOpen(true);
                            }}
                            className="bg-[#14532D] hover:bg-[#166534] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-green-900/10 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            New Expert Tip
                        </button>
                    )}
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
                    {[
                        { id: 'articles', label: 'Articles', icon: <FileText size={18} /> },
                        { id: 'tips', label: 'Astuces Pro', icon: <Quote size={18} /> },
                        { id: 'newsletter', label: 'Newsletter', icon: <Mail size={18} /> },
                        { id: 'tags', label: 'Tags Stats', icon: <Tag size={18} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'articles' && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                    placeholder="Search by title or content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                            <th className="px-8 py-5">Article</th>
                                            <th className="px-8 py-5">Category</th>
                                            <th className="px-8 py-5">Author</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {loading && posts.length === 0 ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-8 py-6"><div className="flex items-center gap-4"><Skeleton className="size-12 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-20" /></div></div></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></td>
                                                </tr>
                                            ))
                                        ) : posts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">
                                                    <span className="material-symbols-outlined text-5xl opacity-20">article</span>
                                                    <p className="font-semibold mt-2">No blog posts yet.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            posts.map((post) => (
                                                <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                                {post.imageUrl ? <img src={post.imageUrl} className="size-full object-cover" /> : <div className="size-full flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">image</span></div>}
                                                            </div>
                                                            <div className="max-w-[300px]">
                                                                <p className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1" title={post.title}>{post.title}</p>
                                                                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic">/blog/{post.slug}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[11px] font-bold uppercase tracking-tight">
                                                            {post.category || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">A</div>
                                                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{post.author}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-2.5 py-1 ${post.status === 'Published' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} rounded-full text-[10px] font-bold uppercase tracking-tight`}>
                                                            {post.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEdit(post)} className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"><Edit size={18} /></button>
                                                            <button onClick={() => showConfirm({
                                                                title: 'Supprimer l\'article',
                                                                message: 'Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.',
                                                                confirmText: 'Supprimer',
                                                                variant: 'danger',
                                                                onConfirm: () => handleDelete(post.id)
                                                            })} className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-8 py-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[13px] font-medium text-slate-500">
                                    Showing {(page - 1) * 5 + 1}–{Math.min(page * 5, total)} of {total} posts
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Prev</button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Next</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'tips' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Contenu de l'astuce</th>
                                        <th className="px-8 py-5">Auteur</th>
                                        <th className="px-8 py-5">Statut</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-full" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-6 w-16" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : tips.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">Aucune astuce enregistrée.</td>
                                        </tr>
                                    ) : (
                                        tips.map((tip) => (
                                            <tr key={tip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2 italic">"{tip.content}"</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">{tip.authorName}</span>
                                                        <span className="text-[12px] text-slate-500">{tip.authorRole}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button
                                                        onClick={() => handleToggleTipActive(tip)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tip.isActive
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-200/50'
                                                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                            }`}
                                                    >
                                                        {tip.isActive ? 'Active' : 'Désactivée'}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTip(tip);
                                                                setTipForm({ content: tip.content, authorName: tip.authorName, authorRole: tip.authorRole, isActive: tip.isActive });
                                                                setIsTipModalOpen(true);
                                                            }}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => showConfirm({
                                                                title: 'Supprimer l\'astuce',
                                                                message: 'Voulez-vous vraiment supprimer cette astuce d\'expert ?',
                                                                confirmText: 'Supprimer',
                                                                variant: 'danger',
                                                                onConfirm: async () => {
                                                                    await api.deleteTip(tip.id);
                                                                    showToast('Astuce supprimée', 'success');
                                                                    loadData();
                                                                }
                                                            })}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Date d'inscription</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-64" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">Aucun abonné pour le moment.</td>
                                        </tr>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{sub.email}</td>
                                                <td className="px-8 py-6 text-slate-500 font-medium">{new Date(sub.subscribedAt).toLocaleString()}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSubscriber(sub.id)}
                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all font-bold"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'tags' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tagStats.length === 0 ? (
                            <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-20 text-center border border-slate-200">
                                <Tag size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500 font-medium">Aucun tag utilisé dans les articles publiés.</p>
                            </div>
                        ) : (
                            tagStats.map((tag) => (
                                <div key={tag.tag} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight">#{tag.tag}</p>
                                            <p className="text-[12px] font-medium text-slate-500">{tag.count} article{tag.count > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${Math.min(100, (tag.count / Math.max(...tagStats.map(t => t.count))) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight uppercase italic flex items-center gap-3">
                                    <span className="h-8 w-2 bg-primary rounded-full"></span>
                                    {editingPost ? 'Modifier l\'Article' : 'Nouvel Article'}
                                </h3>
                                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Structurez votre contenu pour un impact maximal et un meilleur référencement.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group">
                                <span className="material-symbols-outlined transition-transform group-hover:rotate-90">close</span>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-950/30">
                            <form onSubmit={handleSubmit} className="space-y-12 pb-10">
                                {/* Section 1: Basic Information */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">1. Informations de Base</h4>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Identifiez votre article avec un titre percutant et une URL optimisée.</p>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Titre de l'article</label>
                                            <input
                                                required
                                                value={form.title}
                                                onChange={e => handleTitleChange(e.target.value)}
                                                className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-[15px] font-bold transition-all placeholder:text-slate-300 shadow-sm"
                                                placeholder="Comment choisir sa perceuse..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Slug (URL)</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    value={form.slug}
                                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                                    className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-[14px] font-medium transition-all font-mono text-slate-500 shadow-sm"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-300">link</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Résumé court (Excerpt)</label>
                                            <textarea
                                                rows={3}
                                                value={form.excerpt}
                                                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                                className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-[14px] font-medium transition-all resize-none shadow-sm"
                                                placeholder="Une brève description pour accrocher vos lecteurs..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">2. Contenu Principal</h4>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Rédigez le corps de votre article. Utilisez des balises HTML pour la mise en forme.</p>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
                                            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-800/50">
                                                <button type="button" onClick={() => insertTag('b', 'Texte en gras')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                                                <button type="button" onClick={() => insertTag('i', 'Texte en italique')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                                                <button type="button" onClick={() => insertTag('ul', 'Élément de liste')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                                                <button type="button" onClick={() => insertTag('a', 'Lien')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">link</span></button>
                                                <button type="button" onClick={() => editorImageInputRef.current?.click()} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={editorImageInputRef}
                                                    onChange={handleEditorImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                                                <button type="button" onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all border ${showPreview ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-primary border-primary/20 hover:bg-primary hover:text-white'}`}>
                                                    {showPreview ? 'Éditeur' : 'Aperçu'}
                                                </button>
                                            </div>
                                            {showPreview ? (
                                                <div className="w-full px-8 py-8 min-h-[400px] bg-white dark:bg-slate-900 overflow-y-auto prose dark:prose-invert max-w-none">
                                                    <div dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-slate-300 italic">Aucun contenu à prévisualiser...</p>' }} className="blog-content-preview text-[16px] leading-[1.8] font-medium" />
                                                </div>
                                            ) : (
                                                <textarea
                                                    ref={contentRef}
                                                    required
                                                    rows={15}
                                                    value={form.content}
                                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                                    className="w-full px-8 py-8 bg-transparent border-none outline-none text-[16px] leading-[1.8] font-medium transition-all resize-none placeholder:text-slate-200"
                                                    placeholder="Commencez à raconter votre histoire..."
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Media */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">3. Média à la Une</h4>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">L'image de couverture qui apparaîtra dans les listes et en haut de l'article.</p>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <div className="relative group aspect-[16/7] rounded-[32px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-green-500/50 shadow-sm cursor-pointer">
                                            {form.imageUrl ? (
                                                <>
                                                    <img src={form.imageUrl} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[12px] uppercase tracking-wider">Changer l'image</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-8">
                                                    <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-green-500">add_photo_alternate</span>
                                                    </div>
                                                    <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Cliquez ou glissez pour uploader</p>
                                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Recommandé: 1200x630px (PNG, JPG)</p>
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-md z-20">
                                                    <div className="size-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                                    <p className="text-[12px] font-black uppercase text-primary tracking-widest">Téléchargement...</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Classification */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">4. Classification</h4>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Organisez votre contenu pour aider les utilisateurs à le trouver.</p>
                                    </div>
                                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Catégorie</label>
                                            <div className="relative">
                                                <select
                                                    value={form.category}
                                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                                    className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-bold transition-all appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">Sélectionner une catégorie</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tags (Mots-clés)</label>
                                            <div className="space-y-3">
                                                <input
                                                    onKeyDown={(e: any) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const tag = e.target.value.trim();
                                                            if (tag && !form.tags.includes(tag)) {
                                                                setForm({ ...form, tags: [...form.tags, tag] });
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-[14px] font-medium transition-all shadow-sm"
                                                    placeholder="Tapez et appuyez sur Entrée..."
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {form.tags.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-[12px] font-black uppercase tracking-tight">
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })}
                                                                className="hover:scale-125 transition-transform"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Publication */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">6. Publication</h4>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Définissez les paramètres de sortie de l'article.</p>
                                    </div>
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date de publication</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={form.publishDate}
                                                        onChange={e => setForm({ ...form, publishDate: e.target.value })}
                                                        className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-[14px] font-bold transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">État de l'article</label>
                                                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm({ ...form, status: 'Draft' })}
                                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${form.status === 'Draft' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
                                                    >
                                                        Brouillon
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm({ ...form, status: 'Published' })}
                                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${form.status === 'Published' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Publié
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-10 py-4.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95"
                            >
                                Annuler
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={(e: any) => {
                                    const formEl = e.currentTarget.closest('div').previousSibling.firstChild as HTMLFormElement;
                                    formEl.requestSubmit();
                                }}
                                className="flex-1 py-4.5 bg-primary text-white rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? 'Enregistrement...' : (editingPost ? 'Mettre à jour l\'Article' : 'Publier Maintenant')}
                                {!isSubmitting && <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">rocket_launch</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tip Modal */}
            {isTipModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic flex items-center gap-3">
                                <Quote size={24} className="text-emerald-600" />
                                {editingTip ? 'Modifier l\'Astuce' : 'Nouvelle Astuce Expert'}
                            </h3>
                            <button onClick={() => setIsTipModalOpen(false)} className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleTipSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contenu de l'astuce</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={tipForm.content}
                                    onChange={e => setTipForm({ ...tipForm, content: e.target.value })}
                                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[15px] font-medium transition-all resize-none shadow-sm"
                                    placeholder="Partagez un conseil d'expert..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom de l'auteur</label>
                                    <input
                                        required
                                        value={tipForm.authorName}
                                        onChange={e => setTipForm({ ...tipForm, authorName: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-bold transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Rôle/Titre</label>
                                    <input
                                        required
                                        value={tipForm.authorRole}
                                        onChange={e => setTipForm({ ...tipForm, authorRole: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                <input
                                    type="checkbox"
                                    id="tip-active"
                                    checked={tipForm.isActive}
                                    onChange={e => setTipForm({ ...tipForm, isActive: e.target.checked })}
                                    className="size-5 accent-emerald-600 rounded cursor-pointer"
                                />
                                <label htmlFor="tip-active" className="text-[13px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Activer cette astuce immédiatement (désactive les autres)</label>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsTipModalOpen(false)} className="px-8 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">Annuler</button>
                                <button disabled={isSubmitting} type="submit" className="flex-1 py-4 bg-emerald-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (editingTip ? 'Mettre à jour' : 'Créer l\'astuce')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* The global NotificationOverlay handles toasts and confirms now */}
        </main>
    );
}


