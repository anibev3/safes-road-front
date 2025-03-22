'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

interface AuthRedirectProps {
    redirectTo?: string;
    children: React.ReactNode;
}

/**
 * Composant pour rediriger les utilisateurs déjà authentifiés
 * Utile pour les pages comme login, register, etc.
 */
export default function AuthRedirect({ redirectTo = '/', children }: AuthRedirectProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    // Rendre les enfants uniquement si l'utilisateur n'est pas authentifié
    // ou si la vérification d'authentification est en cours
    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-center'>
                    <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700'></div>
                    <p className='text-gray-500'>Chargement...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Ne rien rendre pendant la redirection
    }

    return <>{children}</>;
}
