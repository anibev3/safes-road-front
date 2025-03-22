'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york-v4/ui/avatar';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/registry/new-york-v4/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/registry/new-york-v4/ui/sheet';
import { Skeleton } from '@/registry/new-york-v4/ui/skeleton';

import {
    Bell,
    Calendar,
    ChevronRight,
    CloudDrizzle,
    Compass,
    Home,
    LogOut,
    Map,
    Menu,
    MessageSquare,
    Navigation,
    PlusCircle,
    Route,
    SearchIcon,
    Settings,
    Sun,
    Truck,
    User,
    Zap
} from 'lucide-react';

export default function DynamicHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    // États pour les notifications
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotificationDot, setShowNotificationDot] = useState(true);
    const [weatherInfo, setWeatherInfo] = useState({
        temp: '24°C',
        condition: 'Ensoleillé',
        icon: <Sun className='h-4 w-4 text-yellow-500' />
    });

    // Charger des notifications simulées
    useEffect(() => {
        if (isAuthenticated) {
            // Ici vous pourriez appeler une API pour récupérer de vraies notifications
            const mockNotifications = [
                {
                    id: 1,
                    title: 'Nouveau risque signalé',
                    message: 'Un nid de poule a été signalé sur votre itinéraire habituel',
                    time: '10:30',
                    type: 'warning',
                    icon: <AlertTriangle className='h-5 w-5 text-orange-500' />,
                    read: false
                },
                {
                    id: 2,
                    title: "Mise à jour d'itinéraire",
                    message: 'Votre itinéraire a été modifié en raison de travaux sur la route D24',
                    time: '09:15',
                    type: 'info',
                    icon: <Route className='h-5 w-5 text-blue-500' />,
                    read: false
                },
                {
                    id: 3,
                    title: 'Alerte météo',
                    message: 'Attention: fortes pluies prévues sur votre trajet Abidjan-Bouaké',
                    time: 'Hier',
                    type: 'danger',
                    icon: <CloudDrizzle className='h-5 w-5 text-blue-500' />,
                    read: true
                },
                {
                    id: 4,
                    title: 'Nouvel utilisateur rejoint',
                    message: 'Pierre Dubois a rejoint votre groupe de chauffeurs',
                    time: 'Hier',
                    type: 'success',
                    icon: <User className='h-5 w-5 text-green-500' />,
                    read: true
                }
            ];

            setNotifications(mockNotifications as never[]);
            setNotificationCount(mockNotifications.filter((n) => !n.read).length);
        }
    }, [isAuthenticated]);

    // Items de navigation basés sur l'état d'authentification
    const getNavItems = () => {
        const authenticatedItems = [
            {
                href: '/',
                label: 'Accueil',
                icon: <Home className='h-5 w-5' />,
                activeIcon: <Home className='h-5 w-5 text-blue-600' />
            },
            {
                href: '/map',
                label: 'Carte',
                icon: <Map className='h-5 w-5' />,
                activeIcon: <Map className='h-5 w-5 text-blue-600' />
            },
            {
                href: '/route-selection',
                label: 'Trajets',
                icon: <Route className='h-5 w-5' />,
                activeIcon: <Route className='h-5 w-5 text-blue-600' />
            },
            {
                href: '/history',
                label: 'Historique',
                icon: <Navigation className='h-5 w-5' />,
                activeIcon: <Navigation className='h-5 w-5 text-blue-600' />
            },
            {
                href: '/profile',
                label: 'Profil',
                icon: <User className='h-5 w-5' />,
                activeIcon: <User className='h-5 w-5 text-blue-600' />
            }
        ];

        const unauthenticatedItems = [
            {
                href: '/',
                label: 'Accueil',
                icon: <Home className='h-5 w-5' />,
                activeIcon: <Home className='h-5 w-5 text-blue-600' />
            }
            // {
            //     href: '/features',
            //     label: 'Fonctionnalités',
            //     icon: <Zap className='h-5 w-5' />,
            //     activeIcon: <Zap className='h-5 w-5 text-blue-600' />
            // },
            // {
            //     href: '/about',
            //     label: 'À propos',
            //     icon: <Compass className='h-5 w-5' />,
            //     activeIcon: <Compass className='h-5 w-5 text-blue-600' />
            // }
        ];

        return isAuthenticated ? authenticatedItems : unauthenticatedItems;
    };

    const navItems = getNavItems();

    const getUserInitials = () => {
        if (!user || !user.user.name) return 'GU'; // Guest User

        const parts = user.user.name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        return parts[0].substring(0, 2).toUpperCase();
    };

    return (
        <header className='sticky top-0 z-30 border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex h-16 items-center px-4'>
                {/* Mobile menu */}
                {/* <div className='md:hidden'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant='ghost' size='icon'>
                                <Menu className='h-5 w-5' />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='left' className='w-[240px] sm:w-[300px]'>
                            <div className='mb-6 flex items-center'>
                                <Truck className='mr-2 h-6 w-6 text-blue-600' />
                                <span className='text-xl font-bold text-blue-900 dark:text-white'>RouteGuard</span>
                            </div>

                            {isLoading ? (
                                <div className='space-y-3'>
                                    <Skeleton className='h-10 w-full' />
                                    <Skeleton className='h-10 w-full' />
                                    <Skeleton className='h-10 w-full' />
                                </div>
                            ) : (
                                <>
                                    {isAuthenticated && (
                                        <div className='mb-6 flex items-center'>
                                            <Avatar className='mr-3 h-10 w-10'>
                                                <AvatarImage
                                                    src={'/api/placeholder/32/32'}
                                                    alt={user?.name || 'Utilisateur'}
                                                />
                                                <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className='font-medium dark:text-white'>
                                                    {user?.name || 'Utilisateur'}
                                                </p>
                                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                    {user?.email || 'email@example.com'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <nav className='flex flex-col space-y-3'>
                                        {navItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                href={item.href}
                                                className={`flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                    pathname === item.href
                                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-50'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}>
                                                {pathname === item.href ? item.activeIcon : item.icon}
                                                <span className='ml-2'>{item.label}</span>
                                            </Link>
                                        ))}
                                    </nav>

                                    {isAuthenticated && (
                                        <>
                                            <div className='mt-6 border-t pt-6 dark:border-gray-700'>
                                                <Button
                                                    variant='outline'
                                                    className='w-full justify-start'
                                                    onClick={() => router.push('/settings')}>
                                                    <Settings className='mr-2 h-4 w-4' />
                                                    Paramètres
                                                </Button>

                                                <Button
                                                    variant='ghost'
                                                    className='mt-2 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400'
                                                    onClick={logout}>
                                                    <LogOut className='mr-2 h-4 w-4' />
                                                    Déconnexion
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {!isAuthenticated && (
                                        <div className='mt-6 space-y-3 border-t pt-6 dark:border-gray-700'>
                                            <Button className='w-full' onClick={() => router.push('/auth/login')}>
                                                Se connecter
                                            </Button>

                                            <Button
                                                variant='outline'
                                                className='w-full'
                                                onClick={() => router.push('/auth/register')}>
                                                Créer un compte
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </SheetContent>
                    </Sheet>
                </div> */}

                {/* Logo */}
                <div className='mx-4 flex items-center'>
                    <Link href='/' className='flex items-center'>
                        <Truck className='mr-2 h-6 w-6 text-blue-600' />
                        <span className='text-xl font-bold text-blue-900 md:inline-block dark:text-white'>
                            RouteGuard
                        </span>
                    </Link>
                </div>

                {/* Desktop navigation */}
                <nav className='hidden flex-1 items-center space-x-1 md:flex lg:space-x-2'>
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:text-blue-600 ${
                                pathname === item.href
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-50'
                                    : 'text-gray-700 dark:text-gray-200'
                            }`}>
                            {pathname === item.href ? item.activeIcon : item.icon}
                            <span className='ml-2'>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Weather info - Desktop only */}
                {isAuthenticated && (
                    <div className='mr-4 hidden items-center rounded-full bg-gray-50 px-3 py-1 md:flex dark:bg-gray-700'>
                        {weatherInfo.icon}
                        <span className='ml-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                            {weatherInfo.temp} • {weatherInfo.condition}
                        </span>
                    </div>
                )}

                {/* Right side actions */}

                <div className='ml-auto flex items-center justify-end space-x-2'>
                    {isLoading ? (
                        <Skeleton className='h-8 w-8 rounded-full' />
                    ) : isAuthenticated ? (
                        <>
                            {/* Quick actions button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='rounded-full'>
                                        <PlusCircle className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/route-selection')}>
                                        <Navigation className='mr-2 h-4 w-4' />
                                        Nouveau trajet
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/map')}>
                                        <Map className='mr-2 h-4 w-4' />
                                        Voir la carte
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/report')}>
                                        <AlertTriangle className='mr-2 h-4 w-4' />
                                        Signaler un risque
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='rounded-full'>
                                        <Avatar className='h-8 w-8'>
                                            <AvatarImage
                                                src={'/api/placeholder/32/32'}
                                                alt={user?.user?.name || 'Utilisateur'}
                                            />
                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuLabel className='font-normal'>
                                        <div className='flex flex-col space-y-1'>
                                            <p className='text-sm leading-none font-medium'>
                                                {user?.user?.name || 'Utilisateur'}
                                            </p>
                                            <p className='text-xs leading-none text-gray-500'>
                                                {user?.user?.email || 'email@example.com'}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <User className='mr-2 h-4 w-4' />
                                        <span>Mon profil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Settings className='mr-2 h-4 w-4' />
                                        <span>Paramètres</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className='mr-2 h-4 w-4' />
                                        <span>Déconnexion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            {/* Login/Register buttons for unauthenticated users */}
                            <Button
                                variant='ghost'
                                size='sm'
                                className='hidden md:inline-flex'
                                onClick={() => router.push('/auth/login')}>
                                Se connecter
                            </Button>
                            <Button
                                className='hidden md:inline-flex'
                                size='sm'
                                onClick={() => router.push('/auth/register')}>
                                S'inscrire
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

// Icône supplémentaire pour les notifications
const AlertTriangle = ({ className }: { className: string }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}>
        <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'></path>
        <path d='M12 9v4'></path>
        <path d='M12 17h.01'></path>
    </svg>
);
