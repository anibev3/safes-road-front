'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { config } from '@/lib/api/config';
import { routeHistoryService } from '@/lib/services/history-service';
import { DisplayRouteResponse, LocationPoint } from '@/utils/models/route';

import { useGoogleMaps } from './use-google-maps';

// Définition des bibliothèques Google Maps à charger
const libraries = ['places', 'geometry'];

interface UseMapRouteProps {
    defaultCenter?: { lat: number; lng: number };
    defaultZoom?: number;
}

export function useMapRoute({
    defaultCenter = { lat: 5.36, lng: -4.0083 }, // Abidjan par défaut
    defaultZoom = 12
}: UseMapRouteProps = {}) {
    const { isLoaded, loadError } = useGoogleMaps();

    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentRouteData, setCurrentRouteData] = useState<DisplayRouteResponse | null>(null);
    const [selectedRisk, setSelectedRisk] = useState<LocationPoint | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // États pour les fonctionnalités supplémentaires
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
    const [showTraffic, setShowTraffic] = useState<boolean>(true);
    const [showBicyclingLayer, setShowBicyclingLayer] = useState<boolean>(false);
    const [showTransitLayer, setShowTransitLayer] = useState<boolean>(false);
    const [routeAlternatives, setRouteAlternatives] = useState<google.maps.DirectionsResult[]>([]);
    const [selectedAlternative, setSelectedAlternative] = useState<number>(0);
    const [routeMetrics, setRouteMetrics] = useState<{
        distance: string;
        duration: string;
        estimatedArrival: string;
    } | null>(null);
    const [infoWindowVisible, setInfoWindowVisible] = useState<boolean>(false);
    const [infoWindowContent, setInfoWindowContent] = useState<string>('');
    const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLng | null>(null);

    // Fonction pour changer le type de carte
    const changeMapType = (type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
        if (mapRef.current) {
            setMapType(type);
            mapRef.current.setMapTypeId(type);
        }
    };

    // Fonction pour afficher/masquer les couches supplémentaires
    const toggleTrafficLayer = () => setShowTraffic((prev) => !prev);
    const toggleBicyclingLayer = () => setShowBicyclingLayer((prev) => !prev);
    const toggleTransitLayer = () => setShowTransitLayer((prev) => !prev);

    // Récupérer les données de l'itinéraire depuis l'URL
    useEffect(() => {
        const routeId = searchParams.get('routeId');
        if (routeId) {
            try {
                const routeData = routeHistoryService.getRoute(routeId);
                if (routeData) {
                    setCurrentRouteData(routeData);
                } else {
                    setError('Itinéraire introuvable');
                }
            } catch (err) {
                console.error("❌ Erreur lors de la récupération des données de l'itinéraire:", err);
                setError("Données d'itinéraire invalides");
            }
        }
    }, [searchParams]);

    // Géolocalisation de l'utilisateur
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.warn("Impossible d'obtenir la position:", err.message);
                }
            );
        }
    }, []);

    // Fonction pour initialiser la carte
    const onMapLoad = useCallback(
        (map: google.maps.Map) => {
            mapRef.current = map;
            setMapLoaded(true);

            // Centrer sur la position de l'utilisateur si disponible
            if (userLocation) {
                map.setCenter(userLocation);
            }

            setIsLoading(false);
        },
        [userLocation]
    );

    // Afficher l'itinéraire quand les données sont disponibles
    useEffect(() => {
        if (!mapLoaded || !currentRouteData || !mapRef.current || !isLoaded) return;

        try {
            setIsLoading(true);
            displayRouteWithAlternatives(currentRouteData);
        } catch (err) {
            console.error("❌ Erreur lors de l'affichage de l'itinéraire:", err);
            setError("Erreur lors de l'affichage de l'itinéraire");
        } finally {
            setIsLoading(false);
        }
    }, [mapLoaded, currentRouteData, isLoaded]);

    // Fonction pour afficher l'itinéraire avec alternatives
    const displayRouteWithAlternatives = async (routeData: DisplayRouteResponse) => {
        if (!mapRef.current || !routeData.locations || routeData.locations.length < 2) return;

        // Nettoyer la carte
        clearMap();

        const map = mapRef.current;

        // Créer les marqueurs pour chaque point de risque
        routeData.locations.forEach((location, index) => {
            if (!location.lat || !location.lng) return;

            // Créer le marqueur
            const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.risk_label || '',
                icon: {
                    url: config.api.iconUrl + (location.icon || ''),
                    scaledSize: new google.maps.Size(48, 48)
                }
            });

            // Ajouter un écouteur d'événements pour le clic
            marker.addListener('click', () => {
                setSelectedRisk(location);
            });

            markersRef.current.push(marker);
        });

        // Tracer l'itinéraire entre les points avec alternatives
        const waypoints = routeData.locations
            .filter((loc) => loc.lat && loc.lng)
            .map((loc) => ({
                location: { lat: loc.lat!, lng: loc.lng! }
            }));

        if (waypoints.length >= 2) {
            // Créer le renderer de directions s'il n'existe pas
            if (!directionsRendererRef.current) {
                directionsRendererRef.current = new google.maps.DirectionsRenderer({
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: '#0A4D68',
                        strokeOpacity: 1.0,
                        strokeWeight: 4
                    }
                });
                directionsRendererRef.current.setMap(map);
            }

            // Créer le service de directions
            const directionsService = new google.maps.DirectionsService();

            // Points de départ et d'arrivée
            const origin = waypoints[0].location;
            const destination = waypoints[waypoints.length - 1].location;

            // Waypoints intermédiaires
            const intermediateWaypoints = waypoints.slice(1, -1);

            try {
                // Demander les directions avec alternatives
                const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
                    directionsService.route(
                        {
                            origin,
                            destination,
                            waypoints: intermediateWaypoints,
                            travelMode: google.maps.TravelMode.DRIVING,
                            optimizeWaypoints: false,
                            provideRouteAlternatives: true, // Demander des alternatives
                            avoidHighways: false,
                            avoidTolls: false,
                            drivingOptions: {
                                departureTime: new Date(), // Utiliser l'heure actuelle
                                trafficModel: google.maps.TrafficModel.BEST_GUESS
                            }
                        },
                        (result, status) => {
                            if (status === google.maps.DirectionsStatus.OK && result) {
                                resolve(result);
                            } else {
                                reject(new Error(`Erreur de directions: ${status}`));
                            }
                        }
                    );
                });

                // Stocker les alternatives
                setRouteAlternatives([result]);
                setSelectedAlternative(0);

                // Calculer et stocker les métriques de l'itinéraire
                if (result.routes.length > 0 && result.routes[0].legs.length > 0) {
                    const leg = result.routes[0].legs[0];
                    const now = new Date();
                    const arrivalTime = new Date(now.getTime() + (leg.duration?.value ?? 0) * 1000);

                    setRouteMetrics({
                        distance: leg.distance?.text ?? '',
                        duration: leg.duration?.text ?? '',
                        estimatedArrival: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }

                // Afficher les directions
                directionsRendererRef.current.setDirections(result);

                // Ajuster la vue pour voir tout l'itinéraire
                if (result.routes.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    result.routes[0].legs.forEach((leg) => {
                        bounds.extend(leg.start_location);
                        bounds.extend(leg.end_location);
                    });
                    map.fitBounds(bounds);
                }
            } catch (err) {
                console.error("❌ Erreur lors du calcul de l'itinéraire:", err);

                // En cas d'erreur, simplement relier les points par une ligne droite
                const path = waypoints.map((wp) => wp.location);
                new google.maps.Polyline({
                    path,
                    geodesic: true,
                    strokeColor: '#0A4D68',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    map
                });

                // Ajuster la vue
                const bounds = new google.maps.LatLngBounds();
                path.forEach((point) => bounds.extend(point));
                map.fitBounds(bounds);
            }
        }
    };

    // Ancienne fonction displayRoute maintenue pour compatibilité
    const displayRoute = displayRouteWithAlternatives;

    // Nettoyer la carte
    const clearMap = () => {
        // Supprimer les marqueurs
        markersRef.current.forEach((marker) => {
            marker.setMap(null);
        });
        markersRef.current = [];

        // Supprimer les directions
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }
    };

    // Zoomer
    const zoomIn = () => {
        if (!mapRef.current) return;
        const currentZoom = mapRef.current.getZoom() || defaultZoom;
        mapRef.current.setZoom(currentZoom + 1);
    };

    // Dézoomer
    const zoomOut = () => {
        if (!mapRef.current) return;
        const currentZoom = mapRef.current.getZoom() || defaultZoom;
        mapRef.current.setZoom(currentZoom - 1);
    };

    // Centrer sur la position de l'utilisateur
    const centerOnUserLocation = () => {
        if (!mapRef.current) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    mapRef.current?.setCenter(userLocation);
                    mapRef.current?.setZoom(15);

                    setUserLocation(userLocation);
                },
                (err) => {
                    console.warn("Impossible d'obtenir la position:", err.message);
                    setError("Impossible d'accéder à votre position");
                }
            );
        } else {
            setError("La géolocalisation n'est pas prise en charge par votre navigateur");
        }
    };

    // Prendre une capture d'écran
    const takeScreenshot = () => {
        if (!mapRef.current) return;

        try {
            // Utiliser la fonction toDataURL du canvas de la carte
            const mapCanvas = mapRef.current.getDiv().querySelector('canvas');
            if (mapCanvas) {
                const dataUrl = mapCanvas.toDataURL('image/png');

                // Créer un élément canvas temporaire pour ajouter des informations
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    // Définir la taille du canvas
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;

                    // Dessiner l'image de la carte
                    ctx?.drawImage(img, 0, 0);

                    // Ajouter du texte ou des watermarks si nécessaire
                    if (ctx) {
                        ctx.font = 'bold 16px Arial';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(10, 10, 160, 30);
                        ctx.fillStyle = '#0A4D68';
                        ctx.fillText('Safes Road Map', 20, 30);
                    }

                    // Générer l'image finale
                    const finalImage = tempCanvas.toDataURL('image/png');

                    // Créer un lien de téléchargement
                    const link = document.createElement('a');
                    link.href = finalImage;
                    link.download = `safes-road-map-${new Date().toISOString().slice(0, 10)}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };

                img.src = dataUrl;
            } else {
                // Fallback si le canvas n'est pas disponible
                // Utilisez html2canvas ou une autre bibliothèque
                setError('Impossible de capturer la carte. Réessayez plus tard.');
            }
        } catch (err) {
            console.error("❌ Erreur lors de la capture d'écran:", err);
            setError("Erreur lors de la capture d'écran");
        }
    };

    // Fonction pour afficher une fenêtre d'information sur la carte
    const showInfoWindow = (content: string, position: google.maps.LatLng) => {
        setInfoWindowContent(content);
        setInfoWindowPosition(position);
        setInfoWindowVisible(true);
    };

    // Fonction pour fermer la fenêtre d'information
    const closeInfoWindow = () => {
        setInfoWindowVisible(false);
    };

    // Nettoyage lors du démontage
    useEffect(() => {
        return () => {
            clearMap();
        };
    }, []);

    return {
        isLoaded,
        loadError,
        isLoading,
        error,
        mapRef,
        currentRouteData,
        selectedRisk,
        onMapLoad,
        displayRoute,
        displayRouteWithAlternatives,
        zoomIn,
        zoomOut,
        centerOnUserLocation,
        takeScreenshot,
        setSelectedRisk,
        defaultCenter,
        defaultZoom,
        mapType,
        showTraffic,
        showBicyclingLayer,
        showTransitLayer,
        routeAlternatives,
        selectedAlternative,
        routeMetrics,
        infoWindowVisible,
        infoWindowContent,
        infoWindowPosition,
        changeMapType,
        toggleTrafficLayer,
        toggleBicyclingLayer,
        toggleTransitLayer,
        showInfoWindow,
        closeInfoWindow
    };
}
