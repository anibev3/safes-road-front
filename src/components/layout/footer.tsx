// components/layout/footer.tsx
import Link from 'next/link';

import { Facebook, Instagram, Linkedin, Navigation, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className='bg-gray-900 text-gray-300'>
            <div className='container mx-auto px-4 py-12 md:px-6'>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
                    <div className='space-y-4'>
                        <div className='flex items-center'>
                            <Navigation className='mr-2 h-6 w-6 text-blue-400' />
                            <span className='text-xl font-bold text-white'>RouteGuard</span>
                        </div>
                        <p className='text-sm text-gray-400'>
                            La solution de navigation intelligente pour les chauffeurs longue distance.
                        </p>
                        <div className='flex space-x-4'>
                            <Link href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Facebook className='h-5 w-5' />
                            </Link>
                            <Link href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Twitter className='h-5 w-5' />
                            </Link>
                            <Link href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Instagram className='h-5 w-5' />
                            </Link>
                            <Link href='#' className='text-gray-400 transition-colors hover:text-white'>
                                <Linkedin className='h-5 w-5' />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className='mb-4 font-semibold text-white'>Liens rapides</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/' className='text-gray-400 transition-colors hover:text-white'>
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link href='/#features' className='text-gray-400 transition-colors hover:text-white'>
                                    Fonctionnalités
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/#how-it-works'
                                    className='text-gray-400 transition-colors hover:text-white'>
                                    Comment ça marche
                                </Link>
                            </li>
                            <li>
                                <Link href='/#pricing' className='text-gray-400 transition-colors hover:text-white'>
                                    Tarifs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className='mb-4 font-semibold text-white'>Ressources</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/blog' className='text-gray-400 transition-colors hover:text-white'>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href='/faq' className='text-gray-400 transition-colors hover:text-white'>
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href='/support' className='text-gray-400 transition-colors hover:text-white'>
                                    Support
                                </Link>
                            </li>
                            <li>
                                <Link href='/tutorials' className='text-gray-400 transition-colors hover:text-white'>
                                    Tutoriels
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className='mb-4 font-semibold text-white'>Contact</h3>
                        <ul className='space-y-2'>
                            <li className='text-gray-400'>Email: contact@routeguard.com</li>
                            <li className='text-gray-400'>Téléphone: +33 1 23 45 67 89</li>
                            <li className='text-gray-400'>Adresse: 123 Avenue de la Route, 75000 Paris</li>
                        </ul>
                    </div>
                </div>

                <div className='mt-12 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row'>
                    <p className='text-sm text-gray-500'>
                        &copy; {new Date().getFullYear()} RouteGuard. Tous droits réservés.
                    </p>
                    <div className='mt-4 flex space-x-6 md:mt-0'>
                        <Link href='/privacy' className='text-sm text-gray-500 transition-colors hover:text-white'>
                            Politique de confidentialité
                        </Link>
                        <Link href='/terms' className='text-sm text-gray-500 transition-colors hover:text-white'>
                            Conditions d'utilisation
                        </Link>
                        <Link href='/cookies' className='text-sm text-gray-500 transition-colors hover:text-white'>
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
