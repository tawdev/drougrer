'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PortalClient() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Admin email is pulled from environment, obfuscating traditional login
      // The admin only needs to enter their secure access code (the password)
      const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL as string;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: accessCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Code d\'accès invalide.');
      }

      login(data.access_token, data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-[#0ea5e9]/20 selection:text-[#0ea5e9]">
      <div className="w-full max-w-[400px]">
        {/* Subtle glow effect behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden z-10 transition-all duration-500">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl shadow-inner mb-6">
              <ShieldCheck className="text-[#0ea5e9] w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Accès Sécurisé</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Authentification requise</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Code d'accès"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all outline-none text-center tracking-widest font-mono"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !accessCode}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-slate-800 disabled:text-slate-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Vérification...' : 'Déverrouiller'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
