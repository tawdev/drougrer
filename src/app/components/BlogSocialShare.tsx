'use client';

import React from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';

export default function BlogSocialShare() {
    const shareLinks = [
        { name: 'WhatsApp', icon: MessageCircle, href: '#', bg: 'hover:bg-[#25D366]' },
        { name: 'Facebook', icon: Facebook, href: '#', bg: 'hover:bg-[#1877F2]' },
        { name: 'Twitter / X', icon: Twitter, href: '#', bg: 'hover:bg-[#000000]' },
        { name: 'LinkedIn', icon: Linkedin, href: '#', bg: 'hover:bg-[#0A66C2]' },
    ];

    return (
        <section className="bg-[#0D0D0D] py-16 px-6 lg:px-10 rounded-[4rem] mx-auto max-w-[1400px] mb-20 overflow-hidden relative group">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#BF1737] opacity-[0.03] rounded-full -translate-x-[40%] -translate-y-1/2 blur-3xl group-hover:opacity-[0.06] transition-opacity" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight italic">
                        CET ARTICLE VOUS A ÉTÉ UTILE ?
                    </h2>
                    <p className="text-white/30 text-[14px] font-medium tracking-tight uppercase">
                        Partagez-le avec vos collègues ou laissez-nous un commentaire !
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4">
                    {shareLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.href}
                            className={`flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:-translate-y-1 hover:border-transparent ${social.bg}`}
                        >
                            <social.icon size={18} strokeWidth={2.5} />
                            {social.name}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
