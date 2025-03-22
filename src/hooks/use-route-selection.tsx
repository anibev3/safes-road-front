// hooks/use-route-selection.tsx
'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { routeHistoryService } from '@/lib/services/history-service';
import { routeService } from '@/lib/services/route-service';
import { DisplayRouteResponse, RouteModel, RoutePointModel } from '@/utils/models/route';

// hooks/use-route-selection.tsx

// hooks/use-route-selection.tsx

// hooks/use-route-selection.tsx

// hooks/use-route-selection.tsx

// hooks/use-route-selection.tsx

export function useRouteSelection() {
    // États pour les listes
    const [routes, setRoutes] = useState<RouteModel[]>([]);
    const [departureCities, setDepartureCities] = useState<Set<string>>(new Set());
    const [destinationRoutes, setDestinationRoutes] = useState<RouteModel[]>([]);
    const [departurePoints, setDeparturePoints] = useState<RoutePointModel[]>([]);
    const [destinationPoints, setDestinationPoints] = useState<RoutePointModel[]>([]);

    // États pour les sélections
    const [selectedDepartureCity, setSelectedDepartureCity] = useState<string>('');
    const [selectedDestinationCity, setSelectedDestinationCity] = useState<string>('');
    const [selectedStartPoint, setSelectedStartPoint] = useState<RoutePointModel | null>(null);
    const [selectedEndPoint, setSelectedEndPoint] = useState<RoutePointModel | null>(null);

    // État de chargement
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ID des villes
    const [departureCityId, setDepartureCityId] = useState<number | null>(null);
    const [destinationCityId, setDestinationCityId] = useState<number | null>(null);

    const router = useRouter();

    // Charger les routes initiales
    useEffect(() => {
        loadInitialRoutes();
    }, []);

    async function loadInitialRoutes() {
        try {
            setIsLoading(true);
            setError(null);

            const routesList = await routeService.getAllRoutes();
            setRoutes(routesList);

            // Extraire les villes de départ uniques
            const uniqueDepartureCities = new Set(routesList.map((r) => r.departure_city));
            setDepartureCities(uniqueDepartureCities);

            console.log('📍 Routes chargées:', routesList.length);
            console.log('📍 Villes de départ:', uniqueDepartureCities);
        } catch (err) {
            console.error('❌ Erreur chargement initial:', err);
            setError('Impossible de charger les trajets');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDepartureChange(value: string) {
        console.log('🏁 Ville départ sélectionnée:', value);

        if (!value) return;

        try {
            // Réinitialiser les champs
            setSelectedDestinationCity('');
            setSelectedStartPoint(null);
            setSelectedEndPoint(null);

            // Rechercher l'ID de la ville
            const route = routes.find((r) => r.departure_city === value);
            if (!route) {
                throw new Error('Ville de départ non trouvée');
            }

            setDepartureCityId(route.departure_city_id);
            setSelectedDepartureCity(value);

            setIsLoading(true);
            setError(null);

            // Charger les points de départ
            const points = await routeService.getPointsByCityId(route.departure_city_id);
            setDeparturePoints(points);

            // Charger les destinations possibles
            const destinations = await routeService.getDestinationCities(route.departure_city_id);
            setDestinationRoutes(destinations);
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError('Impossible de charger les données');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDestinationChange(value: string) {
        console.log('🏁 Ville destination sélectionnée:', value);

        if (!value) return;

        try {
            // Réinitialiser le point d'arrivée
            setSelectedEndPoint(null);

            // Rechercher la route
            const selectedRoute = destinationRoutes.find((r) => r.destination_city === value);
            if (!selectedRoute) {
                throw new Error('Ville de destination non trouvée');
            }

            setDestinationCityId(selectedRoute.destination_city_id);
            setSelectedDestinationCity(value);

            setIsLoading(true);
            setError(null);

            // Charger les points d'arrivée
            const points = await routeService.getPointsByCityId(selectedRoute.destination_city_id);
            setDestinationPoints(points);
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError("Impossible de charger les points d'arrivée");
        } finally {
            setIsLoading(false);
        }
    }

    function handleStartPointSelected(pointId: number) {
        const point = departurePoints.find((p) => p.id === pointId);
        if (point) {
            setSelectedStartPoint(point);
            console.log('📍 Point départ sélectionné:', point.label);
        }
    }

    function handleEndPointSelected(pointId: number) {
        const point = destinationPoints.find((p) => p.id === pointId);
        if (point) {
            setSelectedEndPoint(point);
            console.log('📍 Point arrivée sélectionné:', point.label);
        }
    }

    function clearStartPoint() {
        setSelectedStartPoint(null);
    }

    function clearEndPoint() {
        setSelectedEndPoint(null);
    }

    async function showRoute() {
        if (!selectedStartPoint || !selectedEndPoint || !departureCityId || !destinationCityId) {
            setError("Veuillez sélectionner les points de départ et d'arrivée");

            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await routeService.displayRoute({
                starting_point_longitude: parseFloat(selectedStartPoint.longitude),
                starting_point_latitude: parseFloat(selectedStartPoint.latitude),
                end_point_longitude: parseFloat(selectedEndPoint.longitude),
                end_point_latitude: parseFloat(selectedEndPoint.latitude),
                departure_city_id: departureCityId,
                destination_city_id: destinationCityId
            });

            // Ajouter à l'historique et récupérer l'ID
            const routeId = routeHistoryService.addToHistory(response);

            if (!routeId) {
                throw new Error("Erreur lors de l'enregistrement de l'itinéraire");
            }

            // Rediriger avec seulement l'ID
            router.push(`/map?routeId=${routeId}`);
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError("Impossible d'afficher le trajet");
        } finally {
            setIsLoading(false);
        }
    }

    return {
        // États
        routes,
        departureCities: Array.from(departureCities),
        destinationRoutes,
        departurePoints,
        destinationPoints,
        selectedDepartureCity,
        selectedDestinationCity,
        selectedStartPoint,
        selectedEndPoint,
        isLoading,
        error,

        // Actions
        handleDepartureChange,
        handleDestinationChange,
        handleStartPointSelected,
        handleEndPointSelected,
        clearStartPoint,
        clearEndPoint,
        showRoute
    };
}
