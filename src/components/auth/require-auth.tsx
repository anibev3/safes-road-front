'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

interface RequireAuthProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 */
export default function RequireAuth({ children, redirectTo = '/auth/login' }: RequireAuthProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-center'>
                    <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700'></div>
                    <p className='text-gray-500'>Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Ne rien rendre si l'utilisateur n'est pas authentifié (pendant la redirection)
    if (!isAuthenticated) {
        return null;
    }

    // Rendre les enfants si l'utilisateur est authentifié
    return <>{children}</>;
}
