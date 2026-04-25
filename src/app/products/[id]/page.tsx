'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api, Product, Review } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { generateWhatsAppLink } from '../../lib/whatsapp';
import {
    Heart, ShoppingCart, Star, Truck, ShieldCheck, CreditCard,
    HelpCircle, Headphones, ChevronRight, Minus, Plus, Share2,
    Facebook, Linkedin, MessageCircleWarning, Copy as CopyIcon,
    GitCompare, MessageCircle, X, MapPin, User, Phone, CheckCircle2, FileText
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ProductImageZoom from '../../components/ProductImageZoom';
import RelatedProducts from '../../components/RelatedProducts';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { showToast } = useNotification();
    const [product, setProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'specification' | 'avis'>('description');
    const [reviewName, setReviewName] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const { addToCart, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleCheckout = async () => {
        if (!product) return;
        setIsCheckoutLoading(true);

        try {
            // Generate unique invoice number
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const invoiceNumber = `FAC-${datePart}-${randomPart}`;

            const orderPayload = {
                invoiceNumber,
                date: now.toISOString(),
                items: [{
                    name: product.name,
                    quantity,
                    price: Number(product.price),
                    imageUrl: product.imageUrl,
                }],
                totalPrice: Number(product.price) * quantity,
                customerInfo,
            };

            const backendOrderData = {
                customerName: customerInfo.name || 'Client WhatsApp',
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                invoiceReference: invoiceNumber,
                totalPrice: orderPayload.totalPrice,
                items: orderPayload.items
            };

            await api.createOrder(backendOrderData as any);

            try {
                localStorage.setItem('droguerie_last_order', JSON.stringify(orderPayload));
            } catch (e) {
                console.error('Could not save order to localStorage', e);
            }

            const whatsappLink = generateWhatsAppLink({
                items: orderPayload.items,
                totalPrice: orderPayload.totalPrice,
                customerInfo,
            }, settings?.phoneNumber);

            setTimeout(() => {
                window.open(whatsappLink, '_blank');
                setIsCheckoutLoading(false);
                setIsCheckingOut(false);
                setIsConfirmed(true);
                clearCart();
            }, 1000);

        } catch (error: any) {
            console.error('Order creation failed:', error);
            const errorMsg = error.message || 'Une erreur est survenue lors de la création de la commande.';
            showToast(`${errorMsg} Veuillez réessayer.`, 'error');
            setIsCheckoutLoading(false);
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await api.getProductById(id);
                setProduct(data);

                if (data) {
                    setActiveImage(data.imageUrl);
                    // Record recently viewed
                    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const updated = [data.id, ...recentlyViewed.filter((rid: number) => rid !== data.id)].slice(0, 12);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                }
                // Load approved reviews from API
                const approvedReviews = await api.getProductReviews(id);
                setReviews(approvedReviews);

                // Load Settings for WhatsApp ordering
                const storeSettings = await api.getSettings();
                setSettings(storeSettings);

            } catch (err) {
                console.error('Failed to load product or reviews:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewName || !reviewComment || reviewRating === 0) {
            showToast('Veuillez remplir tous les champs et donner une note.', 'error');
            return;
        }

        try {
            await api.submitReview({
                productId: Number(id),
                name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
            });

            // Show friendly notification explaining moderation
            showToast('Votre avis a été soumis avec succès et est en attente de modération.', 'success');

            // Reset form
            setReviewName('');
            setReviewComment('');
            setReviewRating(0);
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Une erreur est survenue lors de la soumission de votre avis.', 'error');
        }
    };

    const averageRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
        const rating = Math.floor(r.rating);
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating as keyof typeof ratingCounts]++;
        }
    });


    if (loading) {
        return (
        <div className="flex h-screen items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-[#BF1737]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
                <h1 className="text-2xl font-bold text-slate-900">Produit non trouvé</h1>
                <a href="/products" className="text-[#BF1737] hover:underline">Retour à la boutique</a>
            </div>
        );
    }

    const inWishlist = isInWishlist(product.id);

    if (isConfirmed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white min-h-[70vh]">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tighter text-center">Commande Envoyée !</h1>
                <p className="text-slate-500 mb-2 max-w-md text-center font-medium">
                    Votre commande a été envoyée sur WhatsApp. Nous vous contacterons très prochainement.
                </p>
                <p className="text-[#BF1737] font-bold text-sm mb-8 text-center">
                    Votre facture a été générée automatiquement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Link
                        href="/invoice"
                        className="flex items-center justify-center gap-2 bg-[#BF1737] text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#a01430] transition-colors shadow-lg shadow-[#BF1737]/20 flex-1"
                    >
                        <FileText size={16} />
                        Voir ma Facture
                    </Link>
                    <button
                        onClick={() => { setIsConfirmed(false); setQuantity(1); }}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors flex-1"
                    >
                        Continuer
                    </button>
                </div>
                <Link
                    href="/"
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    const handleShare = (platform: string) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = product.name;
        const urls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        };
        if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

                {/* ═══════ BREADCRUMB ═══════ */}
                <nav className="flex items-center gap-1.5 text-[13px] text-slate-500 py-4 border-b border-slate-100 mb-8 flex-wrap">
                    <Link href="/" className="hover:text-[#BF1737] transition-colors">Accueil</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <Link
                                href={`/products?categoryId=${product.categoryId}`}
                                className="hover:text-[#BF1737] transition-colors"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-slate-800 font-medium">{product.name}</span>
                </nav>

                {/* ═══════ PRODUCT MAIN SECTION ═══════ */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">

                    {/* ── LEFT: Product Image & Gallery ── */}
                    <div className="w-full lg:w-[450px] flex-shrink-0 z-20">
                        <div className="border border-slate-200 rounded-2xl relative bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-square flex items-center justify-center p-6 relative">
                                {activeImage ? (
                                    <ProductImageZoom src={activeImage} alt={product.name} />
                                ) : (
                                    <div className="text-slate-200 flex flex-col items-center gap-4">
                                        <MessageCircleWarning size={64} strokeWidth={1} />
                                        <p className="text-sm font-medium">Aucune image disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Thumbnail strip */}
                        {product.imageUrls && product.imageUrls.length > 1 && (
                            <div className="flex flex-nowrap lg:flex-wrap gap-2.5 mt-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar-hide lg:custom-scrollbar">
                                {product.imageUrls.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] flex-shrink-0 rounded-md border-2 transition-all p-1 bg-white overflow-hidden hover:shadow-md ${
                                            activeImage === img 
                                                ? 'border-[#BF1737] shadow-lg shadow-[#BF1737]/10' 
                                                : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* If only one image (backwards compatibility or simple products) */}
                        {(!product.imageUrls || product.imageUrls.length <= 1) && product.imageUrl && (
                             <div className="flex gap-2 mt-4">
                                <div className="w-[70px] h-[70px] border-2 border-[#BF1737] rounded-md overflow-hidden p-1 bg-white shadow-lg shadow-[#BF1737]/10">
                                    <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── CENTER: Product Info ── */}
                    <div className="flex-1 min-w-0">
                        {/* Product Name */}
                        <h1 className="text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] font-bold text-[#1a1a2e] leading-tight mb-3">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3 relative group cursor-pointer w-fit">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-[14px] h-[14px] ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <span className="text-[13px] text-slate-600 hover:text-[#BF1737] hover:underline transition-colors">{reviews.length} Avis</span>

                            {/* Hover Status Dropdown (Tooltip) */}
                            <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-slate-200 shadow-xl rounded-xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto origin-top-left transform scale-95 group-hover:scale-100 z-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={`tooltip-${s}`} className={`w-[18px] h-[18px] ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[16px] font-bold text-slate-900">{averageRating.toFixed(1)} sur 5</span>
                                </div>
                                <p className="text-[13px] text-slate-500 mb-4">{reviews.length} évaluations globales</p>
                                
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = ratingCounts[star as keyof typeof ratingCounts];
                                        const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3 text-[13px] text-slate-600">
                                                <button 
                                                    className="min-w-[55px] text-[#007185] hover:text-[#C7511F] hover:underline text-left font-medium"
                                                    onClick={() => {
                                                        setActiveTab('avis');
                                                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    {star} {star === 1 ? 'étoile' : 'étoiles'}
                                                </button>
                                                <div className="flex-1 h-[14px] bg-sky-50 border border-slate-300 rounded-sm overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-[#FFA41C]" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <div className="min-w-[40px] text-right text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
                                                     onClick={() => {
                                                        setActiveTab('avis');
                                                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    {percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <p className={`text-[14px] font-semibold mb-3 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                        </p>

                        {/* Short Description */}
                        {product.description ? (
                            <div 
                                className="text-[14px] text-slate-600 leading-relaxed mb-4 line-clamp-3 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-1 [&_p]:mb-1"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        ) : (
                            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                                {product.name}. Livraison Maroc.
                            </p>
                        )}

                        {/* Wishlist & Compare */}
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`flex items-center gap-2 text-[13px] transition-colors ${inWishlist ? 'text-[#BF1737]' : 'text-slate-600 hover:text-[#BF1737]'}`}
                            >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                                Liste de souhaits
                            </button>
                            <button
                                onClick={() => toggleCompare(product.id)}
                                className={`flex items-center gap-2 text-[13px] transition-colors ${isInCompare(product.id) ? 'text-[#BF1737]' : 'text-slate-600 hover:text-[#BF1737]'}`}
                            >
                                <GitCompare className={`w-4 h-4 ${isInCompare(product.id) ? 'text-[#BF1737]' : ''}`} />
                                Comparer
                            </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline flex-wrap gap-3 mb-5">
                            <span className="text-[24px] sm:text-[28px] font-bold text-[#BF1737]">
                                {Number(product.price).toFixed(2).replace('.', ',')} MAD
                            </span>
                            {product.oldPrice && product.oldPrice > product.price && (
                                <span className="text-[14px] sm:text-[16px] text-slate-400 line-through">
                                    {Number(product.oldPrice).toFixed(2).replace('.', ',')} MAD
                                </span>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] text-slate-700 font-bold uppercase tracking-wider">Quantité</span>
                                <div className="flex items-center border border-slate-200 rounded-[20px] overflow-hidden bg-white shadow-sm">
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-[50px] h-[48px] text-center text-[15px] font-bold border-none outline-none bg-transparent text-slate-900"
                                    />
                                    <div className="flex flex-col border-l border-slate-100">
                                        <button
                                            onClick={() => setQuantity(q => Math.min(q + 1, product.stock || 99))}
                                            className="w-[32px] h-[24px] flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#BF1737] border-b border-slate-100 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-[32px] h-[24px] flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#BF1737] transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={product.stock === 0}
                                onClick={() => {
                                    addToCart({
                                        productId: Number(product.id),
                                        name: product.name,
                                        price: product.price,
                                        imageUrl: product.imageUrl
                                    }, quantity);
                                }}
                                className="h-[48px] px-8 bg-[#BF1737] text-white text-[13px] font-black uppercase tracking-[0.1em] rounded-[20px] hover:bg-[#a01430] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[#BF1737]/20 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <ShoppingCart className="w-4.5 h-4.5" />
                                <span className="whitespace-nowrap">Ajouter au panier</span>
                            </button>
                        </div>

                        {/* WhatsApp Ordering Button (Direct) */}
                        <button
                            onClick={() => {
                                if (!settings?.phoneNumber && !process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
                                    showToast('Numéro WhatsApp non configuré.', 'error');
                                    return;
                                }
                                setIsCheckingOut(true);
                            }}
                            className="w-full h-[52px] bg-[#1a1a2e] text-white rounded-[20px] hover:bg-[#111122] transition-all flex items-center justify-center relative overflow-hidden group mb-10 shadow-xl shadow-slate-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-3 z-10">
                                <MessageCircle size={22} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                                <span className="text-[12px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Commander via WhatsApp</span>
                            </div>
                        </button>

                        {/* Product Meta */}
                        <div className="space-y-2 pt-5 border-t border-slate-100 text-[13px]">
                            {product.sku && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-medium">SKU :</span>
                                    <span className="text-slate-700">{product.sku}</span>
                                </div>
                            )}
                            {product.category && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-medium">Catégories :</span>
                                    <Link
                                        href={`/products?categoryId=${product.categoryId}`}
                                        className="text-[#BF1737] hover:underline"
                                    >
                                        {product.category.name}
                                    </Link>
                                </div>
                            )}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap text-[#BF1737]">
                                    <span className="text-slate-500 font-medium whitespace-nowrap">Tags :</span>
                                    {product.tags.map((tag, i) => (
                                        <div key={tag} className="flex items-center group">
                                            <Link
                                                href={`/products?search=${encodeURIComponent(tag)}`}
                                                className="hover:underline"
                                            >
                                                {tag}
                                            </Link>
                                            {i < product.tags!!.length - 1 && (
                                                <span className="text-slate-400 ml-1 mr-2">,</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Social Share */}
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-slate-500 font-medium">Partager :</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white transition-colors"
                                    >
                                        <Facebook className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white transition-colors"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Trust Badges Sidebar ── */}
                    <div className="w-full lg:w-[250px] flex-shrink-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 border border-slate-200 rounded-sm lg:divide-y divide-slate-100">
                            {[
                                {
                                    icon: <ShieldCheck className="w-6 h-6" />,
                                    title: 'QUALITÉ GARANTIE',
                                    desc: 'Qualité professionnelle',
                                },
                                {
                                    icon: <Truck className="w-6 h-6" />,
                                    title: 'LIVRAISON SOIGNÉE',
                                    desc: 'Partout au Maroc',
                                },
                                {
                                    icon: <CreditCard className="w-6 h-6" />,
                                    title: 'PAIEMENT À LA LIVRAISON',
                                    desc: 'Payez à la réception',
                                },
                                {
                                    icon: <HelpCircle className="w-6 h-6" />,
                                    title: "CONSEILS D'EXPERTS",
                                    desc: 'Experts en bricolage',
                                },
                                {
                                    icon: <Headphones className="w-6 h-6" />,
                                    title: 'SERVICE CLIENT',
                                    desc: 'À votre écoute 7j/7',
                                },
                            ].map((badge, i) => (
                                <div key={i} className={`flex items-start gap-4 p-4 ${i % 2 === 0 && i !== 4 ? 'sm:border-r lg:border-r-0' : ''} ${i < 4 ? 'border-b' : ''} lg:border-none divide-slate-100`}>
                                    <div className="text-[#BF1737] flex-shrink-0 mt-0.5">
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-bold text-[#1a1a2e] leading-tight">{badge.title}</div>
                                        <div className="text-[12px] text-[#BF1737] leading-tight mt-0.5">{badge.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════ TABS SECTION ═══════ */}
                <div className="mb-16">
                    {/* Tab Headers */}
                    <div className="flex justify-start sm:justify-center border-b border-slate-200 overflow-x-auto overflow-y-hidden custom-scrollbar-hide">
                        {[
                            { key: 'description' as const, label: 'Description' },
                            { key: 'specification' as const, label: 'Spécification' },
                            { key: 'avis' as const, label: `Avis (${reviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-6 sm:px-8 py-4 text-[14px] sm:text-[15px] font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key
                                    ? 'text-[#1a1a2e]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-[#BF1737] rounded-full translate-y-1.5" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="py-10">

                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="max-w-3xl mx-auto">
                                {product.description ? (
                                    <div 
                                        className="text-[15px] text-slate-600 leading-relaxed max-w-none 
                                        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-4 
                                        [&_p]:mb-4 [&_h1]:mt-8 [&_h1:first-child]:mt-0"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="text-[15px] text-slate-600 leading-relaxed text-center">
                                        {product.name}. Produit professionnel de haute qualité, adapté aussi bien aux particuliers qu&apos;aux professionnels. Conçu pour offrir des performances optimales et une fiabilité durable. Livraison disponible partout au Maroc.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Specification Tab */}
                        {activeTab === 'specification' && (
                            <div className="max-w-3xl mx-auto">
                                <table className="w-full text-[14px]">
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { label: 'Référence (SKU)', value: product.sku || 'N/A' },
                                            { label: 'Catégorie', value: product.category?.name || 'N/A' },
                                            { label: 'Marque', value: product.brand?.name || 'N/A' },
                                            { label: 'Stock disponible', value: `${product.stock} unités` },
                                            { label: 'État', value: product.stock > 0 ? 'Disponible' : 'Indisponible' },
                                            { label: 'En promotion', value: product.onSale ? 'Oui' : 'Non' },
                                            { label: 'Éco-responsable', value: product.ecoFriendly ? 'Oui' : 'Non' },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-3 pr-8 text-slate-500 font-medium w-[200px]">{row.label}</td>
                                                <td className="py-3 text-slate-800 font-medium">{row.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Avis (Reviews) Tab */}
                        {activeTab === 'avis' && (
                            <div className="max-w-6xl mx-auto flex gap-12 lg:gap-20 flex-wrap lg:flex-nowrap justify-between items-start">
                                {/* Left: Review Form */}
                                <div className="flex-1 min-w-[300px] max-w-[450px] bg-slate-50/20 p-8 rounded-2xl border border-slate-100">
                                    <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-6">Ajouter un avis</h3>

                                    <form onSubmit={handleSubmitReview}>
                                        {/* Star Rating */}
                                        <div className="mb-5">
                                            <label className="text-[14px] font-semibold text-[#1a1a2e] mb-2 block">
                                                Votre note <span className="text-[#BF1737]">*</span>
                                            </label>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(s)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setReviewRating(s)}
                                                        className="transition-transform active:scale-95"
                                                    >
                                                        <Star
                                                            className={`w-6 h-6 ${(hoverRating || reviewRating) >= s
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-slate-200'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div className="mb-5">
                                            <label className="text-[14px] font-semibold text-[#1a1a2e] mb-2 block">
                                                Nom <span className="text-[#BF1737]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Votre nom complet"
                                                value={reviewName}
                                                onChange={(e) => setReviewName(e.target.value)}
                                                className="w-full h-[45px] border border-slate-200 rounded-xl px-4 text-[14px] outline-none focus:border-[#BF1737] focus:ring-4 focus:ring-[#BF1737]/5 transition-all bg-white"
                                            />
                                        </div>

                                        {/* Comment */}
                                        <div className="mb-6">
                                            <label className="text-[14px] font-semibold text-[#1a1a2e] mb-2 block">
                                                Commentaire <span className="text-[#BF1737]">*</span>
                                            </label>
                                            <textarea
                                                required
                                                placeholder="Partagez votre expérience avec ce produit..."
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                rows={5}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#BF1737] focus:ring-4 focus:ring-[#BF1737]/5 transition-all resize-vertical bg-white"
                                            />
                                        </div>

                                        {/* Submit */}
                                        <button 
                                            type="submit"
                                            className="w-full h-[48px] bg-[#BF1737] text-white text-[14px] font-bold rounded-xl hover:bg-[#a01430] active:scale-[0.98] transition-all shadow-lg shadow-[#BF1737]/10"
                                        >
                                            Soumettre l&apos;avis
                                        </button>
                                    </form>
                                </div>

                                {/* Right: Reviews List */}
                                <div className="flex-1 min-w-[300px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[18px] font-bold text-[#1a1a2e]">
                                            Avis clients ({reviews.length})
                                        </h3>
                                        {reviews.length > 0 && (
                                            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`w-3.5 h-3.5 ${Math.floor(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[14px] font-bold text-amber-700">{averageRating.toFixed(1)}/5</span>
                                            </div>
                                        )}
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-6 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                                            {reviews.map((rev, i) => (
                                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{rev.name}</h4>
                                                            <div className="flex gap-1 mt-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star key={s} className={`w-3 h-3 ${rev.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[12px] text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <p className="text-[14px] text-slate-600 leading-relaxed italic">
                                                        &quot;{rev.comment}&quot;
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                            <div className="w-16 h-16 mb-6 text-[#BF1737] opacity-20">
                                                <MessageCircleWarning size={64} strokeWidth={1} />
                                            </div>
                                            <p className="text-[16px] text-slate-500 text-center font-medium">
                                                Soyez le premier à évaluer ce produit.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <RelatedProducts categoryId={product.categoryId} currentProductId={Number(product.id)} />
            </div>

            {/* Checkout Modal */}
            {isCheckingOut && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isCheckoutLoading && setIsCheckingOut(false)}
                    />

                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="bg-[#BF1737] p-8 text-white relative">
                            <button
                                onClick={() => setIsCheckingOut(false)}
                                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle size={24} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Finalisation</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Infos Livraison</h2>
                            <p className="text-white/60 text-xs font-medium mt-2">Dernière étape pour envoyer votre commande sur WhatsApp.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Nom Complet (Optionnel)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Votre nom complet"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#BF1737]/20 focus:border-[#BF1737] transition-all outline-none"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Email (Obligatoire pour la facture)</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            placeholder="votre@email.com"
                                            required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#BF1737]/20 focus:border-[#BF1737] transition-all outline-none"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Téléphone (Optionnel)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Votre numéro de téléphone"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#BF1737]/20 focus:border-[#BF1737] transition-all outline-none"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Adresse (Optionnel)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ville, Quartier..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#BF1737]/20 focus:border-[#BF1737] transition-all outline-none"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!customerInfo.email || !customerInfo.email.includes('@')) {
                                        showToast('Veuillez entrer une adresse email valide pour recevoir votre facture.', 'error');
                                        return;
                                    }
                                    handleCheckout();
                                }}
                                disabled={isCheckoutLoading}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                {isCheckoutLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Confirmer & Envoyer</>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 font-medium italic">
                                Note : Les informations saisies aideront à traiter votre commande plus rapidement once sur WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
