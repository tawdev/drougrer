'use client';

import { Truck, Clock, MapPin, ShieldCheck, Box, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LivraisonPage() {
    return (
        <div className="flex-1 bg-white">
            {/* Hero Section */}
            <div className="relative py-24 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF1737]/10 border border-[#BF1737]/20 rounded-full text-[#BF1737] mb-8">
                        <Truck size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Expédition Rapide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tight">
                        Livraison <span className="text-[#BF1737]">Partout au Maroc</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Chez MOL Droguerie, nous comprenons que chaque heure compte sur un chantier. C'est pourquoi nous avons optimisé notre logistique pour vous livrer dans les plus brefs délais.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-24">
                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#BF1737]/30 transition-all">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#BF1737] shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <Clock size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic">24h - 48h</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Délai moyen pour les grandes villes comme Casablanca, Rabat, Marrakech et Tanger.
                        </p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#BF1737]/30 transition-all">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#BF1737] shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <MapPin size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic">Couverture Nationale</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Nous livrons dans toutes les provinces du royaume, du nord au sud.
                        </p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#BF1737]/30 transition-all">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#BF1737] shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic">Paiement Sécurisé</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Payez en toute confiance à la réception de votre colis (Cash on Delivery).
                        </p>
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight italic relative inline-block">
                            Processus de <span className="text-[#BF1737]">Commande</span>
                            <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-[#BF1737] rounded-full"></div>
                        </h2>
                        <div className="space-y-8">
                            {[
                                { title: 'Validation Immédiate', desc: 'Dès réception de votre commande, une équipe vérifie la disponibilité et prépare votre facture.' },
                                { title: 'Emballage Soigné', desc: 'Vos articles sont emballés avec des protections renforcées pour éviter tout dommage durant le transport.' },
                                { title: 'Prise en charge Transporteur', desc: 'Nos partenaires logistiques récupèrent les colis quotidiennement pour un départ immédiat.' },
                                { title: 'Notification SMS/WhatsApp', desc: 'Vous recevez un message dès que le livreur est en route vers votre adresse.' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-[#BF1737] text-white flex items-center justify-center font-black text-lg">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#BF1737] opacity-10 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                        <Box size={80} className="text-[#BF1737] opacity-20 mb-8" />
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic">Tarifs de Livraison</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-white/10">
                                <span className="text-slate-400 font-medium">Région de Marrakech</span>
                                <span className="text-xl font-bold">25 MAD</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/10">
                                <span className="text-slate-400 font-medium">Villes Principales (Casablanca, Rabat...)</span>
                                <span className="text-xl font-bold">45 MAD</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-slate-400 font-medium">Autres Régions</span>
                                <span className="text-xl font-bold">55 MAD</span>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-[#BF1737]/10 border border-[#BF1737]/20 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#BF1737] rounded-full flex items-center justify-center">
                                <CheckCircle2 size={20} className="text-white" />
                            </div>
                            <p className="text-sm font-bold leading-tight">
                                Livraison <span className="text-[#BF1737]">OFFERTE</span> pour toute commande supérieure à 500 MAD !
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-slate-50 rounded-[48px] py-16 px-8 border border-slate-100">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">
                        Besoin d'une <span className="text-[#BF1737]">Livraison Express ?</span>
                    </h2>
                    <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto italic leading-relaxed">
                        Pour des besoins urgents sur chantier dans la région de Marrakech, contactez-nous directement pour un service sur mesure.
                    </p>
                    <Link 
                        href="/contact" 
                        className="inline-flex h-14 items-center px-10 bg-[#BF1737] text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-lg shadow-[#BF1737]/20"
                    >
                        Contactez-nous
                    </Link>
                </div>
            </div>
        </div>
    );
}
