'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ChevronDown, Facebook, Instagram, Linkedin, Shield, Twitter } from 'lucide-react';

export default function Footer() {
    // État pour gérer les sections du footer dépliables sur mobile
    const [openSections, setOpenSections] = useState({
        company: false,
        resources: false,
        legal: false
    });

    // Fonction pour basculer l'état d'une section spécifique
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <footer className='bg-gray-900 text-gray-300'>
            {/* Section principale du footer */}
            <div className='container mx-auto px-4 py-8 md:py-12'>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
                    {/* Logo et description */}
                    <div className='md:col-span-1'>
                        <Link href='/' className='mb-4 flex items-center'>
                            <Shield className='mr-2 h-8 w-8 text-blue-400' />
                            <span className='text-xl font-bold text-white'>Safes Road</span>
                        </Link>
                        <p className='mb-4 text-sm text-gray-400'>
                            Naviguez en toute sécurité sur les routes avec notre application dédiée aux chauffeurs
                            professionnels.
                        </p>
                        <div className='mt-4 flex space-x-4'>
                            <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Facebook className='h-5 w-5' />
                            </a>
                            <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Twitter className='h-5 w-5' />
                            </a>
                            <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Instagram className='h-5 w-5' />
                            </a>
                            <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Linkedin className='h-5 w-5' />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Entreprise - Accordéon sur mobile */}
                    <div className='md:col-span-1'>
                        <button
                            className='mb-4 flex w-full items-center justify-between md:mb-6 md:cursor-default'
                            onClick={() => toggleSection('company')}>
                            <h3 className='text-lg font-semibold text-white'>Entreprise</h3>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform md:hidden ${openSections.company ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div className={`space-y-2 ${openSections.company ? 'block' : 'hidden'} md:block`}>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                À propos
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Carrières
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Blog
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Contactez-nous
                            </Link>
                        </div>
                    </div>

                    {/* Ressources - Accordéon sur mobile */}
                    <div className='md:col-span-1'>
                        <button
                            className='mb-4 flex w-full items-center justify-between md:mb-6 md:cursor-default'
                            onClick={() => toggleSection('resources')}>
                            <h3 className='text-lg font-semibold text-white'>Ressources</h3>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform md:hidden ${openSections.resources ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div className={`space-y-2 ${openSections.resources ? 'block' : 'hidden'} md:block`}>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Centre d'aide
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Guides
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                FAQ
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Communauté
                            </Link>
                        </div>
                    </div>

                    {/* Légal - Accordéon sur mobile */}
                    <div className='md:col-span-1'>
                        <button
                            className='mb-4 flex w-full items-center justify-between md:mb-6 md:cursor-default'
                            onClick={() => toggleSection('legal')}>
                            <h3 className='text-lg font-semibold text-white'>Légal</h3>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform md:hidden ${openSections.legal ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div className={`space-y-2 ${openSections.legal ? 'block' : 'hidden'} md:block`}>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Politique de confidentialité
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Conditions d'utilisation
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Politique de cookies
                            </Link>
                            <Link href='#' className='block py-1 text-gray-400 transition-colors hover:text-white'>
                                Licences
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de droits d'auteur */}
            <div className='border-t border-gray-800 px-4 py-6'>
                <div className='container mx-auto flex flex-col items-center justify-between md:flex-row'>
                    <p className='mb-4 text-center text-sm text-gray-500 md:mb-0 md:text-left'>
                        &copy; {new Date().getFullYear()} Safes Road. Tous droits réservés.
                    </p>
                    <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-500 md:justify-end'>
                        <Link href='#' className='transition-colors hover:text-white'>
                            Plan du site
                        </Link>
                        <Link href='#' className='transition-colors hover:text-white'>
                            Accessibilité
                        </Link>
                        <div className='hidden md:block'>|</div>
                        <span>Développé avec ❤️ Vianney Anibe</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
