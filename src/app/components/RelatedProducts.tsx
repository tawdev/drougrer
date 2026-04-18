'use client';

import { useEffect, useState } from 'react';
import { api, Product } from '../lib/api';
import ProductCard from './ProductCard';

export default function RelatedProducts({ categoryId, currentProductId }: { categoryId?: number | null, currentProductId: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Fetch more products than needed to ensure we have enough after filtering out current product
        const res = await api.getProducts({ categoryId: categoryId || undefined, limit: 12 });
        const related = res.data.filter(p => Number(p.id) !== currentProductId).slice(0, 4);
        setProducts(related);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId, currentProductId]);

  if (loading) return null;
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16 mb-20 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h3 className="text-[20px] font-bold text-[#1D1D1D] mb-3 font-display">Produits connexes</h3>
        <div className="h-[1px] w-full bg-slate-100 relative">
          <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-[#BF1737]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
