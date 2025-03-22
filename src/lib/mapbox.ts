// lib/mapbox.ts
import mapboxgl from 'mapbox-gl';

// Remplacer par votre clé API Mapbox
const MAPBOX_ACCESS_TOKEN = 'VOTRE_CLE_API_MAPBOX';

// Initialisation du token Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// Types pour les points géographiques
export interface GeoPoint {
    lat: number;
    lng: number;
}

// Types pour les risques
export interface Risk {
    id: string;
    type: string;
    location: GeoPoint;
    severity: 'low' | 'medium' | 'high';
    description?: string;
    reportedBy: string;
    timestamp: string;
}

// Interface pour les services de cartographie
export interface MapService {
    initializeMap(container: HTMLElement): Promise<mapboxgl.Map>;
    addMarker(map: mapboxgl.Map, point: GeoPoint, options?: any): mapboxgl.Marker;
    addRiskMarker(map: mapboxgl.Map, risk: Risk): mapboxgl.Marker;
    calculateRoute(start: GeoPoint, end: GeoPoint): Promise<any>;
    flyTo(map: mapboxgl.Map, point: GeoPoint, zoom?: number): void;
    getCurrentPosition(): Promise<GeoPoint>;
}

// Implémentation du service de cartographie avec Mapbox
export class MapboxService implements MapService {
    async initializeMap(container: HTMLElement): Promise<mapboxgl.Map> {
        const map = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [2.3522, 48.8566], // Paris par défaut
            zoom: 13
        });

        // Attendre que la carte soit chargée
        return new Promise((resolve) => {
            map.on('load', () => resolve(map));
        });
    }

    addMarker(map: mapboxgl.Map, point: GeoPoint, options: any = {}): mapboxgl.Marker {
        const { color = '#3b82f6', draggable = false } = options;

        return new mapboxgl.Marker({ color, draggable }).setLngLat([point.lng, point.lat]).addTo(map);
    }

    addRiskMarker(map: mapboxgl.Map, risk: Risk): mapboxgl.Marker {
        // Couleur selon la sévérité
        let color = '#22c55e'; // low - vert
        if (risk.severity === 'medium') color = '#eab308'; // medium - jaune
        if (risk.severity === 'high') color = '#ef4444'; // high - rouge

        const marker = this.addMarker(map, risk.location, { color });

        // Ajouter un popup avec les informations du risque
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div>
        <h3 class="font-medium">${risk.type}</h3>
        ${risk.description ? `<p>${risk.description}</p>` : ''}
        <p class="text-xs text-gray-500">Signalé le ${new Date(risk.timestamp).toLocaleString()}</p>
      </div>
    `);

        marker.setPopup(popup);

        return marker;
    }

    async calculateRoute(start: GeoPoint, end: GeoPoint): Promise<any> {
        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${start.lng},${start.lat};${end.lng},${end.lat}` +
                `?alternatives=true&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
        );

        return response.json();
    }

    flyTo(map: mapboxgl.Map, point: GeoPoint, zoom: number = 15): void {
        map.flyTo({
            center: [point.lng, point.lat],
            zoom,
            essential: true
        });
    }

    async getCurrentPosition(): Promise<GeoPoint> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));

                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}

// Instance unique du service
export const mapService = new MapboxService();
