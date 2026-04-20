'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, type Order, type ProductStats, type OrderStats, type Product } from '../lib/api';

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order['status'] }) {
  const styles: Record<Order['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ products: Product[], orders: Order[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [pStats, oStats, orders] = await Promise.all([
          api.getProductStats(),
          api.getOrderStats(),
          api.getOrders(1, 5),
        ]);
        setProductStats(pStats);
        setOrderStats(oStats);
        setRecentOrders(orders.data);
      } catch {
        setError('Failed to connect to the backend. Make sure the server is running on port 3001.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [products, orders] = await Promise.all([
          api.getProducts({ search: searchQuery, limit: 5 }),
          api.getOrders(1, 5, undefined, searchQuery)
        ]);
        setSearchResults({
          products: products.data,
          orders: orders.data
        });
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <main className="flex-1 flex flex-col overflow-y-auto" onClick={() => setShowResults(false)}>
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-slate-900 text-lg font-bold">Dashboard Overview</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-80" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full h-10 pl-10 pr-10 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400 transition-all" 
              placeholder="Search orders, products..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="max-h-[min(70vh,500px)] overflow-y-auto p-2 scrollbar-hide">
                  
                  {/* Orders Section */}
                  <div className="mb-4">
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders</span>
                      <Link href="/admin/orders" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                    </div>
                    {searchResults.orders.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500 italic">No orders found</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.orders.map(order => (
                          <Link 
                            key={order.id} 
                            href={`/admin/orders?search=${encodeURIComponent(order.customerName)}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{order.customerName}</p>
                              <p className="text-[10px] text-slate-500 truncate">#{String(order.id).padStart(4, '0')} • €{Number(order.totalPrice).toFixed(2)}</p>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors uppercase">
                              {order.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Products Section */}
                  <div>
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Products</span>
                      <Link href="/admin/products" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                    </div>
                    {searchResults.products.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500 italic">No products found</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.products.map(product => (
                          <Link 
                            key={product.id} 
                            href={`/admin/products?search=${encodeURIComponent(product.name)}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                          >
                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                              {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <span className="material-symbols-outlined text-[18px]">image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{product.category?.name || 'Uncategorized'} • €{Number(product.price).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-bold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Products */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">inventory</span></div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Products</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold mt-1">{productStats?.total.toLocaleString() ?? '—'}</p>}
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">list_alt</span></div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Orders</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold mt-1">{orderStats?.total.toLocaleString() ?? '—'}</p>}
            </div>
          </div>

          {/* Orders Today */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">today</span></div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Orders Today</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold mt-1">{orderStats?.todayCount ?? '—'}</p>}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">payments</span></div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-slate-900 text-2xl font-bold mt-1">€{orderStats ? orderStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</p>}
            </div>
          </div>
        </div>

        {/* Recent Orders table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-slate-900 text-lg font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-primary text-sm font-semibold hover:underline">View All Orders</Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p>No orders found. Add some orders through the API.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">#{String(order.id).padStart(4, '0')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">€{Number(order.totalPrice).toFixed(2)}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              {loading ? 'Loading...' : `Showing ${recentOrders.length} of ${orderStats?.total ?? 0} orders`}
            </p>
            <Link href="/admin/orders" className="px-3 py-1 text-xs bg-primary text-white rounded hover:opacity-90 transition-opacity">View All</Link>
          </div>
        </div>

      </div>
    </main>
  );
}


