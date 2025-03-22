// lib/services/route-service.ts
import { DisplayRouteResponse, RouteModel, RoutePointModel } from '@/utils/models/route';

import { apiClient } from './api-client';

interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: boolean;
}

class RouteService {
    /**
     * Récupère toutes les routes disponibles
     */
    async getAllRoutes(): Promise<RouteModel[]> {
        try {
            const response = await apiClient.get<ApiResponse<{ data: RouteModel[] }>>('/routes/all/list');

            if (!response || !response.data || !response.data.data) {
                throw new Error('Réponse invalide du serveur');
            }
            console.log('📍 Réponse getAllRoutes:', response.data.data[0].description);

            console.log('📍 Réponse getAllRoutes:', response.data.data);

            return response.data.data;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des routes:', error);
            throw error;
        }
    }

    /**
     * Récupère les points pour une ville donnée
     * @param cityId ID de la ville
     */
    async getPointsByCityId(cityId: number): Promise<RoutePointModel[]> {
        try {
            const response = await apiClient.get<ApiResponse<RoutePointModel[]>>('/risks/point/list', {
                params: {
                    per_page: '100000000000',
                    city_id: cityId.toString()
                }
            });

            if (!response || !response.data) {
                throw new Error('Réponse invalide du serveur');
            }

            console.log(`📍 Points récupérés pour la ville ${cityId}:`, response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des points:', error);
            throw error;
        }
    }

    /**
     * Récupère les villes de destination pour une ville de départ donnée
     * @param departureCityId ID de la ville de départ
     */
    async getDestinationCities(departureCityId: number): Promise<RouteModel[]> {
        try {
            const response = await apiClient.get<ApiResponse<{ data: RouteModel[] }>>(
                '/routes/all-destination-city/list',
                {
                    params: {
                        per_page: '100000000000',
                        city_id: departureCityId.toString()
                    }
                }
            );

            if (!response || !response.data || !response.data.data) {
                throw new Error('Réponse invalide du serveur');
            }

            console.log(`📍 Destinations pour la ville ${departureCityId}:`, response.data);

            return response.data.data;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des destinations:', error);
            throw error;
        }
    }

    /**
     * Affiche un itinéraire entre deux points
     * @param data Données de l'itinéraire
     */
    async displayRoute(data: {
        starting_point_longitude: number;
        starting_point_latitude: number;
        end_point_longitude: number;
        end_point_latitude: number;
        departure_city_id: number;
        destination_city_id: number;
    }): Promise<DisplayRouteResponse> {
        try {
            const response = await apiClient.post<DisplayRouteResponse>('/routes/display', data);

            if (!response) {
                throw new Error('Réponse invalide du serveur');
            }

            console.log('📍 Réponse display route:', response);

            return response;
        } catch (error) {
            console.error("❌ Erreur lors de l'affichage de la route:", error);
            throw error;
        }
    }
}

// Exporte une instance unique
export const routeService = new RouteService();
