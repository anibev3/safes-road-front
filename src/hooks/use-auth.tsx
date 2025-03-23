// hooks/use-auth.tsx
'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { authService } from '@/lib/services/auth-service';
import { UserModel } from '@/utils/models/user';

// hooks/use-auth.tsx

// hooks/use-auth.tsx

// Clés pour le stockage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Type pour le contexte d'authentification
interface AuthContextType {
    user: UserModel | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider pour le contexte
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<UserModel | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialisation de l'état d'auth au chargement
    useEffect(() => {
        const initAuth = async () => {
            try {
                setIsLoading(true);

                // Récupérer le token du stockage
                const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

                if (!storedToken) {
                    setIsLoading(false);

                    return;
                }

                // Définir le token
                setToken(storedToken);

                // Essayer de récupérer les données utilisateur du stockage d'abord
                const storedUserData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
                if (storedUserData) {
                    try {
                        setUser(JSON.parse(storedUserData));
                    } catch (e) {
                        console.error('Erreur lors du parsing des données utilisateur stockées:', e);
                    }
                }

                // Rafraîchir les données utilisateur depuis l'API
                try {
                    const userData = await authService.getCurrentUser(storedToken);
                    setUser(userData);

                    // Mettre à jour les données stockées
                    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
                    storage.setItem(USER_KEY, JSON.stringify(userData));
                } catch (error) {
                    console.error('Erreur lors de la récupération des données utilisateur:', error);

                    // Si erreur 401, le token est probablement expiré, se déconnecter
                    handleLogout();
                }
            } catch (error) {
                console.error("Erreur lors de l'initialisation de l'authentification:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [router]);

    // Connexion
    const handleLogin = async (email: string, password: string, remember = false): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Appel à l'API pour la connexion
            const authResponse = await authService.login(email, password);

            console.log('============>', authResponse);

            // Stocker le token
            const storage = remember ? localStorage : sessionStorage;
            console.log('============>', storage);
            const token = authResponse.data.token;
            console.log('============>', token);
            storage.setItem(TOKEN_KEY, token);
            // if (authResponse.refreshToken) {
            //     storage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
            // }

            setToken(token);

            // Récupérer les informations utilisateur
            const userData = await authService.getCurrentUser(token);
            console.log('============>', userData);
            setUser(userData);

            // Stocker les données utilisateur
            storage.setItem(USER_KEY, JSON.stringify(userData));

            return true;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);

            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Déconnexion
    const handleLogout = async (): Promise<void> => {
        try {
            setIsLoading(true);

            // Appel à l'API pour la déconnexion si un token est disponible
            if (token) {
                // await authService.logout(token);
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Nettoyer le stockage et l'état
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);

            setToken(null);
            setUser(null);
            setIsLoading(false);

            // Rediriger vers la page de connexion
            router.push('/');
        }
    };

    // Rafraîchir les données utilisateur
    const refreshUserData = async (): Promise<void> => {
        if (!token) return;

        try {
            setIsLoading(true);

            // Récupérer les informations utilisateur
            const userData = await authService.getCurrentUser(token);
            setUser(userData);

            // Mettre à jour les données stockées
            const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
            storage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
            // Si erreur 401, le token est probablement expiré, se déconnecter
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    // Valeur du contexte
    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        refreshUserData
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }

    return context;
}
