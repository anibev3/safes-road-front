'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Landing from '@/components/landing/landing';
import Footer from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { routeHistoryService } from '@/lib/services/history-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york-v4/ui/avatar';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card } from '@/registry/new-york-v4/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/registry/new-york-v4/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { HistoryItem } from '@/types/history';

import DashboardLayout from '../dash/layout';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    Badge,
    BarChart2,
    Calendar,
    ChevronRight,
    Clock,
    CloudDrizzle,
    Compass,
    MapPin,
    Navigation,
    Route,
    Shield,
    Sun,
    Truck,
    Users,
    Zap
} from 'lucide-react';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    // États pour la page d'accueil des utilisateurs authentifiés
    const [recentRoutes, setRecentRoutes] = useState<HistoryItem[]>([]);
    const [favoriteRoutes, setFavoriteRoutes] = useState<HistoryItem[]>([]);
    const [weatherData, setWeatherData] = useState({
        temperature: 24,
        condition: 'Ensoleillé',
        icon: <Sun className='h-8 w-8 text-yellow-500' />
    });
    const [userStats, setUserStats] = useState({
        totalTrips: 42,
        totalDistance: 1250,
        risksAvoided: 86,
        safetyScore: 92
    });

    // Charger les données de l'historique pour les utilisateurs authentifiés
    useEffect(() => {
        if (isAuthenticated) {
            try {
                const history = routeHistoryService.getHistory();
                const favorites = routeHistoryService.getFavorites();
                // Récupérer les trajets récents (jusqu'à 5)
                setRecentRoutes(history.slice(0, 5) as HistoryItem[]);

                // Récupérer les favoris (jusqu'à 3)
                setFavoriteRoutes(favorites.slice(0, 3) as HistoryItem[]);
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }
        }
    }, [isAuthenticated]);

    // Les conseils de sécurité pour le carousel
    const safetyTips = [
        {
            title: "Ralentissez à l'approche des dos d'âne",
            description: "Réduisez votre vitesse à 30 km/h pour éviter d'endommager votre véhicule",
            icon: <Truck className='h-12 w-12 text-blue-500' />
        },
        {
            title: 'Attention aux zones de travaux',
            description: 'Respectez la signalisation temporaire et adaptez votre vitesse',
            icon: <Shield className='h-12 w-12 text-orange-500' />
        },
        {
            title: 'Anticipez les nids de poule',
            description: 'Sur les routes dégradées, gardez une distance de sécurité accrue',
            icon: <Route className='h-12 w-12 text-purple-500' />
        },
        {
            title: 'Adaptez votre conduite à la météo',
            description: 'Redoublez de vigilance en cas de pluie ou de visibilité réduite',
            icon: <CloudDrizzle className='h-12 w-12 text-blue-400' />
        }
    ];

    // Effets de transition pour les animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div className='h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
            </div>
        );
    }

    // Page d'accueil pour utilisateurs authentifiés
    if (isAuthenticated) {
        return (
            <DashboardLayout>
                <div className='min-h-screen bg-gray-50 pb-16 dark:bg-gray-900'>
                    {/* Header Hero Section */}
                    <div className='relative bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-8 text-white dark:from-blue-800 dark:to-blue-950'>
                        <div className='container mx-auto max-w-6xl'>
                            <div className='grid grid-cols-1 md:grid-cols-2'>
                                <div className='flex flex-col justify-center'>
                                    <Badge className='mb-3 w-fit bg-blue-500/20 text-white'>Safes Road Pro</Badge>
                                    <h1 className='mb-2 text-4xl font-bold'>
                                        Bonjour, {user?.user?.name || 'Conducteur'}
                                    </h1>
                                    <p className='mb-6 text-xl text-blue-100'>Bonne journée pour prendre la route</p>

                                    <div className='grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm'>
                                        <div className='flex items-center'>
                                            <div className='mr-3 rounded-full bg-white/20 p-2'>
                                                <Calendar className='h-5 w-5' />
                                            </div>
                                            <div>
                                                <div className='text-sm text-blue-100'>Date</div>
                                                <div className='font-medium'>{new Date().toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className='flex items-center'>
                                            <div className='mr-3 rounded-full bg-white/20 p-2'>
                                                <Clock className='h-5 w-5' />
                                            </div>
                                            <div>
                                                <div className='text-sm text-blue-100'>Heure</div>
                                                <div className='font-medium'>
                                                    {new Date().toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex items-center'>
                                            <div className='mr-3 rounded-full bg-white/20 p-2'>{weatherData.icon}</div>
                                            <div>
                                                <div className='text-sm text-blue-100'>Météo</div>
                                                <div className='font-medium'>{weatherData.temperature}°C</div>
                                            </div>
                                        </div>

                                        <div className='flex items-center'>
                                            <div className='mr-3 rounded-full bg-white/20 p-2'>
                                                <Award className='h-5 w-5' />
                                            </div>
                                            <div>
                                                <div className='text-sm text-blue-100'>Score</div>
                                                <div className='font-medium'>{userStats.safetyScore}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-8 flex space-x-4'>
                                        <Button
                                            size='lg'
                                            onClick={() => router.push('/route-selection')}
                                            className='bg-white text-blue-800 hover:bg-blue-50'>
                                            Nouveau trajet
                                            <ArrowRight className='ml-2 h-5 w-5' />
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='lg'
                                            onClick={() => router.push('/add-risk')}
                                            className='border-white bg-amber-400 text-white hover:bg-white/10'>
                                            Ajouter un risque
                                        </Button>
                                    </div>
                                </div>

                                <div className='flex items-center justify-center'>
                                    <div className='relative h-64 w-70 md:h-80 md:w-80'>
                                        <Image
                                            src='/images/car_3.png'
                                            alt='SUV stylisé'
                                            width={420}
                                            height={420}
                                            className='object-contain drop-shadow-xl'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900'></div>
                    </div>

                    {/* Main Content */}
                    <div className='container mx-auto max-w-6xl px-4 py-6'>
                        <motion.div
                            variants={containerVariants}
                            initial='hidden'
                            animate='visible'
                            className='grid gap-6 md:grid-cols-4'>
                            {/* Actions rapides */}
                            <motion.div variants={itemVariants} className='md:col-span-1'>
                                <Card className='overflow-hidden'>
                                    <div className='bg-blue-50 p-4 dark:bg-blue-950'>
                                        <h2 className='text-lg font-semibold text-blue-900 dark:text-blue-200'>
                                            Actions rapides
                                        </h2>
                                    </div>
                                    <div className='flex flex-col divide-y'>
                                        <Button
                                            variant='ghost'
                                            className='flex justify-start rounded-none py-4'
                                            onClick={() => router.push('/route-selection')}>
                                            <Navigation className='mr-3 h-5 w-5 text-blue-600' />
                                            Nouvelle navigation
                                        </Button>

                                        <Button
                                            variant='ghost'
                                            className='flex justify-start rounded-none py-4'
                                            onClick={() => router.push('/risks')}>
                                            <MapPin className='mr-3 h-5 w-5 text-red-600' />
                                            Liste des risques
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            className='flex justify-start rounded-none py-4'
                                            onClick={() => router.push('/add-risk')}>
                                            <MapPin className='mr-3 h-5 w-5 text-red-600' />
                                            Ajouter un risque
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            className='flex justify-start rounded-none py-4'
                                            onClick={() => router.push('/history')}>
                                            <Compass className='mr-3 h-5 w-5 text-green-600' />
                                            Consulter l'historique
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            className='flex justify-start rounded-none py-4'
                                            onClick={() => router.push('/profile')}>
                                            <Users className='mr-3 h-5 w-5 text-purple-600' />
                                            Mon profil
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Statistiques d'utilisation */}
                            <motion.div variants={itemVariants} className='md:col-span-3'>
                                <Card className='overflow-hidden'>
                                    <div className='bg-blue-50 p-4 dark:bg-blue-950'>
                                        <h2 className='text-lg font-semibold text-blue-900 dark:text-blue-200'>
                                            Mes statistiques
                                        </h2>
                                    </div>
                                    <div className='px-4 py-5'>
                                        <div className='grid grid-cols-2 gap-5 md:grid-cols-4'>
                                            <div className='rounded-lg border border-blue-100 bg-white p-4 text-center shadow-sm dark:border-blue-800 dark:bg-gray-800'>
                                                <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950'>
                                                    <Route className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                                                </div>
                                                <div className='text-2xl font-bold text-blue-900 dark:text-blue-200'>
                                                    {userStats.totalTrips}
                                                </div>
                                                <div className='text-sm text-gray-500 dark:text-gray-400'>Trajets</div>
                                            </div>

                                            <div className='rounded-lg border border-green-100 bg-white p-4 text-center shadow-sm dark:border-green-800 dark:bg-gray-800'>
                                                <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950'>
                                                    <BarChart2 className='h-6 w-6 text-green-600 dark:text-green-400' />
                                                </div>
                                                <div className='text-2xl font-bold text-green-900 dark:text-green-200'>
                                                    {userStats.totalDistance}
                                                </div>
                                                <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                    Km parcourus
                                                </div>
                                            </div>

                                            <div className='rounded-lg border border-orange-100 bg-white p-4 text-center shadow-sm dark:border-orange-800 dark:bg-gray-800'>
                                                <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950'>
                                                    <Shield className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                                                </div>
                                                <div className='text-2xl font-bold text-orange-900 dark:text-orange-200'>
                                                    {userStats.risksAvoided}
                                                </div>
                                                <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                    Risques évités
                                                </div>
                                            </div>

                                            <div className='rounded-lg border border-purple-100 bg-white p-4 text-center shadow-sm dark:border-purple-800 dark:bg-gray-800'>
                                                <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950'>
                                                    <Zap className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                                                </div>
                                                <div className='text-2xl font-bold text-purple-900 dark:text-purple-200'>
                                                    {userStats.safetyScore}%
                                                </div>
                                                <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                    Score de sécurité
                                                </div>
                                            </div>
                                        </div>

                                        {/* <div className='mt-6 flex justify-center'>
                                            <Button variant='outline' onClick={() => router.push('/stats')}>
                                                Statistiques détaillées
                                            </Button>
                                        </div> */}
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Conseils de sécurité Carousel */}
                        <motion.div variants={itemVariants} className='mt-6'>
                            <h2 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                                Conseils de sécurité
                            </h2>

                            <Carousel className='w-full'>
                                <CarouselContent>
                                    {safetyTips.map((tip, index) => (
                                        <CarouselItem key={index} className='md:basis-1/2 lg:basis-1/3'>
                                            <Card className='h-full border-blue-100 dark:border-blue-800'>
                                                <div className='flex h-full flex-col p-4'>
                                                    <div className='mb-2 flex justify-center'>{tip.icon}</div>
                                                    <h3 className='mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white'>
                                                        {tip.title}
                                                    </h3>
                                                    <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
                                                        {tip.description}
                                                    </p>
                                                </div>
                                            </Card>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <div className='flex justify-center gap-2 pt-2'>
                                    <CarouselPrevious className='relative right-auto left-0 translate-x-0' />
                                    <CarouselNext className='relative right-0 left-auto translate-x-0' />
                                </div>
                            </Carousel>
                        </motion.div>

                        {/* Trajets récents et favoris */}
                        <div className='mt-8'>
                            <Tabs defaultValue='recent'>
                                <TabsList className='w-full md:w-auto'>
                                    <TabsTrigger value='recent'>Trajets récents</TabsTrigger>
                                    <TabsTrigger value='favorites'>Trajets favoris</TabsTrigger>
                                </TabsList>

                                <TabsContent value='recent' className='mt-4'>
                                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {recentRoutes.length > 0 ? (
                                            recentRoutes.map((route, index) => (
                                                <Card key={index} className='overflow-hidden'>
                                                    <div className='border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'>
                                                        <div className='flex items-center justify-between'>
                                                            <h3 className='font-medium text-gray-800 dark:text-gray-200'>
                                                                {route.name}
                                                            </h3>
                                                            <Badge className='bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                                                                {new Date(route.timestamp).toLocaleDateString()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className='p-3'>
                                                        <div className='text-sm text-gray-600 dark:text-gray-300'>
                                                            <div className='mb-2 flex items-center'>
                                                                <MapPin className='mr-2 h-4 w-4 text-green-600' />
                                                                <span>{route.startLocation}</span>
                                                            </div>
                                                            <div className='flex items-center'>
                                                                <MapPin className='mr-2 h-4 w-4 text-red-600' />
                                                                <span>{route.endLocation}</span>
                                                            </div>
                                                        </div>

                                                        <div className='mt-3 flex space-x-2'>
                                                            <Button
                                                                variant='outline'
                                                                size='sm'
                                                                className='flex-1'
                                                                onClick={() => router.push(`/map?routeId=${route.id}`)}>
                                                                <Route className='mr-1 h-4 w-4' />
                                                                Voir
                                                            </Button>
                                                            <Button
                                                                size='sm'
                                                                className='flex-1'
                                                                onClick={() =>
                                                                    router.push(`/navigation?routeId=${route.id}`)
                                                                }>
                                                                <Navigation className='mr-1 h-4 w-4' />
                                                                Naviguer
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className='col-span-full rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800'>
                                                <Route className='mx-auto mb-3 h-10 w-10 text-gray-400' />
                                                <h3 className='mb-1 text-lg font-medium text-gray-900 dark:text-white'>
                                                    Aucun trajet récent
                                                </h3>
                                                <p className='text-gray-500 dark:text-gray-400'>
                                                    Commencez à utiliser Safes Road pour enregistrer vos trajets
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='favorites' className='mt-4'>
                                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {favoriteRoutes.length > 0 ? (
                                            favoriteRoutes.map((route, index) => (
                                                <Card key={index} className='overflow-hidden'>
                                                    <div className='border-b border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950'>
                                                        <div className='flex items-center justify-between'>
                                                            <h3 className='font-medium text-yellow-800 dark:text-yellow-200'>
                                                                {route.name}
                                                            </h3>
                                                            <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                                                                Favori
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className='p-3'>
                                                        <div className='text-sm text-gray-600 dark:text-gray-300'>
                                                            <div className='mb-2 flex items-center'>
                                                                <MapPin className='mr-2 h-4 w-4 text-green-600' />
                                                                <span>{route.startLocation}</span>
                                                            </div>
                                                            <div className='flex items-center'>
                                                                <MapPin className='mr-2 h-4 w-4 text-red-600' />
                                                                <span>{route.endLocation}</span>
                                                            </div>
                                                        </div>

                                                        <div className='mt-3 flex space-x-2'>
                                                            <Button
                                                                variant='outline'
                                                                size='sm'
                                                                className='flex-1'
                                                                onClick={() => router.push(`/map?routeId=${route.id}`)}>
                                                                <Route className='mr-1 h-4 w-4' />
                                                                Voir
                                                            </Button>
                                                            <Button
                                                                size='sm'
                                                                className='flex-1'
                                                                onClick={() =>
                                                                    router.push(`/navigation?routeId=${route.id}`)
                                                                }>
                                                                <Navigation className='mr-1 h-4 w-4' />
                                                                Naviguer
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className='col-span-full rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800'>
                                                <Star className='mx-auto mb-3 h-10 w-10 text-gray-400' />
                                                <h3 className='mb-1 text-lg font-medium text-gray-900 dark:text-white'>
                                                    Aucun trajet favori
                                                </h3>
                                                <p className='text-gray-500 dark:text-gray-400'>
                                                    Marquez vos trajets préférés comme favoris pour les retrouver ici
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Section communauté */}
                        <motion.div
                            variants={itemVariants}
                            className='mt-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white'>
                            <div className='grid gap-6 md:grid-cols-2'>
                                {/* <div>
                                    <h2 className='mb-2 text-2xl font-bold'>Rejoignez la communauté Safes Road</h2>
                                    <p className='mb-4 text-blue-100'>
                                        Partagez vos expériences, signalez des risques et contribuez à rendre les routes
                                        plus sûres pour tous.
                                    </p>
                                    <Button
                                        className='bg-white text-blue-600 hover:bg-blue-50'
                                        onClick={() => router.push('/community')}>
                                        Explorer la communauté
                                    </Button>
                                </div>

                                <div className='flex flex-wrap items-center justify-center gap-3'>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Avatar key={i} className='h-12 w-12 border-2 border-white'>
                                            <AvatarImage
                                                src={`/api/placeholder/${32 + i}/${32 + i}`}
                                                alt={`Membre ${i}`}
                                            />
                                            <AvatarFallback>U{i}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <div className='ml-1 rounded-full bg-white/20 px-3 py-1 text-sm'>+15K membres</div>
                                </div> */}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Landing page pour visiteurs
    return <Landing />;
}

// Icônes supplémentaires
const Star = ({ className }: { className?: string }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}>
        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
    </svg>
);
