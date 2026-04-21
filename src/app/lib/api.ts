const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    parentId: number | null;
    parent?: Category | null;
    children?: Category[];
    createdAt: string;
    products?: any[]; // For count calculation
}

export interface Product {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    oldPrice?: number | null;
    stock: number;
    imageUrl: string | null;
    imageUrls: string[];
    category: Category | null;
    categoryId: number | null;
    brand: Brand | null;
    brandId: number | null;
    onSale: boolean;
    ecoFriendly: boolean;
    tags: string[];
    description: string | null;
    createdAt: string;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    ecoFriendly?: boolean;
    sort?: string;
}

export interface Order {
    id: number;
    customerName: string;
    email: string;
    phone: string | null;
    address: string | null;
    invoiceReference: string | null;
    items: any;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string | null;
    excerpt: string | null;
    imageUrl: string | null;
    status: string; // Draft, Published
    author: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    publishDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsletterSubscriber {
    id: number;
    email: string;
    subscribedAt: string;
}

export interface Tip {
    id: number;
    content: string;
    authorName: string;
    authorRole: string;
    isActive: boolean;
    createdAt: string;
}

export interface TagCount {
    tag: string;
    count: number;
}

export interface Brand {
    id: number;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StoreSettings {
    id: number;
    storeName: string;
    supportEmail: string;
    phoneNumber: string;
    address: string;
    logoUrl: string | null;
    description: string | null;
    updatedAt: string;
}

export interface ProductStats {
    total: number;
    lowStock: number;
    outOfStock: number;
    active: number;
}

export interface OrderStats {
    total: number;
    pending: number;
    revenue: number;
    inTransit: number;
    todayCount: number;
}

export interface AnalyticsData {
    kpis: {
        totalRevenue: number;
        revenueTrend: number;
        avgOrderValue: number;
        orderTrend: number;
        conversionRate: number;
        conversionTrend: number;
        pendingOrders: number;
        pendingTrend: number;
        newCustomers: number;
        customerTrend: number;
        totalOrders: number;
        totalOrdersTrend: number;
        totalProducts: number;
    };
    trendData: {
        date: string;
        revenue: string;
        orders: string;
    }[];
    salesByCategory: {
        name: string;
        value: string;
    }[];
    topProducts: {
        id: number;
        name: string;
        category: string;
        sales: number;
        imageUrl: string | null;
    }[];
    inventoryHealth: {
        lowStock: number;
        outOfStock: number;
        healthy: number;
    };
    categoryDistribution: {
        name: string;
        count: string;
    }[];
}

export interface Review {
    id: number;
    productId: number;
    name: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    product?: Product;
}

import Cookies from 'js-cookie';

// ─── Image URL Helper ─────────────────────────────────────────────────────────

/**
 * Converts a relative /uploads/... path to a full URL using the API base.
 * External URLs (http/https/data:) are returned as-is.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    // Relative path like /uploads/file.jpg → http://localhost:3002/uploads/file.jpg
    return `${API_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

/** Recursively walk an object and fix any field named imageUrl or logoUrl. */
function fixImageUrls<T>(data: T): T {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) return data.map(fixImageUrls) as unknown as T;
    if (typeof data === 'object') {
        const obj = data as Record<string, any>;
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            if ((key === 'imageUrl' || key === 'logoUrl') && typeof obj[key] === 'string') {
                result[key] = normalizeImageUrl(obj[key]);
            } else if (typeof obj[key] === 'object') {
                result[key] = fixImageUrls(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result as T;
    }
    return data;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = Cookies.get('auth_token');
    
    const baseUrl = API_BASE.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    const url = `${baseUrl}/${cleanPath}`;
    
    const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error ${res.status}: ${path}`);
    }
    
    // Handle 204 No Content or empty responses
    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
        return {} as T;
    }
    
    const text = await res.text();
    if (!text) return {} as T;
    
    try {
        const json = JSON.parse(text);
        return fixImageUrls(json) as T;
    } catch (e) {
        return {} as any;
    }
}

export const api = {
    // Products
    getProducts: (query: ProductQuery & { active?: boolean } = {}) => {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        if (!query.page) params.append('page', '1');
        if (!query.limit) params.append('limit', '8');

        return apiFetch<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    },
    getProductStats: () => apiFetch<ProductStats>('/products/stats'),
    getTags: () => apiFetch<string[]>('/products/tags'),
    getProductById: (id: string | number) =>
        apiFetch<Product>(`/products/${id}`),
    createProduct: (data: Partial<Product> & { categoryName?: string }) =>
        fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to create product');
            return res.json() as Promise<Product>;
        }),
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('auth_token');
        return fetch(`${API_BASE}/upload`, {
            method: 'POST',
            ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
            body: formData,
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed to upload image');
            const json = await res.json() as { url: string; filename: string };
            // Normalize relative URL to full URL
            json.url = normalizeImageUrl(json.url) || json.url;
            return json;
        });
    },
    uploadImages: (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const token = Cookies.get('auth_token');
        return fetch(`${API_BASE}/upload/multiple`, {
            method: 'POST',
            ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
            body: formData,
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed to upload images');
            const json = await res.json() as { url: string; filename: string }[];
            // Normalize relative URLs to full URLs
            return json.map(item => ({
                ...item,
                url: normalizeImageUrl(item.url) || item.url
            }));
        });
    },
    updateProduct: (id: number, data: Partial<Product> & { categoryName?: string }) =>
        fetch(`${API_BASE}/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to update product');
            return res.json() as Promise<Product>;
        }),
    deleteProduct: (id: number) =>
        fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to delete product');
        }),

    // Orders
    getOrders: (page = 1, limit = 10, status?: string, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        return apiFetch<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    },
    getOrderStats: () => apiFetch<OrderStats>('/orders/stats'),
    getOrderById: (id: string | number) => apiFetch<Order>(`/orders/${id}`),
    createOrder: (data: Partial<Order>) => apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: number, status: Order['status'], email?: string) => apiFetch<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, email }),
    }),
    resendInvoice: (id: number) => apiFetch<{ success: boolean; message: string }>(`/orders/${id}/resend-invoice`, {
        method: 'POST',
    }),

    // Categories
    getCategories: (activeOnly = false) => {
        const query = activeOnly ? '?active=true' : '';
        return apiFetch<Category[]>(`/categories${query}`);
    },
    getUniqueCategories: () => apiFetch<string[]>('/blog/categories/unique'),
    createCategory: (data: { name: string; description?: string; isActive?: boolean; parentId?: number | null }) =>
        fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to create category');
            return res.json() as Promise<Category>;
        }),
    updateCategory: (id: number, data: { name?: string; description?: string; isActive?: boolean; parentId?: number | null }) =>
        fetch(`${API_BASE}/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to update category');
            return res.json() as Promise<Category>;
        }),
    deleteCategory: (id: number) =>
        fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE',
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to delete category');
        }),

    // Blog
    getPosts: (page = 1, limit = 6, search?: string, tag?: string, category?: string, sort?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (tag) params.append('tag', tag);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);

        return apiFetch<PaginatedResponse<BlogPost>>(`/blog?${params.toString()}`);
    },

    getPostBySlug: (slug: string) => {
        const url = `${API_BASE}/blog/slug/${slug}`;
        console.log(`[API] Fetching post by slug from: ${url}`);
        return fetch(url).then((res) => {
            if (!res.ok) {
                console.error(`[API ERROR] Status ${res.status} for URL ${url}`);
                throw new Error('Failed to fetch post by slug');
            }
            return res.json() as Promise<BlogPost>;
        }).catch(err => {
            console.error(`[API EXCEPTION] ${err.message} for URL ${url}`);
            throw err;
        });
    },

    createPost: (data: Partial<BlogPost>) =>
        fetch(`${API_BASE}/blog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to create post');
            return res.json() as Promise<BlogPost>;
        }),

    updatePost: (id: number, data: Partial<BlogPost>) =>
        fetch(`${API_BASE}/blog/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to update post');
            return res.json() as Promise<BlogPost>;
        }),

    deletePost: (id: number) =>
        fetch(`${API_BASE}/blog/${id}`, {
            method: 'DELETE',
        }).then((res) => {
            if (!res.ok) throw new Error('Failed to delete post');
        }),

    // Analytics
    getAnalytics: (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiFetch<AnalyticsData>(`/analytics/dashboard${query}`);
    },

    // Brands
    getBrands: () => apiFetch<Brand[]>('/brands'),
    getActiveBrands: () => apiFetch<Brand[]>('/brands/active'),
    createBrand: (data: { name: string; logoUrl?: string; isActive?: boolean }) =>
        apiFetch<Brand>('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateBrand: (id: number, data: { name?: string; logoUrl?: string; isActive?: boolean }) =>
        apiFetch<Brand>(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteBrand: (id: number) =>
        apiFetch<void>(`/brands/${id}`, {
            method: 'DELETE',
        }),

    // Newsletter
    subscribeNewsletter: (email: string) =>
        apiFetch<NewsletterSubscriber>('/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
    getNewsletterSubscribers: () => apiFetch<NewsletterSubscriber[]>('/newsletter/subscribers'),
    getNewsletterStats: () => apiFetch<{ count: number }>('/newsletter/stats'),
    deleteSubscriber: (id: number) =>
        apiFetch<void>(`/newsletter/subscribers/${id}`, {
            method: 'DELETE',
        }),

    // Tags
    getPopularTags: () => apiFetch<TagCount[]>('/blog/tags'),

    // Tips
    getActiveTip: () =>
        fetch(`${API_BASE}/tips/active`).then(async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            return data as Tip | null;
        }),
    getTips: () => apiFetch<Tip[]>('/tips'),
    createTip: (data: Partial<Tip>) =>
        apiFetch<Tip>('/tips', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateTip: (id: number, data: Partial<Tip>) =>
        apiFetch<Tip>(`/tips/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteTip: (id: number) =>
        fetch(`${API_BASE}/tips/${id}`, {
            method: 'DELETE',
        }).then(async (res) => {
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to delete tip');
            }
        }),

    // Settings
    getSettings: () => apiFetch<StoreSettings>('/settings'),
    updateSettings: (data: Partial<StoreSettings>) => apiFetch<StoreSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    // Reviews
    submitReview: (data: { productId: number; name: string; rating: number; comment: string }) =>
        apiFetch<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getProductReviews: (productId: number | string) =>
        apiFetch<Review[]>(`/reviews/product/${productId}`), // Backend naturally filters to 'approved' only
    getAllReviews: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return apiFetch<Review[]>(`/reviews${query}`); // Admin
    },
    updateReviewStatus: (id: number, status: 'pending' | 'approved' | 'rejected') =>
        apiFetch<Review>(`/reviews/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    deleteReview: (id: number) =>
        apiFetch<void>(`/reviews/${id}`, {
            method: 'DELETE',
        }),
};
