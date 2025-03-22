'use client';

import { Suspense } from 'react';

import dynamic from 'next/dynamic';

// Import dynamique avec désactivation du SSR
const MapScreenContent = dynamic(() => import('@/components/map/map-content'), {
    ssr: false, // Important pour éviter les problèmes d'hydratation avec Google Maps
    loading: () => (
        <div className='flex h-screen items-center justify-center'>
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
            <p className='ml-4 text-lg'>Chargement de la carte...</p>
        </div>
    )
});

export default function MapScreen() {
    return (
        <Suspense
            fallback={
                <div className='flex h-screen items-center justify-center'>
                    <div className='h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                    <p className='ml-4 text-lg'>Chargement de la carte...</p>
                </div>
            }>
            <MapScreenContent />
        </Suspense>
    );
}
