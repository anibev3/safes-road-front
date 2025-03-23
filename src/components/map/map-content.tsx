'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import { useMapRoute } from '@/hooks/use-map-route';
import { config } from '@/lib/api/config';
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
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/registry/new-york-v4/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/new-york-v4/ui/tooltip';
import { BicyclingLayer, GoogleMap, InfoWindow, TrafficLayer, TransitLayer } from '@react-google-maps/api';

import {
    AlertOctagon,
    AlertTriangle,
    ArrowLeft,
    Camera,
    ChevronDown,
    Cloud,
    Crosshair,
    Info,
    Minus,
    Plus,
    Route,
    Ruler,
    Share2,
    Shield
} from 'lucide-react';

// Styles pour la carte Google Maps
const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

// Sélectionner l'icône appropriée pour le type de risque
const getRiskIcon = (riskType: string) => {
    if (!riskType) return <AlertTriangle className='h-5 w-5' />;

    const lowerType = riskType.toLowerCase();

    if (lowerType.includes("dos d'âne") || lowerType.includes("dos-d'âne") || lowerType.includes('ralentisseur')) {
        return <AlertTriangle className='h-5 w-5' />;
    }

    if (lowerType.includes('nid de poule') || lowerType.includes('trou')) {
        return <AlertOctagon className='h-5 w-5' />;
    }

    if (lowerType.includes('police') || lowerType.includes('contrôle')) {
        return <Shield className='h-5 w-5' />;
    }

    if (lowerType.includes('travaux')) {
        return <AlertTriangle className='h-5 w-5' />;
    }

    if (lowerType.includes('pluie') || lowerType.includes('météo') || lowerType.includes('inondation')) {
        return <Cloud className='h-5 w-5' />;
    }

    return <AlertTriangle className='h-5 w-5' />;
};

// Nettoyer le texte HTML
const cleanHtmlTags = (text: string) => {
    if (!text) return '';

    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
};

