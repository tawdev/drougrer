'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, type Order, type OrderStats } from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  User,
  MapPin,
  Phone,
  FileText,
  MoreHorizontal,
  Mail,
  MessageCircle,
  RefreshCw,
  Eye,
  Search
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />;
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20 ring-amber-600/20', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
    confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/20 ring-blue-600/20', text: 'text-blue-700 dark:text-blue-400', icon: Package },
    processing: { bg: 'bg-indigo-50 dark:bg-indigo-900/20 ring-indigo-600/20', text: 'text-indigo-700 dark:text-indigo-400', icon: Package },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-600/20', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
    cancelled: { bg: 'bg-rose-50 dark:bg-rose-900/20 ring-rose-600/20', text: 'text-rose-700 dark:text-rose-400', icon: XCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${s.bg} ${s.text}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Tous', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Confirmés', value: 'confirmed' },
  { label: 'En préparation', value: 'processing' },
  { label: 'Terminés', value: 'completed' },
  { label: 'Annulés', value: 'cancelled' },
];

export default function AdminOrdersPage() {
  const { showToast } = useNotification();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search');

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page on search or filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, o] = await Promise.all([
        api.getOrderStats(),
        api.getOrders(page, 10, statusFilter || undefined, debouncedSearch || undefined),
      ]);
      setStats(s);
      setOrders(o.data);
      setTotal(o.total);
      setTotalPages(o.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the backend.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      setActionLoading(orderId);

      let email: string | undefined = undefined;

      // PRE-CONFIRMATION CHECK: if confirming, we NEED an email
      if (newStatus === 'confirmed') {
        const order = orders.find(o => o.id === orderId);
        if (!order?.email) {
          const userEmail = window.prompt("L'email du client est manquant. Veuillez le saisir pour envoyer la facture :");
          if (!userEmail || !userEmail.includes('@')) {
            showToast("Une adresse email valide est requise pour confirmer la commande.", 'error');
            return;
          }
          email = userEmail;
        }
      }

      await api.updateOrderStatus(orderId, newStatus, email);

      if (newStatus === 'confirmed') {
        showToast('Commande confirmée ! La facture a été envoyée par email au client.', 'success');
      }
      loadData();
    } catch (err: any) {
      showToast(`Erreur: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvoice = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await api.resendInvoice(orderId);
      showToast('Facture renvoyée avec succès !', 'success');
    } catch (err: any) {
      showToast(`Erreur: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background-dark">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase">Gestion des Commandes</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Suivez et gérez les flux de ventes de votre droguerie.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-64"
              placeholder="Chercher client, réf..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 transition-all"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400 mb-6">
          <XCircle size={20} />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Commandes', value: stats?.total?.toLocaleString(), icon: Package, colorClass: 'bg-blue-50 text-blue-600' },
          { label: 'En attente', value: stats?.pending?.toLocaleString(), icon: Clock, colorClass: 'bg-amber-50 text-amber-600' },
          { label: 'Chiffre d\'Affaires', value: stats ? `${Number(stats.revenue).toFixed(2).replace('.', ',')} MAD` : '—', icon: CheckCircle2, colorClass: 'bg-emerald-50 text-emerald-600' },
          { label: 'Aujourd\'hui', value: stats?.todayCount?.toLocaleString(), icon: MoreHorizontal, colorClass: 'bg-indigo-50 text-indigo-600' },
        ].map(({ label, value, icon: Icon, colorClass }) => (
          <div key={label} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            {loading ? <Skeleton className="h-8 w-24 mt-2" /> : <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tighter">{value ?? '—'}</p>}
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center bg-slate-50/30">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-slate-200'}`}
            >{f.label}</button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Réf / Client</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Montant Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading && orders.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-6"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Aucune commande trouvée</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer ${expandedOrder === order.id ? 'bg-slate-50/50' : ''}`} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">
                            {order.invoiceReference || `#${String(order.id).padStart(4, '0')}`}
                          </span>
                          <span className="text-sm font-bold text-slate-500">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-slate-900 dark:text-slate-100">
                        {Number(order.totalPrice).toFixed(2).replace('.', ',')} <span className="text-[10px]">MAD</span>
                      </td>
                      <td className="px-6 py-6"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-all"
                          >
                            {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Content */}
                    {expandedOrder === order.id && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={5} className="px-6 py-8 border-b border-slate-100">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Customer Details */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Informations Client</h4>
                              <div className="space-y-3">
                                <div className="flex gap-3 text-sm font-bold text-slate-700">
                                  <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                  <span>{order.customerName}</span>
                                </div>
                                <div className="flex gap-3 text-sm font-bold text-slate-700">
                                  <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                  <span className="break-all">{order.email}</span>
                                </div>
                                <div className="flex gap-3 text-sm font-bold text-slate-700">
                                  <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                  <span>{order.phone || 'Aucun numéro'}</span>
                                </div>
                                <div className="flex gap-3 text-sm font-bold text-slate-700">
                                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                  <span className="leading-relaxed">{order.address || 'Aucune adresse renseignée'}</span>
                                </div>

                                <div className="pt-2">
                                  <a
                                    href={`https://wa.me/${order.phone?.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customerName || ''}, je vous contacte concernant votre commande ${order.invoiceReference || `#${order.id}`} sur Droguerie Maroc.`)}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all"
                                  >
                                    <MessageCircle size={14} /> Contact WhatsApp
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="lg:col-span-1 border-x border-slate-100 px-8">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Produits commandés</h4>
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {order.items && Array.isArray(order.items) ? order.items.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-xs font-bold py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex gap-2">
                                      <span className="text-slate-400">x{item.quantity}</span>
                                      <span className="text-slate-800">{item.name}</span>
                                    </div>
                                    <span className="text-slate-900">{(item.price * item.quantity).toFixed(2)} MAD</span>
                                  </div>
                                )) : <p className="text-xs text-slate-400 italic">Aucun détail produit trouvé.</p>}
                              </div>
                            </div>

                            {/* Management & Invoice */}
                            <div className="space-y-6">
                              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="bg-red-50 p-2 rounded-lg text-red-500">
                                    <FileText size={18} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Référence Facture</p>
                                    <p className="text-xs font-bold text-slate-900">{order.invoiceReference || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Link
                                    href={`/invoice?orderId=${order.id}`}
                                    className="p-2 text-slate-400 hover:text-[#BF1737] transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-slate-100 rounded-lg"
                                    title="Ouvrir la facture"
                                  >
                                    <Eye size={16} /> Aperçu
                                  </Link>
                                  {(order.status === 'confirmed' || order.status === 'processing' || order.status === 'completed') && (
                                    <button
                                      onClick={() => handleResendInvoice(order.id)}
                                      disabled={actionLoading === order.id}
                                      className="p-2 text-slate-400 hover:text-blue-600 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-slate-100 rounded-lg"
                                      title="Renvoyer la facture par email"
                                    >
                                      <RefreshCw size={16} className={actionLoading === order.id ? 'animate-spin' : ''} /> Renvoyer
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {order.status === 'pending' && (
                                  <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-100 flex flex-col items-center leading-tight"
                                  >
                                    <span>Confirmer & Envoyer Facture</span>
                                  </button>
                                )}
                                {order.status === 'confirmed' && (
                                  <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100"
                                  >
                                    Lancer la préparation
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-100"
                                  >
                                    Marquer comme livré
                                  </button>
                                )}
                                {order.status !== 'cancelled' && order.status !== 'completed' && (
                                  <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                    className="px-4 bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                  >
                                    Annuler
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {loading ? 'Chargement...' : `Affichage ${orders.length > 0 ? (page - 1) * 10 + 1 : 0}–${Math.min(page * 10, total)} sur ${total.toLocaleString()}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setPage((p) => Math.max(1, p - 1)); }}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition-all"
            >Précédent</button>
            <button
              onClick={(e) => { e.stopPropagation(); setPage((p) => Math.min(totalPages, p + 1)); }}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition-all"
            >Suivant</button>
          </div>
        </div>
      </div>
    </main>
  );
}


