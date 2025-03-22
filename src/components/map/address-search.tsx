// components/map/address-search.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { GeoPoint } from '@/lib/mapbox';
import { Button } from '@/registry/new-york-v4/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/registry/new-york-v4/ui/command';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/new-york-v4/ui/popover';

import { Loader2, MapPin, Search, X } from 'lucide-react';

// components/map/address-search.tsx

// components/map/address-search.tsx

interface SearchResult {
    id: string;
    name: string;
    address: string;
    location: GeoPoint;
}

interface AddressSearchProps {
    onSelect: (result: SearchResult) => void;
    placeholder?: string;
    initialValue?: string;
    label?: string;
    className?: string;
    showIcon?: boolean;
}

export default function AddressSearch({
    onSelect,
    placeholder = 'Rechercher une adresse...',
    initialValue = '',
    label,
    className = '',
    showIcon = true
}: AddressSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Gérer la recherche avec debounce
    useEffect(() => {
        if (!value.trim()) {
            setResults([]);

            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchAddress(value);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [value]);

    // Fonction de recherche d'adresse avec l'API Mapbox Geocoding
    const searchAddress = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);

        try {
            // Utilisation de l'API Mapbox Geocoding
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    query
                )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,place&language=fr&limit=5`
            );

            const data = await response.json();

            // Transformer les résultats au format attendu
            const formattedResults = data.features.map((feature: any) => ({
                id: feature.id,
                name: feature.text,
                address: feature.place_name,
                location: {
                    lng: feature.center[0],
                    lat: feature.center[1]
                }
            }));

            setResults(formattedResults);
        } catch (error) {
            console.error("Erreur lors de la recherche d'adresse:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Simuler des résultats de recherche pour la démonstration
    const simulateSearch = (query: string) => {
        setIsLoading(true);

        setTimeout(() => {
            // Simuler des résultats basés sur la recherche
            const mockResults: SearchResult[] = [
                {
                    id: '1',
                    name: 'Paris',
                    address: 'Paris, France',
                    location: { lat: 48.8566, lng: 2.3522 }
                },
                {
                    id: '2',
                    name: 'Lyon',
                    address: 'Lyon, France',
                    location: { lat: 45.7578, lng: 4.832 }
                },
                {
                    id: '3',
                    name: 'Marseille',
                    address: 'Marseille, France',
                    location: { lat: 43.2965, lng: 5.3698 }
                },
                {
                    id: '4',
                    name: 'Toulouse',
                    address: 'Toulouse, France',
                    location: { lat: 43.6047, lng: 1.4442 }
                },
                {
                    id: '5',
                    name: 'Nice',
                    address: 'Nice, France',
                    location: { lat: 43.7102, lng: 7.262 }
                }
            ].filter(
                (result) =>
                    result.name.toLowerCase().includes(query.toLowerCase()) ||
                    result.address.toLowerCase().includes(query.toLowerCase())
            );

            setResults(mockResults);
            setIsLoading(false);
        }, 500);
    };

    const handleSelect = (result: SearchResult) => {
        setValue(result.address);
        setIsOpen(false);
        onSelect(result);
    };

    const handleClear = () => {
        setValue('');
        setResults([]);
    };

    return (
        <div className={className}>
            {label && <label className='mb-1 block text-sm font-medium text-gray-700'>{label}</label>}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className='relative'>
                        {showIcon && (
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                        )}
                        <Input
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (e.target.value) {
                                    setIsOpen(true);
                                    // Pour la démonstration, on utilise une fonction simulée
                                    simulateSearch(e.target.value);
                                } else {
                                    setIsOpen(false);
                                }
                            }}
                            placeholder={placeholder}
                            className={`${showIcon ? 'pl-10' : ''} pr-10`}
                        />
                        {value && (
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={handleClear}
                                className='absolute top-0 right-0 h-10 w-10'>
                                <X className='h-4 w-4 text-gray-400' />
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                    <Command>
                        <CommandList>
                            {isLoading ? (
                                <div className='flex items-center justify-center p-4'>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    <span>Recherche en cours...</span>
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                                    <CommandGroup>
                                        {results.map((result) => (
                                            <CommandItem
                                                key={result.id}
                                                onSelect={() => handleSelect(result)}
                                                className='cursor-pointer'>
                                                <MapPin className='mr-2 h-4 w-4 text-gray-500' />
                                                <div className='flex flex-col'>
                                                    <span className='font-medium'>{result.name}</span>
                                                    <span className='text-xs text-gray-500'>{result.address}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
