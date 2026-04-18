'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Download, CheckCircle2, FileText, MapPin, Phone, User, Store, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string | null;
}

interface OrderPayload {
    invoiceNumber: string;
    date: string;
    items: OrderItem[];
    totalPrice: number;
    customerInfo: {
        name: string;
        phone: string;
        address: string;
    };
}

function InvoiceContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    
    const [order, setOrder] = useState<OrderPayload | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        
        async function fetchOrder() {
            setLoading(true);
            if (orderId) {
                try {
                    const data = await api.getOrderById(orderId);
                    setOrder({
                        invoiceNumber: data.invoiceReference || `FAC-${data.id}`,
                        date: data.createdAt,
                        items: Array.isArray(data.items) ? data.items : [],
                        totalPrice: Number(data.totalPrice),
                        customerInfo: {
                            name: data.customerName,
                            phone: data.phone || '',
                            address: data.address || ''
                        }
                    });
                } catch (error) {
                    console.error("Erreur backend:", error);
                }
            } else {
                const storedOrder = localStorage.getItem('droguerie_last_order');
                if (storedOrder) {
                    try {
                        setOrder(JSON.parse(storedOrder));
                    } catch (error) {
                        console.error("Erreur locale:", error);
                    }
                }
            }
            setLoading(false);
        }

        fetchOrder();
    }, [orderId]);

    const generatePDF = () => {
        window.print();
    };

    if (!isClient || loading) {
        return (
        <div className="flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="text-[#BF1737] animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} className="text-red-300" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter text-center">Aucune facture trouvée</h1>
                <p className="text-slate-500 mb-8 max-w-md text-center font-medium">
                    Nous n'avons trouvé aucune trace de cette commande.
                </p>
                <Link 
                    href="/products" 
                    className="flex items-center gap-2 bg-[#BF1737] text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#a01430] transition-colors shadow-lg shadow-[#BF1737]/20"
                >
                    <ArrowLeft size={16} /> Retour à la boutique
                </Link>
            </div>
        );
    }

    const orderDate = new Date(order.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex-1 flex flex-col bg-slate-50 py-12 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
            <div className="max-w-4xl mx-auto">
                {/* Floating Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 gap-4 print:hidden">
                    <Link 
                        href={orderId ? "/admin/orders" : "/products"} 
                        className="flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" /> {orderId ? "Retour aux commandes" : "Continuer vos achats"}
                    </Link>
                    <button 
                        onClick={generatePDF}
                        className="flex items-center gap-2 bg-[#BF1737] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#a01430] transition-colors shadow-md shadow-[#BF1737]/20"
                    >
                        <Download size={16} />
                        Télécharger en PDF
                    </button>
                </div>

                {/* Printable Invoice Container */}
                <div className="bg-white rounded-[24px] shadow-xl overflow-hidden mb-12 border border-slate-100 print:shadow-none print:border-none print:m-0 print:p-0">
                    <div ref={invoiceRef} className="p-8 sm:p-14 bg-white">
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8">
                            <div className="mb-6 md:mb-0">
                                <div className="flex items-center gap-3 mb-4">
                                     <div className="relative w-12 h-12 flex-shrink-0">
                                        <div className="w-full h-full bg-[#BF1737] rounded-xl flex items-center justify-center">
                                            <Store size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Droguerie <span className="text-[#BF1737]">Maroc</span></h1>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">L'excellence au quotidien</p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-500 space-y-1">
                                    <p>123 Boulevard Hassan II</p>
                                    <p>Casablanca, 20000, Maroc</p>
                                    <p>Tél: +212 7 73 66 24 87</p>
                                    <p>Email: contact@drogueriemaroc.com</p>
                                </div>
                            </div>
                            
                            <div className="text-left md:text-right">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-200 mb-2">Facture</h2>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">N° {order.invoiceNumber}</p>
                                    <p className="text-sm font-medium text-slate-500">Date : {orderDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Section */}
                        {(order.customerInfo.name || order.customerInfo.phone || order.customerInfo.address) && (
                            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                    <User size={14} /> Facturé à
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-slate-700">
                                    {order.customerInfo.name && (
                                        <div className="flex gap-2 items-center">
                                             <span className="font-bold text-slate-900">Client :</span> {order.customerInfo.name}
                                        </div>
                                    )}
                                    {order.customerInfo.phone && (
                                        <div className="flex gap-2 items-center">
                                            <Phone size={14} className="text-slate-400" /> {order.customerInfo.phone}
                                        </div>
                                    )}
                                    {order.customerInfo.address && (
                                        <div className="flex gap-2 items-start sm:col-span-2">
                                            <MapPin size={14} className="text-slate-400 mt-1 flex-shrink-0" /> 
                                            <span className="leading-relaxed">{order.customerInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="mb-10 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 text-xs font-black uppercase tracking-widest text-[#BF1737]">
                                        <th className="py-4 px-2">Description</th>
                                        <th className="py-4 px-2 text-center">Qté</th>
                                        <th className="py-4 px-2 text-right">Prix U.</th>
                                        <th className="py-4 px-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-semibold text-slate-700">
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100">
                                            <td className="py-4 px-2 text-slate-900">{item.name}</td>
                                            <td className="py-4 px-2 text-center text-slate-500">{item.quantity}</td>
                                            <td className="py-4 px-2 text-right">{item.price.toFixed(2).replace('.', ',')}</td>
                                            <td className="py-4 px-2 text-right text-slate-900 font-bold">{(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end">
                            <div className="w-full sm:w-1/2 md:w-1/3 space-y-4 text-sm">
                                <div className="flex justify-between font-bold text-slate-500 px-2">
                                    <span>Sous-total HT</span>
                                    <span>{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-500 px-2 pb-4 border-b border-slate-200">
                                    <span>TVA (0%)</span>
                                    <span>0,00 MAD</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black text-slate-900 px-2 pt-2">
                                    <span className="text-[#BF1737]">Total TTC</span>
                                    <span>{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
                            <p className="mb-1 font-bold text-slate-500 uppercase tracking-widest">Merci pour votre commande</p>
                            <p>Cette facture certifie la bonne réception de votre demande.</p>
                            <p className="mt-2 text-[10px]">Généré le {new Date().toLocaleString('fr-FR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="text-[#BF1737] animate-spin" />
            </div>
        }>
            <InvoiceContent />
        </Suspense>
    );
}

