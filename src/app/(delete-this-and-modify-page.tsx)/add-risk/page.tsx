'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import DashboardLayout from '@/app/dash/layout';
import { useAuth } from '@/hooks/use-auth';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { config } from '@/lib/api/config';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card } from '@/registry/new-york-v4/ui/card';
import { DialogFooter, DialogHeader } from '@/registry/new-york-v4/ui/dialog';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { GoogleMap, Marker } from '@react-google-maps/api';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Camera,
    Check,
    CheckCircle,
    ChevronLeft,
    Edit,
    Info,
    Locate,
    Map,
    MapPin,
    RotateCcw,
    Upload,
    X
} from 'lucide-react';
import { Label } from 'recharts';
import { toast } from 'sonner';

// Interface pour les coordonnées
interface Coordinates {
    lat: number;
    lng: number;
}

const libraries = ['places', 'geometry'];

export default function RiskDeclarationPage() {
    const router = useRouter();
    const { isAuthenticated, token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // États pour la gestion des photos
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [imageCoordinates, setImageCoordinates] = useState<Coordinates | null>(null);

    // États pour la carte et les coordonnées
    const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
    const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 5.36, lng: -4.0083 }); // Abidjan par défaut
    const [isLocating, setIsLocating] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [manualCoordinatesDialogOpen, setManualCoordinatesDialogOpen] = useState(false);
    const [latitudeInput, setLatitudeInput] = useState('');
    const [longitudeInput, setLongitudeInput] = useState('');

    // États pour l'envoi des données
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showLocationOptions, setShowLocationOptions] = useState(false);

    // Référence à l'objet GoogleMap
    const mapRef = useRef<google.maps.Map | null>(null);

    // Chargement de l'API Google Maps
    const { isLoaded, loadError } = useGoogleMaps();

    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    // Gérer le changement de fichier
    const handleFileChange = async (e: { target: { files: File[] | null; value: null } }) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessingImage(true);
        setSelectedImage(file);

        // Créer une URL de prévisualisation
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            // Extraire les métadonnées EXIF de l'image
            const coordinates = await extractCoordinatesFromImage(file);

            if (coordinates) {
                setImageCoordinates(coordinates);
                setSelectedLocation(coordinates);
                setMapCenter(coordinates);
                toast('Information', {
                    description: "Les coordonnées de l'image ont été extraites avec succès.",
                    action: {
                        label: 'Undo',
                        onClick: () => console.log('Undo')
                    }
                });
                setShowLocationOptions(false);
            } else {
                // Si aucune coordonnée n'est trouvée dans l'image
                setImageCoordinates(null);
                toast('Information', {
                    description: 'Aucune coordonnée GPS trouvée dans cette image.',
                    action: {
                        label: 'Undo',
                        onClick: () => console.log('Undo')
                    }
                });
                setShowLocationOptions(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'extraction des métadonnées:", error);
            toast('Erreur', {
                description: "Impossible d'extraire les métadonnées de l'image.",
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });
            setShowLocationOptions(true);
        } finally {
            setIsProcessingImage(false);
        }

        // Nettoyage de l'input file pour permettre de sélectionner la même image
        e.target.value = null;
    };

    // Extraire les coordonnées d'une image
    const extractCoordinatesFromImage = async (file: Blob): Promise<Coordinates | null> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    // Pour l'exemple, nous simulons l'extraction des coordonnées
                    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme exif-js

                    // Simulation: 1 chance sur 3 de trouver des coordonnées
                    const hasCoordinates = Math.random() > 0.7;

                    if (hasCoordinates) {
                        // Générer des coordonnées aléatoires autour d'Abidjan pour l'exemple
                        const randomLat = 5.36 + (Math.random() - 0.5) * 0.1;
                        const randomLng = -4.0083 + (Math.random() - 0.5) * 0.1;

                        resolve({
                            lat: randomLat,
                            lng: randomLng
                        });
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = function (error) {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    // Supprimer l'image sélectionnée
    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedImage(null);
        setPreviewUrl(null);
        setImageCoordinates(null);
        setShowLocationOptions(false);
    };

    // Géolocaliser l'utilisateur
    const getCurrentLocation = () => {
        setIsLocating(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentPosition: Coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    setSelectedLocation(currentPosition);
                    setMapCenter(currentPosition);
                    setShowMap(true);

                    toast('Information', {
                        description: 'Votre position actuelle a été définie.',
                        action: {
                            label: 'Undo',
                            onClick: () => console.log('Undo')
                        }
                    });

                    setIsLocating(false);
                    setShowLocationOptions(false);
                },
                (error) => {
                    console.error('Erreur de géolocalisation:', error);
                    toast('Erreur', {
                        description: "Impossible d'obtenir votre position actuelle.",
                        action: {
                            label: 'Undo',
                            onClick: () => console.log('Undo')
                        }
                    });
                    setIsLocating(false);
                }
            );
        } else {
            toast('Erreur', {
                description: "La géolocalisation n'est pas supportée par votre navigateur.",
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });
            setIsLocating(false);
        }
    };

    // Gérer le clic sur la carte
    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const clickedPosition: Coordinates = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };

            setSelectedLocation(clickedPosition);
        }
    };

    // Ouvrir la boîte de dialogue pour les coordonnées manuelles
    const openManualCoordinatesDialog = () => {
        if (selectedLocation) {
            setLatitudeInput(selectedLocation.lat.toString());
            setLongitudeInput(selectedLocation.lng.toString());
        }
        setManualCoordinatesDialogOpen(true);
    };

    // Soumettre les coordonnées manuelles
    const submitManualCoordinates = () => {
        try {
            const lat = parseFloat(latitudeInput);
            const lng = parseFloat(longitudeInput);

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                toast('Erreur', {
                    description: 'Les coordonnées saisies ne sont pas valides.',
                    action: {
                        label: 'Undo',
                        onClick: () => console.log('Undo')
                    }
                });

                return;
            }

            const newPosition: Coordinates = { lat, lng };
            setSelectedLocation(newPosition);
            setMapCenter(newPosition);
            setShowMap(true);
            setManualCoordinatesDialogOpen(false);

            toast('Information', {
                description: 'Les coordonnées ont été mises à jour avec succès.',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });

            setShowLocationOptions(false);
        } catch (error) {
            toast('Erreur', {
                description: 'Veuillez saisir des coordonnées valides.',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });
        }
    };

    // Soumettre la déclaration de risque
    const handleSubmit = async () => {
        if (!selectedImage || !selectedLocation) {
            toast('Erreur', {
                description: 'Veuillez sélectionner une image et définir une localisation.',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });

            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Créer un objet FormData
            const formData = new FormData();
            formData.append('photo', selectedImage);
            formData.append('latitude', selectedLocation.lat.toString());
            formData.append('longitude', selectedLocation.lng.toString());

            // Envoyer les données au serveur
            const response = await fetch(`${config.api.baseUrl}/risks/store/photo/for-validation`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            setSubmitSuccess(true);
            toast('Information', {
                description: 'Le risque a été signalé avec succès.',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });

            // Redirection après un court délai
            setTimeout(() => {
                router.push('/risks');
            }, 2000);
        } catch (error: unknown) {
            console.error('Erreur lors de la soumission:', error);
            setSubmitError(error instanceof Error ? error.message : 'Une erreur inconnue est survenue');
            toast('Erreur', {
                description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo')
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Recommencer la déclaration
    const handleReset = () => {
        handleRemoveImage();
        setSelectedLocation(null);
        setShowMap(false);
        setSubmitSuccess(false);
        setSubmitError(null);
    };

    // Formater les coordonnées pour l'affichage
    const formatCoordinates = (coords: Coordinates | null) => {
        if (!coords) return 'Non défini';

        return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    };

    // Si chargement de la carte
    if (loadError) {
        return (
            <div className='container mx-auto max-w-3xl px-4 py-8'>
                <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20'>
                    <AlertTriangle className='mx-auto h-10 w-10 text-red-500' />
                    <h2 className='mt-4 text-lg font-medium text-red-800 dark:text-red-300'>
                        Erreur de chargement de la carte
                    </h2>
                    <p className='mt-2 text-red-700 dark:text-red-400'>
                        Impossible de charger Google Maps. Veuillez vérifier votre connexion et réessayer.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className='container mx-auto max-w-3xl px-4 py-8'>
                <div className='mb-6 flex items-center'>
                    <Button variant='ghost' size='icon' className='mr-2' onClick={() => router.back()}>
                        <ChevronLeft className='h-5 w-5' />
                    </Button>
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Signaler un risque</h1>
                </div>

                {submitSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='rounded-lg border border-green-100 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-900/20'>
                        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50'>
                            <CheckCircle className='h-10 w-10 text-green-600 dark:text-green-400' />
                        </div>
                        <h2 className='mb-2 text-2xl font-semibold text-green-800 dark:text-green-300'>
                            Risque signalé avec succès
                        </h2>
                        <p className='mb-6 text-green-700 dark:text-green-400'>
                            Merci pour votre contribution. Votre signalement va aider à améliorer la sécurité routière.
                        </p>
                        <div className='flex justify-center space-x-4'>
                            <Button variant='outline' onClick={handleReset}>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Nouveau signalement
                            </Button>
                            <Button onClick={() => router.push('/risks')}>Voir tous les risques</Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        {/* Section Photo */}
                        <Card className='overflow-hidden'>
                            <div className='border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
                                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Photo du risque</h2>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                    Prenez une photo claire du risque à signaler
                                </p>
                            </div>

                            <div className='p-4'>
                                {!selectedImage ? (
                                    <div
                                        className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400'
                                        onClick={handleSelectImage}>
                                        <div className='mb-4 rounded-full bg-blue-50 p-3 dark:bg-blue-900/50'>
                                            <Camera className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                        </div>
                                        <p className='mb-2 text-lg font-medium text-gray-700 dark:text-gray-300'>
                                            Cliquez pour ajouter une photo
                                        </p>
                                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                                            SVG, PNG, JPG ou GIF (max. 10MB)
                                        </p>
                                    </div>
                                ) : (
                                    <div className='relative overflow-hidden rounded-lg'>
                                        {isProcessingImage && (
                                            <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                <div className='rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800'>
                                                    <Spinner className='h-8 w-8 text-blue-600' />
                                                    <p className='mt-2 text-center text-sm'>Analyse de l'image...</p>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            src={previewUrl || ''}
                                            alt='Aperçu du risque'
                                            className='h-full w-full object-contain'
                                            style={{ maxHeight: '400px' }}
                                        />
                                        <Button
                                            variant='destructive'
                                            size='icon'
                                            className='absolute top-2 right-2 h-8 w-8 rounded-full opacity-90'
                                            onClick={handleRemoveImage}>
                                            <X className='h-4 w-4' />
                                        </Button>

                                        {imageCoordinates && (
                                            <div className='absolute right-2 bottom-2 left-2 rounded-lg bg-black/50 p-2 text-sm text-white'>
                                                <div className='flex items-center'>
                                                    <MapPin className='mr-1 h-4 w-4 text-red-400' />
                                                    <span>
                                                        Coordonnées trouvées dans l'image:{' '}
                                                        {formatCoordinates(imageCoordinates)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    className='hidden'
                                    accept='image/*'
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFileChange({
                                                target: {
                                                    files: Array.from(e.target.files),
                                                    value: null
                                                }
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </Card>
                        {/* Options de localisation */}
                        {showLocationOptions && (
                            <Card className='border-blue-100 dark:border-blue-900'>
                                <div className='border-b border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20'>
                                    <h2 className='text-lg font-semibold text-blue-900 dark:text-blue-300'>
                                        Options de localisation
                                    </h2>
                                    <p className='text-sm text-blue-700 dark:text-blue-400'>
                                        Veuillez choisir une méthode pour définir la position du risque
                                    </p>
                                </div>

                                <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-3'>
                                    <Button
                                        variant='outline'
                                        className='flex h-auto flex-col items-center justify-center gap-2 p-4'
                                        onClick={getCurrentLocation}
                                        disabled={isLocating}>
                                        <Locate className='h-6 w-6 text-blue-600' />
                                        <span className='text-sm'>Ma position actuelle</span>
                                        {isLocating && <Spinner className='h-4 w-4' />}
                                    </Button>

                                    <Button
                                        variant='outline'
                                        className='flex h-auto flex-col items-center justify-center gap-2 p-4'
                                        onClick={() => {
                                            setShowMap(true);
                                            setShowLocationOptions(false);
                                        }}>
                                        <Map className='h-6 w-6 text-purple-600' />
                                        <span className='text-sm'>Sélectionner sur la carte</span>
                                    </Button>

                                    <Button
                                        variant='outline'
                                        className='flex h-auto flex-col items-center justify-center gap-2 p-4'
                                        onClick={openManualCoordinatesDialog}>
                                        <Edit className='h-6 w-6 text-green-600' />
                                        <span className='text-sm'>Saisie manuelle</span>
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Section Localisation */}
                        <Card className='overflow-hidden'>
                            <div className='border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
                                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Localisation</h2>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                    Indiquez la position exacte du risque
                                </p>
                            </div>

                            <div className='p-4'>
                                {/* Affichage de la carte */}
                                {(showMap || selectedLocation) && isLoaded && (
                                    <div className='mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
                                        <GoogleMap
                                            mapContainerStyle={{ height: '300px', width: '100%' }}
                                            center={mapCenter}
                                            zoom={14}
                                            onClick={handleMapClick}
                                            onLoad={(map: google.maps.Map) => {
                                                mapRef.current = map;
                                            }}
                                            options={{
                                                streetViewControl: false,
                                                mapTypeControl: false,
                                                fullscreenControl: false
                                            }}>
                                            {selectedLocation && <Marker position={selectedLocation} />}
                                        </GoogleMap>
                                    </div>
                                )}

                                {/* Affichage des coordonnées et boutons d'action */}
                                <div
                                    className={`flex flex-col rounded-lg border p-4 ${
                                        selectedLocation
                                            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                    }`}>
                                    <div className='mb-4 flex items-center'>
                                        <div
                                            className={`mr-3 rounded-full p-2 ${
                                                selectedLocation
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            {selectedLocation ? (
                                                <Check className='h-5 w-5' />
                                            ) : (
                                                <MapPin className='h-5 w-5' />
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <p
                                                className={`font-medium ${
                                                    selectedLocation
                                                        ? 'text-green-800 dark:text-green-300'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {selectedLocation
                                                    ? 'Position sélectionnée'
                                                    : 'Aucune position sélectionnée'}
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    selectedLocation
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {selectedLocation
                                                    ? formatCoordinates(selectedLocation)
                                                    : 'Utilisez les options ci-dessous pour définir la position'}
                                            </p>
                                        </div>
                                    </div>

                                    {!showLocationOptions && (
                                        <div className='flex flex-wrap gap-2'>
                                            {!selectedLocation && (
                                                <Button
                                                    variant='default'
                                                    className='flex-1'
                                                    onClick={() => setShowLocationOptions(true)}>
                                                    <MapPin className='mr-2 h-4 w-4' />
                                                    Définir la position
                                                </Button>
                                            )}

                                            {selectedLocation && (
                                                <>
                                                    <Button
                                                        variant='outline'
                                                        className='flex-1'
                                                        onClick={() => {
                                                            setShowMap(true);
                                                            setShowLocationOptions(false);
                                                        }}>
                                                        <Map className='mr-2 h-4 w-4' />
                                                        Modifier sur la carte
                                                    </Button>

                                                    <Button
                                                        variant='outline'
                                                        className='flex-1'
                                                        onClick={openManualCoordinatesDialog}>
                                                        <Edit className='mr-2 h-4 w-4' />
                                                        Modifier manuellement
                                                    </Button>

                                                    <Button
                                                        variant='outline'
                                                        className='flex-1'
                                                        onClick={getCurrentLocation}
                                                        disabled={isLocating}>
                                                        <Locate className='mr-2 h-4 w-4' />
                                                        Ma position
                                                        {isLocating && <Spinner className='ml-2 h-4 w-4' />}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Bouton de soumission */}
                        <Button
                            size='lg'
                            className='w-full'
                            disabled={isSubmitting || !selectedImage || !selectedLocation}
                            onClick={handleSubmit}>
                            {isSubmitting ? (
                                <>
                                    <Spinner className='mr-2 h-4 w-4' />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className='mr-2 h-5 w-5' />
                                    Signaler le risque
                                </>
                            )}
                        </Button>

                        {submitError && (
                            <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300'>
                                <div className='flex'>
                                    <AlertTriangle className='mr-2 h-5 w-5 text-red-600 dark:text-red-400' />
                                    <div>
                                        <p className='font-medium'>Erreur lors de la soumission</p>
                                        <p className='text-sm text-red-700 dark:text-red-400'>{submitError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Dialogue pour les coordonnées manuelles */}
                <Dialog open={manualCoordinatesDialogOpen} onOpenChange={setManualCoordinatesDialogOpen}>
                    <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>Saisie manuelle des coordonnées</DialogTitle>
                            <DialogDescription>Entrez les coordonnées précises du risque</DialogDescription>
                        </DialogHeader>

                        <div className='space-y-4 py-4'>
                            <div className='space-y-2'>
                                <Label>Latitude</Label>
                                <Input
                                    id='latitude'
                                    placeholder='Ex: 5.3600'
                                    value={latitudeInput}
                                    onChange={(e) => setLatitudeInput(e.target.value)}
                                />
                                <p className='text-xs text-gray-500'>Doit être entre -90 et 90</p>
                            </div>
                            <div className='space-y-2'>
                                <Label>Longitude</Label>
                                <Input
                                    id='longitude'
                                    placeholder='Ex: -4.0083'
                                    value={longitudeInput}
                                    onChange={(e) => setLongitudeInput(e.target.value)}
                                />
                                <p className='text-xs text-gray-500'>Doit être entre -180 et 180</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant='outline' onClick={() => setManualCoordinatesDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={submitManualCoordinates}>Confirmer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

// Composant Spinner pour les chargements
const Spinner = ({ className }: { className: string }) => (
    <svg
        className={`animate-spin ${className || 'h-5 w-5'}`}
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
        <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
    </svg>
);
