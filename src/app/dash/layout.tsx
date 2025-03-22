// 'use client';
// import { useEffect, useState } from 'react';
import { ReactNode, useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import RequireAuth from '@/components/auth/require-auth';
import DashboardHeader from '@/components/layout/dashboard-header';
import MobileBottomNavigation from '@/components/layout/mobile-bottom-navigation';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Éviter les erreurs d'hydratation
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Déterminer si nous sommes sur la page de navigation où le header ne doit pas être affiché
    const isNavigationPage = pathname === '/navigation';

    // Déterminer si nous devons afficher la barre de navigation inférieure
    // Ne pas l'afficher sur la page de navigation pour un affichage plus immersif
    const showBottomNav = !isNavigationPage;

    return (
        <RequireAuth>
            <div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
                {pathname !== '/map' && <DashboardHeader />}
                {/* {!isNavigationPage && (
                    <header className='sticky top-0 z-30 flex h-14 items-center border-b bg-white px-4 md:h-16 dark:border-gray-800 dark:bg-gray-900'>
                        <div className='flex items-center'>
                            <Navigation className='mr-2 h-6 w-6 text-blue-600' />
                            <span className='text-lg font-bold text-blue-900 dark:text-white'>RouteGuard</span>
                        </div>
                    </header>
                )} */}

                <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>{children}</main>

                {showBottomNav && <MobileBottomNavigation />}
            </div>
        </RequireAuth>
    );
}

// 'use client';

// import { useEffect } from 'react';

// export function ErrorBoundary({ children }) {
//   useEffect(() => {
//     const handleError = (event) => {
//       console.error('Erreur non captée:', event.error);
//       // Empêche le crash complet
//       event.preventDefault();
//     };

//     window.addEventListener('error', handleError);

//     return () => {
//       window.removeEventListener('error', handleError);
//     };
//   }, []);

//   return children;
// }
