// components/map/map-container.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { GeoPoint, Risk, mapService } from '@/lib/mapbox';
import { riskService } from '@/lib/risk-service';

import { Loader2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// components/map/map-container.tsx

// components/map/map-container.tsx

interface MapContainerProps {
    initialCenter?: GeoPoint;
    initialZoom?: number;
    onMapLoaded?: (map: mapboxgl.Map) => void;
    onMapClick?: (point: GeoPoint) => void;
    showControls?: boolean;
    markers?: Risk[];
    children?: React.ReactNode;
    className?: string;
}

export default function MapContainer({
    initialCenter = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
    initialZoom = 13,
    onMapLoaded,
    onMapClick,
    showControls = true,
    markers = [],
    children,
    className = ''
}: MapContainerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const markerRefs = useRef<Record<string, mapboxgl.Marker>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialiser la carte Mapbox
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const initMap = async () => {
            try {
                setIsLoading(true);

                // Créer l'instance de la carte
                const map = await mapService.initializeMap(mapContainerRef.current as HTMLElement);
                mapInstanceRef.current = map;

                // Ajouter les contrôles
                if (showControls) {
                    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
                    map.addControl(
                        new mapboxgl.GeolocateControl({
                            positionOptions: {
                                enableHighAccuracy: true
                            },
                            trackUserLocation: true
                        }),
                        'top-right'
                    );
                    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
                }

                // Centrer la carte
                map.setCenter([initialCenter.lng, initialCenter.lat]);
                map.setZoom(initialZoom);

                // Événement de clic sur la carte
                if (onMapClick) {
                    map.on('click', (e) => {
                        onMapClick({
                            lat: e.lngLat.lat,
                            lng: e.lngLat.lng
                        });
                    });
                }

                // Notifier que la carte est chargée
                if (onMapLoaded) {
                    onMapLoaded(map);
                }

                setIsLoading(false);
            } catch (err) {
                setError("Erreur lors de l'initialisation de la carte");
                setIsLoading(false);
                console.error(err);
            }
        };

        initMap();

        // Nettoyage
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [initialCenter, initialZoom, onMapLoaded, onMapClick, showControls]);

    // Ajouter/mettre à jour les marqueurs de risques
    useEffect(() => {
        if (!mapInstanceRef.current || !markers.length) return;

        const map = mapInstanceRef.current;

        // Supprimer les marqueurs qui ne sont plus dans la liste
        const currentMarkerIds = markers.map((marker) => marker.id);
        Object.keys(markerRefs.current).forEach((markerId) => {
            if (!currentMarkerIds.includes(markerId)) {
                markerRefs.current[markerId].remove();
                delete markerRefs.current[markerId];
            }
        });

        // Ajouter ou mettre à jour les marqueurs
        markers.forEach((risk) => {
            if (markerRefs.current[risk.id]) {
                // Mise à jour de la position si nécessaire
                markerRefs.current[risk.id].setLngLat([risk.location.lng, risk.location.lat]);
            } else {
                // Nouveau marqueur
                markerRefs.current[risk.id] = mapService.addRiskMarker(map, risk);
            }
        });
    }, [markers]);

    return (
        <div className={`relative h-full w-full ${className}`}>
            <div ref={mapContainerRef} className='h-full w-full'>
                {isLoading && (
                    <div className='bg-opacity-70 absolute inset-0 z-10 flex items-center justify-center bg-white'>
                        <div className='flex flex-col items-center'>
                            <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-600' />
                            <span>Chargement de la carte...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className='bg-opacity-70 absolute inset-0 z-10 flex items-center justify-center bg-white'>
                        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
                            <p className='font-medium'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {children}
        </div>
    );
}
