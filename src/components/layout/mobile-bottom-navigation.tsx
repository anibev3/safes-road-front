'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { AlertTriangle, History, Home, Map, Navigation, User } from 'lucide-react';

export default function MobileBottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [activeRoute, setActiveRoute] = useState('/');

    useEffect(() => {
        setActiveRoute(pathname);
    }, [pathname]);

    const navItems = [
        { href: '/', label: 'Accueil', icon: <Home className='h-5 w-5' /> },
        { href: '/add-risk', label: 'Ajouter', icon: <Map className='h-5 w-5' /> },
        { href: '/route-selection', label: 'Trajets', icon: <Navigation className='h-5 w-5' /> },
        { href: '/risks', label: 'Risques', icon: <AlertTriangle className='h-5 w-5' /> },
        { href: '/history', label: 'Historique', icon: <History className='h-5 w-5' /> }
    ];

    return (
        <div className='fixed right-0 bottom-0 left-0 z-50 flex h-16 w-full border-t border-gray-200 bg-white md:hidden dark:border-gray-700 dark:bg-gray-900'>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-1 flex-col items-center justify-center space-y-1 ${
                        activeRoute === item.href
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={(e) => {
                        if (item.href === '/navigation' && !window.location.search.includes('routeId')) {
                            e.preventDefault();
                            router.push('/route-selection');
                        }
                    }}>
                    {item.icon}
                    <span className='text-xs'>{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
