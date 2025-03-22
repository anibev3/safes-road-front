// types/globals.d.ts

// Google Maps API n'est pas disponible par défaut en TypeScript
declare global {
    interface Window {
        google: any;
        initMap: () => void; // Fonction pour initialiser la carte Google Maps
    }
}

export {};
