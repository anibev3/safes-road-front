// lib/services/http-client.ts
import { config } from './config';
import { toast } from 'sonner';

// Clés pour le stockage
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Options par défaut pour les requêtes fetch
const defaultOptions: RequestInit = {
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
};

// Configuration de l'API
const API_URL = config.api.baseUrl;
const API_VERSION = '';

class HttpClient {
    /**
     * Récupère le token d'authentification du stockage
     */
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;

        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }

    /**
     * Ajoute les headers d'authentification si un token est disponible
     */
    private getAuthHeaders(): HeadersInit {
        const token = this.getToken();
        if (!token) return { ...defaultOptions.headers } as HeadersInit;

        return {
            ...defaultOptions.headers,
            Authorization: `Bearer ${token}`
        } as HeadersInit;
    }

    /**
     * Effectue une requête GET
     * @param endpoint Point d'API
     * @param options Options de la requête
     * @returns Promise avec la réponse
     */
    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${API_VERSION}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            await this.handleResponseError(response);
        }

        return await response.json();
    }

    /**
     * Effectue une requête POST
     * @param endpoint Point d'API
     * @param data Données à envoyer
     * @param options Options de la requête
     * @returns Promise avec la réponse
     */
    async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${API_VERSION}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                ...(options.headers || {})
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            await this.handleResponseError(response);
        }

        return await response.json();
    }

    /**
     * Effectue une requête PUT
     * @param endpoint Point d'API
     * @param data Données à envoyer
     * @param options Options de la requête
     * @returns Promise avec la réponse
     */
    async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${API_VERSION}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            method: 'PUT',
            headers: {
                ...this.getAuthHeaders(),
                ...(options.headers || {})
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            await this.handleResponseError(response);
        }

        return await response.json();
    }

    /**
     * Effectue une requête DELETE
     * @param endpoint Point d'API
     * @param options Options de la requête
     * @returns Promise avec la réponse
     */
    async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${API_VERSION}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            method: 'DELETE',
            headers: {
                ...this.getAuthHeaders(),
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            await this.handleResponseError(response);
        }

        return await response.json();
    }

    /**
     * Gère les erreurs de réponse
     * @param response Réponse de l'API
     */
    private async handleResponseError(response: Response): Promise<never> {
        let errorMessage = 'Une erreur est survenue';

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Si la réponse ne contient pas de JSON valide
        }

        // Gérer spécifiquement les erreurs d'authentification
        if (response.status === 401) {
            // Nettoyer le stockage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);

            // Rediriger vers la page de connexion si on est côté client
            if (typeof window !== 'undefined') {
                // window.location.href = '/auth/login';
                toast.error('Session expirée, veuillez vous reconnecter');
            }
        }

        throw new Error(errorMessage);
    }
}

export const httpClient = new HttpClient();
