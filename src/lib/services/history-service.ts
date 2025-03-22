import { DisplayRouteResponse } from '@/utils/models/route';

interface RouteHistoryItem {
    id: string;
    timestamp: number;
    route: DisplayRouteResponse;
    name: string;
    startLocation: string;
    endLocation: string;
    isFavorite: boolean;
}

const HISTORY_STORAGE_KEY = 'route_history';
const MAX_HISTORY_ITEMS = 20;

class RouteHistoryService {
    /**
     * Récupère les itinéraires favoris
     */
    getFavorites(): RouteHistoryItem[] {
        try {
            const history = this.getHistory();

            return history.filter((item) => item.isFavorite);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des favoris:', error);

            return [];
        }
    }
    /**
     * Marque ou démarque un itinéraire comme favori
     */
    toggleFavorite(routeId: string): boolean {
        try {
            const history = this.getHistory();

            // Trouver l'élément à modifier
            const itemIndex = history.findIndex((item) => item.id === routeId);
            if (itemIndex === -1) {
                return false;
            }

            // Inverser l'état du favori
            history[itemIndex].isFavorite = !history[itemIndex].isFavorite;

            // Sauvegarder l'historique mis à jour
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

            return true;
        } catch (error) {
            console.error('❌ Erreur lors du changement de statut favori:', error);

            return false;
        }
    }
    /**
     * Ajoute un itinéraire à l'historique
     */
    addToHistory(route: DisplayRouteResponse): string {
        try {
            const history = this.getHistory();

            // Créer un nouvel élément d'historique
            const routeId = `route_${Date.now()}`;
            const historyItem: RouteHistoryItem = {
                id: routeId,
                timestamp: Date.now(),
                route,
                name: route.route?.label || 'Itinéraire sans nom',
                startLocation: route.locations?.[0]?.risk_label || 'Départ inconnu',
                endLocation: route.locations?.[route.locations?.length - 1]?.risk_label || 'Arrivée inconnue',
                isFavorite: false
            };

            // Ajouter au début de l'historique
            history.unshift(historyItem);

            // Limiter à MAX_HISTORY_ITEMS éléments
            if (history.length > MAX_HISTORY_ITEMS) {
                history.splice(MAX_HISTORY_ITEMS);
            }

            // Sauvegarder l'historique mis à jour
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

            // Sauvegarder également l'itinéraire individuel
            localStorage.setItem(routeId, JSON.stringify(route));

            return routeId;
        } catch (error) {
            console.error("❌ Erreur lors de l'ajout à l'historique:", error);

            return '';
        }
    }

    /**
     * Récupère l'historique des itinéraires
     */
    getHistory(): RouteHistoryItem[] {
        try {
            const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!historyJson) return [];

            return JSON.parse(historyJson);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération de l'historique:", error);

            return [];
        }
    }

    /**
     * Récupère un itinéraire spécifique
     */
    getRoute(routeId: string): DisplayRouteResponse | null {
        try {
            const routeJson = localStorage.getItem(routeId);
            if (!routeJson) return null;

            return JSON.parse(routeJson);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération de l'itinéraire:", error);

            return null;
        }
    }

    /**
     * Supprime un itinéraire de l'historique
     */
    removeFromHistory(routeId: string): boolean {
        try {
            const history = this.getHistory();

            // Filtrer l'élément à supprimer
            const newHistory = history.filter((item) => item.id !== routeId);

            // Si la taille n'a pas changé, l'élément n'a pas été trouvé
            if (newHistory.length === history.length) {
                return false;
            }

            // Sauvegarder l'historique mis à jour
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));

            // Supprimer l'itinéraire individuel
            localStorage.removeItem(routeId);

            return true;
        } catch (error) {
            console.error("❌ Erreur lors de la suppression de l'historique:", error);

            return false;
        }
    }

    /**
     * Efface tout l'historique
     */
    clearHistory(): boolean {
        try {
            const history = this.getHistory();

            // Supprimer tous les itinéraires individuels
            history.forEach((item) => {
                localStorage.removeItem(item.id);
            });

            // Supprimer l'historique
            localStorage.removeItem(HISTORY_STORAGE_KEY);

            return true;
        } catch (error) {
            console.error("❌ Erreur lors de la suppression de l'historique:", error);

            return false;
        }
    }
}

// Export singleton
export const routeHistoryService = new RouteHistoryService();
