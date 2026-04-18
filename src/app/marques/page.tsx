'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Brand } from '../lib/api';
import { motion } from 'framer-motion';

export default function MarquesPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getActiveBrands()
            .then(setBrands)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.21, 0.45, 0.32, 0.9] as any
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-1 bg-white flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#1e4d2b]/10 border-t-[#1e4d2b] rounded-full animate-spin"></div>
                    <span className="text-slate-400 font-medium text-sm animate-pulse uppercase tracking-widest">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] py-20">
            <div className="mx-auto max-w-[1580px] px-6 lg:px-10">

                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tight leading-none mb-4">
                        Toutes nos Marques
                    </h1>
                    <div className="h-1.5 w-24 bg-[#1e4d2b] rounded-full opacity-30" />
                </motion.div>

                {/* Grid */}
                {brands.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200"
                    >
                        <p className="text-slate-400 text-lg font-medium italic">Aucune marque disponible pour le moment.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5"
                    >
                        {brands.map((brand) => (
                            <motion.div key={brand.id} variants={itemVariants}>
                                <Link
                                    href={`/products?brandId=${brand.id}`}
                                    className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-500 group cursor-pointer aspect-square sm:aspect-auto sm:h-[180px]"
                                >
                                    {/* Logo Container */}
                                    <div className="flex-1 flex items-center justify-center w-full min-h-[100px]">
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                className="max-w-[140px] md:max-w-[160px] max-h-[80px] md:max-h-[100px] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-[#1e4d2b]/20 transition-all duration-500">
                                                <span className="text-2xl font-black text-slate-300 uppercase group-hover:text-[#1e4d2b]">
                                                    {brand.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Name */}
                                    <div className="text-center group-hover:translate-y-[-4px] transition-transform duration-500">
                                        <span className="text-[15px] font-bold text-slate-800 tracking-tight group-hover:text-[#1e4d2b] transition-colors">
                                            {brand.name}
                                        </span>
                                        <div className="mt-1 h-0.5 w-0 bg-[#1e4d2b] mx-auto group-hover:w-full transition-all duration-500 rounded-full" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
