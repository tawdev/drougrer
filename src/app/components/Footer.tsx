'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Tag } from 'lucide-react';
import { api, Category } from '../lib/api';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
    const { settings, loading: settingsLoading } = useSettings();
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        api.getCategories(true).then(res => {
            const prioritizedNames = ['Peinture', 'Outillage', 'Plomberie', 'Quincaillerie', 'Électricité', 'Matériaux'];
            const filtered = res.filter(c =>
                c.parentId === null &&
                prioritizedNames.some(name => c.name.toLowerCase().includes(name.toLowerCase()))
            ).sort((a, b) => {
                const indexA = prioritizedNames.findIndex(name => a.name.toLowerCase().includes(name.toLowerCase()));
                const indexB = prioritizedNames.findIndex(name => b.name.toLowerCase().includes(name.toLowerCase()));
                return indexA - indexB;
            });
            setCategories(filtered.slice(0, 6));
        }).catch(err => console.error('Footer categories fetch error:', err));

        api.getTags().then(res => {
            if (res && res.length > 0) {
                setTags(res);
            }
        }).catch(err => console.error('Footer tags fetch error:', err));
    }, []);

    const cleanTag = (t: string) => t.replace(/[\[\]"]+/g, '').trim();
    const defaultTags = [
        'Outillage Maroc', 'Peinture Maroc', 'Perceuse Bosch',
        'Perceuse Visseuse', 'Quincaillerie Maroc', 'Robinetterie', 'Visserie'
    ];

    // Filter and clean tags, ensuring uniqueness
    const allAvailableTags = Array.from(new Set(
        (tags.length > 0 ? tags : defaultTags)
            .map(cleanTag)
            .filter((t: string) => t.length > 1) // Remove single-char noise if any
    ));
    
    // Limit to 10 tags for balance with other columns
    const displayTags = allAvailableTags.slice(0, 10);

    return (
        <footer className="border-t border-slate-200 bg-white pt-10 sm:pt-20 pb-10 mt-auto">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-8 mb-12 sm:mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 pr-0 lg:pr-12">
                        <Link href="/" className="inline-block mb-6 group">
                            <div className="relative" style={{ width: 180, height: 72 }}>
                                {settingsLoading ? (
                                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
                                ) : (
                                    <Image
                                        src={settings?.logoUrl || "/mol2.jpeg"}
                                        alt={settings?.storeName || "MOL Droguerie – Meilleur Prix"}
                                        fill
                                        style={{ objectFit: 'contain', mixBlendMode: settings?.logoUrl ? 'normal' : 'multiply' }}
                                        unoptimized={true}
                                        sizes="180px"
                                    />
                                )}
                            </div>
                        </Link>
                        <div className="text-[14px] font-medium leading-relaxed text-slate-500 mb-8 max-w-sm">
                            {settingsLoading ? (
                                <div className="space-y-2">
                                    <div className="w-full h-4 bg-slate-50 animate-pulse rounded" />
                                    <div className="w-full h-4 bg-slate-50 animate-pulse rounded" />
                                    <div className="w-[80%] h-4 bg-slate-50 animate-pulse rounded" />
                                </div>
                            ) : (
                                settings?.description || "MOL Droguerie est votre partenaire de confiance pour tout l'outillage professionnel, la quincaillerie et les matériaux de construction au Maroc. Nous nous engageons à vous fournir la meilleure qualité au meilleur prix."
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#BF1737] hover:text-white transition-all">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#BF1737] hover:text-white transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#BF1737] hover:text-white transition-all">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Service Client Section */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[20px] font-bold text-slate-900 mb-8 font-display">Service Client</h4>
                        <ul className="space-y-3">
                            <li><Link href="/contact" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Contact</Link></li>
                            <li><Link href="/faqs" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">FAQ</Link></li>
                            <li><Link href="/livraison" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Livraison</Link></li>
                            <li><Link href="/retours" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Retours & Échanges</Link></li>
                            <li><Link href="/confidentialite" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Confidentialité</Link></li>
                            <li><Link href="/conditions-generales" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Conditions Générales</Link></li>
                        </ul>
                    </div>

                    {/* Categories Section */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[20px] font-bold text-slate-900 mb-8 font-display">Catégories</h4>
                        <ul className="space-y-3">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={`/products?categoryId=${cat.id}`}
                                            className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors"
                                        >
                                            {cat.name.replace(' de Construction', '')}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/products?search=Peinture" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Peinture</Link></li>
                                    <li><Link href="/products?search=Outillage" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Outillage</Link></li>
                                    <li><Link href="/products?search=Plomberie" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Plomberie</Link></li>
                                    <li><Link href="/products?search=Quincaillerie" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Quincaillerie</Link></li>
                                    <li><Link href="/products?search=Electricite" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Électricité</Link></li>
                                    <li><Link href="/products?search=Materiaux" className="text-[15px] font-normal text-slate-500 hover:text-[#BF1737] transition-colors">Matériaux</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Tags Section */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[20px] font-bold text-slate-900 mb-8 font-display">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {displayTags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/products?search=${encodeURIComponent(tag)}`}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-500 hover:border-[#BF1737] hover:text-[#BF1737] transition-all group"
                                >
                                    <Tag size={12} className="text-slate-400 group-hover:text-[#BF1737] transition-colors" />
                                    {tag}
                                </Link>
                            ))}
                        </div>
                        {/* Fixed height - no expand toggle */}
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[20px] font-bold text-slate-900 mb-8 font-display">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#BF1737] shrink-0 mt-0.5" />
                                <span className="text-[14px] font-medium text-slate-500">
                                    {settingsLoading ? <div className="w-32 h-4 bg-slate-50 animate-pulse rounded" /> : (settings?.address || "Casablanca, Maroc")}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-[#BF1737] shrink-0" />
                                <span className="text-[14px] font-bold text-slate-500">
                                    {settingsLoading ? <div className="w-24 h-4 bg-slate-50 animate-pulse rounded" /> : (settings?.phoneNumber || "+212 5XX XX XX XX")}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#BF1737] shrink-0" />
                                <span className="text-[14px] font-bold text-slate-500 truncate">
                                    {settingsLoading ? <div className="w-40 h-4 bg-slate-50 animate-pulse rounded" /> : (settings?.supportEmail || "contact@moldroguerie.ma")}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 pt-10">
                    <p className="text-[13px] font-medium text-slate-500">
                        Copyright © <a href="https://cdigital.ma/" target="_blank" rel="noopener noreferrer" className="text-[#BF1737] font-bold hover:underline">CDigital</a> {new Date().getFullYear()}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
