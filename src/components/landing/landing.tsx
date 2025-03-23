'use client';

import { SetStateAction, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/layout/footer';
import { Button } from '@/registry/new-york-v4/ui/button';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ChevronRight as ChevronRightIcon,
    MapPin,
    Menu,
    Navigation,
    Shield,
    Truck,
    X
} from 'lucide-react';

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // États pour les carrousels
    const [featureIndex, setFeatureIndex] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Références pour les carrousels
    const featuresRef = useRef(null);
    const stepsRef = useRef(null);
    const testimonialsRef = useRef(null);

    // Options tactiles pour le défilement
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Configuration des fonctionnalités
    const features = [
        {
            icon: <Navigation className='h-8 w-8 text-blue-600 md:h-10 md:w-10' />,
            title: 'Navigation précise',
            description: 'Obtenez des directions précises et optimisées pour vos trajets longue distance.'
        },
        {
            icon: <AlertTriangle className='h-8 w-8 text-orange-500 md:h-10 md:w-10' />,
            title: 'Alertes en temps réel',
            description: 'Recevez des alertes sur les dangers potentiels le long de votre itinéraire.'
        },
        {
            icon: <MapPin className='h-8 w-8 text-red-500 md:h-10 md:w-10' />,
            title: 'Signalement de risques',
            description: 'Contribuez à la communauté en signalant les risques que vous rencontrez.'
        },
        {
            icon: <Shield className='h-8 w-8 text-green-600 md:h-10 md:w-10' />,
            title: 'Sécurité améliorée',
            description: "Voyagez en toute sécurité grâce aux informations partagées par d'autres chauffeurs."
        },
        {
            icon: <Truck className='h-8 w-8 text-purple-600 md:h-10 md:w-10' />,
            title: 'Adapté aux professionnels',
            description: 'Interface conçue spécifiquement pour les chauffeurs de poids lourds.'
        },
        {
            icon: <MapPin className='h-8 w-8 text-yellow-500 md:h-10 md:w-10' />,
            title: "Points d'intérêt",
            description: 'Localisez les aires de repos, stations-service et restaurants le long de votre route.'
        }
    ];

    // Configuration des étapes
    const steps = [
        {
            step: '1',
            title: 'Planifiez votre itinéraire',
            description: 'Sélectionnez votre point de départ et votre destination pour obtenir le meilleur itinéraire.'
        },
        {
            step: '2',
            title: 'Naviguez en toute sécurité',
            description: 'Suivez les indications et recevez des alertes sur les risques potentiels en temps réel.'
        },
        {
            step: '3',
            title: 'Contribuez à la communauté',
            description: 'Signalez les dangers rencontrés pour aider les autres chauffeurs à les éviter.'
        }
    ];

    // Configuration des témoignages
    const testimonials = [
        {
            name: 'Thomas D.',
            role: 'Chauffeur poids lourd',
            photo: '/api/placeholder/64/64',
            quote: "Safes Road a complètement changé ma façon de conduire. Les alertes en temps réel m'ont évité plusieurs accidents potentiels."
        },
        {
            name: 'Sophie M.',
            role: 'Livreuse professionnelle',
            photo: '/api/placeholder/64/64',
            quote: "L'application la plus complète que j'ai utilisée. La communauté est très active et les signalements sont précis et à jour."
        },
        {
            name: 'Jean-Marc P.',
            role: 'Transporteur international',
            photo: '/api/placeholder/64/64',
            quote: "Indispensable pour les longs trajets. La fonction de planification d'itinéraire m'aide à optimiser mes déplacements et à éviter les zones à risque."
        }
    ];

    // Gestionnaires de navigation du carrousel
    const nextFeature = () => {
        setFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    };

    const prevFeature = () => {
        setFeatureIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
    };

    const nextStep = () => {
        setStepIndex((prevIndex) => (prevIndex + 1) % steps.length);
    };

    const prevStep = () => {
        setStepIndex((prevIndex) => (prevIndex - 1 + steps.length) % steps.length);
    };

    const nextTestimonial = () => {
        setTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setTestimonialIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };

    // Gestion des événements tactiles
    const handleTouchStart = (e: { targetTouches: { clientX: SetStateAction<number> }[] }) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: { targetTouches: { clientX: SetStateAction<number> }[] }) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (carouselType: string) => {
        if (touchStart - touchEnd > 75) {
            // Swipe gauche
            if (carouselType === 'features') nextFeature();
            else if (carouselType === 'steps') nextStep();
            else if (carouselType === 'testimonials') nextTestimonial();
        }

        if (touchEnd - touchStart > 75) {
            // Swipe droit
            if (carouselType === 'features') prevFeature();
            else if (carouselType === 'steps') prevStep();
            else if (carouselType === 'testimonials') prevTestimonial();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    // Close menu when screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

    return (
        <div className='flex min-h-screen flex-col'>
            {/* Header reste inchangé */}
            <header className='sticky top-0 z-50 w-full bg-white/90 shadow-sm backdrop-blur-sm'>
                {/* ... Contenu du header inchangé ... */}
                <div className='container mx-auto flex items-center justify-between px-4 py-3'>
                    <Link href='/' className='flex items-center space-x-2'>
                        <Shield className='h-8 w-8 text-blue-600' />
                        <span className='text-xl font-bold text-blue-900'>Safes Road</span>
                    </Link>

                    <nav className='hidden items-center space-x-6 md:flex'>
                        <Button asChild className='ml-2'>
                            <Link href='/auth/login'>Tableau de bord</Link>
                        </Button>
                    </nav>

                    <button className='p-2 text-gray-700 md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className='absolute z-50 w-full bg-white px-4 py-4 shadow-md md:hidden'>
                        <nav className='flex flex-col space-y-4'>
                            <Button className='w-full justify-center' onClick={() => setIsMenuOpen(false)} asChild>
                                <Link href='/auth/login'>Tableau de bord</Link>
                            </Button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Section Hero reste inchangée */}
            <section className='relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-4 py-16 text-white md:px-6 md:py-32'>
                {/* ... Contenu de la section Hero inchangé ... */}
                <div className='absolute inset-0 opacity-20'>
                    <div className="absolute inset-0 bg-[url('/assets/map-pattern.svg')] bg-repeat opacity-30"></div>
                </div>

                <div className='relative z-10 container max-w-5xl'>
                    <div className='grid grid-cols-1 items-center gap-8 md:grid-cols-2'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className='flex flex-col space-y-6'>
                            <h1 className='text-3xl font-bold tracking-tighter md:text-6xl'>
                                Navigation Sécurisée pour Chauffeurs Longue Distance
                            </h1>
                            <p className='text-base text-blue-100 md:text-xl'>
                                Planifiez vos itinéraires, évitez les dangers et contribuez à une communauté de
                                chauffeurs vigilants.
                            </p>
                            <div className='flex flex-col gap-4 pt-4 sm:flex-row'>
                                <Button
                                    size='lg'
                                    asChild
                                    className='w-full bg-white text-blue-900 hover:bg-blue-50 sm:w-auto'>
                                    <Link href='/auth/login'>
                                        Mon tableau de bord <ChevronRight className='ml-2 h-4 w-4' />
                                    </Link>
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    className='w-full border-amber-500 text-amber-500 hover:bg-white/10 sm:w-auto'>
                                    En savoir plus
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className='relative mt-6 md:mt-0 md:block'>
                            <div className='relative overflow-hidden rounded-lg border border-white/20 shadow-2xl'>
                                <Image
                                    src='/images/globe-map.jpg'
                                    alt='Interface de navigation'
                                    className='h-auto w-full'
                                    width={600}
                                    height={350}
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent'></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section - Carrousel en mobile */}
            <section className='bg-white py-16 md:py-20'>
                <div className='container mx-auto px-4 md:px-6'>
                    <div className='mb-12 text-center md:mb-16'>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-4xl'>
                            Fonctionnalités principales
                        </h2>
                        <p className='mx-auto max-w-3xl text-lg text-gray-600 md:text-xl'>
                            Une solution complète pour une navigation sécurisée sur les longues distances
                        </p>
                    </div>

                    {/* Version mobile - Carrousel */}
                    <div
                        className='md:hidden'
                        ref={featuresRef}
                        onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => {
                            handleTouchStart({
                                targetTouches: [{ clientX: e.targetTouches[0].clientX }]
                            });
                        }}
                        onTouchMove={(e: React.TouchEvent<HTMLDivElement>) => {
                            handleTouchMove({
                                targetTouches: [{ clientX: e.targetTouches[0].clientX }]
                            });
                        }}
                        onTouchEnd={() => handleTouchEnd('features')}>
                        <div className='relative px-4'>
                            <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className='flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
                                <div className='mb-4 rounded-full bg-blue-50 p-3'>{features[featureIndex].icon}</div>
                                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                                    {features[featureIndex].title}
                                </h3>
                                <p className='text-center text-sm text-gray-600'>
                                    {features[featureIndex].description}
                                </p>
                            </motion.div>

                            <div className='absolute top-1/2 left-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={prevFeature}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Fonctionnalité précédente'>
                                    <ChevronLeft className='h-5 w-5' />
                                </button>
                            </div>

                            <div className='absolute top-1/2 right-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={nextFeature}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Fonctionnalité suivante'>
                                    <ChevronRightIcon className='h-5 w-5' />
                                </button>
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center space-x-2'>
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setFeatureIndex(index)}
                                    className={`h-2 w-2 rounded-full ${
                                        index === featureIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Aller à la fonctionnalité ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Version desktop - Grille */}
                    <div className='hidden grid-cols-1 gap-6 sm:grid-cols-2 md:grid lg:grid-cols-3'>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className='flex flex-col items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md md:p-6'>
                                <div className='mb-4 rounded-full bg-blue-50 p-3'>{feature.icon}</div>
                                <h3 className='mb-2 text-lg font-semibold text-gray-900 md:text-xl'>{feature.title}</h3>
                                <p className='text-center text-sm text-gray-600 md:text-base'>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Carrousel en mobile */}
            <section className='bg-gray-50 py-16 md:py-20'>
                <div className='container mx-auto px-4 md:px-6'>
                    <div className='mb-12 text-center md:mb-16'>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-4xl'>Comment ça marche</h2>
                        <p className='mx-auto max-w-3xl text-lg text-gray-600 md:text-xl'>
                            Quelques étapes simples pour commencer votre voyage en toute sécurité
                        </p>
                    </div>

                    {/* Version mobile - Carrousel */}
                    <div
                        className='md:hidden'
                        ref={stepsRef}
                        onTouchStart={(e: React.TouchEvent<HTMLDivElement>) =>
                            handleTouchStart({ targetTouches: Array.from(e.targetTouches) })
                        }
                        onTouchMove={(e: React.TouchEvent<HTMLDivElement>) =>
                            handleTouchMove({ targetTouches: Array.from(e.targetTouches) })
                        }
                        onTouchEnd={() => handleTouchEnd('steps')}>
                        <div className='relative px-4'>
                            <motion.div
                                key={stepIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className='flex flex-col items-center text-center'>
                                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white'>
                                    {steps[stepIndex].step}
                                </div>
                                <h3 className='mb-2 text-lg font-semibold text-gray-900'>{steps[stepIndex].title}</h3>
                                <p className='text-sm text-gray-600'>{steps[stepIndex].description}</p>
                            </motion.div>

                            <div className='absolute top-1/2 left-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={prevStep}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Étape précédente'>
                                    <ChevronLeft className='h-5 w-5' />
                                </button>
                            </div>

                            <div className='absolute top-1/2 right-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={nextStep}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Étape suivante'>
                                    <ChevronRightIcon className='h-5 w-5' />
                                </button>
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center space-x-2'>
                            {steps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setStepIndex(index)}
                                    className={`h-2 w-2 rounded-full ${
                                        index === stepIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Aller à l'étape ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Version desktop - Grille */}
                    <div className='mx-auto hidden max-w-5xl grid-cols-1 gap-8 md:grid md:grid-cols-3'>
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className='flex flex-col items-center text-center'>
                                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white'>
                                    {step.step}
                                </div>
                                <h3 className='mb-2 text-lg font-semibold text-gray-900 md:text-xl'>{step.title}</h3>
                                <p className='text-sm text-gray-600 md:text-base'>{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Preview Section reste inchangée */}
            <section className='bg-white py-16 md:py-20'>
                {/* ... Contenu de App Preview inchangé ... */}
                <div className='container mx-auto px-4 md:px-6'>
                    <div className='mb-12 text-center md:mb-16'>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-4xl'>
                            Découvrez notre application
                        </h2>
                        <p className='mx-auto max-w-3xl text-lg text-gray-600 md:text-xl'>
                            Une interface intuitive conçue pour vous accompagner sur la route
                        </p>
                    </div>

                    <div className='grid grid-cols-1 items-center gap-8 md:grid-cols-2'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className='order-2 space-y-4 md:order-1'>
                            <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
                                <h3 className='text-md mb-1 font-medium text-blue-900 md:text-lg'>
                                    Navigation intuitive
                                </h3>
                                <p className='text-sm text-gray-600 md:text-base'>
                                    Interface simplifiée pour une utilisation facile, même en conduisant.
                                </p>
                            </div>
                            <div className='rounded-lg border-l-4 border-green-500 bg-green-50 p-4'>
                                <h3 className='text-md mb-1 font-medium text-green-900 md:text-lg'>
                                    Alertes intelligentes
                                </h3>
                                <p className='text-sm text-gray-600 md:text-base'>
                                    Notifications visuelles et sonores pour tous les dangers sur votre route.
                                </p>
                            </div>
                            <div className='rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4'>
                                <h3 className='text-md mb-1 font-medium text-purple-900 md:text-lg'>Mode hors-ligne</h3>
                                <p className='text-sm text-gray-600 md:text-base'>
                                    Accédez à vos itinéraires même sans connexion internet.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className='relative order-1 md:order-2'>
                            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-1'>
                                <div className='relative overflow-hidden rounded-lg bg-gray-900'>
                                    <Image
                                        src='/images/gps-navigato.webp'
                                        alt='Application Safes Road en action'
                                        className='h-auto w-full rounded-lg'
                                        width={300}
                                        height={250}
                                    />

                                    {/* Overlay noir semi-transparent en bas de l'image */}
                                    <div className='absolute right-0 bottom-0 left-0 bg-black/10 p-4 backdrop-blur-sm'>
                                        <p className='mb-3 text-center font-medium text-white'>
                                            Téléchargez l'application maintenant
                                        </p>
                                        <div className='flex flex-row justify-center gap-4'>
                                            <a
                                                href='#'
                                                className='transform transition-transform hover:scale-105'
                                                aria-label="Télécharger sur l'App Store">
                                                <Image
                                                    src='/images/app_store.png'
                                                    alt="Télécharger sur l'App Store"
                                                    width={190}
                                                    height={40}
                                                    className='h-auto'
                                                />
                                            </a>
                                            <a
                                                href='#'
                                                className='transform transition-transform hover:scale-105'
                                                aria-label='Télécharger sur Google Play'>
                                                <Image
                                                    src='/images/google_play.png'
                                                    alt='Télécharger sur Google Play'
                                                    width={190}
                                                    height={40}
                                                    className='h-auto'
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='absolute -right-3 -bottom-3 z-10 rounded-full bg-white p-3 shadow-lg md:-right-5 md:-bottom-5 md:p-4'>
                                <Shield className='h-8 w-8 text-blue-600 md:h-10 md:w-10' />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Carrousel en mobile */}
            <section className='bg-gray-50 py-16 md:py-20'>
                <div className='container mx-auto px-4 md:px-6'>
                    <div className='mb-12 text-center md:mb-16'>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-4xl'>
                            Ce que disent nos utilisateurs
                        </h2>
                        <p className='mx-auto max-w-3xl text-lg text-gray-600 md:text-xl'>
                            Découvrez les expériences de chauffeurs qui utilisent Safes Road au quotidien
                        </p>
                    </div>

                    {/* Version mobile - Carrousel */}
                    <div
                        className='md:hidden'
                        ref={testimonialsRef}
                        onTouchStart={(e: React.TouchEvent<HTMLDivElement>) =>
                            handleTouchStart({ targetTouches: Array.from(e.targetTouches) })
                        }
                        onTouchMove={(e: React.TouchEvent<HTMLDivElement>) =>
                            handleTouchMove({ targetTouches: Array.from(e.targetTouches) })
                        }
                        onTouchEnd={() => handleTouchEnd('testimonials')}>
                        <div className='relative px-4'>
                            <motion.div
                                key={testimonialIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className='rounded-xl bg-white p-5 shadow-md'>
                                <div className='mb-4 flex items-center'>
                                    <img
                                        src={testimonials[testimonialIndex].photo}
                                        alt={testimonials[testimonialIndex].name}
                                        className='mr-3 h-10 w-10 rounded-full object-cover'
                                    />
                                    <div>
                                        <h4 className='font-medium text-gray-900'>
                                            {testimonials[testimonialIndex].name}
                                        </h4>
                                        <p className='text-xs text-gray-500'>{testimonials[testimonialIndex].role}</p>
                                    </div>
                                </div>
                                <p className='text-sm text-gray-700 italic'>"{testimonials[testimonialIndex].quote}"</p>
                            </motion.div>

                            <div className='absolute top-1/2 left-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={prevTestimonial}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Témoignage précédent'>
                                    <ChevronLeft className='h-5 w-5' />
                                </button>
                            </div>

                            <div className='absolute top-1/2 right-0 flex -translate-y-1/2 items-center justify-center'>
                                <button
                                    onClick={nextTestimonial}
                                    className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm'
                                    aria-label='Témoignage suivant'>
                                    <ChevronRightIcon className='h-5 w-5' />
                                </button>
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center space-x-2'>
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setTestimonialIndex(index)}
                                    className={`h-2 w-2 rounded-full ${
                                        index === testimonialIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Aller au témoignage ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Version desktop - Grille */}
                    <div className='hidden grid-cols-1 gap-6 sm:grid-cols-2 md:grid md:grid-cols-3'>
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className='rounded-xl bg-white p-5 shadow-md md:p-6'>
                                <div className='mb-4 flex items-center'>
                                    <img
                                        src={testimonial.photo}
                                        alt={testimonial.name}
                                        className='mr-3 h-10 w-10 rounded-full object-cover md:h-12 md:w-12'
                                    />
                                    <div>
                                        <h4 className='font-medium text-gray-900'>{testimonial.name}</h4>
                                        <p className='text-xs text-gray-500 md:text-sm'>{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className='text-sm text-gray-700 italic md:text-base'>"{testimonial.quote}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section reste inchangée */}
            <section className='bg-blue-900 py-16 text-white md:py-20'>
                <div className='container mx-auto px-4 text-center md:px-6'>
                    <h2 className='mb-4 text-2xl font-bold md:mb-6 md:text-4xl'>
                        Prêt à prendre la route en toute sécurité ?
                    </h2>
                    <p className='mx-auto mb-6 max-w-3xl text-lg text-blue-100 md:mb-8 md:text-xl'>
                        Rejoignez notre communauté de chauffeurs et contribuez à rendre les routes plus sûres pour tous.
                    </p>
                    <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                        <Button size='lg' asChild className='w-full bg-white text-blue-900 hover:bg-blue-50 sm:w-auto'>
                            <Link href='/dash'>Tableau de bord</Link>
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            asChild
                            className='w-full border-blue-500 text-blue-500 hover:bg-white/10 sm:w-auto'>
                            <Link href='/profile'>Mon profil</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
