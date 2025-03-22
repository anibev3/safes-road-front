// lib/services/api-client.ts
import { config } from '../api/config';

interface ApiOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.api.baseUrl;
    }

    private getAuthHeader(): Record<string, string> {
        // Récupérer le token d'authentification du localStorage
        let token = '';
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
        }

        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private buildUrl(endpoint: string, params?: Record<string, string>): string {
        const url = new URL(this.baseUrl + endpoint);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }

    async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const { headers = {}, params } = options;
        const url = this.buildUrl(endpoint, params);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                    ...headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête GET ${endpoint}:`, error);
            throw error;
        }
    }

    async post<T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> {
        const { headers = {}, params } = options;
        const url = this.buildUrl(endpoint, params);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                    ...headers
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête POST ${endpoint}:`, error);
            throw error;
        }
    }

    async put<T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> {
        const { headers = {}, params } = options;
        const url = this.buildUrl(endpoint, params);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                    ...headers
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête PUT ${endpoint}:`, error);
            throw error;
        }
    }

    async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const { headers = {}, params } = options;
        const url = this.buildUrl(endpoint, params);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                    ...headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête DELETE ${endpoint}:`, error);
            throw error;
        }
    }
}

// Exporter une instance unique
export const apiClient = new ApiClient();
