// // hooks/use-media-query.js
// 'use client';

// import { useEffect, useState } from 'react';

// // hooks/use-media-query.js

// export function useMediaQuery(query: string) {
//     const [matches, setMatches] = useState(false);

//     useEffect(() => {
//         // Vérifier si window est défini (côté client)
//         if (typeof window !== 'undefined') {
//             const media = window.matchMedia(query);

//             // Définir l'état initial
//             setMatches(media.matches);

//             // Callback pour les changements
//             const listener = (event: MediaQueryListEvent) => {
//                 setMatches(event.matches);
//             };

//             // Ajouter le listener
//             media.addEventListener('change', listener);

//             // Nettoyer
//             return () => {
//                 media.removeEventListener('change', listener);
//             };
//         }
//     }, [query]);

//     return matches;
// }
