'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Star,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  Mail,
  ShoppingCart,
  Heart,
  GitCompare,
  Eye,
  Plus,
  Truck,
  Banknote,
  Wrench,
  Headset,
  PaintRoller,
  HandCoins,
  Paintbrush,
  Hammer,
  Droplets,
  Nut,
  Package,
  HardHat,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Category, type Product, type Brand } from './lib/api';
import ProductRating from './components/ProductRating';
import ProductCard from './components/ProductCard';
import { useCart } from './context/CartContext';

/* ─── Hero Slide Data ─── */
const HERO_SLIDES = [
  {
    id: 0,
    image: '/hero-slide-imgs/10c92c631a77cd2ef312aa9786f9cf0d.jpg',
    name: 'Perceuse Bosch 18V',
    price: '289 MAD',
    badge: 'PRIX GROSSISTE',
  },
  {
    id: 1,
    image: '/hero-slide-imgs/8015ae7a86ee94b57ea983be2c0f8b95.jpg',
    name: 'Set Brosses Pro',
    price: '59 MAD',
    badge: 'STOCK LIMITÉ',
  },
  {
    id: 2,
    image: '/hero-slide-imgs/dbbdd5880017ec421d278a58c3970db5.jpg',
    name: 'Meuleuse INGCO 125mm',
    price: '189 MAD',
    badge: 'NOUVEAUTÉ',
  },
];


