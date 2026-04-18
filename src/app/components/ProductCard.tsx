'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, RefreshCw } from 'lucide-react';
import ProductRating from './ProductRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { motion } from 'framer-motion';
import { type Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
  imageClassName?: string;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, className = '', imageClassName = '', viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const productNumId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  const isWishlisted = isInWishlist(productNumId);
  const isCompared = isInCompare(productNumId);

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : (product.onSale ? price * 1.2 : null);
  const isOnSale = product.onSale || (oldPrice && oldPrice > price);

  // Combine main image and gallery images, ensuring uniqueness and non-null values
  const allImages = useMemo(() => {
    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && url !== product.imageUrl) images.push(url);
      });
    }
    // Limit to 5 images for performance and UX
    return images.slice(0, 5);
  }, [product.imageUrl, product.imageUrls]);

  // Handle auto-sliding on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && allImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 1500); // 1.5 seconds per slide
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, allImages.length]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80';
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const isList = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.4 }
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`h-full ${className}`}
    >
      <Link
        href={`/products/${product.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group/card flex transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] relative h-full bg-white border border-slate-200 rounded-[8px] p-3 sm:p-4 overflow-hidden ${isList
          ? 'flex-row w-full gap-4 sm:gap-6 items-start'
          : 'flex-col w-full max-w-[280px]'
          }`}
      >
      {/* Media Wrapper */}
      <div className={`relative flex flex-col ${isList ? 'shrink-0 pr-8' : 'w-full mb-3'}`}>

        {/* Image Container */}
        {/* Image / Media Container - FORCED ANCHOR */}
        <div 
          className={`relative transition-all duration-500 overflow-hidden bg-white rounded-[8px] shrink-0 grid ${isList
            ? 'w-[100px] h-[100px] sm:w-[140px] sm:h-[140px]'
            : 'aspect-square w-full'
            } ${imageClassName}`}
          style={{ position: 'relative', transform: 'translateZ(0)' }}
        >
          
          {/* Sale Badge - Stacked via grid/absolute combo with forced parent anchor */}
          {isOnSale && (
            <div className="absolute top-2 left-2 z-40 bg-[#0bc241] text-white px-2 py-1.5 rounded-[6px] text-[10px] font-black shadow-lg leading-none tracking-wider uppercase pointer-events-none">
              -{oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 17}%
            </div>
          )}

          <div
            className="col-start-1 row-start-1 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {allImages.length > 0 ? (
              allImages.map((url, idx) => (
                <div key={idx} className="flex-shrink-0 w-full h-full flex items-center justify-center p-4 bg-white transition-all duration-300">
                  <img
                    src={getImageUrl(url)}
                    alt={`${product.name} - image ${idx + 1}`}
                    className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 lg:group-hover/card:scale-[1.05]"
                  />
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full h-full flex items-center justify-center p-4 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80"
                  alt={product.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Heart & Compare) */}
        {isList && (
          <div className="absolute right-0 top-0 z-30 flex gap-1 sm:gap-1.5 flex-col">
            <button 
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isWishlisted ? 'bg-[#BF1737] border border-[#BF1737] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#BF1737] hover:border-[#BF1737] hover:text-white'}`}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                toggleWishlist(productNumId);
              }}
              title={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
              {isWishlisted ? (
                <Heart size={14} strokeWidth={0} className="fill-white sm:w-4 sm:h-4 w-[14px] h-[14px]" />
              ) : (
                <Heart size={14} strokeWidth={1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
              )}
            </button>
            <button 
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isCompared ? 'bg-[#BF1737] border border-[#BF1737] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#BF1737] hover:border-[#BF1737] hover:text-white'}`}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                toggleCompare(productNumId);
              }}
              title={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
            >
              <RefreshCw size={14} strokeWidth={isCompared ? 2.5 : 1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
            </button>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className={`flex flex-col flex-1 min-w-0 ${isList ? 'h-full pt-0.5 sm:pt-1' : 'h-full pt-1.5'}`}>
        <h3 className={`font-medium text-slate-800 line-clamp-2 sm:line-clamp-2 leading-[1.4] transition-colors group-hover/card:text-[#BF1737] mb-1 sm:mb-2 pb-0.5 ${isList ? 'text-[14px] sm:text-[17px]' : 'text-[13px] sm:text-[15px] min-h-[40px] sm:min-h-[46px]'}`}>
          {product.name}
        </h3>

        {/* Rating Area */}
        <div className="mb-2 sm:mb-4 opacity-70">
          <ProductRating productId={product.id} starSize={isList ? 12 : 10} textSize={isList ? "text-[11px] sm:text-[13px] ml-1.5" : "text-[10px] sm:text-[12px] ml-1.5 text-slate-500"} />
        </div>

        {/* Price & Cart Area */}
        {isList ? (
          <>
            {/* Price Area List */}
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2.5 mb-2 sm:mb-4">
              <span className="font-medium text-[#BF1737] leading-none text-[15px] sm:text-[18px]">
                {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} <span className="text-[13px] sm:text-[15px]">MAD</span>
              </span>
              {isOnSale && oldPrice && (
                <span className="text-slate-500 line-through leading-none font-normal text-[12px] sm:text-[15px]">
                  {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
                </span>
              )}
            </div>

            {/* Add to Cart Button List */}
            <div className="mt-auto flex justify-start">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl
                  });
                }}
                className="rounded-[6px] bg-[#BF1737] text-white px-3 py-1.5 sm:px-5 sm:py-2 font-bold sm:font-medium text-[12px] sm:text-[14px] hover:bg-[#A3142F] transition-colors shadow-sm"
              >
                Ajouter au panier
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-end justify-between mt-auto gap-2">
            {/* Price Area Grid */}
            <div className="flex flex-col justify-end min-w-0">
              {isOnSale && oldPrice ? (
                <span className="text-slate-500 line-through leading-none font-normal text-[11px] sm:text-[12px] mb-1 sm:mb-1.5 truncate">
                  {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
                </span>
              ) : (
                <span className="leading-none text-[11px] sm:text-[12px] mb-1 sm:mb-1.5 opacity-0 select-none">0</span>
              )}
              <span className="font-medium text-[#BF1737] leading-none text-[14px] sm:text-[16px] truncate">
                {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 }).replace('.', ',')} MAD
              </span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl
                });
              }}
              className="rounded-[8px] flex items-center justify-center transition-colors duration-300 w-8 h-8 sm:w-9 sm:h-9 bg-[#BF1737]/10 text-[#BF1737] lg:group-hover/card:bg-[#BF1737] lg:group-hover/card:text-white shrink-0"
            >
              <ShoppingCart size={16} strokeWidth={2.5} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons (Grid Mode Only) */}
      {!isList && (
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-30 flex gap-1.5 flex-col">
          <button 
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isWishlisted ? 'bg-[#BF1737] border border-[#BF1737] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#BF1737] hover:border-[#BF1737] hover:text-white'}`}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              toggleWishlist(productNumId);
            }}
            title={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
          >
            {isWishlisted ? (
              <Heart size={14} strokeWidth={0} className="fill-white sm:w-4 sm:h-4 w-[14px] h-[14px]" />
            ) : (
              <Heart size={14} strokeWidth={1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
            )}
          </button>
          <button 
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isCompared ? 'bg-[#BF1737] border border-[#BF1737] text-white' : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-600 hover:bg-[#BF1737] hover:border-[#BF1737] hover:text-white'}`}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              toggleCompare(productNumId);
            }}
            title={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
          >
            <RefreshCw size={14} strokeWidth={isCompared ? 2.5 : 1.5} className="sm:w-4 sm:h-4 w-[14px] h-[14px]" />
          </button>
        </div>
      )}
      </Link>
    </motion.div>
  );
}
