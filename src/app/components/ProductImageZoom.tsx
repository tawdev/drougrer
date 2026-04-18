'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ProductImageZoomProps {
    src: string;
    alt: string;
}

export default function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
    const [showZoom, setShowZoom] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const [lensPos, setLensPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imgRef.current || isMobile) return;
        
        const container = e.currentTarget.getBoundingClientRect();
        const img = imgRef.current.getBoundingClientRect();
        
        // Image offset within container
        const imgOffsetX = img.left - container.left;
        const imgOffsetY = img.top - container.top;
        
        // Mouse position relative to image
        let x = e.clientX - img.left;
        let y = e.clientY - img.top;

        // Dynamic lens size - made smaller for a tighter zoom area
        const lensWidth = img.width / 2.8;
        const lensHeight = img.height / 2.8;
        
        // Constrain lens within image bounds
        const minX = lensWidth / 2;
        const maxX = img.width - lensWidth / 2;
        const minY = lensHeight / 2;
        const maxY = img.height - lensHeight / 2;

        const constrainedX = Math.max(minX, Math.min(x, maxX));
        const constrainedY = Math.max(minY, Math.min(y, maxY));
        
        setLensPos({ 
            x: constrainedX - lensWidth / 2 + imgOffsetX, 
            y: constrainedY - lensHeight / 2 + imgOffsetY,
            width: lensWidth,
            height: lensHeight
        });

        // Background position percentage
        const percentX = (constrainedX - minX) / (maxX - minX) * 100;
        const percentY = (constrainedY - minY) / (maxY - minY) * 100;
        
        setMousePos({ x: percentX, y: percentY });
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full group">
            <div 
                className="relative w-full h-full flex items-center justify-center cursor-crosshair"
                onMouseEnter={() => !isMobile && setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                />
                
                {/* Lens Overlay */}
                {showZoom && !isMobile && (
                    <div 
                        className="absolute bg-[#BF1737]/10 border border-[#BF1737]/30 pointer-events-none z-10"
                        style={{
                            width: lensPos.width,
                            height: lensPos.height,
                            left: lensPos.x,
                            top: lensPos.y
                        }}
                    />
                )}
            </div>

            {/* Side Zoom Result Panel - Made smaller and slightly repositioned */}
            {showZoom && !isMobile && (
                <div 
                    className="absolute left-[calc(100%+20px)] top-0 md:w-[400px] lg:w-[480px] md:h-[400px] lg:h-[480px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] overflow-hidden pointer-events-none rounded-xl animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                        backgroundSize: '280%',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* High-fidelity mask for premium feel */}
                    <div className="absolute inset-0 border-[12px] border-white/50 pointer-events-none" />
                </div>
            )}
        </div>
    );
}