export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [activeCategoryPage, setActiveCategoryPage] = useState(0);
  const productsPerPage = 6;
  const [brands, setBrands] = useState<Brand[]>([]);

  // Dynamic category link helpers — filter to parent categories only to avoid matching sub-categories
  const quincaillerieCategory = useMemo(() => categories.find(c => c.parentId === null && c.name.toLowerCase().includes('quincaillerie')), [categories]);
  const peintureCategory = useMemo(() => categories.find(c => c.parentId === null && c.name.toLowerCase().includes('peinture')), [categories]);

  const [activeTab, setActiveTab] = useState('Populaires');
  const [activeIncontournableTab, setActiveIncontournableTab] = useState('Derniers Produits');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [featuredTotalPages, setFeaturedTotalPages] = useState(1);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  // Incontournable state
  const [incontournableProducts, setIncontournableProducts] = useState<Product[]>([]);
  const [incontournablePage, setIncontournablePage] = useState(1);
  const [incontournableTotalPages, setIncontournableTotalPages] = useState(1);
  const [isLoadingIncontournable, setIsLoadingIncontournable] = useState(false);

  // Swipe interaction states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Incontournable swipe states
  const [incTouchStart, setIncTouchStart] = useState<number | null>(null);
  const [incTouchEnd, setIncTouchEnd] = useState<number | null>(null);

  // Testimonial state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const minSwipeDistance = 50;
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const incontournableScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Scroll sync handlers
  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setPage: (p: number) => void) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    if (scrollWidth <= clientWidth) return;
    
    // Calculate page based on scroll progress
    // We assume pages are divided evenly
    const maxScroll = scrollWidth - clientWidth;
    const scrollPercentage = scrollLeft / maxScroll;
    // Debounce state update slightly or only update when "closer" to another page
    // For simplicity, we can use a simpler calculation:
    const newPage = Math.round(scrollPercentage * (featuredTotalPages - 1)) + 1;
    // We'll update the state, components using this state should be optimized
    // Actually, native scroll snap handles the "locking", we just follow.
  };

  const handleFeaturedScroll = () => {
    if (!featuredScrollRef.current) return;
    const { scrollLeft, clientWidth } = featuredScrollRef.current;
    if (clientWidth === 0) return;
    const newPage = Math.round(scrollLeft / clientWidth) + 1;
    if (newPage !== featuredPage) setFeaturedPage(newPage);
  };

  const handleIncontournableScroll = () => {
    if (!incontournableScrollRef.current) return;
    const { scrollLeft, clientWidth } = incontournableScrollRef.current;
    if (clientWidth === 0) return;
    const newPage = Math.round(scrollLeft / clientWidth) + 1;
    if (newPage !== incontournablePage) setIncontournablePage(newPage);
  };

  const handleCategoryScroll = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, clientWidth } = categoryScrollRef.current;
    if (clientWidth === 0) return;
    const newPage = Math.round(scrollLeft / clientWidth);
    if (newPage !== activeCategoryPage) setActiveCategoryPage(newPage);
  };

  const scrollToPage = (ref: React.RefObject<HTMLDivElement | null>, pageIndex: number) => {
    if (!ref.current) return;
    const { clientWidth } = ref.current;
    ref.current.scrollTo({
      left: pageIndex * clientWidth,
      behavior: 'smooth'
    });
  };

  const getDotsCount = (ref: React.RefObject<HTMLDivElement | null>, itemsCount: number) => {
    if (!ref.current || itemsCount === 0) return 0;
    const { scrollWidth, clientWidth } = ref.current;
    if (clientWidth === 0) return 0;
    return Math.ceil(scrollWidth / clientWidth);
  };

  // Initial Fetch: Categories and first set of products
  useEffect(() => {
    api.getCategories(true).then(res => {
      const active = res.filter(c => c.isActive);
      setCategories(active);

      if (active.length > 0) {
        // Prioritize starting with one of the 6 main categories
        const prioritized = ['Peinture', 'Outillage', 'Plomberie', 'Quincaillerie', 'Électricité', 'Matériaux de Construction'];
        // Explicitly look for 'Peinture' first to ensure it's the default
        const peinture = active.find(c => c.name === 'Peinture');
        const firstWithProducts = peinture || active.find(c => prioritized.includes(c.name)) || active[0];
        setActiveCategoryId(firstWithProducts.id);
      }
    }).catch(console.error);

    api.getProducts({ limit: 18, active: true }).then(res => setFeaturedProducts(res.data)).catch(console.error);

    api.getBrands().then(res => setBrands(res.filter(b => b.isActive))).catch(console.error);
  }, []);

  // Fetch featured products based on tab and page
  useEffect(() => {
    setIsLoadingFeatured(true);
    let query: any = { page: 1, limit: 18 };

    if (activeTab === 'Populaires') query.sort = 'popularity';
    if (activeTab === 'Promotions') query.onSale = true;
    if (activeTab === 'Nouveautés') query.sort = 'createdAt';
    if (activeTab === 'Derniers Ajouts') query.sort = 'updatedAt';

    query.active = true;
    api.getProducts(query)
      .then(res => {
        setFeaturedProducts(res.data);
        setFeaturedTotalPages(res.totalPages);
        setIsLoadingFeatured(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingFeatured(false);
      });
  }, [activeTab, featuredPage]);

  // Reset page when tab changes
  useEffect(() => {
    setFeaturedPage(1);
    // Explicitly reset scroll position to start
    if (featuredScrollRef.current) {
        featuredScrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [activeTab]);

  // Fetch incontournables
  useEffect(() => {
    setIsLoadingIncontournable(true);
    let query: any = { page: 1, limit: 12, active: true };
    
    if (activeIncontournableTab === 'Derniers Produits') query.sort = 'createdAt';
    if (activeIncontournableTab === 'En Promo') query.onSale = true;
    if (activeIncontournableTab === 'Meilleures Ventes') query.sort = 'popularity';

    if (activeIncontournableTab === 'Vus Récemment') {
      // Handle local storage recently viewed
      try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (recentlyViewed.length > 0) {
            // Because our current API does not support exact ID matching array, 
            // we will fetch general products but preferably we would filter by IDs.
            // For MVP, we'll fetch them individually if needed, or just sort by newest as fallback.
            // A better way is to rely on frontend filtering if required, but let's just fetch latest 15.
        }
      } catch(e){}
    }

    api.getProducts(query)
      .then(res => {
        // Special logic for "Vus Récemment" since it relies on localStorage IDs
        if (activeIncontournableTab === 'Vus Récemment') {
            try {
                const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                if (recentlyViewed.length > 0) {
                    // Fetch each product individually since api.getProducts might not support 'ids' array
                    Promise.all(recentlyViewed.map((id: number) => api.getProductById(id)))
                        .then(products => {
                            const validProducts = products.filter(Boolean) as Product[];
                            setIncontournableProducts(validProducts);
                            setIsLoadingIncontournable(false);
                        });
                    return;
                } else {
                    setIncontournableProducts([]);
                    setIsLoadingIncontournable(false);
                    return;
                }
            } catch(e){
                console.error(e);
            }
        }

        setIncontournableProducts(res.data);
        setIncontournableTotalPages(res.totalPages);
        setIsLoadingIncontournable(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingIncontournable(false);
      });
  }, [activeIncontournableTab, incontournablePage]);

  useEffect(() => {
    setIncontournablePage(1);
    if (incontournableScrollRef.current) {
        incontournableScrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [activeIncontournableTab]);

  // Fetch products when category changes
  useEffect(() => {
    if (activeCategoryId) {
      setIsLoadingProducts(true);
      setActiveCategoryPage(0); // Reset page on category change
      api.getProducts({ categoryId: activeCategoryId, limit: 18, active: true })
        .then(res => {
          setCategoryProducts(res.data);
          setIsLoadingProducts(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingProducts(false);
        });
    }
  }, [activeCategoryId]);

  const TESTIMONIALS = [
    {
      initial: 'MA',
      name: 'Mohammed Alami',
      role: 'Chef de chantier — Casablanca',
      date: 'Il y a 2 jours',
      tag: 'Qualité Professionnelle',
      content: "La qualité des outils est irréprochable. J'achète régulièrement pour mes équipes et je n'ai jamais été déçu. Les meuleuses INGCO sont parfaites pour le bâtiment. Livraison rapide même en pleine saison."
    },
    {
      initial: 'KB',
      name: 'Karim Bensaid',
      role: "Architecte d'intérieur — Rabat",
      date: 'Il y a 1 semaine',
      tag: 'Service Premium',
      content: "Un service client exceptionnel et des finissions de peinture magnifiques. Mes projets haut de gamme gagnent en prestige avec leurs produits. Je recommande vivement pour les professionnels."
    },
    {
      initial: 'FZ',
      name: 'Fatine Zahra',
      role: 'Propriétaire — Marrakech',
      date: 'Il y a 3 jours',
      tag: 'Conseil & Expertise',
      content: "J'ai refait toute ma plomberie avec leur matériel. Installation facile et conseils précieux du support technique. C'est rare de trouver une telle expertise en ligne au Maroc."
    },
    {
      initial: 'YT',
      name: 'Youssef Tazi',
      role: 'Électricien — Tanger',
      date: 'Il y a 5 jours',
      tag: 'Rapport Qualité/Prix',
      content: "Le meilleur rapport qualité-prix du marché. Les équipements électriques sont robustes et respectent toutes les normes de sécurité. Livraison ultra-rapide sur mes chantiers à Tanger."
    },
    {
      initial: 'HM',
      name: 'Hind Mansouri',
      role: 'Décoratrice — Agadir',
      date: 'Il y a 2 semaines',
      tag: 'Choix & Design',
      content: "Large choix de finitions et accessoires. DroguerieApp est devenu mon partenaire privilégié. Le gain de temps sur la sélection et la logistique est un vrai plus pour mon activité."
    }
  ];

  // Fetch incontournable products based on tab and page
  useEffect(() => {
    async function fetchIncontinentData() {
      setIsLoadingIncontournable(true);

      if (activeIncontournableTab === 'Vus Récemment') {
        const savedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (savedIds.length === 0) {
          setIncontournableProducts([]);
          setIncontournableTotalPages(1);
          setIsLoadingIncontournable(false);
          return;
        }

        // Pagination for local IDs
        const limit = 6;
        const startIndex = (incontournablePage - 1) * limit;
        const pageIds = savedIds.slice(startIndex, startIndex + limit);

        try {
          const products = await Promise.all(pageIds.map((id: number) => api.getProductById(id)));
          setIncontournableProducts(products as Product[]);
          setIncontournableTotalPages(Math.ceil(savedIds.length / limit));
        } catch (err) {
          console.error('Failed to fetch recently viewed:', err);
        } finally {
          setIsLoadingIncontournable(false);
        }
        return;
      }

      let query: any = { page: 1, limit: 18 };
      if (activeIncontournableTab === 'Derniers Produits') query.sort = 'createdAt';
      if (activeIncontournableTab === 'En Promo') query.onSale = true;
      if (activeIncontournableTab === 'Meilleures Ventes') query.sort = 'popularity';

      query.active = true;
      api.getProducts(query)
        .then(res => {
          setIncontournableProducts(res.data);
          setIncontournableTotalPages(res.totalPages);
          setIsLoadingIncontournable(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingIncontournable(false);
        });
    }

    fetchIncontinentData();
  }, [activeIncontournableTab, incontournablePage]);

  // Reset incontournable page when tab changes
  useEffect(() => {
    setIncontournablePage(1);
  }, [activeIncontournableTab]);

  // Native scroll handling replaces custom touch events for better performance and feel


  // Helper for pagination dots limiting
  const getVisiblePages = (total: number, current: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    let pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (current < total - 2) pages.push('...');
    if (!pages.includes(total)) pages.push(total);

    return pages;
  };

  /* Auto-advance slides every 4 seconds */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Helper to get icon for category (fallback to Package)
  const getCategoryIcon = (name: string) => {
    // Normalize string to ignore accents (e.g., é -> e)
    const lower = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.includes('peinture')) return Paintbrush;
    if (lower.includes('outil')) return Hammer;
    if (lower.includes('plomb')) return Droplets;
    if (lower.includes('quinc')) return Wrench;
    if (lower.includes('elec') || lower.includes('appareill')) return Zap;
    if (lower.includes('mater')) return HardHat;
    return Package;
  };

  return (
    <div className="flex-1 flex flex-col bg-white font-display overflow-x-hidden">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Dynamic Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-warehouse-v2-.jpg"
            alt="Hardware Store Warehouse"
            className="w-full h-full object-cover"
          />
          {/* Main Dark Gradient Overlay (Right to Left) — Softened to show more warehouse */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/60 via-[#0D0D0D]/20 to-transparent z-0" />
          {/* Bottom Fade Overlay — Softened */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60 z-0" />
        </div>

        {/* Technical Lined Grid Overlay — Boldened Horizontal and Vertical Lines */}
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(191, 23, 55, 0.4) 1.5px, transparent 1.5px), 
              linear-gradient(90deg, rgba(191, 23, 55, 0.4) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-10">
            {/* Top badge row */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-6"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 border-2 border-[#BF1737]/40 rounded-full bg-[#BF1737]/5">
                <span className="flex h-2 w-2 rounded-full bg-[#BF1737] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#BF1737]">N°1 AU MAROC</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">5000+ avis</span>
            </motion.div>

            {/* Giant display typography */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0 sm:space-y-0 tracking-[-0.05em] leading-[0.85]"
            >
              <div className="text-[34px] sm:text-[45px] md:text-[60px] lg:text-[75px] xl:text-[90px] font-black text-white uppercase drop-shadow-2xl">
                OUTILLAGE
              </div>
              <div className="text-[34px] sm:text-[45px] md:text-[60px] lg:text-[75px] xl:text-[90px] font-black uppercase flex items-center gap-3 sm:gap-6 flex-wrap">
                <span className="text-[#BF1737]">&</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #BF1737' }}>QUINCAIL-</span>
              </div>
              <div className="text-[34px] sm:text-[45px] md:text-[60px] lg:text-[75px] xl:text-[90px] font-black uppercase">
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #BF1737' }}>LERIE</span>
              </div>

              {/* Decorative Red Accent Line */}
              <div className="pt-6 sm:pt-8">
                <div className="h-[2px] w-full max-w-[280px] bg-gradient-to-r from-[#BF1737] to-transparent opacity-80" />
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-lg text-[14px] sm:text-base text-white/40 leading-relaxed font-medium"
            >
              Droguerie Maroc — votre source professionnelle pour l'outillage électrique, la peinture, la quincaillerie et bien plus. Plus de 1200 références en stock.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-5 pt-2"
            >
              <Link href="/products" className="px-8 sm:px-12 py-3.5 sm:py-4.5 bg-[#BF1737] hover:bg-[#A3142F] text-white rounded-2xl font-black text-[12px] sm:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#BF1737]/20 transition-all transform hover:-translate-y-1 min-w-[200px] sm:min-w-[220px] flex items-center justify-center text-center">
                VOIR NOS PRODUITS
              </Link>
              <Link href="#categories" className="px-8 sm:px-12 py-3.5 sm:py-4.5 border-2 border-white/10 hover:border-white/20 text-white rounded-2xl font-black text-[12px] sm:text-sm uppercase tracking-[0.2em] transition-all min-w-[180px] flex items-center justify-center text-center">
                CATÉGORIES
              </Link>
            </motion.div>

            {/* Bottom Stats */}
            <div className="flex items-start gap-4 sm:gap-6 pb-4 sm:pb-8">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white leading-none">1200+</p>
                <p className="text-[8px] sm:text-[9px] font-medium text-white/30 uppercase tracking-[0.1em] sm:tracking-wider mt-1">Produits</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white leading-none">25+</p>
                <p className="text-[8px] sm:text-[9px] font-medium text-white/30 uppercase tracking-[0.1em] sm:tracking-wider mt-1">Ans d'expérience</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white leading-none">98%</p>
                <p className="text-[8px] sm:text-[9px] font-medium text-white/30 uppercase tracking-[0.1em] sm:tracking-wider mt-1">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Showcase — Auto-Sliding */}
          <div className="flex-1 relative group w-full mt-10 lg:mt-0">

            {/* Image carousel container — floating animation */}
            <div className="relative z-10 w-full max-w-[280px] sm:max-w-[380px] aspect-square mx-auto floating">
              {/* Concentric decorative rings — centered behind image */}
              <div className="absolute top-1/2 left-1/2 w-[140%] aspect-square rounded-full border-2 border-[#BF1737]/[0.08] pulse-scale" />
              <div className="absolute top-1/2 left-1/2 w-[120%] aspect-square rounded-full border-2 border-[#BF1737]/[0.12] pulse-scale-reverse" />
              {/* Warm radial background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] aspect-square rounded-full bg-[#BF1737]/[0.06] blur-[80px]" />
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className="absolute inset-0 flex items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    opacity: currentSlide === index ? 1 : 0,
                    transform: currentSlide === index
                      ? 'scale(1) translateX(0)'
                      : index > currentSlide || (currentSlide === HERO_SLIDES.length - 1 && index === 0)
                        ? 'scale(0.92) translateX(60px)'
                        : 'scale(0.92) translateX(-60px)',
                    pointerEvents: currentSlide === index ? 'auto' : 'none',
                  }}
                >
                  {/* Dark card frame */}
                  <div className="relative w-[85%] aspect-[4/5] bg-[#151515] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                    <img
                      src={slide.image}
                      alt={slide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Product Info Badge — Bottom-Left, tilted (OUTSIDE carousel, floats opposite) */}
            <div
              key={`badge-left-${currentSlide}`}
              className="absolute left-[5%] sm:-left-4 lg:left-[-10%] bottom-[8%] sm:bottom-[12%] z-20 backdrop-blur-xl border border-white/5 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] floating-reverse -rotate-3 max-w-[160px] sm:max-w-[200px]"
              style={{
                background: `linear-gradient(135deg, rgba(26, 26, 26, 0.4), rgba(191, 23, 55, 0.15))`
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black text-green-400 uppercase tracking-widest">En stock</span>
              </div>
              <p className="text-white font-black text-[12px] sm:text-sm uppercase tracking-tight leading-tight">{HERO_SLIDES[currentSlide].name}</p>
              <p className="text-[#BF1737] font-black text-[12px] sm:text-sm mt-1">{HERO_SLIDES[currentSlide].price}</p>
            </div>

            {/* Floating Offer Badge — Top-Right, tilted, slightly behind image (INSIDE carousel container) */}
            <div
              key={`badge-right-${currentSlide}`}
              className="absolute right-[5%] sm:-right-2 lg:right-[-2%] top-[10%] sm:top-[15%] z-0 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-[0_30px_60px_-15px_rgba(191,23,55,0.4)] floating-reverse rotate-4"
              style={{
                background: `linear-gradient(135deg, rgba(191, 23, 55, 0.75), rgba(191, 23, 55, 0.35))`
              }}
            >
              <p className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest mb-0.5">{HERO_SLIDES[currentSlide].badge}</p>
              <p className="text-white/70 text-[9px] sm:text-[10px] font-semibold">Dès 10 pièces</p>
            </div>

            {/* Slider dots */}
            <div className="relative z-20 flex items-center justify-center gap-3 mt-8 sm:mt-6">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-500 ${currentSlide === index
                    ? 'w-6 h-1.5 sm:w-8 sm:h-2 bg-[#BF1737]'
                    : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/20 hover:bg-white/40'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Left "Défiler" indicator */}
        <div className="absolute bottom-10 left-10 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] rotate-90 origin-left mt-16 text-white whitespace-nowrap">DÉFILER</span>
        </div>
      </section>

      {/* ─── TICKER / MARQUEE ─── */}
      <div className="bg-[#BF1737] py-2.5 overflow-hidden whitespace-nowrap border-y border-white/10 relative z-20">
        <div className="flex animate-marquee gap-12 items-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-12 group">
              <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                PEINTURE & FINITION <Plus size={12} className="opacity-40" />
              </span>
              <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                PRIX GROSSISTE <Plus size={12} className="opacity-40" />
              </span>
              <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                STOCK PERMANENT <Plus size={12} className="opacity-40" />
              </span>
              <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                BOSCH • INGCO • DEWALT <Plus size={12} className="opacity-40" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES / VALUE PROPOSITIONS ─── */}
      <section className="relative z-30 my-6 sm:my-8 px-4 sm:px-6 lg:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[1400px]"
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md py-5 sm:py-7 px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-0 items-center">
              {[
                {
                  title: 'QUALITÉ GARANTIE',
                  desc: 'Qualité professionnelle',
                  icon: <PaintRoller size={28} className="text-[#BF1737]" />
                },
                {
                  title: 'LIVRAISON SOIGNÉE',
                  desc: 'Partout au Maroc',
                  icon: <Truck size={28} className="text-[#BF1737]" />
                },
                {
                  title: 'PAIEMENT À LA LIVRAISON',
                  desc: 'Payez à la réception',
                  icon: <HandCoins size={28} className="text-[#BF1737]" />
                },
                {
                  title: 'CONSEILS D\'EXPERTS',
                  desc: 'Experts en bricolage',
                  icon: <Wrench size={28} className="text-[#BF1737]" />
                },
                {
                  title: 'SERVICE CLIENT',
                  desc: 'À votre écoute 7j/7',
                  icon: <Headset size={28} className="text-[#BF1737]" />
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 px-2 sm:px-4 lg:px-8 ${idx !== 4 ? 'lg:border-r border-slate-100' : ''}`}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[12px] sm:text-[13px] font-bold text-slate-800 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── CATÉGORIES VEDETTES / FEATURED PRODUCTS ─── */}
      <section id="categories" className="py-20 bg-white pt-10">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Header Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-[500px]"
            >
              <h2 className="text-[36px] font-bold text-slate-900 leading-tight">Catégories Vedettes</h2>
              <p className="text-[16px] text-slate-400 font-normal mt-4 leading-relaxed">
                Équipez-vous des meilleurs outils et matériaux pour tous vos projets de bricolage et rénovation
              </p>
            </motion.div>

            {/* Category Tabs */}
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="flex items-center px-4 gap-3 overflow-x-auto custom-scrollbar pb-12 pt-4 lg:pb-12 w-full lg:w-auto"
            >
              {(categories.length > 0) ? (
                categories
                  .filter(cat => cat.parentId === null)
                  .sort((a, b) => {
                    // Prioritize the 6 main categories I just seeded
                    const prioritized = ['Peinture', 'Outillage', 'Plomberie', 'Quincaillerie', 'Électricité', 'Matériaux de Construction'];
                    const aIdx = prioritized.indexOf(a.name);
                    const bIdx = prioritized.indexOf(b.name);
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return 0;
                  })
                  .slice(0, 10) // Show up to 10 top categories
                  .map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    const isActive = activeCategoryId === cat.id;
                    return (
                      <motion.button
                        variants={{
                          hidden: { opacity: 0, scale: 0.9, y: 10 },
                          show: { opacity: 1, scale: 1, y: 0 }
                        }}
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`flex-shrink-0 w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 border bg-white ${isActive
                          ? 'border-[#BF1737] shadow-[0_10px_20px_-5px_rgba(191,23,55,0.1)] scale-105'
                          : 'border-slate-200 hover:border-[#BF1737] hover:scale-105 shadow-sm'
                          }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[#BF1737]/10 text-[#BF1737]' : 'text-slate-400 bg-slate-50'}`}>
                          <Icon size={22} strokeWidth={1.5} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-tight text-center px-2 line-clamp-2 leading-[1.4] pb-0.5 ${isActive ? 'text-[#BF1737]' : 'text-slate-600'}`}>
                          {cat.name}
                        </span>
                      </motion.button>
                    );
                  })
              ) : (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-lg bg-slate-100 animate-pulse" />
                ))
              )}
            </motion.div>
          </div>

          {/* Product Carousel - Swipable with fingers */}
          <div className="relative group/carousel">
            {/* Navigation Arrows - Desktop Only */}
            <button 
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <div
              ref={categoryScrollRef}
              onScroll={handleCategoryScroll}
              className={`mt-6 pt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden scroll-smooth transition-all duration-500 ${isLoadingProducts ? 'opacity-50' : 'opacity-100'}`}
            >
              {categoryProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="w-[180px] sm:w-[200px] lg:w-[220px] xl:w-[calc((100%-80px)/6)] shrink-0 snap-start"
                />
              ))}

              {/* Loading Placeholder or Empty State */}
              {!isLoadingProducts && categoryProducts.length === 0 && (
                <div className="flex-1 py-20 text-center">
                  <p className="text-slate-400">Aucun produit trouvé dans cette catégorie.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>

        </div>
      </section>

      {/* ─── TABBED PRODUCTS SECTION (Populaires, Promotions, etc.) ─── */}
      <section className="py-14 bg-white pt-[10px]">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-0 mb-8">
            <div className="flex items-center gap-10 overflow-x-auto overflow-y-hidden custom-scrollbar py-2">
              {['Populaires', 'Promotions', 'Nouveautés', 'Derniers Ajouts'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-5 text-[14px] font-bold uppercase tracking-tight transition-colors whitespace-nowrap ${isActive ? 'text-[#BF1737]' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {tab}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#BF1737]">
                        <div className="absolute top-[1px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#BF1737]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>


          </div>

          <div className="relative group/featured">
            {/* Navigation Arrows - Desktop Only */}
            <button 
              onClick={() => {
                if (featuredScrollRef.current) {
                  featuredScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
              className="absolute left-[-20px] top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/featured:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <div
              ref={featuredScrollRef}
              onScroll={handleFeaturedScroll}
              className={`pt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden scroll-smooth transition-opacity duration-300 ${isLoadingFeatured ? 'opacity-50' : 'opacity-100'}`}
            >
            {featuredProducts.map((product, idx) => (
              <ProductCard 
                key={`featured-${product.id}-${idx}`} 
                product={product} 
                className="w-[180px] sm:w-[200px] lg:w-[220px] xl:w-[calc((100%-80px)/6)] shrink-0 snap-start"
              />
            ))}

            {/* Fallbacks if < 6 products exist to show the layout */}
            {Array.from({ length: Math.max(0, 6 - featuredProducts.length) }).map((_, i) => (
              <div key={`placeholder-${i}`} className="w-[180px] sm:w-[200px] lg:w-[220px] xl:w-[calc((100%-80px)/6)] shrink-0 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col opacity-50 pointer-events-none">
                <div className="aspect-square w-full mb-4 bg-slate-100 rounded-xl" />
                <div className="w-3/4 h-4 bg-slate-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-slate-200 rounded mb-4" />
                <div className="w-1/4 h-3 bg-slate-200 rounded mb-4" />
                <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between">
                  <div className="w-16 h-5 bg-slate-200 rounded" />
                  <div className="w-9 h-9 bg-slate-200 rounded-[10px]" />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              if (featuredScrollRef.current) {
                featuredScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            className="absolute right-[-20px] top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/featured:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        </div>

        </div>
      </section>

      {/* ─── BRANDS LOGO MARQUEE ─── */}
      <section className="pb-12 bg-white">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          <div className="flex items-center gap-6 mb-10 overflow-hidden">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 whitespace-nowrap">
              Marques Partenaires
            </h2>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          <div className="border border-slate-200 rounded-[20px] py-8 px-6 overflow-hidden relative flex items-center bg-white">
            {/* Fade edges to smooth out the scrolling effect */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-[20px]" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-[20px]" />

            {/* Auto-scrolling container */}
            <div className="flex animate-marquee items-center min-w-full gap-[6rem]">
              {/* Double the set to create an infinite loop */}
              {[...Array(3)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex gap-[6rem] items-center shrink-0">
                  {brands.length > 0 ? (
                    brands.map(brand => (
                      <img
                        key={`brand-${groupIdx}-${brand.id}`}
                        src={brand.logoUrl ? (brand.logoUrl.startsWith('http') ? brand.logoUrl : `${process.env.NEXT_PUBLIC_API_URL}${brand.logoUrl}`) : ''}
                        className="h-14 md:h-[60px] max-w-[160px] object-contain mix-blend-multiply"
                        alt={brand.name}
                      />
                    ))
                  ) : (
                    <div className="text-slate-300 font-bold text-xs uppercase tracking-widest">Chargement...</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── DUAL PROMO BANNERS (REFINED & FULL) ─── */}
      <section className="pb-24 bg-white">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card 1: Sécurité - Industrial Premium */}
            <Link href={quincaillerieCategory ? `/products?categoryId=${quincaillerieCategory.id}` : '/products'} className="group relative h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-700 bg-black">
              <div className="flex h-full">
                {/* Image Part - 65% width */}
                <div className="w-[65%] h-full relative overflow-hidden">
                  <img
                    src="/banners/premium_security_banner.png"
                    alt="Sécurité"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] ease-out"
                  />
                  {/* Inner shadow for depth - refined for new image */}
                  <div className="absolute inset-0 shadow-[inset_-100px_0_150px_-50px_rgba(0,0,0,0.9)] z-10" />
                  {/* Subtle red line accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BF1737] to-transparent opacity-60 z-20" />
                </div>
                
                {/* Text Part - 35% width with overlap feel */}
                <div className="w-[35%] h-full bg-[#0a0a0a] flex flex-col items-start justify-center px-8 relative z-20 border-l border-white/5">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-px bg-[#BF1737]/30" />
                  <div className="space-y-1 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck size={14} className="text-[#BF1737]" />
                       <span className="text-[10px] font-black text-[#BF1737] uppercase tracking-[0.3em]">Hardware Pro</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white leading-[0.85] uppercase italic tracking-tighter">
                      SÉCURITÉ<br />
                      <span className="text-outline text-white/10" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}>MAXIMALE</span>
                    </h3>
                  </div>
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em] mb-8">
                    Protégez votre espace
                  </p>
                  <div className="inline-flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.25em] border-b-2 border-[#BF1737] pb-1 transform group-hover:translate-x-2 transition-transform duration-500">
                    VOIR LA SÉLECTION <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Finitions - Industrial Premium */}
            <Link href={peintureCategory ? `/products?categoryId=${peintureCategory.id}` : '/products'} className="group relative h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-700 bg-black">
              <div className="flex h-full direction-reverse">
                 {/* Text Part - 40% width */}
                 <div className="w-[40%] h-full bg-[#0d0d0d] flex flex-col items-end justify-center px-8 relative z-20 border-r border-white/5 text-right">
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-px bg-white/20" />
                  <div className="space-y-1 mb-8">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Master Finish</span>
                       <PaintRoller size={14} className="text-slate-400" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white leading-[0.85] uppercase italic tracking-tighter">
                      FINITIONS<br />
                      <span className="text-[#BF1737]">PARFAITES</span>
                    </h3>
                  </div>
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em] mb-8">
                    Rouleaux & Pinceaux Pro
                  </p>
                  <div className="inline-flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.25em] border-b-2 border-white/20 group-hover:border-[#BF1737] pb-1 transform group-hover:-translate-x-2 transition-transform duration-500">
                    DÉCOUVRIR <ChevronRight size={14} />
                  </div>
                </div>

                {/* Image Part - 60% width */}
                <div className="w-[60%] h-full relative overflow-hidden">
                  <img
                    src="/banners/premium_paint_tools_dense_banner.png"
                    alt="Finitions"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] ease-out"
                  />
                  {/* Inner shadow for depth - refined for denser image */}
                  <div className="absolute inset-0 shadow-[inset_100px_0_180px_-40px_rgba(0,0,0,0.95)] z-10" />
                  {/* Subtle grey line accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-white/20 to-transparent opacity-40 z-20" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── INCONTOURNABLES SECTION (HORIZONTAL CAROUSEL) ─── */}
      <section className="py-16 bg-white mt-[-20px]">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-0 gap-6 mb-4 relative">
            <h2 className="text-[24px] font-bold text-slate-800 pb-3 relative whitespace-nowrap">
              Incontournables
              <div className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-[#BF1737] z-10" />
            </h2>
            <div className="flex items-center justify-end flex-wrap gap-x-8 gap-y-2 pb-0">
              {['Derniers Produits', 'Vus Récemment', 'En Promo', 'Meilleures Ventes'].map((tab) => {
                const isActive = activeIncontournableTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveIncontournableTab(tab)}
                    className={`relative pb-3 text-[14px] whitespace-nowrap transition-colors ${isActive ? 'text-[#BF1737] font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
                      }`}
                  >
                    {tab}
                    {isActive && (
                      <>
                        <div className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-[#BF1737] z-10" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[8px] h-[4px] bg-[#BF1737] rounded-b-full z-10" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel Grid */}
          <div className="relative group/inc">
            {/* Navigation Arrows - Desktop Only */}
            <button 
              onClick={() => {
                if (incontournableScrollRef.current) {
                  incontournableScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/inc:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <div
              ref={incontournableScrollRef}
              onScroll={handleIncontournableScroll}
              className={`flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden scroll-smooth pt-8 transition-opacity duration-300 ${isLoadingIncontournable ? 'opacity-50' : 'opacity-100'}`}
            >
              {incontournableProducts.length > 0 ? incontournableProducts.map((product, idx) => (
                <ProductCard
                  key={`incontournable-${product.id}-${idx}`}
                  product={product}
                  className="w-[180px] sm:w-[200px] lg:w-[220px] xl:w-[calc((100%-80px)/6)] shrink-0 snap-start"
                />
              )) : (
                <div className="text-slate-400 text-center py-10 w-full font-medium">
                  {isLoadingIncontournable ? 'Chargement des produits...' : 'Aucun produit trouvé dans cette catégorie.'}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (incontournableScrollRef.current) {
                  incontournableScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#BF1737]/10 text-[#BF1737] flex items-center justify-center opacity-0 group-hover/inc:opacity-100 transition-all duration-300 hover:bg-[#BF1737]/20 border border-[#BF1737]/10 hidden lg:flex"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>

        </div>
      </section>

      {/* ─── PROMO BANNERS / TRENDING ─── */}
      <section className="py-12 bg-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[1580px] px-6 lg:px-10"
        >
          <Link href="/products?search=dewalt" className="group relative block w-full h-[220px] md:h-[280px] rounded-[12px] overflow-hidden hover:shadow-2xl transition-all duration-700 border border-slate-200/50">
            {/* Background Light Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 z-0" />

            {/* Right Side Image (Faded to the left) */}
            <div className="absolute right-0 top-0 h-full w-[80%] z-10 flex justify-end" style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }}>
              <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80" alt="DeWalt Tools" className="w-[120%] h-full object-cover object-center group-hover:scale-105 transition-transform duration-[3s] mix-blend-multiply opacity-80" />
            </div>

            {/* Left Info Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-24 w-full md:w-[65%] gap-2 md:gap-4">
              <div className="absolute top-8 left-10 md:left-24 bg-[#1a1a1a] w-[42px] h-[52px] rounded-t-full rounded-b-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white" size={24} strokeWidth={1.5} />
                {/* Small green check circle */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#0bc241] rounded-full w-[22px] h-[22px] flex items-center justify-center border-2 border-[#ececec]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>

              <div className="pt-8 md:pt-10">
                <h2 className="text-[22px] md:text-[32px] lg:text-[40px] font-medium tracking-[0.2em] text-[#1a1a1a] leading-[1.3] uppercase whitespace-nowrap">
                  OUTILLAGE DEWALT <br />
                  <span className="font-medium text-[#1a1a1a]">PROFESSIONNEL</span>
                </h2>
                <p className="text-[13px] md:text-[18px] text-slate-700 font-medium tracking-wide mt-2">
                  Puissance et performance sur chantier
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>



      {/* ─── SPECIAL OFFER SECTION ─── */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-[96%] max-w-[1600px] rounded-[2.5rem] overflow-hidden bg-black text-white min-h-[400px] flex items-center mt-12 mb-20 shadow-2xl"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
          <img className="w-full h-full object-cover opacity-40" src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80" alt="Special Offer" />
        </div>

        <div className="container px-8 md:px-16 lg:px-24 relative z-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-8 h-[2px] bg-[#BF1737]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF1737]">Offre Spéciale</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic">
              LIVRAISON <br />
              <span className="text-[#BF1737]">GRATUITE</span> <br />
              <span className="text-outline text-white/20">DÈS 299 MAD</span>
            </h2>
            <p className="text-white/60 text-xs md:text-sm max-w-md leading-relaxed font-medium">
              Profitez de la livraison offerte sur toutes vos commandes supérieures à 299 MAD partout au Maroc. Commandez maintenant !
            </p>
            <Link href="/products" className="w-fit inline-flex px-8 py-4 bg-[#BF1737] hover:bg-[#A3142F] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#BF1737]/20 transition-all items-center gap-3 group mx-auto lg:mx-0">
              COMMANDER MAINTENANT
              <div className="w-2 h-2 rounded-full bg-white opacity-40 group-hover:scale-150 transition-all" />
            </Link>
          </div>

          <div className="flex-1 space-y-3 w-full max-w-sm">
            {[
              { title: 'Livraison Express', desc: 'Casablanca & environs en 24h' },
              { title: 'National 2-5 Jours', desc: 'Toutes les villes du Maroc' },
              { title: 'Emballage Soigné', desc: 'Produits protégés & sécurisés' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col p-5 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                <h4 className="text-white font-black text-xs uppercase tracking-tight">{item.title}</h4>
                <p className="text-white/40 text-[9px] font-medium mt-0.5 uppercase tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── TESTIMONIALS SECTION (ILS NOUS FONT CONFIANCE) ─── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 space-y-4"
          >
            <div className="flex items-center gap-4 justify-center">
              <div className="w-10 h-[2px] bg-[#BF1737]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#BF1737]">TÉMOIGNAGES</span>
              <div className="w-10 h-[2px] bg-[#BF1737]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
              ILS NOUS FONT <span className="text-[#BF1737]">CONFIANCE</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Plus de 5000 clients satisfaits à travers tout le Maroc
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Active Testimonial Card */}
            <div className="bg-[#fdfdfd] border border-slate-100 rounded-[30px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden group min-h-[380px] flex flex-col justify-center transition-all duration-500">
              {/* Quote Icon Background */}
              <div className="absolute top-10 right-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Quote size={120} className="text-[#BF1737] fill-[#BF1737]" />
              </div>

              <div key={activeTestimonial} className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1737]/60">
                  {TESTIMONIALS[activeTestimonial].date}
                </span>

                <p className="text-[18px] md:text-[22px] font-medium text-slate-700 leading-relaxed italic">
                  "{TESTIMONIALS[activeTestimonial].content}"
                </p>

                <div className="flex items-center justify-between gap-6 flex-wrap pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#BF1737] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#BF1737]/20">
                      {TESTIMONIALS[activeTestimonial].initial}
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold text-lg leading-none">{TESTIMONIALS[activeTestimonial].name}</h4>
                      <p className="text-slate-400 text-xs font-medium mt-1">{TESTIMONIALS[activeTestimonial].role}</p>
                    </div>
                  </div>

                  <div className="px-4 py-2 bg-[#BF1737]/5 rounded-full border border-[#BF1737]/10">
                    <span className="text-[10px] font-black text-[#BF1737] uppercase tracking-widest">{TESTIMONIALS[activeTestimonial].tag}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Avatars Navigation */}
            <div className="flex items-center justify-center gap-4 mt-10">
              {TESTIMONIALS.map((user, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${activeTestimonial === i
                    ? 'bg-[#BF1737] text-white scale-110 shadow-xl shadow-[#BF1737]/20 translate-y-[-4px]'
                    : 'bg-white border border-slate-100 text-slate-400 hover:border-[#BF1737]/30 hover:text-[#BF1737] hover:translate-y-[-2px]'
                    }`}
                >
                  {user.initial}
                </button>
              ))}
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              {[
                { val: '5000+', label: 'Clients satisfaits' },
                { val: '4.9/5', label: 'Note moyenne' },
                { val: '98%', label: 'Recommanderaient' },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <h3 className="text-4xl font-black text-slate-900 mb-2 group-hover:text-[#BF1737] transition-colors">{stat.val}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US / COMMITMENTS ─── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
          <div className="space-y-4 mb-14">
            <div className="flex items-center gap-4 justify-center">
              <div className="w-10 h-[2px] bg-[#BF1737]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#BF1737]">Pourquoi nous choisir</span>
              <div className="w-10 h-[2px] bg-[#BF1737]" />
            </div>
            <h2 className="text-5xl font-bold text-slate-900 leading-tight">Nos Engagements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Livraison Express', desc: '24-48h sur Casablanca, 2-5 jours partout au Maroc.', num: '01' },
              { title: 'Qualité Certifiée', desc: 'Produits conformes aux normes EN/ISO. Garantie constructeur.', num: '02' },
              { title: 'Prix Grossiste', desc: 'Tarifs imbattables et remises sur volume.', num: '03' },
              { title: 'Support Professionnel', desc: 'Équipe dédiée disponible pour conseils et commandes.', num: '04' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-[#BF1737]/20 hover:shadow-2xl hover:shadow-[#BF1737]/5 transition-all duration-500 text-left relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 text-6xl font-black text-[#BF1737]/10 transition-colors group-hover:text-[#BF1737]/20">{item.num}</span>
                <div className="w-12 h-1 bg-[#BF1737]/10 group-hover:w-20 group-hover:bg-[#BF1737] transition-all duration-500 mb-6 rounded-full" />
                <h3 className="text-slate-900 font-bold text-lg mb-3 leading-tight group-hover:text-[#BF1737] transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
