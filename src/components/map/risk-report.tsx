// components/map/risk-report.tsx
'use client';

import { useState } from 'react';

import { GeoPoint } from '@/lib/mapbox';
import { NewRisk, RiskType, riskService, riskTypes } from '@/lib/risk-service';
import { Button } from '@/registry/new-york-v4/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/registry/new-york-v4/ui/dialog';
import { Label } from '@/registry/new-york-v4/ui/label';
import { RadioGroup, RadioGroupItem } from '@/registry/new-york-v4/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';

import { motion } from 'framer-motion';
import { AlertTriangle, Camera, Cloud, Construction, MapPin, Shield, X } from 'lucide-react';

// components/map/risk-report.tsx

// components/map/risk-report.tsx

interface RiskReportProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLocation?: GeoPoint;
    onReportSuccess?: (risk: NewRisk) => void;
}

export default function RiskReport({
    open,
    onOpenChange,
    currentLocation = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
    onReportSuccess
}: RiskReportProps) {
    const [selectedTab, setSelectedTab] = useState<'quick' | 'detailed'>('quick');
    const [selectedRiskType, setSelectedRiskType] = useState<RiskType | null>(null);
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Icons for risk types
    const getRiskIcon = (riskType: string) => {
        switch (riskType) {
            case 'pothole':
            case 'speedbump':
                return <AlertTriangle className='h-5 w-5' />;
            case 'construction':
                return <Construction className='h-5 w-5' />;
            case 'police':
                return <Shield className='h-5 w-5' />;
            case 'weather':
                return <Cloud className='h-5 w-5' />;
            default:
                return <AlertTriangle className='h-5 w-5' />;
        }
    };

    const handleSubmit = async () => {
        if (!selectedRiskType) return;

        setIsSubmitting(true);

        try {
            const newRisk: NewRisk = {
                type: selectedRiskType,
                location: currentLocation,
                severity,
                description: description.trim() || undefined
            };

            // Dans un environnement réel, on appelerait l'API
            // await riskService.createRisk(newRisk);

            // Pour la démo, on simule un délai
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Afficher le succès
            setShowSuccess(true);

            // Réinitialiser le formulaire après 2 secondes
            setTimeout(() => {
                if (onReportSuccess) {
                    onReportSuccess(newRisk);
                }
                resetForm();
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            console.error('Erreur lors du signalement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedRiskType(null);
        setSeverity('medium');
        setDescription('');
        setShowSuccess(false);
        setSelectedTab('quick');
    };

    // Animation variants pour le succès
    const successVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) resetForm();
                onOpenChange(newOpen);
            }}>
            <DialogContent className='sm:max-w-md'>
                {showSuccess ? (
                    <motion.div
                        initial='hidden'
                        animate='visible'
                        variants={successVariants}
                        className='flex flex-col items-center py-6'>
                        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                            <AlertTriangle className='h-8 w-8 text-green-600' />
                        </div>
                        <h3 className='mb-2 text-xl font-semibold text-green-800'>Signalement envoyé !</h3>
                        <p className='text-center text-gray-600'>Merci de contribuer à la sécurité des utilisateurs.</p>
                    </motion.div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Signaler un risque</DialogTitle>
                            <DialogDescription>
                                Aidez les autres conducteurs en signalant un danger sur la route.
                            </DialogDescription>
                        </DialogHeader>

                        <div className='my-2 flex items-center space-x-2 text-sm text-blue-600'>
                            <MapPin className='h-4 w-4' />
                            <span>
                                Latitude: {currentLocation.lat.toFixed(5)}, Longitude: {currentLocation.lng.toFixed(5)}
                            </span>
                        </div>

                        <Tabs
                            defaultValue='quick'
                            value={selectedTab}
                            onValueChange={(value) => setSelectedTab(value as 'quick' | 'detailed')}
                            className='mt-2'>
                            <TabsList className='grid grid-cols-2'>
                                <TabsTrigger value='quick'>Signalement rapide</TabsTrigger>
                                <TabsTrigger value='detailed'>Détails</TabsTrigger>
                            </TabsList>

                            <TabsContent value='quick' className='space-y-4 pt-4'>
                                <div className='grid grid-cols-2 gap-3'>
                                    {riskTypes.map((risk) => (
                                        <Button
                                            key={risk.id}
                                            variant={selectedRiskType === risk.id ? 'default' : 'outline'}
                                            className={`justify-start ${
                                                selectedRiskType === risk.id
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : ''
                                            }`}
                                            onClick={() => setSelectedRiskType(risk.id as RiskType)}>
                                            {getRiskIcon(risk.id)}
                                            <span className='ml-2'>{risk.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value='detailed' className='space-y-4 pt-4'>
                                <div className='space-y-4'>
                                    <div>
                                        <Label className='mb-2 block'>Gravité du risque</Label>
                                        <RadioGroup
                                            value={severity}
                                            onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}
                                            className='flex space-x-2'>
                                            <div className='flex items-center space-x-1'>
                                                <RadioGroupItem value='low' id='low' />
                                                <Label htmlFor='low' className='cursor-pointer text-green-600'>
                                                    Faible
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-1'>
                                                <RadioGroupItem value='medium' id='medium' />
                                                <Label htmlFor='medium' className='cursor-pointer text-yellow-600'>
                                                    Moyen
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-1'>
                                                <RadioGroupItem value='high' id='high' />
                                                <Label htmlFor='high' className='cursor-pointer text-red-600'>
                                                    Élevé
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div>
                                        <Label htmlFor='description' className='mb-2 block'>
                                            Description (optionnelle)
                                        </Label>
                                        <Textarea
                                            id='description'
                                            placeholder='Décrivez le risque plus en détail...'
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className='resize-none'
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Button variant='outline' className='w-full'>
                                            <Camera className='mr-2 h-4 w-4' />
                                            Ajouter une photo
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className='flex-col gap-2 sm:flex-row sm:gap-0'>
                            <Button variant='outline' onClick={() => onOpenChange(false)}>
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedRiskType || isSubmitting}
                                className='relative'>
                                {isSubmitting ? 'Envoi en cours...' : 'Signaler'}
                                {selectedRiskType && (
                                    <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500'></div>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