export default function MapScreenContent() {
    const router = useRouter();
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [showRiskDetails, setShowRiskDetails] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);

    const {
        isLoaded,
        loadError,
        isLoading,
        error,
        currentRouteData,
        selectedRisk,
        onMapLoad,
        zoomIn,
        zoomOut,
        centerOnUserLocation,
        takeScreenshot,
        setSelectedRisk,
        defaultCenter,
        defaultZoom,
        mapType,
        showTraffic,
        showBicyclingLayer,
        showTransitLayer,
        routeAlternatives,
        selectedAlternative,
        routeMetrics,
        infoWindowVisible,
        infoWindowContent,
        infoWindowPosition,
        changeMapType,
        toggleTrafficLayer,
        toggleBicyclingLayer,
        toggleTransitLayer,
        showInfoWindow,
        closeInfoWindow
    } = useMapRoute();

    const shareLocation = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Ma position sur Safes Road',
                    text: 'Voici mon trajet sur Safes Road',
                    url: window.location.href
                });
            } else {
                // Fallback pour les navigateurs qui ne supportent pas l'API Share
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papier');
            }
        } catch (error) {
            console.error('Erreur lors du partage:', error);
        }
    };

    if (loadError) {
        return (
            <div className='flex h-screen items-center justify-center bg-gray-100'>
                <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
                    <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-red-500' />
                    <h2 className='mb-2 text-2xl font-bold text-gray-800'>Erreur de chargement</h2>
                    <p className='mb-4 text-gray-600'>
                        Impossible de charger l'API Google Maps. Veuillez vérifier votre connexion et réessayer.
                    </p>
                    <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className='relative flex h-screen flex-col'>
                {/* Carte */}
                <div className='relative flex-1'>
                    {!isLoaded ? (
                        <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                            <div className='flex flex-col items-center'>
                                <div className='mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                                <p className='text-gray-700'>Chargement de Google Maps...</p>
                            </div>
                        </div>
                    ) : (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={defaultZoom}
                            onLoad={onMapLoad}
                            options={{
                                mapTypeControl: true,
                                mapTypeControlOptions: {
                                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                                    position: google.maps.ControlPosition.TOP_RIGHT
                                },
                                streetViewControl: true,
                                streetViewControlOptions: {
                                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                                },
                                fullscreenControl: true,
                                fullscreenControlOptions: {
                                    position: google.maps.ControlPosition.RIGHT_TOP
                                },
                                zoomControl: false, // Nous utilisons nos propres contrôles
                                scaleControl: true,
                                rotateControl: true,
                                scrollwheel: true,
                                gestureHandling: 'greedy',
                                disableDefaultUI: false,
                                styles: [
                                    // Style personnalisé pour les routes principales
                                    {
                                        featureType: 'road.highway',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#f8ae6b' }]
                                    },
                                    // Style pour les routes secondaires
                                    {
                                        featureType: 'road.arterial',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#e6e6e6' }]
                                    },
                                    // Améliorer la visibilité des points d'intérêt
                                    {
                                        featureType: 'poi',
                                        elementType: 'labels.icon',
                                        stylers: [{ visibility: 'on' }, { saturation: 50 }]
                                    },
                                    // Points d'eau plus visibles
                                    {
                                        featureType: 'water',
                                        elementType: 'geometry',
                                        stylers: [{ color: '#b3d1ff' }]
                                    }
                                ]
                            }}>
                            {/* Ajout des indicateurs de trafic */}
                            {showTraffic && <TrafficLayer />}

                            {/* Conditionally render BicyclingLayer */}
                            {showBicyclingLayer && <BicyclingLayer />}

                            {/* Conditionally render TransitLayer */}
                            {showTransitLayer && <TransitLayer />}

                            {/* Render InfoWindow if visible */}
                            {infoWindowVisible && infoWindowPosition && (
                                <InfoWindow position={infoWindowPosition} onCloseClick={closeInfoWindow}>
                                    <div dangerouslySetInnerHTML={{ __html: infoWindowContent }} />
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    )}

                    {isLoading && (
                        <div className='bg-opacity-50 absolute inset-0 z-50 flex items-center justify-center bg-black'>
                            <div className='flex flex-col items-center rounded-lg bg-white p-6 shadow-xl'>
                                <div className='mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
                                <p className='font-medium text-gray-800'>Chargement de l'itinéraire...</p>
                                <p className='mt-2 text-sm text-gray-500'>Veuillez patienter</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className='absolute top-4 left-1/2 z-50 -translate-x-1/2 transform rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
                            <p className='font-medium'>{error}</p>
                        </div>
                    )}

                    {/* Bouton de retour */}
                    <Button
                        variant='secondary'
                        size='icon'
                        className='absolute top-4 left-4 z-20 h-12 w-12 rounded-full bg-white shadow-md'
                        onClick={() => router.push('/route-selection')}>
                        <ArrowLeft className='h-5 w-5 text-gray-700' />
                    </Button>

                    {/* Contrôles de zoom */}
                    <div className='absolute top-20 right-4 z-20 flex flex-col space-y-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='rounded-full bg-white shadow-md'
                                        onClick={zoomIn}>
                                        <Plus className='h-5 w-5 text-gray-700' />
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
                                        className='rounded-full bg-white shadow-md'
                                        onClick={zoomOut}>
                                        <Minus className='h-5 w-5 text-gray-700' />
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
                                        className='rounded-full bg-white shadow-md'
                                        onClick={centerOnUserLocation}>
                                        <Crosshair className='h-5 w-5 text-gray-700' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='left'>
                                    <p>Ma position</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Bouton flottant pour ouvrir le bottom sheet */}
                    <div className='absolute right-6 bottom-6 z-20'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size='icon'
                                        className='h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700'
                                        onClick={() => setShowBottomSheet(true)}>
                                        <Info className='h-6 w-6 text-white' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='left'>
                                    <p>Informations du trajet</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Boutons d'actions supplémentaires */}
                    <div className='absolute bottom-6 left-6 z-20 flex flex-col space-y-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='rounded-full bg-white shadow-md'
                                        onClick={takeScreenshot}>
                                        <Camera className='h-5 w-5 text-gray-700' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    <p>Capturer l'écran</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='rounded-full bg-white shadow-md'
                                        onClick={shareLocation}>
                                        <Share2 className='h-5 w-5 text-gray-700' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    <p>Partager</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Bottom Sheet pour les informations */}
                <Sheet open={showBottomSheet} onOpenChange={setShowBottomSheet}>
                    <SheetContent side='bottom' className='max-h-[85vh] overflow-y-auto rounded-t-xl pb-0'>
                        <SheetHeader className='mb-4 text-left'>
                            <SheetTitle>
                                {currentRouteData &&
                                currentRouteData.locations &&
                                currentRouteData.locations.length >= 2 ? (
                                    <div className='flex items-center'>
                                        <div className='mr-3 rounded-lg bg-orange-100 p-2'>
                                            <AlertTriangle className='h-5 w-5 text-orange-600' />
                                        </div>
                                        <span>
                                            {currentRouteData.locations[0].risk_label} -{' '}
                                            {
                                                currentRouteData.locations[currentRouteData.locations.length - 1]
                                                    .risk_label
                                            }
                                        </span>
                                    </div>
                                ) : (
                                    <div>Chargement de l'itinéraire...</div>
                                )}
                            </SheetTitle>
                        </SheetHeader>

                        <div className='space-y-6'>
                            {/* Statistiques de l'itinéraire si disponibles */}
                            {routeMetrics && (
                                <div className='mb-4 grid grid-cols-3 gap-2'>
                                    <div className='rounded-lg bg-blue-50 p-3 text-center'>
                                        <p className='text-xs text-blue-700'>Distance</p>
                                        <p className='font-semibold'>{routeMetrics.distance}</p>
                                    </div>
                                    <div className='rounded-lg bg-green-50 p-3 text-center'>
                                        <p className='text-xs text-green-700'>Durée</p>
                                        <p className='font-semibold'>{routeMetrics.duration}</p>
                                    </div>
                                    <div className='rounded-lg bg-purple-50 p-3 text-center'>
                                        <p className='text-xs text-purple-700'>Arrivée</p>
                                        <p className='font-semibold'>{routeMetrics.estimatedArrival}</p>
                                    </div>
                                </div>
                            )}

                            {/* Recommandations */}
                            {currentRouteData && (
                                <Card className='mb-4 bg-blue-50 p-4'>
                                    <h3 className='mb-2 font-medium text-blue-800'>Recommandations</h3>
                                    <p className='text-sm leading-relaxed text-gray-700'>
                                        <span>Sur le trajet </span>
                                        <span className='font-semibold'>{currentRouteData.route?.label}</span>
                                        <span>, nous vous invitons à </span>
                                        <span>{cleanHtmlTags(currentRouteData.max_precaution || '')} - de </span>
                                        <span className='font-semibold'>{currentRouteData.max_speed}</span>
                                        <span> km/h chaque fois que vous rencontrerez un(e) dos d'âne. </span>
                                        <span>
                                            Cette précaution peut vous éviter d'être l'auteur ou la victime des
                                            conséquences suivantes :{' '}
                                        </span>
                                        <span className='font-semibold'>
                                            {cleanHtmlTags(currentRouteData.max_consequence || '')}
                                        </span>
                                        <span className='italic'>
                                            . Merci de bien vouloir respecter cette recommandation sur votre trajet et
                                            faites bon voyage !
                                        </span>
                                    </p>
                                </Card>
                            )}

                            {/* Barre d'actions rapides */}
                            <div className='mb-6 flex justify-around'>
                                <Button
                                    variant='outline'
                                    className='flex h-auto flex-col items-center rounded-lg px-4 py-2'
                                    onClick={takeScreenshot}>
                                    <Camera className='mb-1 h-5 w-5 text-blue-600' />
                                    <span className='text-xs'>Capture</span>
                                </Button>
                                <Button
                                    variant='outline'
                                    className='flex h-auto flex-col items-center rounded-lg px-4 py-2'
                                    onClick={centerOnUserLocation}>
                                    <Crosshair className='mb-1 h-5 w-5 text-blue-600' />
                                    <span className='text-xs'>Position</span>
                                </Button>
                                <Button
                                    className='flex h-auto flex-col items-center rounded-lg bg-blue-800 px-4 py-2 hover:bg-blue-900'
                                    onClick={() => setShowRiskDetails(true)}>
                                    <Route className='mb-1 h-5 w-5' />
                                    <span className='text-xs'>Détails</span>
                                </Button>
                            </div>

                            {/* Liste des points de risque sur le trajet */}
                            {currentRouteData && currentRouteData.risks && (
                                <div>
                                    <h3 className='mb-3 text-base font-semibold'>Points de risque sur votre trajet</h3>
                                    <div className='space-y-3'>
                                        {currentRouteData.risks.map((risk, index) => (
                                            <Card
                                                key={index}
                                                className='cursor-pointer p-3 transition-colors hover:bg-gray-50'
                                                onClick={() => {
                                                    // Trouver le point correspondant dans les locations
                                                    const location = currentRouteData.locations?.find(
                                                        (loc) => loc.risk_label === risk.risk_label
                                                    );
                                                    if (location) {
                                                        setSelectedRisk(location);
                                                    }
                                                }}>
                                                <div className='flex items-center'>
                                                    <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50'>
                                                        {risk.risk_type_icon ? (
                                                            <img
                                                                src={`${config.api.iconUrl}${risk.risk_type_icon}`}
                                                                alt={risk.risk_type_label || 'Risque'}
                                                                className='h-10 w-10'
                                                            />
                                                        ) : (
                                                            getRiskIcon(risk.risk_type_label || '')
                                                        )}
                                                    </div>
                                                    <div className='flex-1'>
                                                        <div className='font-medium'>{risk.risk_label}</div>
                                                        <div className='mt-1 flex'>
                                                            <Badge
                                                                variant='outline'
                                                                className='mr-2 bg-blue-50 text-blue-700'>
                                                                {risk.count} point{risk.count !== 1 ? 's' : ''}
                                                            </Badge>
                                                            {risk.risk_type_speed && (
                                                                <Badge
                                                                    variant='outline'
                                                                    className='flex items-center bg-orange-50 text-orange-700'>
                                                                    {risk.risk_type_speed} km/h
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className='h-4 w-4 text-gray-400' />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Dialogue d'informations sur un risque */}
                <Dialog open={selectedRisk !== null} onOpenChange={(open) => !open && setSelectedRisk(null)}>
                    <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>{selectedRisk?.risk_label}</DialogTitle>
                            <DialogDescription>{selectedRisk?.risk_type_label}</DialogDescription>
                        </DialogHeader>

                        {selectedRisk?.photo && (
                            <div className='aspect-video overflow-hidden rounded-md'>
                                <img
                                    src={`${config.api.photoUrl}${selectedRisk.photo}`}
                                    alt={selectedRisk.risk_label || 'Photo du risque'}
                                    className='h-full w-full object-cover'
                                />
                            </div>
                        )}

                        <div className='space-y-4'>
                            {selectedRisk?.risk_type_precaution && (
                                <div className='rounded-lg bg-orange-50 p-3'>
                                    <h4 className='mb-1 flex items-center font-medium text-orange-800'>
                                        <AlertTriangle className='mr-2 h-4 w-4' />
                                        Précautions
                                    </h4>
                                    <p className='text-sm text-orange-700'>
                                        {cleanHtmlTags(selectedRisk.risk_type_precaution)}
                                    </p>
                                </div>
                            )}

                            {selectedRisk?.risk_type_speed && (
                                <div className='rounded-lg bg-blue-50 p-3'>
                                    <h4 className='mb-1 flex items-center font-medium text-blue-800'>
                                        Vitesse recommandée
                                    </h4>
                                    <p className='text-sm text-blue-700'>{selectedRisk.risk_type_speed} km/h</p>
                                </div>
                            )}

                            {selectedRisk?.risk_type_consequence && (
                                <div className='rounded-lg bg-red-50 p-3'>
                                    <h4 className='mb-1 flex items-center font-medium text-red-800'>
                                        <AlertOctagon className='mr-2 h-4 w-4' />
                                        Conséquences possibles
                                    </h4>
                                    <p className='text-sm text-red-700'>
                                        {cleanHtmlTags(selectedRisk.risk_type_consequence)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant='secondary' onClick={() => setSelectedRisk(null)}>
                                Fermer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Feuille de détails du trajet */}
                <Sheet open={showRiskDetails} onOpenChange={setShowRiskDetails}>
                    <SheetContent className='sm:max-w-md'>
                        <SheetHeader>
                            <SheetTitle>Détails de l'itinéraire</SheetTitle>
                            <SheetDescription>Informations et statistiques sur votre trajet</SheetDescription>
                        </SheetHeader>

                        {currentRouteData && (
                            <div className='h-[calc(100vh-80px)] space-y-6 overflow-y-auto py-4'>
                                {/* Carte d'en-tête */}
                                <Card className='rounded-lg bg-blue-800 p-4 text-white'>
                                    <h3 className='mb-2 text-lg font-semibold'>{currentRouteData.route?.label}</h3>

                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                            <Ruler className='mr-2 h-4 w-4' />
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

                                {/* Points de départ et d'arrivée */}
                                <div className='space-y-2'>
                                    <h4 className='font-medium text-gray-600'>Trajet</h4>

                                    <div className='flex items-start rounded-lg bg-green-50 p-3'>
                                        <div className='mt-1 mr-3'>
                                            <div className='h-4 w-4 rounded-full bg-green-600'></div>
                                        </div>
                                        <div>
                                            <p className='font-medium text-green-800'>Départ</p>
                                            <p className='text-sm text-green-700'>
                                                {currentRouteData.locations?.[0]?.risk_label || 'Point de départ'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className='ml-5 h-6 w-0.5 bg-gray-300'></div>

                                    <div className='flex items-start rounded-lg bg-red-50 p-3'>
                                        <div className='mt-1 mr-3'>
                                            <div className='h-4 w-4 rounded-full bg-red-600'></div>
                                        </div>
                                        <div>
                                            <p className='font-medium text-red-800'>Arrivée</p>
                                            <p className='text-sm text-red-700'>
                                                {currentRouteData.locations?.[currentRouteData.locations.length - 1]
                                                    ?.risk_label || "Point d'arrivée"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Risques sur l'itinéraire */}
                                <div className='space-y-3'>
                                    <h4 className='font-medium text-gray-600'>Risques sur l'itinéraire</h4>

                                    {currentRouteData.risks?.map((risk, index) => (
                                        <div
                                            key={index}
                                            className='rounded-lg border bg-white p-3 transition-shadow hover:shadow-sm'>
                                            <div className='mb-2 flex items-center'>
                                                <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50'>
                                                    {risk.risk_type_icon ? (
                                                        <img
                                                            src={`${config.api.iconUrl}${risk.risk_type_icon}`}
                                                            alt={risk.risk_type_label || 'Risque'}
                                                            className='h-8 w-8'
                                                        />
                                                    ) : (
                                                        getRiskIcon(risk.risk_type_label || '')
                                                    )}
                                                </div>
                                                <div>
                                                    <p className='font-medium'>{risk.risk_type_label}</p>
                                                    <p className='text-xs text-gray-500'>
                                                        {risk.count} point{risk.count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {risk.risk_type_speed && (
                                                <div className='mt-2 flex w-fit items-center rounded bg-orange-50 px-2 py-1 text-sm text-orange-700'>
                                                    Max {risk.risk_type_speed} km/h
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Recommandations */}
                                <div className='space-y-3'>
                                    <h4 className='font-medium text-gray-600'>Recommandations</h4>

                                    <div className='rounded-lg bg-blue-50 p-4'>
                                        <p className='text-sm leading-relaxed text-blue-800'>
                                            {cleanHtmlTags(currentRouteData.max_precaution || '')}
                                        </p>
                                    </div>

                                    {currentRouteData.route?.other_recommendation && (
                                        <div className='rounded-lg bg-indigo-50 p-4'>
                                            <h5 className='mb-1 font-medium text-indigo-800'>Autres recommandations</h5>
                                            <p className='text-sm leading-relaxed text-indigo-700'>
                                                {cleanHtmlTags(currentRouteData.route.other_recommendation)}
                                            </p>
                                        </div>
                                    )}

                                    {currentRouteData.route?.resting_place && (
                                        <div className='rounded-lg bg-green-50 p-4'>
                                            <h5 className='mb-1 font-medium text-green-800'>Lieux de repos</h5>
                                            <p className='text-sm leading-relaxed text-green-700'>
                                                {cleanHtmlTags(currentRouteData.route.resting_place)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <SheetFooter className='mt-4'>
                            <Button onClick={() => setShowRiskDetails(false)}>Fermer</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </DashboardLayout>
    );
}
