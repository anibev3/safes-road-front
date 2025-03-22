// app/(auth)/login/page-mobile.tsx
'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';

import { Eye, EyeOff, Loader2, Lock, Mail, Navigation } from 'lucide-react';
import { z } from 'zod';

// app/(auth)/login/page-mobile.tsx

// app/(auth)/login/page-mobile.tsx

// Schéma de validation
const loginSchema = z.object({
    email: z.string().email({ message: 'Adresse email invalide' }),
    password: z.string().min(1, { message: 'Le mot de passe est requis' })
});

export default function LoginPageMobile() {
    const router = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Effacer l'erreur lors de la saisie
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: undefined
            });
        }

        // Effacer le message d'erreur général
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Valider les données du formulaire
            loginSchema.parse(formData);

            // Réinitialiser les erreurs
            setErrors({});
            setErrorMessage(null);

            // Démarrer le chargement
            setIsLoading(true);

            // Appeler le service de connexion
            const success = await login(formData.email, formData.password, formData.remember);

            if (success) {
                // Rediriger vers le tableau de bord en cas de succès
                router.push('/map');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Formatter les erreurs Zod
                const formattedErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        formattedErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(formattedErrors);
            } else {
                // Gérer les autres erreurs (ex: erreurs d'API)
                setErrorMessage(
                    error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen flex-col bg-white px-4 py-8'>
            <div className='mb-6 flex justify-center'>
                <Link href='/' className='flex items-center'>
                    <Navigation className='h-7 w-7 text-blue-600' />
                    <span className='ml-2 text-xl font-bold text-blue-900'>RouteGuard</span>
                </Link>
            </div>

            <h1 className='mb-6 text-center text-2xl font-bold'>Connexion</h1>

            {errorMessage && (
                <Alert variant='destructive' className='mb-4'>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
                <div className='space-y-2'>
                    <Label htmlFor='email-mobile'>Email</Label>
                    <div className='relative'>
                        <Mail className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
                        <Input
                            id='email-mobile'
                            name='email'
                            type='email'
                            autoComplete='email'
                            required
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder='votre@email.com'
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <Label htmlFor='password-mobile'>Mot de passe</Label>
                        <Link href='/forgot-password' className='text-xs text-blue-600 hover:text-blue-500'>
                            Mot de passe oublié?
                        </Link>
                    </div>
                    <div className='relative'>
                        <Lock className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
                        <Input
                            id='password-mobile'
                            name='password'
                            type={showPassword ? 'text' : 'password'}
                            autoComplete='current-password'
                            required
                            className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                            placeholder='••••••••'
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute top-0 right-0 h-10 w-10'
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}>
                            {showPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-400' />
                            ) : (
                                <Eye className='h-4 w-4 text-gray-400' />
                            )}
                        </Button>
                    </div>
                    {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
                </div>

                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='remember-mobile'
                        name='remember'
                        checked={formData.remember}
                        onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                        disabled={isLoading}
                    />
                    <label
                        htmlFor='remember-mobile'
                        className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Se souvenir de moi
                    </label>
                </div>

                <Button type='submit' className='w-full py-6' disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Connexion en cours...
                        </>
                    ) : (
                        'Se connecter'
                    )}
                </Button>
            </form>
        </div>
    );
}
