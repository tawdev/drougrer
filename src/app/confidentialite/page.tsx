'use client';

import { ShieldCheck, Eye, Lock, Database, Globe, UserCheck } from 'lucide-react';

export default function ConfidentialitePage() {
    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">
                        Politique de <span className="text-[#BF1737]">Confidentialité</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto italic">
                        La protection de vos données personnelles est une priorité absolue chez MOL Droguerie. Découvrez comment nous gérons vos informations en toute transparence.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-24">
                <div className="space-y-16">
                    {/* Intro */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 font-medium leading-[1.8] text-[17px]">
                            Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données à caractère personnel lorsque vous utilisez notre site web <span className="text-[#BF1737] font-bold">moldroguerie.ma</span> et nos services associés. En utilisant notre site, vous acceptez les pratiques décrites dans cette politique.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-12">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 bg-[#FEF0F2] rounded-2xl flex items-center justify-center text-[#BF1737] mb-4">
                                <Database size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase italic leading-tight">Collecte des Données</h2>
                        </div>
                        <div className="text-slate-600 font-medium leading-relaxed space-y-4">
                            <p>Nous collectons les informations que vous nous fournissez directement :</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Informations d'identification (Nom, prénom, adresse e-mail, numéro de téléphone).</li>
                                <li>Informations de livraison (Adresse postale complète).</li>
                                <li>Historique des commandes et préférences d'achat.</li>
                                <li>Données de communication lors de vos échanges via WhatsApp ou email.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-12">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 bg-[#FEF0F2] rounded-2xl flex items-center justify-center text-[#BF1737] mb-4">
                                <Eye size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase italic leading-tight">Utilisation des Informations</h2>
                        </div>
                        <div className="text-slate-600 font-medium leading-relaxed space-y-4">
                            <p>Les données collectées sont utilisées pour les finalités suivantes :</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Traitement et expédition de vos commandes.</li>
                                <li>Gestion de la relation client (support, SAV).</li>
                                <li>Envoi d'offres promotionnelles (uniquement avec votre consentement).</li>
                                <li>Amélioration technique du site et de votre expérience utilisateur.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-12">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 bg-[#FEF0F2] rounded-2xl flex items-center justify-center text-[#BF1737] mb-4">
                                <Lock size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase italic leading-tight">Sécurité & Protection</h2>
                        </div>
                        <div className="text-slate-600 font-medium leading-relaxed">
                            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération ou divulgation. Nos systèmes sont régulièrement mis à jour pour garantir un niveau de protection optimal.</p>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-12">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 bg-[#FEF0F2] rounded-2xl flex items-center justify-center text-[#BF1737] mb-4">
                                <UserCheck size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase italic leading-tight">Vos Droits</h2>
                        </div>
                        <div className="text-slate-600 font-medium leading-relaxed">
                            <p>Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition aux données vous concernant. Pour exercer ces droits, vous pouvez nous contacter à tout moment.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-24 pt-12 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
}
