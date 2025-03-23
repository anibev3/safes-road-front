'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMapRoute } from '@/hooks/use-map-route';
import { config } from '@/lib/api/config';
import { routeHistoryService } from '@/lib/services/history-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york-v4/ui/avatar';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card } from '@/registry/new-york-v4/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/registry/new-york-v4/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from '@/registry/new-york-v4/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/registry/new-york-v4/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/registry/new-york-v4/ui/sheet';
import { Switch } from '@/registry/new-york-v4/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/new-york-v4/ui/tooltip';
import { LocationPoint } from '@/utils/models/route';
import { GoogleMap, TrafficLayer } from '@react-google-maps/api';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertOctagon,
    AlertTriangle,
    Battery,
    BatteryCharging,
    BellRing,
    Clock,
    Cloud,
    Crosshair,
    FastForward,
    Headphones,
    Info,
    Layers,
    MapPin,
    Maximize2,
    Minus,
    Moon,
    Navigation,
    PhoneCall,
    Plus,
    RotateCcw,
    Route,
    Shield,
    Sun,
    Thermometer,
    Timer,
    Volume2,
    VolumeX,
    X,
    Zap
} from 'lucide-react';

// Styles pour la carte Google Maps
const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

// Fonction utilitaire pour formater le temps
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Composant principal de la page de navigation
export default function NavigationScreenContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const routeId = searchParams.get('routeId');

    // États pour la navigation
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [remainingDistance, setRemainingDistance] = useState<string>('');
    const [remainingTime, setRemainingTime] = useState<string>('');
    const [arrivalTime, setArrivalTime] = useState<string>('');
    const [currentSpeed, setCurrentSpeed] = useState<number>(0);
    const [nextRisk, setNextRisk] = useState<LocationPoint | null>(null);
    const [distanceToNextRisk, setDistanceToNextRisk] = useState<string>('');
    const [showRiskWarning, setShowRiskWarning] = useState<boolean>(false);
    const [showSpeedWarning, setShowSpeedWarning] = useState<boolean>(false);
    const [speedLimit, setSpeedLimit] = useState<number | null>(null);
    const [speedMode, setSpeedMode] = useState<'normal' | 'ecological' | 'sport'>('normal');
    const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
    const [nightMode, setNightMode] = useState<boolean>(false);
    const [mapLayers, setMapLayers] = useState<{ traffic: boolean; satellite: boolean }>({
        traffic: true,
        satellite: false
    });
    const [showAssistant, setShowAssistant] = useState<boolean>(false);
    const [passengerMode, setPassengerMode] = useState<boolean>(false);
    const [emergencyContactsOpen, setEmergencyContactsOpen] = useState<boolean>(false);
    const [tripStats, setTripStats] = useState<{
        avgSpeed: number;
        maxSpeed: number;
        risksAvoided: number;
        startTime: Date | null;
        pauseTime: number;
    }>({
        avgSpeed: 0,
        maxSpeed: 0,
        risksAvoided: 0,
        startTime: null,
        pauseTime: 0
    });

    // Référence pour le timer de simulation
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Utilisation du hook personnalisé pour la carte
    const {
        isLoaded,
        loadError,
        isLoading,
        error,
        currentRouteData,
        selectedRisk,
        onMapLoad,
        displayRoute,
        zoomIn,
        zoomOut,
        centerOnUserLocation,
        takeScreenshot,
        setSelectedRisk,
        defaultCenter,
        defaultZoom,
        mapRef,
        routeMetrics
    } = useMapRoute();

    // Charger les données de l'itinéraire
    useEffect(() => {
        if (!routeId) {
            router.push('/route-selection');

            return;
        }

        // Le reste est géré par le hook useMapRoute
    }, [routeId, router]);

    // Démarrer la navigation
    const startNavigation = () => {
        setIsNavigating(true);

        // Initialiser les statistiques du trajet
        setTripStats({
            ...tripStats,
            startTime: new Date(),
            avgSpeed: 0,
            maxSpeed: 0,
            risksAvoided: 0,
            pauseTime: 0
        });

        // Initialiser ETA et informations de navigation
        if (routeMetrics) {
            setRemainingDistance(routeMetrics.distance);
            setRemainingTime(routeMetrics.duration);
            setArrivalTime(routeMetrics.estimatedArrival);
        }

        // Simuler la navigation (à remplacer par un suivi GPS réel)
        simulateNavigation();
    };

    // Arrêter la navigation
    const stopNavigation = () => {
        setIsNavigating(false);

        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }

        // Afficher un résumé du trajet
        showTripSummary();
    };

    // Simuler la navigation (pour démonstration)
    const simulateNavigation = () => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
        }

        let progress = 0;
        let currentRiskIndex = 0;

        simulationIntervalRef.current = setInterval(() => {
            // Simuler la progression sur l'itinéraire
            progress += 0.5;

            // Simuler la vitesse actuelle
            const simulatedSpeed = 50 + Math.random() * 20;
            setCurrentSpeed(Math.round(simulatedSpeed));

            // Mettre à jour les stats
            setTripStats((prev) => ({
                ...prev,
                avgSpeed: (prev.avgSpeed + simulatedSpeed) / 2,
                maxSpeed: Math.max(prev.maxSpeed, simulatedSpeed)
            }));

            // Simuler la distance restante
            if (currentRouteData && currentRouteData.locations) {
                const totalDistance = 100; // km (simulé)
                const remainingDist = totalDistance - (progress * totalDistance) / 100;
                setRemainingDistance(`${remainingDist.toFixed(1)} km`);

                // Simuler le temps restant
                const remainingMins = remainingDist * 1.2; // 1.2 minutes par km (simulé)
                const hours = Math.floor(remainingMins / 60);
                const mins = Math.floor(remainingMins % 60);
                setRemainingTime(`${hours > 0 ? hours + 'h ' : ''}${mins} min`);

                // Simuler l'heure d'arrivée
                const now = new Date();
                const arrivalDate = new Date(now.getTime() + remainingMins * 60 * 1000);
                setArrivalTime(formatTime(arrivalDate));

                // Simuler le prochain risque
                if (currentRouteData.locations.length > currentRiskIndex + 1) {
                    const nextRiskPoint = currentRouteData.locations[currentRiskIndex + 1];
                    setNextRisk(nextRiskPoint);

                    // Distance jusqu'au prochain risque
                    const distToRisk = (remainingDist * (currentRiskIndex + 1)) / currentRouteData.locations.length;
                    setDistanceToNextRisk(`${distToRisk.toFixed(1)} km`);

                    // Afficher un avertissement lorsqu'on approche d'un risque
                    if (distToRisk < 0.5) {
                        setShowRiskWarning(true);

                        // Vitesse recommandée pour ce risque
                        if (nextRiskPoint.risk_type_speed) {
                            setSpeedLimit(parseInt(nextRiskPoint.risk_type_speed));
                        }

                        // Vérifier si la vitesse actuelle dépasse la limite
                        if (speedLimit && simulatedSpeed > speedLimit) {
                            setShowSpeedWarning(true);
                        } else {
                            setShowSpeedWarning(false);
                        }

                        // Simuler que nous venons de passer ce risque
                        setTimeout(() => {
                            setShowRiskWarning(false);
                            setSpeedLimit(null);
                            currentRiskIndex++;
                            setTripStats((prev) => ({
                                ...prev,
                                risksAvoided: prev.risksAvoided + 1
                            }));
                        }, 5000);
                    } else {
                        setShowRiskWarning(false);
                        setSpeedLimit(null);
                    }
                }
            }

            // Fin de la simulation après avoir atteint 100%
            if (progress >= 100) {
                clearInterval(simulationIntervalRef.current!);
                stopNavigation();
            }
        }, 1000);
    };

    // Afficher le résumé du trajet
    const showTripSummary = () => {
        // Implémenter l'affichage du résumé
    };

    // Mises à jour de l'interface basées sur le mode
    useEffect(() => {
        // Appliquer le mode nuit
        if (nightMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Autres mises à jour basées sur le mode
    }, [nightMode]);

    // Nettoyage lors du démontage
    useEffect(() => {
        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
        };
    }, []);

    if (loadError) {
        return (
            <div className='flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900'>
                <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800'>
                    <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-red-500' />
                    <h2 className='mb-2 text-2xl font-bold text-gray-800 dark:text-white'>Erreur de chargement</h2>
                    <p className='mb-4 text-gray-600 dark:text-gray-300'>
                        Impossible de charger l'API Google Maps. Veuillez vérifier votre connexion et réessayer.
                    </p>
                    <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative flex h-screen flex-col bg-white dark:bg-gray-900 ${showRiskWarning ? 'risk-warning-active' : ''}`}>
            {/* Barre d'état supérieure */}
            <div className='z-30 flex h-12 items-center justify-between bg-blue-900 px-4 text-white dark:bg-blue-950'>
                <div className='flex items-center'>
                    <Clock className='mr-1 h-4 w-4' />
                    <span className='text-sm'>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className='flex items-center space-x-3'>
                    {isNavigating && (
                        <div className='flex items-center'>
                            {/* <SoundWave className="mr-1 h-4 w-4 text-green-400" /> */}
                            <span className='text-xs text-green-400'>Navigation active</span>
                        </div>
                    )}

                    <div className='flex items-center'>
                        <BatteryCharging className='h-4 w-4 text-green-400' />
                    </div>
                </div>
            </div>

            {/* Carte principale */}
            <div className='relative flex-1'>
                {!isLoaded ? (
                    <div className='flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800'>
                        <div className='flex flex-col items-center'>
                            <div className='mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                            <p className='text-gray-700 dark:text-gray-300'>Chargement de Google Maps...</p>
                        </div>
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={defaultZoom}
                        onLoad={onMapLoad}
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            zoomControl: false,
                            styles: nightMode
                                ? [
                                      // Style mode nuit
                                      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                                      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                                      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                                      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                                      {
                                          featureType: 'road',
                                          elementType: 'geometry.stroke',
                                          stylers: [{ color: '#212a37' }]
                                      },
                                      {
                                          featureType: 'road',
                                          elementType: 'labels.text.fill',
                                          stylers: [{ color: '#9ca5b3' }]
                                      },
                                      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }
                                  ]
                                : []
                        }}>
                        {/* Couche de trafic conditionnelle */}
                        {mapLayers.traffic && <TrafficLayer />}

                        {/* Les marqueurs et l'itinéraire sont gérés programmatiquement dans useMapRoute */}
                    </GoogleMap>
                )}

                {/* Alerte en cas de risque imminent */}
                {/* <AnimatePresence>
                    {showRiskWarning && nextRisk && (
                        <motion.div 
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="absolute top-16 left-1/2 z-40 -translate-x-1/2 transform">
                            <Card className="flex w-max items-center space-x-3 border-2 border-red-500 bg-red-50 p-3 shadow-lg dark:bg-red-900 dark:text-white">
                                <div className="flex flex-col">
                                    <span className="font-bold text-red-700 dark:text-red-300">
                                        {nextRisk.risk_type_label || 'Risque imminent'}
                                    </span>
                                    <span className="text-sm text-red-600 dark:text-red-200">
                                        Dans {distanceToNextRisk} • {speedLimit ? `Max ${speedLimit} km/h` : 'Ralentissez'}
                                    </span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                                    {nextRisk.risk_type_icon ? (
                                        <img
                                            src={`${config.api.iconUrl}${nextRisk.risk_type_icon}`}
                                            alt={nextRisk.risk_type_label || 'Risque'}
                                            className="h-8 w-8"
                                        />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-300" />
                                    )}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full" 
                                    onClick={() => setShowRiskWarning(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence> */}

                {/* Alerte de vitesse excessive */}
                <AnimatePresence>
                    {showSpeedWarning && speedLimit && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className='absolute bottom-32 left-1/2 z-40 -translate-x-1/2 transform'>
                            <Card className='flex items-center space-x-3 bg-orange-50 p-3 shadow-lg dark:bg-orange-900 dark:text-white'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-800'>
                                    <AlertOctagon className='h-6 w-6 text-orange-600 dark:text-orange-300' />
                                </div>
                                <div className='text-center'>
                                    <span className='text-lg font-bold text-orange-700 dark:text-orange-300'>
                                        {speedLimit} km/h
                                    </span>
                                    <span className='block text-sm text-orange-600 dark:text-orange-200'>
                                        Vitesse maximale recommandée
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Boutons de contrôle de carte */}
                <div className='absolute top-16 right-4 z-20 flex flex-col space-y-2'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                                    onClick={zoomIn}>
                                    <Plus className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                                <p>Zoom avant</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                                    onClick={zoomOut}>
                                    <Minus className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                                <p>Zoom arrière</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                                    onClick={centerOnUserLocation}>
                                    <Crosshair className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                                <p>Ma position</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                                    onClick={() => takeScreenshot()}>
                                    <Maximize2 className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                                <p>Capture d'écran</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                                    onClick={() => setMapLayers((prev) => ({ ...prev, traffic: !prev.traffic }))}>
                                    <Layers
                                        className={`h-5 w-5 ${mapLayers.traffic ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                                <p>Trafic {mapLayers.traffic ? 'activé' : 'désactivé'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Bouton retour */}
                <Button
                    variant='secondary'
                    size='icon'
                    className='absolute top-16 left-4 z-20 h-10 w-10 rounded-full bg-white shadow-md dark:bg-gray-800'
                    onClick={() => router.push('/route-selection')}>
                    <X className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                </Button>
            </div>

            {/* Interface de navigation en bas */}
            <div className='z-20 border-t border-gray-200 bg-white px-4 py-3 shadow-md dark:border-gray-700 dark:bg-gray-800'>
                {!isNavigating ? (
                    <div className='flex flex-col'>
                        <div className='mb-3 flex items-center justify-between'>
                            <div>
                                <h2 className='text-lg font-bold text-gray-800 dark:text-white'>
                                    {currentRouteData?.route?.label || 'Votre itinéraire'}
                                </h2>
                                {routeMetrics && (
                                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                                        {routeMetrics.distance} • {routeMetrics.duration} • Arrivée à{' '}
                                        {routeMetrics.estimatedArrival}
                                    </p>
                                )}
                            </div>

                            {/* <SheetTrigger asChild>
                                <Button variant='outline' size='sm' className='flex items-center gap-1'>
                                    <Info className='h-4 w-4' />
                                    <span>Détails</span>
                                </Button>
                            </SheetTrigger> */}
                        </div>

                        <Button
                            className='bg-blue-800 py-6 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                            onClick={startNavigation}>
                            <Navigation className='mr-2 h-5 w-5' />
                            Démarrer la navigation assistée
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col'>
                        {/* Indicateur de vitesse et prochaine manœuvre */}
                        <div className='mb-2 flex justify-between'>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-gray-800 dark:text-white'>{currentSpeed}</div>
                                <div className='text-xs text-gray-500 dark:text-gray-400'>km/h</div>
                            </div>

                            <div className='flex items-center'>
                                {nextRisk && (
                                    <div className='flex items-center'>
                                        <div className='mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                                            {nextRisk.photo ? (
                                                <img
                                                    src={`${config.api.photoUrl}${nextRisk.photo}`}
                                                    alt={nextRisk.risk_type_label || 'Risque'}
                                                    className='h-6 w-6'
                                                />
                                            ) : (
                                                <AlertTriangle className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                                            )}
                                        </div>
                                        <div>
                                            <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                                {nextRisk.risk_type_label || 'Prochain risque'}
                                            </div>
                                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                                                Dans {distanceToNextRisk}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='text-center'>
                                <div className='text-xl font-medium text-gray-800 dark:text-white'>{arrivalTime}</div>
                                <div className='text-xs text-gray-500 dark:text-gray-400'>Arrivée estimée</div>
                            </div>
                        </div>

                        {/* Informations de navigation */}
                        <div className='mb-4 grid grid-cols-3 gap-3'>
                            <Card className='border-blue-100 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950'>
                                <div className='text-center'>
                                    <div className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                                        {remainingDistance}
                                    </div>
                                    <div className='text-xs text-blue-600 dark:text-blue-400'>Distance</div>
                                </div>
                            </Card>

                            <Card className='border-green-100 bg-green-50 p-2 dark:border-green-900 dark:bg-green-950'>
                                <div className='text-center'>
                                    <div className='text-sm font-medium text-green-800 dark:text-green-300'>
                                        {remainingTime}
                                    </div>
                                    <div className='text-xs text-green-600 dark:text-green-400'>Restant</div>
                                </div>
                            </Card>

                            <Card className='border-orange-100 bg-orange-50 p-2 dark:border-orange-900 dark:bg-orange-950'>
                                <div className='text-center'>
                                    <div className='text-sm font-medium text-orange-800 dark:text-orange-300'>
                                        {tripStats.risksAvoided}
                                    </div>
                                    <div className='text-xs text-orange-600 dark:text-orange-400'>Risques évités</div>
                                </div>
                            </Card>
                        </div>

                        {/* Contrôles de navigation */}
                        <div className='flex justify-between'>
                            <Button
                                variant={audioEnabled ? 'default' : 'outline'}
                                size='icon'
                                className='h-12 w-12 rounded-full'
                                onClick={() => setAudioEnabled(!audioEnabled)}>
                                {audioEnabled ? <Volume2 className='h-5 w-5' /> : <VolumeX className='h-5 w-5' />}
                            </Button>

                            <Button variant='destructive' className='px-6' onClick={stopNavigation}>
                                Arrêter
                            </Button>

                            <Button
                                variant={nightMode ? 'default' : 'outline'}
                                size='icon'
                                className='h-12 w-12 rounded-full'
                                onClick={() => setNightMode(!nightMode)}>
                                {nightMode ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Feuille de détails */}
            <Sheet>
                <SheetContent side='right' className='sm:max-w-md'>
                    <SheetHeader>
                        <SheetTitle>Détails de l'itinéraire</SheetTitle>
                        <SheetDescription>Informations et statistiques sur votre trajet</SheetDescription>
                    </SheetHeader>

                    {currentRouteData && (
                        <div className='h-[calc(100vh-200px)] space-y-6 overflow-y-auto py-4'>
                            {/* Carte d'en-tête */}
                            <Card className='bg-blue-800 p-4 text-white dark:bg-blue-900'>
                                <h3 className='mb-2 text-lg font-semibold'>{currentRouteData.route?.label}</h3>

                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <Route className='mr-2 h-4 w-4' />
                                        <span className='text-sm'>
                                            {currentRouteData.locations?.length || 0} points
                                        </span>
                                    </div>

                                    <div className='flex items-center'>
                                        <AlertTriangle className='mr-2 h-4 w-4' />
                                        <span className='text-sm'>
                                            {currentRouteData.risks?.length || 0} types de risques
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Onglets d'information */}
                            <Tabs defaultValue='risks'>
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='risks'>Risques</TabsTrigger>
                                    <TabsTrigger value='route'>Itinéraire</TabsTrigger>
                                    <TabsTrigger value='info'>Infos</TabsTrigger>
                                </TabsList>

                                <TabsContent value='risks' className='mt-4 space-y-4'>
                                    {currentRouteData.risks?.map((risk, index) => (
                                        <Card key={index} className='overflow-hidden'>
                                            <div className='flex items-start p-3'>
                                                <div className='mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900'>
                                                    {risk.risk_type_icon ? (
                                                        <img
                                                            src={`${config.api.iconUrl}${risk.risk_type_icon}`}
                                                            alt={risk.risk_type_label || 'Risque'}
                                                            className='h-8 w-8'
                                                        />
                                                    ) : (
                                                        <AlertTriangle className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                                    )}
                                                </div>
                                                <div className='flex-1'>
                                                    <h4 className='font-medium text-gray-800 dark:text-white'>
                                                        {risk.risk_type_label || 'Type de risque'}
                                                    </h4>
                                                    <div className='mt-1 flex flex-wrap gap-2'>
                                                        <Badge
                                                            variant='outline'
                                                            className='bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                                                            {risk.count} point{risk.count !== 1 ? 's' : ''}
                                                        </Badge>
                                                        {risk.risk_type_speed && (
                                                            <Badge
                                                                variant='outline'
                                                                className='bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'>
                                                                Max {risk.risk_type_speed} km/h
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </TabsContent>

                                <TabsContent value='route' className='mt-4 space-y-4'>
                                    {/* Points de départ et d'arrivée */}
                                    <div className='space-y-2'>
                                        <h4 className='font-medium text-gray-600 dark:text-gray-400'>Trajet</h4>

                                        <div className='flex items-start rounded-lg bg-green-50 p-3 dark:bg-green-900'>
                                            <div className='mt-1 mr-3'>
                                                <div className='h-4 w-4 rounded-full bg-green-600'></div>
                                            </div>
                                            <div>
                                                <p className='font-medium text-green-800 dark:text-green-300'>Départ</p>
                                                <p className='text-sm text-green-700 dark:text-green-400'>
                                                    {currentRouteData.locations?.[0]?.risk_label || 'Point de départ'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='ml-5 h-6 w-0.5 bg-gray-300 dark:bg-gray-600'></div>

                                        <div className='flex items-start rounded-lg bg-red-50 p-3 dark:bg-red-900'>
                                            <div className='mt-1 mr-3'>
                                                <div className='h-4 w-4 rounded-full bg-red-600'></div>
                                            </div>
                                            <div>
                                                <p className='font-medium text-red-800 dark:text-red-300'>Arrivée</p>
                                                <p className='text-sm text-red-700 dark:text-red-400'>
                                                    {currentRouteData.locations?.[currentRouteData.locations.length - 1]
                                                        ?.risk_label || "Point d'arrivée"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {routeMetrics && (
                                        <Card className='p-3'>
                                            <h4 className='mb-2 font-medium text-gray-800 dark:text-white'>
                                                Statistiques de trajet
                                            </h4>
                                            <div className='grid grid-cols-2 gap-2 text-sm'>
                                                <div className='text-gray-600 dark:text-gray-400'>Distance:</div>
                                                <div className='font-medium text-gray-800 dark:text-white'>
                                                    {routeMetrics.distance}
                                                </div>

                                                <div className='text-gray-600 dark:text-gray-400'>Durée estimée:</div>
                                                <div className='font-medium text-gray-800 dark:text-white'>
                                                    {routeMetrics.duration}
                                                </div>

                                                <div className='text-gray-600 dark:text-gray-400'>Arrivée prévue:</div>
                                                <div className='font-medium text-gray-800 dark:text-white'>
                                                    {routeMetrics.estimatedArrival}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </TabsContent>

                                <TabsContent value='info' className='mt-4 space-y-4'>
                                    {/* Recommandations */}
                                    <div className='space-y-3'>
                                        <h4 className='font-medium text-gray-600 dark:text-gray-400'>
                                            Recommandations
                                        </h4>

                                        {currentRouteData.max_precaution && (
                                            <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900'>
                                                <p className='text-sm leading-relaxed text-blue-800 dark:text-blue-300'>
                                                    {currentRouteData.max_precaution}
                                                </p>
                                            </div>
                                        )}

                                        {currentRouteData.route?.other_recommendation && (
                                            <div className='rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900'>
                                                <h5 className='mb-1 font-medium text-indigo-800 dark:text-indigo-300'>
                                                    Autres recommandations
                                                </h5>
                                                <p className='text-sm leading-relaxed text-indigo-700 dark:text-indigo-400'>
                                                    {currentRouteData.route.other_recommendation}
                                                </p>
                                            </div>
                                        )}

                                        {currentRouteData.route?.resting_place && (
                                            <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900'>
                                                <h5 className='mb-1 font-medium text-green-800 dark:text-green-300'>
                                                    Lieux de repos
                                                </h5>
                                                <p className='text-sm leading-relaxed text-green-700 dark:text-green-400'>
                                                    {currentRouteData.route.resting_place}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Paramètres de navigation */}
                                    <div>
                                        <h4 className='mb-2 font-medium text-gray-600 dark:text-gray-400'>
                                            Paramètres
                                        </h4>

                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-700 dark:text-gray-300'>
                                                    Mode nuit
                                                </span>
                                                <Switch checked={nightMode} onCheckedChange={setNightMode} />
                                            </div>

                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-700 dark:text-gray-300'>
                                                    Alertes vocales
                                                </span>
                                                <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                                            </div>

                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-700 dark:text-gray-300'>
                                                    Mode passager
                                                </span>
                                                <Switch checked={passengerMode} onCheckedChange={setPassengerMode} />
                                            </div>

                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-700 dark:text-gray-300'>
                                                    Afficher trafic
                                                </span>
                                                <Switch
                                                    checked={mapLayers.traffic}
                                                    onCheckedChange={(checked) =>
                                                        setMapLayers((prev) => ({ ...prev, traffic: checked }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    <SheetFooter className='mt-4'>
                        <Button variant='outline' className='w-full' onClick={() => setEmergencyContactsOpen(true)}>
                            <PhoneCall className='mr-2 h-4 w-4' />
                            Contacts d'urgence
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Dialogue des contacts d'urgence */}
            <Dialog open={emergencyContactsOpen} onOpenChange={setEmergencyContactsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contacts d'urgence</DialogTitle>
                        <DialogDescription>En cas d'urgence, contactez l'un des numéros suivants</DialogDescription>
                    </DialogHeader>

                    <div className='space-y-3'>
                        {[
                            { name: 'Pompiers', number: '18', icon: <Zap className='h-4 w-4 text-red-500' /> },
                            { name: 'Police', number: '17', icon: <Shield className='h-4 w-4 text-blue-500' /> },
                            { name: 'SAMU', number: '15', icon: <Timer className='h-4 w-4 text-green-500' /> },
                            {
                                name: "Numéro d'urgence européen",
                                number: '112',
                                icon: <BellRing className='h-4 w-4 text-yellow-500' />
                            }
                        ].map((contact, index) => (
                            <Card key={index} className='flex items-center justify-between p-3'>
                                <div className='flex items-center'>
                                    <div className='mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                                        {contact.icon}
                                    </div>
                                    <div>
                                        <div className='font-medium'>{contact.name}</div>
                                        <div className='text-sm text-gray-500'>{contact.number}</div>
                                    </div>
                                </div>

                                <Button size='sm' className='rounded-full'>
                                    <PhoneCall className='h-4 w-4' />
                                </Button>
                            </Card>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant='outline' onClick={() => setEmergencyContactsOpen(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assistant virtuel */}
            <Drawer open={showAssistant} onOpenChange={setShowAssistant}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Assistant de route</DrawerTitle>
                        <DrawerDescription>Comment puis-je vous aider pendant votre trajet ?</DrawerDescription>
                    </DrawerHeader>

                    <div className='p-4'>
                        <div className='mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900'>
                            <div className='flex items-start'>
                                <Avatar className='mr-3'>
                                    <AvatarImage src='/api/placeholder/32/32' alt='Assistant' />
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm text-blue-800 dark:text-blue-300'>
                                        Bonjour ! Je suis votre assistant de route. Je peux vous aider avec les
                                        informations sur les risques, suggérer des pauses, ou vous donner des conseils
                                        pendant votre trajet.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='mb-4 space-y-2'>
                            {[
                                'Informations sur le prochain risque',
                                'Suggérer une pause',
                                'Lieux de repos à proximité',
                                'Signaler un nouveau risque'
                            ].map((suggestion, index) => (
                                <Button
                                    key={index}
                                    variant='outline'
                                    className='w-full justify-start text-left'
                                    onClick={() => {}}>
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button variant='outline' onClick={() => setShowAssistant(false)}>
                            Fermer
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Bouton d'assistant flottant */}
            {isNavigating && (
                <Button
                    className='absolute right-4 bottom-24 z-40 h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                    size='icon'
                    onClick={() => setShowAssistant(true)}>
                    <Headphones className='h-6 w-6' />
                </Button>
            )}
        </div>
    );
}
