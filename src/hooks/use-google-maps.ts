// hooks/use-google-maps.ts
import { config } from '@/lib/api/config';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places', 'geometry'];

export function useGoogleMaps() {
    return useJsApiLoader({
        id: 'google-map-script', // Identifiant consistant
        googleMapsApiKey: config.googleMaps.apiKey,
        libraries: libraries as any
    });
}
