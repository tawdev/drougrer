'use client';

import { RefreshCcw, ShieldCheck, HelpCircle, FileText, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function RetoursPage() {
    return (
        <div className="flex-1 bg-slate-50">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-[#FEF0F2] rounded-3xl flex items-center justify-center text-[#BF1737] mx-auto mb-6 shadow-sm">
                        <RefreshCcw size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">
                        Retours & <span className="text-[#BF1737]">Échanges</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto italic">
                        Votre satisfaction est notre priorité. Si un produit ne vous convient pas, nous sommes là pour faciliter votre retour ou échange.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-20">
                {/* 7 Days Policy */}
                <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white mb-16 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#BF1737]/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#BF1737] opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="shrink-0 w-32 h-32 border-4 border-[#BF1737] rounded-full flex flex-col items-center justify-center relative">
                            <span className="text-4xl font-black text-white">7</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1737]">Jours</span>
                            <div className="absolute -bottom-2 -right-2 bg-[#BF1737] p-1.5 rounded-full">
                                <ShieldCheck size={16} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tight">Politique de Satisfaction</h2>
                            <p className="text-slate-400 font-medium leading-relaxed italic">
                                Vous disposez de <span className="text-white font-bold">7 jours</span> à compter de la date de réception de votre commande pour demander un échange ou un remboursement. Le produit doit être dans son état d'origine, inutilisé et dans son emballage intact.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="mb-20">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-10 flex items-center gap-3">
                        <div className="w-8 h-1 bg-[#BF1737] rounded-full"></div>
                        Comment procéder ?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <MessageCircle size={24} />, title: 'Contactez-nous', desc: 'Envoyez-nous un message sur WhatsApp ou contactez notre SAV par téléphone.' },
                            { icon: <FileText size={24} />, title: 'Preuve d\'achat', desc: 'Préparez votre numéro de commande ou votre facture reçue lors de la livraison.' },
                            { icon: <CheckCircle2 size={24} />, title: 'Vérification', desc: 'Une fois le produit récupéré et vérifié par nos experts, nous procédons à l\'échange ou au remboursement.' },
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#BF1737] mb-6 shadow-inner">
                                    {step.icon}
                                </div>
                                <h4 className="text-[16px] font-bold text-slate-900 mb-3">{step.title}</h4>
                                <p className="text-[14px] text-slate-500 font-medium leading-relaxed italic">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Notes */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3">
                        <div className="w-8 h-1 bg-[#BF1737] rounded-full"></div>
                        Conditions Importantes
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <ul className="space-y-4">
                            {[
                                'Les produits ouverts, testés ou dont l\'emballage est détérioré ne peuvent être repris.',
                                'Les frais de retour sont à la charge du client, sauf en cas d\'erreur de notre part ou de produit défectueux.',
                                'Le remboursement est effectué via le même mode de paiement initial ou sous forme de bon d\'achat.',
                                'Les articles en promotion "Vente Flash" ou "Liquidation" peuvent avoir des conditions spécifiques.'
                            ].map((note, i) => (
                                <li key={i} className="flex gap-4 items-start text-slate-600 font-medium text-[15px]">
                                    <CheckCircle2 size={18} className="text-[#BF1737] shrink-0 mt-0.5" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* FAQ Link */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-3 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <HelpCircle size={24} className="text-[#BF1737]" />
                        <span className="text-slate-700 font-bold">Encore un doute ?</span>
                        <Link href="/faqs" className="text-[#BF1737] font-black underline underline-offset-4 hover:opacity-80 transition-opacity">
                            Consultez notre FAQ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
