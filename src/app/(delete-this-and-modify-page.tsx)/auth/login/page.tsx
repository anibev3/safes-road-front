'use client';

import { useEffect, useState } from 'react';

import LoginPageDesktop from './page-desktop';
import LoginPageMobile from './page-mobile';

// Fonction pour détecter les appareils mobiles
const isMobile = () => {
    if (typeof window === 'undefined') return false;

    return window.innerWidth < 768; // Considérer mobile si < 768px
};

export default function LoginPage() {
    // Par défaut, utiliser "desktop" côté serveur pour éviter les erreurs d'hydratation
    const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setDevice(isMobile() ? 'mobile' : 'desktop');
        setMounted(true);

        // Gestionnaire pour le redimensionnement
        const handleResize = () => {
            setDevice(isMobile() ? 'mobile' : 'desktop');
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ne rien rendre jusqu'à ce que le component soit monté côté client
    if (!mounted) return null;

    // Rendu conditionnel selon le type d'appareil
    return device === 'mobile' ? <LoginPageMobile /> : <LoginPageDesktop />;
}
