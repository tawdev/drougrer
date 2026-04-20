'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts';
import { api, type AnalyticsData } from '../../lib/api';

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="flex-1 flex flex-col bg-white border border-slate-200 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">
                    {new Date(label).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <div className="space-y-2">
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[12px] font-bold text-slate-500">{item.name}</span>
                            </div>
                            <span className="text-[14px] font-black text-slate-900">
                                {item.name === 'Revenue' ? `${parseFloat(item.value).toLocaleString()} MAD` : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState('Last 30 Days');
    const [customRange, setCustomRange] = useState<{ from?: string; to?: string }>({});

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            let from: string | undefined;
            let to: string | undefined;

            const now = new Date();
            if (activeRange === 'Last 30 Days') {
                const start = new Date();
                start.setDate(now.getDate() - 30);
                from = start.toISOString();
                to = now.toISOString();
            } else if (activeRange === 'Last 90 Days') {
                const start = new Date();
                start.setDate(now.getDate() - 90);
                from = start.toISOString();
                to = now.toISOString();
            } else if (activeRange === 'Year to Date') {
                from = new Date(now.getFullYear(), 0, 1).toISOString();
                to = now.toISOString();
            } else if (activeRange === 'Custom' && customRange.from && customRange.to) {
                from = new Date(customRange.from).toISOString();
                to = new Date(customRange.to).toISOString();
            }

            const res = await api.getAnalytics(from, to);
            setData(res);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeRange !== 'Custom') {
            loadAnalytics();
        }
    }, [activeRange]);

    // Format trend data for Recharts
    const chartData = useMemo(() => {
        if (!data?.trendData) return [];
        return data.trendData.map(p => ({
            date: p.date,
            Revenue: parseFloat(p.revenue),
            Orders: parseInt(p.orders)
        }));
    }, [data]);

    return (
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-[32px] font-black text-slate-900 leading-tight">Analytics Overview</h2>
                        <p className="text-slate-400 font-bold mt-1">Real-time performance metrics for your hardware store.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                        {['Last 30 Days', 'Last 90 Days', 'Year to Date'].map(range => (
                            <button
                                key={range}
                                onClick={() => setActiveRange(range)}
                                className={`px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeRange === range ? 'bg-slate-50 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {range}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <button
                            onClick={() => setActiveRange('Custom')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeRange === 'Custom' ? 'bg-slate-50 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            <span className="text-[13px] font-extrabold uppercase tracking-tight">Custom Range</span>
                        </button>
                    </div>
                </header>

                {activeRange === 'Custom' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-6 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Start Date</label>
                            <input
                                type="date"
                                value={customRange.from || ''}
                                onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">End Date</label>
                            <input
                                type="date"
                                value={customRange.to || ''}
                                onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-slate-700"
                            />
                        </div>
                        <button
                            onClick={loadAnalytics}
                            disabled={!customRange.from || !customRange.to}
                            className="px-8 py-3 bg-primary text-white text-sm font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            APPLY FILTER
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-[400px] rounded-xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Skeleton className="h-[500px] rounded-xl" />
                            <Skeleton className="h-[500px] rounded-xl" />
                        </div>
                    </div>
                ) : data && data.kpis.totalProducts > 0 ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Revenue', value: `${data.kpis.totalRevenue.toLocaleString()}`, suffix: 'MAD', trend: data.kpis.revenueTrend, trendText: `Vs previous ${activeRange}`, icon: 'payments', iconClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
                                { label: 'Avg. Order Value', value: `${data.kpis.avgOrderValue.toFixed(2)}`, suffix: 'MAD', trend: data.kpis.orderTrend, trendText: 'Vs previous period', icon: 'analytics', iconClass: 'text-blue-500', bgClass: 'bg-blue-50' },
                                { label: 'Total Orders', value: `${data.kpis.totalOrders.toLocaleString()}`, suffix: 'Orders', trend: data.kpis.totalOrdersTrend, trendText: `Vs previous ${activeRange}`, icon: 'shopping_cart', iconClass: 'text-purple-500', bgClass: 'bg-purple-50' },
                                { label: 'Pending Orders', value: data.kpis.pendingOrders.toLocaleString(), suffix: 'Orders', trend: data.kpis.pendingTrend, trendText: 'Vs end of prev period', icon: 'pending_actions', iconClass: 'text-orange-500', bgClass: 'bg-orange-50' },
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{card.label}</span>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-0.5 ${card.trend >= 0 ? 'bg-emerald-100/50 text-emerald-600' : 'bg-rose-100/50 text-rose-600'}`}>
                                            {card.trend >= 0 ? '+' : ''}{card.trend.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-[28px] font-black text-slate-900 tracking-tight">{card.value}</span>
                                        <span className="text-xs font-bold text-slate-400 ml-1">{card.suffix}</span>
                                    </div>
                                    {card.trendText && <p className="text-[11px] font-bold text-slate-400/80 mb-2">{card.trendText}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Revenue Trend Chart */}
                        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-none mb-2">Revenue & Orders Trend</h3>
                                    <p className="text-[13px] font-bold text-slate-400">Analysis for {activeRange}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-[#3B82F6]" />
                                        <span className="text-[12px] font-bold text-slate-500">Revenue (MAD)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-[#FB923C]" />
                                        <span className="text-[12px] font-bold text-slate-500">Orders Count</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                                tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                                dy={15}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                                tickFormatter={(val) => `${val.toLocaleString()} MAD`}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                                tickFormatter={(val) => val}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="Revenue"
                                                stroke="#3B82F6"
                                                strokeWidth={4}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 3, stroke: '#fff' }}
                                                animationDuration={1500}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="Orders"
                                                stroke="#FB923C"
                                                strokeWidth={3}
                                                dot={false}
                                                strokeDasharray="5 5"
                                                activeDot={{ r: 5, fill: '#FB923C', strokeWidth: 2, stroke: '#fff' }}
                                                animationDuration={1500}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                                        <p className="text-slate-400 font-bold">Not enough data for this range</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Sales by Category */}
                            <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <h3 className="text-xl font-black text-slate-900 leading-none">Sales by Category</h3>
                                    <button className="text-[11px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest border-b border-slate-200 pb-1">Historical Rank</button>
                                </div>
                                <div className="space-y-8 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                    {data.salesByCategory.map((cat, i) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[14px] font-bold text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                                                <span className="text-[15px] font-black text-slate-900">{parseFloat(cat.value).toLocaleString()} MAD</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/20 group-hover:bg-primary transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (parseFloat(cat.value) / 1000) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Selling Products */}
                            <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="text-lg font-black text-slate-900 mb-8 shrink-0">Top Selling Products</h3>
                                <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 flex-1 custom-scrollbar">
                                    {data.topProducts.map((product, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                            <span className="material-symbols-outlined text-[18px]">package_2</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-900 line-clamp-1">{product.name}</p>
                                                    <p className="text-[12px] font-medium text-slate-400 uppercase tracking-tighter">{product.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[15px] font-black text-slate-900">{product.sales}</p>
                                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Units Sold</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Inventory Health */}
                            <div className="lg:col-span-4 bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 mb-8">Inventory Health</h3>
                                <div className="space-y-10">
                                    {[
                                        { label: 'Healthy Stock', value: data.inventoryHealth.healthy, total: data.kpis.totalProducts, color: 'bg-emerald-500' },
                                        { label: 'Low Stock', value: data.inventoryHealth.lowStock, total: data.kpis.totalProducts, color: 'bg-orange-400' },
                                        { label: 'Out of Stock', value: data.inventoryHealth.outOfStock, total: data.kpis.totalProducts, color: 'bg-rose-500' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[14px] font-bold text-slate-600">{item.label}</span>
                                                <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">{item.value} ITEMS</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/20 transition-all duration-1000`}
                                                    style={{ width: `${(item.value / item.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Distribution Grid */}
                            <div className="lg:col-span-8 bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="text-xl font-black text-slate-900 mb-8 shrink-0">PRODUCT CLASSIFICATION</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 overflow-y-auto max-h-[386px] pr-2 custom-scrollbar content-start">
                                    {data.categoryDistribution.map((cat, i) => (
                                        <div key={i} className="p-6 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center border border-transparent hover:border-slate-200 transition-all group active:scale-95">
                                            <span className="text-3xl font-black text-slate-900 mb-1 group-hover:scale-110 transition-transform">{cat.count}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words w-full">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : data && data.kpis.totalProducts === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 relative">
                            <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
                            <div className="absolute -top-1 -right-1 size-6 bg-[#BF1737] rounded-full flex items-center justify-center border-4 border-white">
                                <span className="material-symbols-outlined text-[12px] text-white font-black">close</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No Inventory Data Found</h3>
                        <p className="text-slate-400 font-bold text-center max-w-sm px-6 leading-relaxed">
                            It looks like your catalog is currently empty. Add your first products to start tracking sales, inventory health, and performance trends.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                            <a
                                href="/admin/products"
                                className="px-10 py-4 bg-[#BF1737] text-white text-[13px] font-black rounded-2xl hover:bg-[#A3142F] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-[#BF1737]/20 flex items-center gap-2 uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add First Product
                            </a>
                            <button
                                onClick={loadAnalytics}
                                className="px-10 py-4 bg-white text-slate-600 text-[13px] font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Refresh Page
                            </button>
                        </div>
                    </div>
                ) : null}

            </div>
        </main>
    );
}


