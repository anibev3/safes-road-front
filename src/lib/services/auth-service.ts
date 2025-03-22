// lib/services/auth-service.ts
import {
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    UserModel,
    UserResponse,
    createEmptyUser
} from '@/utils/models/user';

import { httpClient } from '../api/http-client';

// Endpoints pour l'authentification
const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    USER: '/auth/user',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
};

class AuthService {
    /**
     * Connexion utilisateur
     * @param email Email de l'utilisateur
     * @param password Mot de passe de l'utilisateur
     * @returns Promise contenant la réponse de l'API
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const payload: LoginRequest = { username: email, password };

            return await httpClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload);
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }

    /**
     * Récupérer les informations de l'utilisateur
     * @param token Token d'authentification
     * @returns Promise contenant les informations utilisateur
     */
    async getCurrentUser(token: string): Promise<UserModel> {
        try {
            // Le token est géré par le client HTTP
            const data = await httpClient.get<UserResponse>(AUTH_ENDPOINTS.USER);
            console.log('========================');
            console.log('============>', data);
            console.log('========================');

            return data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            throw error;
        }
    }

    /**
     * Rafraîchir le token d'authentification
     * @param refreshToken Token de rafraîchissement
     * @returns Promise contenant le nouveau token
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const payload: RefreshTokenRequest = { refreshToken };

            return await httpClient.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, payload);
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            throw error;
        }
    }

    /**
     * Déconnexion utilisateur
     * @returns Promise<void>
     */
    async logout(): Promise<void> {
        try {
            await httpClient.post(AUTH_ENDPOINTS.LOGOUT, {});
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            // On n'arrête pas la déconnexion en cas d'erreur
            // C'est juste une demande de nettoyage côté serveur
        }
    }
}

// Singleton d'instance
export const authService = new AuthService();
