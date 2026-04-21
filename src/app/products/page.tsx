'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Product, type Category, type Brand } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { ShoppingCart, ChevronRight, ChevronDown, MessageCircle, Filter, SlidersHorizontal, Sliders, X, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import ProductRating from '../components/ProductRating';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Sub-Components ─────────────────────────────────────────────────────────────────

function CategoryTreeItem({
  category,
  selectedId,
  onSelect,
  level = 0
}: {
  category: Category;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleToggle = () => {
    onSelect(category.id);
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center group">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center gap-3 py-2 text-[15px] transition-all text-left ${isSelected
            ? 'font-bold text-[#BF1737]'
            : 'font-normal text-slate-500 hover:text-slate-900 focus:text-[#BF1737]'
            }`}
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <span className={`transition-colors flex items-center justify-center shrink-0 ${isSelected ? 'text-[#BF1737]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {hasChildren && isOpen ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
          </span>
          <span className="truncate">{category.name}</span>
        </button>
      </div>

      {/* Animated subcategories wrapper */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${hasChildren && isOpen
          ? 'grid-rows-[1fr] opacity-100 mt-1'
          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
      >
        <div className="overflow-hidden">
          {hasChildren && category.children!.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const initialBrandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : null;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [brandId, setBrandId] = useState<number | null>(initialBrandId);
  const [sort, setSort] = useState('newest');

  // Advanced Filters
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [ecoFriendly, setEcoFriendly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync with URL params (e.g. from Header search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
    const urlBrand = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : null;

    if (urlSearch !== search) setSearch(urlSearch);
    if (urlCategory !== categoryId) setCategoryId(urlCategory);
    if (urlBrand !== brandId) setBrandId(urlBrand);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, brandId, sort, minPrice, maxPrice, inStock, onSale, ecoFriendly, limit]);

  // Load Categories & Brands
  useEffect(() => {
    api.getCategories(true).then(setCategories).catch(console.error);
    api.getActiveBrands().then(setBrands).catch(console.error);
  }, []);

  // Load Products
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock || undefined,
        onSale: onSale || undefined,
        ecoFriendly: ecoFriendly || undefined,
        sort: sort || undefined,
        active: true,
      });
      setProducts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / limit));

      // Fetch categories with products count logic (handled via caching in a real app, but fetched here)
      const cachedCategories = await api.getCategories(true);
      setCategories(cachedCategories);

    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, brandId, minPrice, maxPrice, inStock, onSale, ecoFriendly, sort, limit]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load Latest Products (Sidebar)
  useEffect(() => {
    api.getProducts({ sort: 'newest', limit: 4 })
      .then(res => setLatestProducts(res.data))
      .catch(console.error);
  }, []);

  // Derived hierarchical categories
  const categoryTree = useMemo(() => {
    const buildTree = (items: Category[], parentId: number | null = null): Category[] => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    return buildTree(categories);
  }, [categories]);

  // Helper for Pagination Display
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, page + 1);

    if (page === 1) end = Math.min(3, totalPages);
    if (page === totalPages) start = Math.max(1, totalPages - 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-bold shadow-sm transition-colors ${page === i
            ? 'bg-[#BF1737] text-white shadow-[#BF1737]/20'
            : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <nav className="flex items-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_left</span>
        </button>

        {start > 1 && (
          <>
            <button onClick={() => setPage(1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">1</button>
            {start > 2 && <span className="flex h-10 w-6 items-center justify-center text-slate-400 font-bold">...</span>}
          </>
        )}

        {pages}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="flex h-10 w-6 items-center justify-center text-slate-400 font-bold">...</span>}
            <button onClick={() => setPage(totalPages)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
        </button>
      </nav>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white font-sans text-slate-900 selection:bg-[#BF1737]/20 selection:text-slate-900">

      {/* Mobile Sticky Filter Bar - Visible only on mobile/tablet */}
      <div className="xl:hidden sticky top-[115px] sm:top-[135px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:border-[#BF1737] transition-all"
          >
            <Filter size={18} className="text-[#BF1737]" />
            Filtrer
          </button>
          
          <div className="flex-1 relative">
            <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full flex items-center justify-center gap-2 h-11 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:border-[#BF1737] transition-all"
            >
                <ArrowUpDown size={18} className="text-slate-400" />
                <span>{
                  sort === 'newest' ? 'Derniers' :
                    sort === 'priceAsc' ? 'Prix: Min' :
                      sort === 'priceDesc' ? 'Prix: Max' : 'Trier'
                }</span>
            </button>
            {isSortOpen && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[100] bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                {[
                  { label: 'Derniers', value: 'newest' },
                  { label: 'Prix : décroissant', value: 'priceDesc' },
                  { label: 'Prix : croissant', value: 'priceAsc' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-[14px] font-medium transition-colors hover:bg-slate-50 ${sort === option.value ? 'text-[#BF1737] bg-slate-50/50' : 'text-slate-600'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-2 py-6 sm:py-8 sm:px-4 lg:px-6">
        <div className="flex flex-col xl:flex-row gap-10">

          {/* Sidebar / Filter Drawer */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`
            fixed inset-0 z-[150] bg-white transition-transform duration-300 xl:relative xl:z-0 xl:translate-x-0 xl:w-[260px] xl:shrink-0 xl:block xl:sticky xl:top-[120px] xl:h-fit
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            overflow-y-auto xl:overflow-visible custom-scrollbar
          `}>
            {/* Mobile Sidebar Header */}
            <div className="xl:hidden flex items-center justify-between p-5 border-b border-slate-100 bg-[#BF1737] text-white">
                <div className="flex items-center gap-2">
                    <Sliders size={20} />
                    <span className="text-[17px] font-black uppercase tracking-widest">Filtres</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 xl:p-0 space-y-10">
              {/* Categories */}
              <div>
                <div className="mb-6">
                  <h3 className="text-[20px] font-bold text-[#1D1D1D] mb-3 font-display">Parcourir les catégories</h3>
                  <div className="h-[1px] w-full bg-slate-100 relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-[#BF1737]"></div>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                  <div className="space-y-1">
                    <button
                      onClick={() => setCategoryId(null)}
                      className={`w-full flex items-center gap-2 py-2 text-[16px] transition-colors ${categoryId === null ? 'font-bold text-[#BF1737]' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${categoryId === null ? 'text-[#BF1737]' : 'text-slate-400'}`}>grid_view</span> Tous les produits
                    </button>
                    {categoryTree.map(cat => (
                      <CategoryTreeItem
                        key={cat.id}
                        category={cat}
                        selectedId={categoryId}
                        onSelect={setCategoryId}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              <div>
                <div className="mb-6 mt-10">
                  <h3 className="text-[20px] font-bold text-[#1D1D1D] mb-3 font-display">Marques</h3>
                  <div className="h-[1px] w-full bg-slate-100 relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-[#BF1737]"></div>
                  </div>
                </div>
                <div className="h-[200px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                  <div className="space-y-1">
                    <button
                      onClick={() => setBrandId(null)}
                      className={`w-full flex items-center gap-2 py-2 text-[16px] transition-colors ${brandId === null ? 'font-bold text-[#BF1737]' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                    >
                      Toutes les marques
                    </button>
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => setBrandId(brand.id)}
                        className={`w-full flex items-center gap-2 py-2 text-[16px] transition-colors ${brandId === brand.id ? 'font-bold text-[#BF1737]' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters / Price Range */}
              <div>
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold text-[#1D1D1D] mb-3 font-display">Filtres</h3>
                  <div className="h-[1px] w-full bg-slate-100 relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-[#BF1737]"></div>
                  </div>
                </div>

                <div className="px-1">
                  <h4 className="text-[17px] font-bold text-[#1D1D1D] mb-5 font-display">Prix</h4>

                  <div className="flex items-center gap-3 mb-8">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={minPrice?.toLocaleString() || '0'}
                        onChange={(e) => setMinPrice(Number(e.target.value.replace(/\D/g, '')))}
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white text-center text-[15px] font-medium text-slate-900 outline-none focus:border-[#BF1737] transition-colors"
                      />
                    </div>
                    <span className="text-slate-400 font-bold">—</span>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={maxPrice?.toLocaleString() || '1000'}
                        onChange={(e) => setMaxPrice(Number(e.target.value.replace(/\D/g, '')))}
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white text-center text-[15px] font-medium text-slate-900 outline-none focus:border-[#BF1737] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="relative h-1 w-full bg-slate-200 rounded-full">
                    <div
                      className="absolute h-full bg-[#BF1737] rounded-full"
                      style={{
                        left: `${((minPrice || 0) / 1000) * 100}%`,
                        right: `${100 - (((maxPrice || 1000) / 1000) * 100)}%`
                      }}
                    ></div>

                    {/* Min Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={minPrice || 0}
                      onChange={(e) => setMinPrice(Math.min(Number(e.target.value), (maxPrice || 1000)))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer pointer-events-auto z-30"
                    />

                    {/* Max Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={maxPrice || 1000}
                      onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), (minPrice || 0)))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer pointer-events-auto z-30"
                    />

                    {/* Visual Thumbs */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full bg-[#BF1737] ring-4 ring-[#BF1737]/20 cursor-pointer shadow-sm pointer-events-none z-20"
                      style={{ left: `${((minPrice || 0) / 1000) * 100}%` }}
                    ></div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full bg-[#BF1737] ring-4 ring-[#BF1737]/20 cursor-pointer shadow-sm pointer-events-none z-20"
                      style={{ left: `${((maxPrice || 1000) / 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-5">Availability</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${inStock ? 'border-[#BF1737] bg-[#BF1737]' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                      {inStock && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                    </div>
                    <span className={`text-[14px] font-bold transition-colors ${inStock ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>In Stock</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${onSale ? 'border-[#BF1737] bg-[#BF1737]' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                      {onSale && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                    </div>
                    <span className={`text-[14px] font-bold transition-colors ${onSale ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>On Sale</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={ecoFriendly} onChange={(e) => setEcoFriendly(e.target.checked)} />
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${ecoFriendly ? 'border-[#BF1737] bg-[#BF1737]' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                      {ecoFriendly && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                    </div>
                    <span className={`text-[14px] font-bold transition-colors ${ecoFriendly ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>Eco-Friendly</span>
                  </label>
                </div>
              </div>

              {/* Latest Products - Sidebar Section */}
              <div className="hidden xl:block">
                <div className="mb-6">
                  <h3 className="text-[20px] font-bold text-[#1D1D1D] mb-3 font-display">Derniers produits</h3>
                  <div className="h-[1px] w-full bg-slate-100 relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-[#BF1737]"></div>
                  </div>
                </div>

                <div className="space-y-6">
                  {latestProducts.map(product => {
                    const price = Number(product.price);
                    const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
                    return (
                      <a key={product.id} href={`/products/${product.id}`} className="flex gap-4 group">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-300 bg-[#F8F9FA] p-1 transition-all group-hover:border-[#BF1737]/20 group-hover:shadow-md">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <span className="material-symbols-outlined text-[32px]">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-1 line-clamp-2 transition-colors group-hover:text-[#BF1737]">{product.name}</h4>
                          <ProductRating productId={product.id} className="mb-1" starSize={14} textSize="text-[11px]" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-black text-[#BF1737]">{price.toFixed(2).replace('.', ',')} MAD</span>
                            {oldPrice && oldPrice > price && (
                              <span className="text-[12px] font-medium text-slate-400 line-through">{(oldPrice).toFixed(2).replace('.', ',')} MAD</span>
                            )}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Mobile "Apply" Button */}
              <div className="xl:hidden pt-4 pb-10">
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full py-4 bg-[#BF1737] text-white font-black rounded-2xl shadow-lg shadow-[#BF1737]/20 uppercase tracking-widest"
                >
                    Afficher les produits
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Grid Area */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-1">
              <div>
                <h2 className="text-[28px] font-black text-slate-900 tracking-tight">
                  {categoryId ? (categories.find(c => c.id === categoryId)?.name || 'Boutique') : 'Boutique'}
                </h2>
              </div>

              <div className="hidden xl:flex flex-wrap items-center gap-3">
                {/* View Mode Toggle Pill */}
                <div className="flex items-center gap-1 bg-[#F0F2F5] p-1 rounded-full border border-slate-100 hover:border-[#BF1737] shadow-inner mr-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${viewMode === 'grid' ? 'text-[#BF1737]' : ''}`}>grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${viewMode === 'list' ? 'text-[#BF1737]' : ''}`}>view_list</span>
                  </button>
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-3 text-[13px] font-bold text-slate-700 outline-none hover:border-[#BF1737] transition-all cursor-pointer min-w-[140px] justify-between focus:border-[#BF1737] focus:ring-1 focus:ring-[#BF1737]/20"
                  >
                    <span>{
                      sort === 'newest' ? 'Derniers' :
                        sort === 'priceAsc' ? 'Prix: croissant' :
                          sort === 'priceDesc' ? 'Prix: décroissant' :
                            sort === 'alpha' ? 'Alphabétique' :
                              sort === 'relevance' ? 'Pertinence' :
                                sort === 'rating' ? 'Les mieux notés' : 'Derniers'
                    }</span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {isSortOpen && (
                    <div className="absolute top-[calc(100%+12px)] right-0 z-[100] min-w-[180px] bg-white/80 backdrop-blur-xl rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 py-2 animate-in fade-in zoom-in duration-200 origin-top">
                      {/* Arrow Pointer */}
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white/80 backdrop-blur-xl border-t border-l border-white/40 rotate-45"></div>

                      {[
                        { label: 'Alphabétique', value: 'alpha' },
                        { label: 'Derniers', value: 'newest' },
                        { label: 'Prix : décroissant', value: 'priceDesc' },
                        { label: 'Prix : croissant', value: 'priceAsc' },
                        { label: 'Pertinence', value: 'relevance' },
                        { label: 'Les mieux notés', value: 'rating' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSort(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-slate-50 ${sort === option.value ? 'text-[#BF1737] bg-slate-50/50' : 'text-slate-600'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Limit Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLimitOpen(!isLimitOpen)}
                    onBlur={() => setTimeout(() => setIsLimitOpen(false), 200)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-3 text-[13px] font-bold text-slate-700 outline-none hover:border-[#BF1737] transition-all cursor-pointer min-w-[70px] justify-between focus:border-[#BF1737] focus:ring-1 focus:ring-[#BF1737]/20"
                  >
                    <span>{limit}</span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isLimitOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {isLimitOpen && (
                    <div className="absolute top-[calc(100%+12px)] right-0 z-[100] min-w-[80px] bg-white/80 backdrop-blur-xl rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 py-2 animate-in fade-in zoom-in duration-200 origin-top">
                      {/* Arrow Pointer */}
                      <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white/80 backdrop-blur-xl border-t border-l border-white/40 rotate-45"></div>

                      {[10, 20, 30, 40, 50].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            setLimit(val);
                            setIsLimitOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-slate-50 ${limit === val ? 'text-[#BF1737] bg-slate-50/50' : 'text-slate-600'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid Area ... */}
            {loading ? (
              <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`animate-pulse bg-white p-4 ${viewMode === 'grid' ? 'h-[250px] sm:h-[380px] flex flex-col' : 'h-[160px] sm:h-[200px] flex gap-4 sm:gap-6'} rounded-[20px] border border-slate-100 shadow-sm`}>
                    <div className={`${viewMode === 'grid' ? 'w-full h-[60%] mb-4' : 'h-full w-32 sm:w-48'} bg-slate-100 rounded-[12px]`}></div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                      <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                      <div className="mt-auto flex justify-between items-end">
                        <div className="h-6 w-1/3 bg-slate-100 rounded"></div>
                        <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-white rounded-[24px] border border-slate-100">
                <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-slate-200 mb-4">inventory_2</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">No products found</h3>
                <p className="text-[14px] sm:text-[16px] text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                <button 
                    onClick={() => { setCategoryId(null); setBrandId(null); setSearch(''); setMinPrice(null); setMaxPrice(null); setInStock(false); setOnSale(false); setEcoFriendly(false); }} 
                    className="mt-6 px-6 py-2.5 bg-[#BF1737] text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                >
                    Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="h-full"
                  >
                    <ProductCard product={product} viewMode="grid" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="h-full"
                  >
                    <ProductCard product={product} viewMode="list" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination Controls */}
            {products.length > 0 && !loading && (
              <div className="mt-10 sm:mt-14 mb-4 flex items-center justify-center -mx-2 sm:mx-0 overflow-x-auto pb-4">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4332]"></div></div>}>
      <ProductListingContent />
    </Suspense>
  );
}
