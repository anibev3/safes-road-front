// lib/risk-service.ts
import { GeoPoint, Risk } from './mapbox';

// Types des risques disponibles
export type RiskType =
    | 'pothole' // nid de poule
    | 'speedbump' // dos d'âne
    | 'construction' // travaux
    | 'accident' // accident
    | 'police' // contrôle de police
    | 'weather'; // intempérie

// Interface pour les détails des types de risques
export interface RiskTypeInfo {
    id: RiskType;
    label: string;
    icon: string; // Nom de l'icône Lucide
    description: string;
}

// Catalogue des types de risques
export const riskTypes: RiskTypeInfo[] = [
    {
        id: 'pothole',
        label: 'Nid de poule',
        icon: 'AlertTriangle',
        description: 'Creux dans la chaussée pouvant endommager les véhicules'
    },
    {
        id: 'speedbump',
        label: "Dos d'âne",
        icon: 'AlertTriangle',
        description: 'Ralentisseur sur la route'
    },
    {
        id: 'construction',
        label: 'Travaux',
        icon: 'Construction',
        description: 'Zone de travaux sur la route'
    },
    {
        id: 'accident',
        label: 'Accident',
        icon: 'AlertOctagon',
        description: 'Accident sur la voie'
    },
    {
        id: 'police',
        label: 'Contrôle de police',
        icon: 'Shield',
        description: "Point de contrôle des forces de l'ordre"
    },
    {
        id: 'weather',
        label: 'Intempérie',
        icon: 'Cloud',
        description: 'Conditions météorologiques difficiles (pluie, neige, verglas...)'
    }
];

// Interface pour la création d'un nouveau risque
export interface NewRisk {
    type: RiskType;
    location: GeoPoint;
    description?: string;
    severity: 'low' | 'medium' | 'high';
}

class RiskService {
    private apiUrl = '/api/risks';

    // Récupérer tous les risques
    async getAllRisks(): Promise<Risk[]> {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des risques');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);
            // Retourner un tableau vide en cas d'erreur
            // eslint-disable-next-line newline-before-return
            return [];
        }
    }

    // Récupérer les risques dans une zone géographique
    async getRisksInArea(bounds: {
        sw: GeoPoint; // Sud-Ouest
        ne: GeoPoint; // Nord-Est
    }): Promise<Risk[]> {
        try {
            const params = new URLSearchParams({
                swLat: bounds.sw.lat.toString(),
                swLng: bounds.sw.lng.toString(),
                neLat: bounds.ne.lat.toString(),
                neLng: bounds.ne.lng.toString()
            });

            const response = await fetch(`${this.apiUrl}/area?${params}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des risques dans la zone');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);

            return [];
        }
    }

    // Récupérer les risques le long d'un itinéraire
    async getRisksAlongRoute(routeId: string): Promise<Risk[]> {
        try {
            const response = await fetch(`${this.apiUrl}/route/${routeId}`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des risques sur l'itinéraire");
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);

            return [];
        }
    }

    // Créer un nouveau risque
    async createRisk(newRisk: NewRisk): Promise<Risk> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRisk)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du risque');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Mettre à jour un risque existant
    async updateRisk(id: string, updatedRisk: Partial<NewRisk>): Promise<Risk> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedRisk)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du risque');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Supprimer un risque
    async deleteRisk(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du risque');
            }
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Voter pour confirmer un risque
    async voteRisk(id: string, vote: 'up' | 'down'): Promise<Risk> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vote })
            });

            if (!response.ok) {
                throw new Error('Erreur lors du vote');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Obtenir un risque par son ID
    async getRiskById(id: string): Promise<Risk | null> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error('Erreur lors de la récupération du risque');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur:', error);

            return null;
        }
    }
}

// Instance unique du service
export const riskService = new RiskService();
