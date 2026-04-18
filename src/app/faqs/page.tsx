'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react';

const faqs = [
    {
        category: 'Commandes',
        items: [
            {
                q: 'Comment puis-je suivre ma commande ?',
                a: "Une fois votre commande passée, vous recevrez un message de confirmation sur WhatsApp avec un lien de suivi. Vous pouvez également nous contacter directement sur WhatsApp pour obtenir des mises à jour en temps réel."
            },
            {
                q: 'Puis-je modifier ou annuler ma commande ?',
                a: "Oui, vous pouvez modifier ou annuler votre commande tant qu'elle n'a pas encore été expédiée. Veuillez nous contacter le plus rapidement possible via WhatsApp ou par téléphone."
            },
            {
                q: 'Quels sont les modes de paiement acceptés ?',
                a: "Pour votre confort et votre sécurité, nous acceptons principalement le paiement à la livraison (Cash on Delivery) partout au Maroc."
            }
        ]
    },
    {
        category: 'Livraison',
        items: [
            {
                q: 'Quels sont les délais de livraison ?',
                a: "Nous livrons généralement sous 24h à 48h pour les grandes villes (Casablanca, Rabat, Marrakech, etc.) et sous 72h pour les autres régions du Maroc."
            },
            {
                q: 'Combien coûte la livraison ?',
                a: "Les frais de livraison varient selon votre localisation et le poids de votre commande. La livraison est souvent offerte pour les commandes dépassant un certain montant (voir nos promotions actuelles)."
            }
        ]
    },
    {
        category: 'Produits & Garanties',
        items: [
            {
                q: 'Les produits sont-ils garantis ?',
                a: "Tous nos équipements et outils électriques bénéficient d'une garantie constructeur. La durée de la garantie varie selon la marque et le produit."
            },
            {
                q: 'Proposez-vous des prix pour les professionnels ?',
                a: "Absolument. Si vous êtes un professionnel du bâtiment ou un revendeur, contactez notre service commercial pour obtenir des tarifs préférentiels sur les commandes en gros."
            }
        ]
    }
];

export default function FAQsPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFaq = (index: string) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">
                        Questions <span className="text-[#BF1737]">Fréquentes</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium mb-10 max-w-2xl mx-auto">
                        Trouvez rapidement des réponses à vos questions sur nos produits, la livraison et nos services.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une réponse..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#BF1737] focus:ring-4 focus:ring-[#BF1737]/5 transition-all outline-none font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="space-y-12">
                    {faqs.map((group, groupIdx) => {
                        const filteredItems = group.items.filter(item => 
                            item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.a.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={groupIdx}>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3">
                                    <div className="w-8 h-1 bg-[#BF1737] rounded-full"></div>
                                    {group.category}
                                </h2>
                                <div className="space-y-4">
                                    {filteredItems.map((item, itemIdx) => {
                                        const originalItemIdx = group.items.findIndex(i => i.q === item.q);
                                        const id = `${groupIdx}-${originalItemIdx}`;
                                        const isSearchActive = searchQuery.trim().length > 0;
                                        const isOpen = openIndex === id || isSearchActive;
                                        
                                        return (
                                            <div 
                                                key={id} 
                                                className={`bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'border-[#BF1737] shadow-lg shadow-[#BF1737]/5' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                                            >
                                                <button 
                                                    onClick={() => !isSearchActive && toggleFaq(id)}
                                                    className={`w-full px-6 py-5 flex items-center justify-between text-left ${isSearchActive ? 'cursor-default' : 'cursor-pointer'}`}
                                                    aria-expanded={isOpen}
                                                >
                                                    <span className={`text-[16px] font-bold ${isOpen ? 'text-[#BF1737]' : 'text-slate-800'}`}>
                                                        {item.q}
                                                    </span>
                                                    {!isSearchActive && (
                                                        isOpen ? <ChevronUp className="w-5 h-5 text-[#BF1737]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {item.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {searchQuery.trim().length > 0 && faqs.every(group => 
                        group.items.filter(item => 
                            item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.a.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0
                    ) && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun résultat trouvé</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto">
                                Nous n'avons trouvé aucune réponse pour &quot;{searchQuery}&quot;. Essayez d'utiliser des termes différents.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-16 py-10 px-6 bg-[#BF1737] shadow-xl shadow-[#BF1737]/10 rounded-2xl text-center text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-wide">
                        Vous avez d'autres questions ?
                    </h3>
                    <p className="text-[15px] md:text-base font-medium mb-6 opacity-90">
                        Notre équipe est là pour vous aider
                    </p>
                    <div className="text-[15px] md:text-base font-medium tracking-wide">
                        +212 5 22 00 00 00 <span className="mx-2 opacity-50">|</span> contact@drogueriemaroc.com
                    </div>
                </div>
            </div>
        </div>
    );
}
