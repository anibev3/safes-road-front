// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Définir les chemins publics (accessibles sans authentification)
const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/',
    '/api/auth/login'
];

// Vérifier si un chemin est public
const isPublicPath = (path: string) => {
    return publicPaths.some((publicPath) => {
        // Si c'est exactement le même chemin
        if (publicPath === path) return true;

        // Si c'est un sous-chemin (par exemple, '/reset-password/token')
        if (path.startsWith(publicPath + '/')) return true;

        // Si c'est la racine ou une page d'API publique
        if (publicPath === '/' && path === '/') return true;

        return false;
    });
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Vérifier si le chemin est public
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Vérifier l'authentification
    const token = request.cookies.get('auth_token')?.value || request.headers.get('Authorization')?.split(' ')[1];

    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));

        return NextResponse.redirect(url);
    }

    // Si l'utilisateur est authentifié, continuer
    return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
    matcher: [
        // Appliquer à toutes les routes sauf _next, assets statiques, et fichiers
        '/((?!_next/static|_next/image|favicon.ico|images|assets|.*\\..*|api/auth/login).*)'
    ]
};
