'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award, Truck, ShieldCheck, Users, Star, MapPin, Phone, Clock,
  ChevronRight, Paintbrush, Wrench, Droplets, Zap, ArrowRight,
  CheckCircle2, Heart, Target, TrendingUp
} from 'lucide-react';

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

export default function AboutUsPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stat1 = useCountUp(30, 2000);
  const stat2 = useCountUp(15000, 2500);
  const stat3 = useCountUp(500, 2000);
  const stat4 = useCountUp(98, 2000);

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Qualité Premium',
      description: 'Nous sélectionnons rigoureusement chaque produit pour garantir une qualité professionnelle à nos clients.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Confiance & Fiabilité',
      description: 'Des marques reconnues et des garanties solides pour chaque achat. Votre satisfaction est notre priorité.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expertise Métier',
      description: 'Notre équipe de spécialistes vous accompagne et vous conseille dans tous vos projets de rénovation.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Livraison Rapide',
      description: 'Service de livraison efficace partout au Maroc. Recevez vos commandes directement chez vous.',
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  const timeline = [
    { year: '1995', title: 'Les Débuts', desc: 'Ouverture de notre première boutique à Casablanca, spécialisée en produits de quincaillerie.' },
    { year: '2005', title: 'Expansion', desc: 'Élargissement de notre gamme avec la peinture, plomberie et électricité. 3 nouvelles succursales.' },
    { year: '2015', title: 'Modernisation', desc: 'Lancement de notre plateforme en ligne et digitalisation de l\'expérience client.' },
    { year: '2024', title: "Aujourd'hui", desc: 'Leader régional avec +15 000 produits, livraison nationale et service client premium.' },
  ];

  const categories = [
    { icon: <Paintbrush className="w-6 h-6" />, name: 'Peinture', count: '2 500+' },
    { icon: <Wrench className="w-6 h-6" />, name: 'Outillage', count: '3 200+' },
    { icon: <Droplets className="w-6 h-6" />, name: 'Plomberie', count: '1 800+' },
    { icon: <Zap className="w-6 h-6" />, name: 'Électricité', count: '2 400+' },
  ];

  return (
        <div className="flex-1 flex flex-col bg-white">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative h-[620px] overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 scale-110"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="/store-hero.png"
            alt="Intérieur de notre magasin"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80 z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-amber-400" />
            Votre partenaire de confiance depuis 1995
          </div>
          <h1 className="text-white text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] max-w-4xl">
            À Propos de
            <span className="block bg-gradient-to-r from-[#BF1737] to-[#FF6B6B] bg-clip-text text-transparent">
              Notre Droguerie
            </span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-10">
            Plus qu&apos;une simple droguerie — un véritable partenaire pour tous vos projets
            de construction, rénovation et aménagement.
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="group flex items-center gap-2 bg-[#BF1737] text-white px-8 py-4 rounded-xl font-bold text-[15px] hover:bg-[#a01430] transition-all shadow-lg shadow-[#BF1737]/30 hover:shadow-xl hover:shadow-[#BF1737]/40 hover:-translate-y-0.5"
            >
              Découvrir nos produits
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 text-white px-8 py-4 rounded-xl font-bold text-[15px] hover:bg-white/20 transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS BANNER ═══════════ */}
      <section className="relative -mt-2 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: '+', label: "Années d'expérience", icon: <Target className="w-5 h-5" /> },
              { ref: stat2.ref, count: stat2.count.toLocaleString(), suffix: '+', label: 'Produits disponibles', icon: <TrendingUp className="w-5 h-5" /> },
              { ref: stat3.ref, count: stat3.count, suffix: '+', label: 'Marques partenaires', icon: <Award className="w-5 h-5" /> },
              { ref: stat4.ref, count: stat4.count, suffix: '%', label: 'Clients satisfaits', icon: <Heart className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div
                key={i}
                ref={stat.ref}
                className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#BF1737]/10 text-[#BF1737] mb-3 group-hover:bg-[#BF1737] group-hover:text-white transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
                  {stat.count}{stat.suffix}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BF1737]/10 text-[#BF1737] text-sm font-semibold mb-6">
                <CheckCircle2 className="w-4 h-4" />
                Notre Histoire
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Une passion pour la <span className="text-[#BF1737]">qualité</span> depuis 3 décennies
              </h2>
              <div className="space-y-5 text-slate-600 text-[16px] leading-relaxed">
                <p>
                  Fondée en 1995 à Casablanca, notre droguerie est née d&apos;une vision simple :
                  offrir aux professionnels et particuliers les meilleurs produits de quincaillerie,
                  peinture, plomberie et électricité, accompagnés d&apos;un conseil expert.
                </p>
                <p>
                  Ce qui a commencé comme une petite boutique de quartier est devenu aujourd&apos;hui
                  une référence incontournable dans le secteur de la distribution de matériaux
                  et fournitures au Maroc.
                </p>
                <p>
                  Notre philosophie reste inchangée : <strong>qualité, expertise et proximité</strong>.
                  Chaque produit est soigneusement sélectionné auprès des meilleures marques
                  internationales et locales.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium hover:border-[#BF1737]/30 hover:bg-[#BF1737]/5 transition-colors cursor-default">
                    <span className="text-[#BF1737]">{cat.icon}</span>
                    {cat.name}
                    <span className="text-slate-400 text-xs">({cat.count})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200/50">
                <Image
                  src="/tools-flatlay.png"
                  alt="Nos outils professionnels"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-slate-100 max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Certifié ISO</div>
                    <div className="text-xs text-slate-500">Normes internationales</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BF1737]/10 text-[#BF1737] text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Nos Valeurs
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Ce qui nous <span className="text-[#BF1737]">distingue</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Les principes fondamentaux qui guident chaque décision et chaque interaction avec nos clients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TIMELINE ═══════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BF1737]/10 text-[#BF1737] text-sm font-semibold mb-4">
              <Clock className="w-4 h-4" />
              Notre Parcours
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Une histoire de <span className="text-[#BF1737]">croissance</span>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#BF1737] via-[#BF1737]/50 to-slate-200 hidden md:block" />

            <div className="space-y-12 md:space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className={`relative flex items-center md:mb-16 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content side */}
                  <div className={`w-full md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                      <span className="inline-block text-[#BF1737] text-sm font-bold mb-2 bg-[#BF1737]/10 px-3 py-1 rounded-full">{item.year}</span>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-[15px]">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#BF1737] border-4 border-white shadow-lg flex items-center justify-center hidden md:flex z-10">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Empty side */}
                  <div className="hidden md:block w-[calc(50%-40px)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DELIVERY / SERVICES ═══════════ */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#BF1737] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/delivery-service.png"
                alt="Service de livraison"
                width={600}
                height={450}
                className="w-full h-[450px] object-cover"
              />
              {/* Floating badge */}
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <div className="text-white font-bold text-lg">Livraison 24/48h</div>
                <div className="text-white/70 text-sm">Partout au Maroc</div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold mb-6">
                <Truck className="w-4 h-4" />
                Nos Services
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Un service <span className="text-[#BF1737]">complet</span> pour vos projets
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                De la sélection des produits à la livraison, nous vous accompagnons
                à chaque étape de votre projet.
              </p>
              <div className="space-y-4">
                {[
                  'Livraison rapide partout au Maroc',
                  'Conseil personnalisé par des experts',
                  'Service après-vente réactif',
                  'Garantie sur tous les produits',
                  'Devis gratuit pour les professionnels',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90">
                    <div className="w-6 h-6 rounded-full bg-[#BF1737]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#BF1737]" />
                    </div>
                    <span className="text-[15px]">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-10 inline-flex items-center gap-2 bg-[#BF1737] text-white px-8 py-4 rounded-xl font-bold text-[15px] hover:bg-[#a01430] transition-all shadow-lg shadow-[#BF1737]/30 hover:shadow-xl group"
              >
                Demander un devis
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ LOCATION / CONTACT ═══════════ */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BF1737]/10 text-[#BF1737] text-sm font-semibold mb-4">
              <MapPin className="w-4 h-4" />
              Nous Trouver
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Rendez-nous <span className="text-[#BF1737]">visite</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Notre équipe vous accueille du lundi au samedi dans nos locaux.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-14 h-14 rounded-2xl bg-[#BF1737]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#BF1737] group-hover:text-white transition-colors text-[#BF1737]">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Adresse</h3>
              <p className="text-slate-500">Quartier Industriel, <br />Casablanca, Maroc</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-14 h-14 rounded-2xl bg-[#BF1737]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#BF1737] group-hover:text-white transition-colors text-[#BF1737]">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Téléphone</h3>
              <p className="text-slate-500">+212 5 22 00 00 00<br />+212 6 00 00 00 00</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow text-center group">
              <div className="w-14 h-14 rounded-2xl bg-[#BF1737]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#BF1737] group-hover:text-white transition-colors text-[#BF1737]">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Horaires</h3>
              <p className="text-slate-500">Lun – Sam : 8h30 – 19h00<br />Dimanche : Fermé</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 bg-gradient-to-r from-[#BF1737] to-[#d32f5a] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight">
            Prêt à démarrer votre prochain projet ?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Explorez notre catalogue de plus de 15 000 produits et bénéficiez de conseils d&apos;experts
            pour réussir tous vos travaux.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#BF1737] px-10 py-4 rounded-xl font-bold text-[16px] hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-0.5"
            >
              Explorer la boutique
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold text-[16px] hover:bg-white/10 transition-all"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
